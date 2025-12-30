import jwt from 'jsonwebtoken';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { config } from '../config/env.js';
import userRepository from '../repositories/userRepository.js';
import logger from '../utils/logger.js';
import emailService from './emailService.js';

/**
 * Authentication Service
 */
class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} User and QR code for 2FA setup
   */
  async register(userData) {
    try {

      // Check if email already exists
      const existingEmail = await userRepository.findByEmail(userData.email);
      if (existingEmail) {
        throw new Error('Email already exists');
      }

      // Generate TOTP secret for 2FA
      const secret = authenticator.generateSecret();

      console.log(secret)

      // Create user with active status and TOTP secret
      const user = await userRepository.create({
        ...userData,
        active: true,
        status: 'qrgen',
        otpkey: secret,
        company_id: 1,
      });

      // Generate otpauth URL for QR code with simple data
      const otpauthUrl = authenticator.keyuri(userData.email, config.totp.issuer, secret);

      // Generate QR code as base64 image
      const qrCodeBase64 = await QRCode.toDataURL(otpauthUrl);

      // Send welcome email with QR code
      await emailService.send(
        userData.email,
        config.email.registerSubject,
        'REGISTER_TEMPLATE',
        {
          qrCode: qrCodeBase64,
          email: userData.email,
        }
      );

      logger.info(`Registration email sent to : ${userData.email}`);
      logger.info(`User registered: ${user.username}`);

      return {
        user: user.toJSON(),
        qrCode: qrCodeBase64,
        message: 'Scan the QR code with your authenticator app to complete setup',
      };
    } catch (error) {
      logger.error({ err: error }, 'Error registering user');
      throw error;
    }
  }

  /**
   * Login user with email and OTP
   * @param {string} email - User email
   * @param {string} otp - OTP code from authenticator app
   * @returns {Promise<Object>} User and token
   */
  async login(email, otp) {
    try {
      // Find user by email
      const user = await userRepository.findByEmail(email);

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Verify TOTP code with simple configuration
      const isValid = authenticator.verify({
        token: otp,
        secret: user.otpkey,
        window: 2,  // Allow ±2 time steps (±60 seconds) for time drift
      });

      if (!isValid) {
        throw new Error('Invalid OTP code');
      }

      // Generate token
      const token = this.generateToken(user);

      logger.info(`User logged in: ${user.username}`);

      return {
        user: user.toJSON(),
        token,
      };
    } catch (error) {
      logger.error({ err: error }, 'Error logging in');
      throw error;
    }
  }

  /**
   * Generate JWT token
   * @param {Object} user - User object
   * @returns {string} JWT token
   */
  generateToken(user) {
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Object} Decoded token payload
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      logger.error({ err: error }, 'Error verifying token');
      throw new Error('Invalid or expired token');
    }
  }

}

export default new AuthService();
