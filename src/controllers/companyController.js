import companyService from '../services/companyService.js';
import logger from '../utils/logger.js';

class CompanyController {
  /**
   * Get all companies
   * @route GET /api/companies
   */
  async getAllCompanies(req, res) {
    try {
      const filters = {
        page: req.query.page,
        limit: req.query.limit,
        description: req.query.description,
      };

      const result = await companyService.getAllCompanies(filters);

      return res.status(200).json(result);
    } catch (error) {
      logger.error({ err: error }, 'Get all companies error');
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to retrieve companies',
      });
    }
  }

  /**
   * Get company by ID
   * @route GET /api/companies/:id
   */
  async getCompanyById(req, res) {
    try {
      const { id } = req.params;

      const company = await companyService.getCompanyById(id);

      return res.status(200).json({
        success: true,
        message: 'Company retrieved successfully',
        data: { company },
      });
    } catch (error) {
      logger.error({ err: error }, 'Get company by ID error');
      return res.status(404).json({
        success: false,
        message: error.message || 'Company not found',
      });
    }
  }

  /**
   * Create new company
   * @route POST /api/companies
   */
  async createCompany(req, res) {
    try {
      const data = req.body;

      if (!data.description) {
        return res.status(400).json({
          success: false,
          message: 'description is required',
        });
      }

      const company = await companyService.createCompany(data);

      return res.status(201).json({
        success: true,
        message: 'Company created successfully',
        data: { company },
      });
    } catch (error) {
      logger.error({ err: error }, 'Create company error');
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create company',
      });
    }
  }

  /**
   * Update company
   * @route PATCH /api/companies/:id
   */
  async updateCompany(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const company = await companyService.updateCompany(id, updates);

      return res.status(200).json({
        success: true,
        message: 'Company updated successfully',
        data: { company },
      });
    } catch (error) {
      logger.error({ err: error }, 'Update company error');
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update company',
      });
    }
  }
}

export default new CompanyController();
