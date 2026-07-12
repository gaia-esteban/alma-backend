import authService from '../services/authService.js';
import logger from '../utils/logger.js';

/**
 * Authentication Controller
 */
class AuthController {
  /**
   * Register new user
   * @route POST /api/auth/register
   */
  async register(req, res) {
    try {
      const { name, email, role, company_access } = req.body;

      // Validate required fields
      if (!name || !email || !role) {
        return res.status(400).json({
          success: false,
          message: 'name, email, and role are required',
        });
      }

      if (!Array.isArray(company_access) || company_access.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'company_access is required and must be a non-empty array of company ids',
        });
      }

      const result = await authService.register({
        name,
        email,
        role,
        company_access,
      });

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      logger.error({ err: error }, 'Register error');
      return res.status(400).json({
        success: false,
        message: error.message || 'Registration failed',
      });
    }
  }

  /**
   * Login user with email and OTP
   * @route POST /api/auth/login
   */
  async login(req, res) {
    try {
      const { email, otp } = req.body;

      // Validate required fields
      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message: 'Email and OTP are required',
        });
      }

      const result = await authService.login(email, otp);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      logger.error({ err: error }, 'Login error');
      return res.status(401).json({
        success: false,
        message: error.message || 'Login failed',
      });
    }
  }

}

export default new AuthController();
