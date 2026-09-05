import userRepository from '../repositories/userRepository.js';
import logger from '../utils/logger.js';
import { validateCompanyAccessIds } from '../utils/validateCompanyAccess.js';

/**
 * Strips sensitive fields (otpkey) before a user is returned via the API.
 * @param {import('../models/User.js').default} user
 * @returns {Object}
 */
function sanitize(user) {
  const { otpkey, ...safe } = user.toJSON();
  return safe;
}

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
      const { page = 1, limit = 10, role, active } = filters;
      const offset = (page - 1) * limit;

      const where = {};
      if (role) where.role = role;
      if (active !== undefined) where.active = active === 'true' || active === true;

      const options = {
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
      };

      const users = await userRepository.findAll(options);
      const total = await userRepository.count(where);

      logger.info(`Retrieved ${users.length} users`);

      return {
        data: users.map(sanitize),
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
        throw new Error('Usuario no encontrado');
      }

      logger.info(`Retrieved user: ${user.email}`);
      return sanitize(user);
    } catch (error) {
      logger.error({ err: error }, `Error getting user by ID ${id}`);
      throw error;
    }
  }

  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} updates - Update data (name, email, role, active, status, company_access)
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(id, updates) {
    try {
      const user = await userRepository.findById(id);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Check if new email is taken
      if (updates.email && updates.email !== user.email) {
        const existingEmail = await userRepository.findByEmail(updates.email);
        if (existingEmail) {
          throw new Error('El email ya está registrado');
        }
      }

      // Validate every company_access id refers to an existing company
      if (updates.company_access) {
        updates.company_access = await validateCompanyAccessIds(updates.company_access);
      }

      const updatedUser = await userRepository.update(id, updates);
      logger.info(`User updated: ${updatedUser.email}`);

      return sanitize(updatedUser);
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
        throw new Error('Usuario no encontrado');
      }

      // Prevent deleting yourself
      if (String(currentUser.id) === String(id)) {
        throw new Error('No puedes eliminar tu propia cuenta');
      }

      await userRepository.delete(id);
      logger.info(`User deleted: ${user.email}`);

      return {
        message: 'Usuario eliminado correctamente',
      };
    } catch (error) {
      logger.error({ err: error }, `Error deleting user ${id}`);
      throw error;
    }
  }

}

export default new UserService();
