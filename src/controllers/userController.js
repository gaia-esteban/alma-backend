import userService from '../services/userService.js';
import authService from '../services/authService.js';
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
        message: error.message || 'Error al obtener los usuarios',
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
        message: 'Usuario obtenido correctamente',
        data: { user },
      });
    } catch (error) {
      logger.error({ err: error }, 'Get user by ID error');
      return res.status(404).json({
        success: false,
        message: error.message || 'Usuario no encontrado',
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
      if (!userData.name || !userData.email || !Array.isArray(userData.company_access) || userData.company_access.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'El nombre, el email y un arreglo no vacío de compañías (company_access) son obligatorios',
        });
      }

      const result = await authService.register(userData);
      const { otpkey, ...safeUser } = result.user;

      return res.status(201).json({
        success: true,
        message: 'Usuario creado correctamente',
        data: { user: safeUser },
      });
    } catch (error) {
      logger.error({ err: error }, 'Create user error');
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al crear el usuario',
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

      const user = await userService.updateUser(id, updates);

      return res.status(200).json({
        success: true,
        message: 'Usuario actualizado correctamente',
        data: { user },
      });
    } catch (error) {
      logger.error({ err: error }, 'Update user error');
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar el usuario',
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
        message: 'Usuario eliminado correctamente',
        data: result,
      });
    } catch (error) {
      logger.error({ err: error }, 'Delete user error');
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al eliminar el usuario',
      });
    }
  }

}

export default new UserController();
