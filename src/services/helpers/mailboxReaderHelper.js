import config from '../../config/env.js';
import logger from '../../utils/logger.js';

async function callContaiExport(invoices, consecutive) {
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
    body: JSON.stringify({ invoices, consecutive }),
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

export default { callContaiExport };
