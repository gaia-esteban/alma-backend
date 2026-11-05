import config from '../../config/env.js';
import logger from '../../utils/logger.js';

async function callContaiExport(invoices, consecutive, { userEmail, userName } = {}) {
  const { baseUrl, user, password } = config.mailboxReader;

  if (!baseUrl) {
    throw new Error('MAILBOX_READER_URL is not set');
  }

  const url = `${baseUrl.replace(/\/+$/, '')}/incoming-orders/contai`;
  const auth = Buffer.from(`${user}:${password}`).toString('base64');

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({ invoices, consecutive, userEmail, userName }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    logger.error(
      { status: res.status, body: text, url },
      'Mailbox Reader contai export failed'
    );
    throw new Error(`Mailbox Reader returned ${res.status}`);
  }

  return res.json();
}

/**
 * Ask mailbox-reader (which holds the cached Siigo credentials) to make sure a
 * supplier exists in Siigo, creating it if needed.
 * @returns {Promise<{ status: 'exists'|'created'|'failed', siigoId?: string, message?: string, missing?: string[] }>}
 */
async function callSiigoSupplierSync({ companyId, identification, description, userEmail, userName }) {
  const { baseUrl, user, password } = config.mailboxReader;

  if (!baseUrl) {
    throw new Error('MAILBOX_READER_URL is not set');
  }

  const url = `${baseUrl.replace(/\/+$/, '')}/suppliers/siigo-sync`;
  const auth = Buffer.from(`${user}:${password}`).toString('base64');

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({ companyId, identification, description, userEmail, userName }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    logger.error(
      { status: res.status, body: text, url },
      'Mailbox Reader siigo supplier sync failed'
    );
    throw new Error(`Mailbox Reader returned ${res.status}`);
  }

  return res.json();
}

export default { callContaiExport, callSiigoSupplierSync };
