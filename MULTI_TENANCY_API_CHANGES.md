# Multi-Tenancy API Changes

This document lists every API-visible change from the multi-tenancy work, so the frontend can be updated to match. It does not cover internal implementation details — only what changes for a client calling this API.

## 1. Core concept

Every company-scoped resource (invoices, suppliers, event log) now requires a `companyId`:

- **GET (list/detail) endpoints** — pass one or more company ids via a `companyId` query param, comma-separated for multiple: `?companyId=1,3,7`.
- **POST / PATCH (write) endpoints** — pass exactly one company id in the request body as `companyId` (or `company_id` — both accepted).

If it's missing: **400**. If the caller isn't allowed to see/write that company: **403**.

## 2. The user object changed shape

`company_id` (single, nullable number) is **gone**. It's replaced by:

```json
"company_access": ["1", "3", "7"]
```

- Always an array of **strings** (company ids), always has **at least one** element — never null/empty.
- Returned on the `user` object from `POST /api/auth/login`, `GET /api/users`, `GET /api/users/:id`.
- The frontend should treat this as "the set of companies this user is allowed to see." Use it to:
  - Populate a company filter/switcher for list screens (multi-select, drives the `companyId` query param).
  - Populate a single company picker for create/edit forms (drives the `companyId` body field).
  - If the user's `role` is `admin`, they are **not restricted** to `company_access` — they can pass any valid company id(s) and always see the full `GET /api/companies` list. `company_access` is still present on an admin's user object but is not enforced against them.

## 3. Registration is no longer public

`POST /api/auth/register` now requires an **admin's Bearer token** (previously anonymous). Whatever "sign up" UI existed needs to move behind an admin-only "create user" screen.

Request body now requires `company_access`:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "user",
  "company_access": ["1", "3"]
}
```

- `company_access` must be a non-empty array; every id must correspond to an existing company, or the request is rejected (400).

## 4. Endpoint-by-endpoint changes

### Incoming Orders (invoices) — `/api/incoming-orders`

| Method | Route | Change |
|---|---|---|
| GET | `/incoming-orders` | **Requires** `?companyId=1,2,...`. Response items now include a nested `company: { id, description }` — use this instead of a separate lookup to show which company an invoice belongs to. |
| GET | `/incoming-orders/:id` | **Requires** `?companyId=...`. 404 if the invoice's company isn't in the ids you passed. Response includes `company` same as above. |
| POST | `/incoming-orders/export` | Body now **requires** `companyId`. Every invoice in the `invoices` array must actually belong to that company or the whole request is rejected (400). |
| PATCH | `/incoming-orders/:id/status` | Body now **requires** `companyId`. 404 if the invoice doesn't belong to that company. |

### Suppliers — `/api/suppliers`

| Method | Route | Change |
|---|---|---|
| GET | `/suppliers` | **Requires** `?companyId=1,2,...`. The old `?company_id=` single-value filter is gone — use `companyId` instead. Response items now include a nested `company: { id, description }` — use this instead of a separate lookup to show which company a supplier belongs to. |
| GET | `/suppliers/:id` | **Requires** `?companyId=...`. 404 if outside the requested companies. Response includes `company` same as above. |
| POST | `/suppliers` | Body now **requires** `companyId` (or `company_id`) — this becomes the supplier's `company_id`, overriding anything else sent in the body. |
| PATCH | `/suppliers/:id` | Body now **requires** `companyId`. A supplier's `company_id` can no longer be changed via this endpoint (any `company_id` in the update body is ignored/kept as-is). |

### Companies — `/api/companies`

| Method | Route | Change |
|---|---|---|
| GET | `/companies` | **No `companyId` param needed/used.** Automatically returns only the companies in the caller's `company_access` (admins see all). |
| GET | `/companies/:id` | 404 if that company isn't in the caller's `company_access` (unless admin). |
| POST | `/companies` | **Now admin-only** (403 for non-admins). Previously any authenticated user could create a company. |
| PATCH | `/companies/:id` | **Now admin-only** (403 for non-admins). Previously any authenticated user could edit a company. |

### Event Log — `/api/events-log`

| Method | Route | Change |
|---|---|---|
| GET | `/events-log` | **Requires** `?companyId=1,2,...`. |
| GET | `/events-log/:id` | **Requires** `?companyId=...`. 404 if outside the requested companies. Note: some events (e.g. a failed login for an unrecognized email, generic app-level events) have no company at all and will never show up under any `companyId` filter — this is expected. |
| POST | `/events-log` | Unchanged (internal/service-to-service call via API key, not used by the frontend). |

### Users — `/api/users`

No route/param changes. Response objects now carry `company_access` instead of `company_id` (see §2).

## 5. Error responses to handle

| Status | When | Example message |
|---|---|---|
| 400 | `companyId` missing on a scoped GET | `"companyId query parameter is required (comma-separated for multiple companies)"` |
| 400 | `companyId` missing on a scoped POST/PATCH | `"companyId is required"` |
| 403 | Requested `companyId` not in the caller's `company_access` | `"Access denied to company: 4"` |
| 404 | Resource exists but belongs to a company outside the ones you requested | standard "not found" message |

## 6. Suggested frontend flow

1. After login, read `user.company_access` from the login response and store it (e.g. alongside the JWT).
2. If it has more than one entry, show a company switcher/multi-select filter on list screens; default to selecting all of them.
3. Every list-screen fetch must append `?companyId=<selected ids joined by commas>`.
4. Every create/edit form must include a single company selector (defaulting to the user's only company if they have just one) and send it as `companyId` in the request body.
5. Admin-only screens (create user, create/edit company) should check `role === 'admin'` before rendering, since the backend now enforces this too.
