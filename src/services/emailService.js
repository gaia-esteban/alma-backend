import nodemailer from 'nodemailer';
import { config } from '../config/env.js';
import logger from '../utils/logger.js';
import { emailTemplates } from './emailTemplates.js';

/**
 * Email Service
 * Generic email sending service using nodemailer
 */
class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });
  }

  /**
   * Send email with template
   * @param {string} recipient - Email recipient
   * @param {string} subject - Email subject
   * @param {string} template - Template name
   * @param {Object} data - Template data
   * @returns {Promise<Object>} Email send result
   */
  async send(recipient, subject, template, data = {}) {
    try {
      const templateFn = emailTemplates[template];

      if (!templateFn) {
        throw new Error(`Template ${template} not found`);
      }

      const html = templateFn(data);

      const mailOptions = {
        from: `${config.email.sender} <${config.email.user}>`,
        to: recipient,
        subject,
        html,
        attachments: [],
      };

      // Add QR code as inline attachment if present
      if (data.qrCode) {
        // Extract base64 data from data URL
        const base64Data = data.qrCode.replace(/^data:image\/png;base64,/, '');

        mailOptions.attachments.push({
          filename: 'qrcode.png',
          content: base64Data,
          encoding: 'base64',
          cid: 'qrcode@alma',
        });
      }

      const result = await this.transporter.sendMail(mailOptions);

      logger.info(`Email sent to ${recipient} using template ${template}`);

      return result;
    } catch (error) {
      logger.error({ err: error }, 'Error sending email');
      throw error;
    }
  }
}

export default new EmailService();
