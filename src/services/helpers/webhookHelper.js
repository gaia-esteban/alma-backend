import logger from '../../utils/logger.js';

const WEBHOOK_URL = process.env.N8N_EXPORT_WEBHOOK_URL;

async function callExportWebhook(invoices, consecutive) {
  if (!WEBHOOK_URL) {
    throw new Error('N8N_EXPORT_WEBHOOK_URL is not set');
  }

  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invoices, consecutive }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    logger.error({ status: res.status, body: text }, 'n8n export webhook failed');
    throw new Error(`n8n webhook returned ${res.status}`);
  }

  return res.json();
}

export default { callExportWebhook };
