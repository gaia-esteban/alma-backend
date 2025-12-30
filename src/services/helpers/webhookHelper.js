import env from '../../config/env.js';
import logger from '../../utils/logger.js';

/**
 * Webhook Helper - Handles API calls to external webhooks
 */
class WebhookHelper {
  /**
   * Call n8n webhook for invoice export
   * @param {Array<string>} invoices - Array of invoice IDs to export
   * @param {string} consecutive - Consecutive identifier for the export
   * @returns {Promise<Object>} Webhook response
   */
  async callExportWebhook(invoices, consecutive) {
    try {
      const webhookUrl = `${env.automation.webhookUrl}/${env.automation.webhookEnv}/${env.automation.webhookPath}`;
      const username = env.automation.user;
      const password = env.automation.password;

      // Validate configuration
      if (!webhookUrl || !username || !password) {
        throw new Error('Webhook configuration is missing. Please check environment variables.');
      }

      // Create Basic Auth credentials
      const credentials = Buffer.from(`${username}:${password}`).toString('base64');

      // Prepare request body
      const requestBody = {
        invoices,
        consecutive,
      };

      logger.info(`Calling export webhook for ${invoices.length} firing at ${webhookUrl}`);

      // Make API call to n8n webhook
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`,
        },
        body: JSON.stringify(requestBody),
      });

      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`Webhook call failed with status ${response.status}: ${errorText}`);
        throw new Error(`Webhook call failed: ${response.status} ${response.statusText}`);
      }

      // Parse response
      const data = await response.json();
      logger.info(`Webhook call successful for consecutive ${consecutive}`);

      return data;
    } catch (error) {
      logger.error({ err: error }, 'Error calling export webhook');

      // Provide more specific error messages
      if (error.message.includes('fetch')) {
        throw new Error('Failed to connect to webhook service. Please check network connectivity.');
      }

      throw error;
    }
  }
}

export default new WebhookHelper();
