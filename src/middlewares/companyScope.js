import logger from '../utils/logger.js';

function parseCompanyIds(raw) {
  if (raw === undefined || raw === null || raw === '') return [];
  return String(raw)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

/**
 * GET-side company scoping.
 * Reads one or more comma-separated ids from `companyId` (or `companyIds`) query param,
 * validates the caller has access to every one of them, and attaches req.companyIds.
 * Admins bypass the access check but must still provide the param.
 */
export function requireCompanyIdParam(req, res, next) {
  const companyIds = parseCompanyIds(req.query.companyId ?? req.query.companyIds);

  if (companyIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'companyId query parameter is required (comma-separated for multiple companies)',
    });
  }

  if (req.user.role !== 'admin') {
    const access = req.user.company_access || [];
    const unauthorized = companyIds.filter((id) => !access.includes(id));
    if (unauthorized.length > 0) {
      logger.warn(`User ${req.user.id} attempted to access unauthorized companies: ${unauthorized.join(', ')}`);
      return res.status(403).json({
        success: false,
        message: `Access denied to company: ${unauthorized.join(', ')}`,
      });
    }
  }

  req.companyIds = companyIds;
  next();
}

/**
 * POST/PATCH-side company scoping.
 * Reads a single id from body.companyId (or body.company_id), validates the caller has
 * access to it, and attaches req.companyId. Admins bypass the access check.
 */
export function requireSingleCompanyId(req, res, next) {
  const raw = req.body?.companyId ?? req.body?.company_id;

  if (raw === undefined || raw === null || raw === '') {
    return res.status(400).json({
      success: false,
      message: 'companyId is required',
    });
  }

  if (Array.isArray(raw)) {
    return res.status(400).json({
      success: false,
      message: 'Only a single companyId is allowed for this operation',
    });
  }

  const companyId = String(raw);

  if (req.user.role !== 'admin' && !(req.user.company_access || []).includes(companyId)) {
    logger.warn(`User ${req.user.id} attempted to write to unauthorized company: ${companyId}`);
    return res.status(403).json({
      success: false,
      message: `Access denied to company: ${companyId}`,
    });
  }

  req.companyId = companyId;
  next();
}

export default { requireCompanyIdParam, requireSingleCompanyId };
