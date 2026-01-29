import prisma from '../../shared/prisma';
import type { Company } from '@prisma/client';
import type { CreateCompanyInput, UpdateCompanyInput, ListCompaniesQuery } from './company.types';

// ==================== REPOSITORY ====================
// Direct database access layer - no business logic here

export class CompanyRepository {

    // Create a new company
    async create(data: CreateCompanyInput): Promise<Company> {
        return prisma.company.create({
            data: {
                legalName: data.legalName,
                tradeName: data.tradeName,
                taxId: data.taxId,
                cnssId: data.cnssId,
                activitySector: data.activitySector,
                companySize: data.companySize,
                employeeCount: data.employeeCount,
                address: data.address,
                city: data.city,
                region: data.region,
                phone: data.phone || null,
                email: data.email || null,
                website: data.website || null,
            },
        });
    }

    // Find company by ID
    async findById(id: string): Promise<Company | null> {
        return prisma.company.findUnique({
            where: { id },
        });
    }

    // Find company by Tax ID
    async findByTaxId(taxId: string): Promise<Company | null> {
        return prisma.company.findUnique({
            where: { taxId },
        });
    }

    // List companies with pagination and filters
    async findMany(query: ListCompaniesQuery): Promise<{ companies: Company[]; total: number }> {
        const { page, limit, search, sector, isActive } = query;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {};

        if (search) {
            where.OR = [
                { legalName: { contains: search, mode: 'insensitive' } },
                { tradeName: { contains: search, mode: 'insensitive' } },
                { taxId: { contains: search } },
            ];
        }

        if (sector) {
            where.activitySector = sector;
        }

        if (isActive !== undefined) {
            where.isActive = isActive;
        }

        // Execute both queries in parallel
        const [companies, total] = await Promise.all([
            prisma.company.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.company.count({ where }),
        ]);

        return { companies, total };
    }

    // Update company
    async update(id: string, data: UpdateCompanyInput): Promise<Company> {
        return prisma.company.update({
            where: { id },
            data: {
                ...data,
                phone: data.phone || null,
                email: data.email || null,
                website: data.website || null,
            },
        });
    }

    // Soft delete (set isActive = false)
    async softDelete(id: string): Promise<Company> {
        return prisma.company.update({
            where: { id },
            data: { isActive: false },
        });
    }

    // Hard delete (permanent)
    async delete(id: string): Promise<Company> {
        return prisma.company.delete({
            where: { id },
        });
    }

    // Check if Tax ID exists (for uniqueness validation)
    async taxIdExists(taxId: string, excludeId?: string): Promise<boolean> {
        const company = await prisma.company.findUnique({
            where: { taxId },
            select: { id: true },
        });

        if (!company) return false;
        if (excludeId && company.id === excludeId) return false;
        return true;
    }
}

// Export singleton instance
export const companyRepository = new CompanyRepository();
