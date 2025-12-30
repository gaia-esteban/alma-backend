import userRepository from '../repositories/userRepository.js';
import logger from '../utils/logger.js';

/**
 * User Service - Business Logic Layer
 */
class UserService {
  /**
   * Get all users
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Users list with pagination
   */
  async getAllUsers(filters = {}) {
    try {
      const { page = 1, limit = 10, role } = filters;
      const offset = (page - 1) * limit;

      const options = {
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
      };

      if (role) {
        options.where = { role };
      }

      const users = await userRepository.findAll(options);
      const total = await userRepository.count(options.where || {});

      logger.info(`Retrieved ${users.length} users`);

      return {
        data: users.map(user => user.toJSON()),
        total,
      };
    } catch (error) {
      logger.error({ err: error }, 'Error getting all users');
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object>} User data
   */
  async getUserById(id) {
    try {
      const user = await userRepository.findById(id);
      if (!user) {
        throw new Error('User not found');
      }

      logger.info(`Retrieved user: ${user.username}`);
      return user.toJSON();
    } catch (error) {
      logger.error({ err: error }, `Error getting user by ID ${id}`);
      throw error;
    }
  }

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async createUser(userData) {
    try {
      // Check if username already exists
      const existingUsername = await userRepository.findByUsername(userData.username);
      if (existingUsername) {
        throw new Error('Username already exists');
      }

      // Check if email already exists
      const existingEmail = await userRepository.findByEmail(userData.email);
      if (existingEmail) {
        throw new Error('Email already exists');
      }

      const user = await userRepository.create(userData);
      logger.info(`User created: ${user.username}`);

      return user.toJSON();
    } catch (error) {
      logger.error({ err: error }, 'Error creating user');
      throw error;
    }
  }

  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} updates - Update data
   * @param {Object} currentUser - Current authenticated user
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(id, updates, currentUser) {
    try {
      const user = await userRepository.findById(id);
      if (!user) {
        throw new Error('User not found');
      }

      // Check permissions
      if (currentUser.id !== id && currentUser.role !== 'admin') {
        throw new Error('Unauthorized to update this user');
      }

      // Prevent non-admins from changing role
      if (updates.role && currentUser.role !== 'admin') {
        throw new Error('Only admins can change user roles');
      }

      // Check if new username is taken
      if (updates.username && updates.username !== user.username) {
        const existingUsername = await userRepository.findByUsername(updates.username);
        if (existingUsername) {
          throw new Error('Username already exists');
        }
      }

      // Check if new email is taken
      if (updates.email && updates.email !== user.email) {
        const existingEmail = await userRepository.findByEmail(updates.email);
        if (existingEmail) {
          throw new Error('Email already exists');
        }
      }

      const updatedUser = await userRepository.update(id, updates);
      logger.info(`User updated: ${updatedUser.username}`);

      return updatedUser.toJSON();
    } catch (error) {
      logger.error({ err: error }, `Error updating user ${id}`);
      throw error;
    }
  }

  /**
   * Delete user
   * @param {string} id - User ID
   * @param {Object} currentUser - Current authenticated user
   * @returns {Promise<Object>} Success message
   */
  async deleteUser(id, currentUser) {
    try {
      const user = await userRepository.findById(id);
      if (!user) {
        throw new Error('User not found');
      }

      // Only admins can delete users
      if (currentUser.role !== 'admin') {
        throw new Error('Only admins can delete users');
      }

      // Prevent deleting yourself
      if (currentUser.id === id) {
        throw new Error('You cannot delete your own account');
      }

      await userRepository.delete(id);
      logger.info(`User deleted: ${user.username}`);

      return {
        message: 'User deleted successfully',
      };
    } catch (error) {
      logger.error({ err: error }, `Error deleting user ${id}`);
      throw error;
    }
  }

}

export default new UserService();
