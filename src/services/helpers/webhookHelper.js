import env from '../../config/env.js';
import logger from '../../utils/logger.js';

/**
 * Webhook Helper - Proxies requests to the Alma Mailbox Reader service
 */
class WebhookHelper {
  /**
   * Call alma-mailbox-reader /incoming-orders/contai endpoint
   * @param {Array<string>} invoices - Array of invoice IDs to export
   * @param {number} consecutive - Consecutive number for the export
   * @returns {Promise<Object>} Service response
   */
  async callExportWebhook(invoices, consecutive) {
    const { baseUrl, user, password } = env.mailboxReader;

    if (!baseUrl || !user || !password) {
      throw new Error('Mailbox Reader configuration is missing. Check MAILBOX_READER_* environment variables.');
    }

    const url = `${baseUrl}/incoming-orders/contai`;
    const credentials = Buffer.from(`${user}:${password}`).toString('base64');

    logger.info(`Calling mailbox-reader contai for ${invoices.length} invoices at ${url}`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`,
        },
        body: JSON.stringify({ invoices, consecutive }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`Mailbox-reader call failed with status ${response.status}: ${errorText}`);
        throw new Error(`Mailbox-reader call failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      logger.info(`Mailbox-reader call successful for consecutive ${consecutive}`);
      return data;
    } catch (error) {
      logger.error({ err: error }, 'Error calling mailbox-reader');

      if (error.message.includes('fetch')) {
        throw new Error('Failed to connect to mailbox-reader service. Please check network connectivity.');
      }

      throw error;
    }
  }
}

export default new WebhookHelper();
