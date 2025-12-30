import userService from '../services/userService.js';
import logger from '../utils/logger.js';

/**
 * User Controller
 */
class UserController {
  /**
   * Get all users
   * @route GET /api/users
   */
  async getAllUsers(req, res) {
    try {
      const filters = {
        page: req.query.page,
        limit: req.query.limit,
        role: req.query.role,
      };

      const result = await userService.getAllUsers(filters);

      return res.status(200).json(result);
    } catch (error) {
      logger.error({ err: error }, 'Get all users error');
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to retrieve users',
      });
    }
  }

  /**
   * Get user by ID
   * @route GET /api/users/:id
   */
  async getUserById(req, res) {
    try {
      const { id } = req.params;

      const user = await userService.getUserById(id);

      return res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: { user },
      });
    } catch (error) {
      logger.error({ err: error }, 'Get user by ID error');
      return res.status(404).json({
        success: false,
        message: error.message || 'User not found',
      });
    }
  }

  /**
   * Create new user
   * @route POST /api/users
   */
  async createUser(req, res) {
    try {
      const userData = req.body;

      // Validate required fields
      if (!userData.username || !userData.email || !userData.password) {
        return res.status(400).json({
          success: false,
          message: 'Username, email, and password are required',
        });
      }

      const user = await userService.createUser(userData);

      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: { user },
      });
    } catch (error) {
      logger.error({ err: error }, 'Create user error');
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create user',
      });
    }
  }

  /**
   * Update user
   * @route PUT /api/users/:id
   */
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const currentUser = req.user;

      const user = await userService.updateUser(id, updates, currentUser);

      return res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: { user },
      });
    } catch (error) {
      logger.error({ err: error }, 'Update user error');
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update user',
      });
    }
  }

  /**
   * Delete user
   * @route DELETE /api/users/:id
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const currentUser = req.user;

      const result = await userService.deleteUser(id, currentUser);

      return res.status(200).json({
        success: true,
        message: 'User deleted successfully',
        data: result,
      });
    } catch (error) {
      logger.error({ err: error }, 'Delete user error');
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete user',
      });
    }
  }

}

export default new UserController();
