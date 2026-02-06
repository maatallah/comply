import { companyRepository } from './company.repository';
import prisma from '../../shared/prisma';
import type { Company } from '@prisma/client';
import { obligationService } from '../obligations/obligation.service';
import type { CreateCompanyInput, UpdateCompanyInput, ListCompaniesQuery } from './company.types';

// ==================== SERVICE ====================
// Business logic layer - validation, rules, transformations

export class CompanyService {

    // Create company with business rules
    async createCompany(data: CreateCompanyInput): Promise<Company> {
        // Check if Tax ID already exists
        const exists = await companyRepository.taxIdExists(data.taxId);
        if (exists) {
            throw new Error('COMPANY_TAX_ID_EXISTS');
        }

        return companyRepository.create(data);
    }

    // Get company by ID
    async getCompanyById(id: string): Promise<Company> {
        const company = await companyRepository.findById(id);
        if (!company) {
            throw new Error('COMPANY_NOT_FOUND');
        }
        return company;
    }

    // List companies with pagination
    async listCompanies(query: ListCompaniesQuery): Promise<{
        companies: Company[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const { companies, total } = await companyRepository.findMany(query);

        return {
            companies,
            total,
            page: query.page,
            limit: query.limit,
            totalPages: Math.ceil(total / query.limit),
        };
    }

    // Update company
    async updateCompany(id: string, data: UpdateCompanyInput): Promise<Company> {
        // Check company exists
        const existing = await companyRepository.findById(id);
        if (!existing) {
            throw new Error('COMPANY_NOT_FOUND');
        }

        // If updating Tax ID, check uniqueness
        if (data.taxId && data.taxId !== existing.taxId) {
            const taxIdExists = await companyRepository.taxIdExists(data.taxId, id);
            if (taxIdExists) {
                throw new Error('COMPANY_TAX_ID_EXISTS');
            }
        }

        const updated = await companyRepository.update(id, data);

        // Auto-handle Offshore obligations when regime changes
        if (data.regime && data.regime !== existing.regime) {
            if (data.regime === 'OFFSHORE') {
                await obligationService.subscribeToOffshore(id);
            } else if (data.regime === 'ONSHORE') {
                await obligationService.unsubscribeFromOffshore(id);
            }
        }

        return updated;
    }

    // Check if company has linked data (PROTECTION)
    async hasLinkedData(id: string): Promise<{ hasData: boolean; details: Record<string, number> }> {
        const [userCount, obligationCount, auditCount, deadlineCount] = await Promise.all([
            prisma.user.count({ where: { companyId: id } }),
            prisma.obligation.count({ where: { companyId: id } }),
            prisma.audit.count({ where: { companyId: id } }),
            prisma.deadline.count({ where: { companyId: id } }),
        ]);

        const details = {
            users: userCount,
            obligations: obligationCount,
            audits: auditCount,
            deadlines: deadlineCount,
        };

        const hasData = userCount > 0 || obligationCount > 0 || auditCount > 0 || deadlineCount > 0;

        return { hasData, details };
    }

    // Soft delete company (SAFE - just deactivates)
    async deactivateCompany(id: string): Promise<Company> {
        const existing = await companyRepository.findById(id);
        if (!existing) {
            throw new Error('COMPANY_NOT_FOUND');
        }

        return companyRepository.softDelete(id);
    }

    // Hard delete company (PROTECTED - only if no linked data)
    async deleteCompany(id: string, force: boolean = false): Promise<Company> {
        const existing = await companyRepository.findById(id);
        if (!existing) {
            throw new Error('COMPANY_NOT_FOUND');
        }

        // Protection: Check for linked data
        if (!force) {
            const { hasData, details } = await this.hasLinkedData(id);
            if (hasData) {
                const error = new Error('COMPANY_HAS_LINKED_DATA') as any;
                error.details = details;
                throw error;
            }
        }

        return companyRepository.delete(id);
    }
}

// Export singleton instance
export const companyService = new CompanyService();
