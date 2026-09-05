import { Op } from 'sequelize';
import companyRepository from '../repositories/companyRepository.js';

/**
 * Validates that every id in `companyAccess` refers to an existing company.
 * Returns the normalized (stringified) id array.
 * @param {Array<string|number>} companyAccess
 * @returns {Promise<string[]>}
 */
export async function validateCompanyAccessIds(companyAccess) {
  const companyIds = companyAccess.map((id) => String(id));
  const existingCompanies = await companyRepository.count({
    id: { [Op.in]: companyIds },
  });
  if (existingCompanies !== new Set(companyIds).size) {
    throw new Error('company_access contains one or more unknown company ids');
  }
  return companyIds;
}
