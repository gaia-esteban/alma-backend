import User from '../models/User.js';
import logger from '../utils/logger.js';

/**
 * User Repository - Data Access Layer
 */
class UserRepository {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<User>}
   */
  async create(userData) {
    try {
      const user = await User.create(userData);
      logger.info(`User created: ${user.username}`);
      return user;
    } catch (error) {
      logger.error({ err: error }, 'Error creating user');
      throw error;
    }
  }

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<User|null>}
   */
  async findById(id) {
    try {
      return await User.findByPk(id);
    } catch (error) {
      logger.error({ err: error }, `Error finding user by ID ${id}`);
      throw error;
    }
  }

  /**
   * Find user by username
   * @param {string} username - Username
   * @returns {Promise<User|null>}
   */
  async findByUsername(username) {
    try {
      return await User.findOne({ where: { username } });
    } catch (error) {
      logger.error({ err: error }, `Error finding user by username ${username}`);
      throw error;
    }
  }

  /**
   * Find user by email
   * @param {string} email - Email address
   * @returns {Promise<User|null>}
   */
  async findByEmail(email) {
    try {
      return await User.findOne({ where: { email } });
    } catch (error) {
      logger.error({ err: error }, `Error finding user by email ${email}`);
      throw error;
    }
  }

  /**
   * Find all users
   * @param {Object} options - Query options
   * @returns {Promise<User[]>}
   */
  async findAll(options = {}) {
    try {
      return await User.findAll(options);
    } catch (error) {
      logger.error({ err: error }, 'Error finding all users');
      throw error;
    }
  }

  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} updates - Update data
   * @returns {Promise<User|null>}
   */
  async update(id, updates) {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        return null;
      }
      await user.update(updates);
      logger.info(`User updated: ${user.username}`);
      return user;
    } catch (error) {
      logger.error({ err: error }, `Error updating user ${id}`);
      throw error;
    }
  }

  /**
   * Delete user
   * @param {string} id - User ID
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        return false;
      }
      await user.destroy();
      logger.info(`User deleted: ${user.username}`);
      return true;
    } catch (error) {
      logger.error({ err: error }, `Error deleting user ${id}`);
      throw error;
    }
  }

  /**
   * Count users
   * @param {Object} where - Where conditions
   * @returns {Promise<number>}
   */
  async count(where = {}) {
    try {
      return await User.count({ where });
    } catch (error) {
      logger.error({ err: error }, 'Error counting users');
      throw error;
    }
  }
}

export default new UserRepository();
