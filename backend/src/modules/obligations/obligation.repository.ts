import prisma from '../../shared/prisma';
import type { Obligation } from '@prisma/client';
import type { CreateObligationInput, UpdateObligationInput, ListObligationsQuery } from './obligation.types';

// ==================== REPOSITORY ====================

export class ObligationRepository {

    // Create obligation for a company
    async create(companyId: string, data: CreateObligationInput & {
        titleFr: string;
        category: string;
    }): Promise<Obligation> {
        return prisma.obligation.create({
            data: {
                companyId,
                regulationId: data.regulationId,
                titleFr: data.titleFr,
                titleAr: data.titleAr,
                descriptionFr: data.descriptionFr,
                descriptionAr: data.descriptionAr,
                category: data.category,
                frequency: data.frequency,
                riskLevel: data.riskLevel,
            },
            include: {
                regulation: true,
            },
        });
    }

    // Find by ID
    async findById(id: string): Promise<Obligation | null> {
        return prisma.obligation.findUnique({
            where: { id },
            include: {
                regulation: true,
                controls: true,
                deadlines: {
                    orderBy: { dueDate: 'asc' },
                    take: 5,
                },
            },
        });
    }

    // Find by company ID with filters
    async findByCompanyId(
        companyId: string,
        query: ListObligationsQuery
    ): Promise<{ obligations: Obligation[]; total: number }> {
        const { page, limit, category, riskLevel, isActive } = query;
        const skip = (page - 1) * limit;

        const where: any = { companyId };

        if (category) where.category = category;
        if (riskLevel) where.riskLevel = riskLevel;
        if (isActive !== undefined) where.isActive = isActive;

        const [obligations, total] = await Promise.all([
            prisma.obligation.findMany({
                where,
                skip,
                take: limit,
                orderBy: [
                    { riskLevel: 'desc' },
                    { createdAt: 'desc' },
                ],
                include: {
                    regulation: {
                        select: {
                            code: true,
                            titleFr: true,
                            authority: true,
                        },
                    },
                },
            }),
            prisma.obligation.count({ where }),
        ]);

        return { obligations, total };
    }

    // Check if company already has this regulation
    async existsForCompany(companyId: string, regulationId: string): Promise<boolean> {
        const existing = await prisma.obligation.findFirst({
            where: {
                companyId,
                regulationId,
                isActive: true,
            },
        });
        return !!existing;
    }

    // Update
    async update(id: string, data: UpdateObligationInput): Promise<Obligation> {
        return prisma.obligation.update({
            where: { id },
            data,
            include: {
                regulation: true,
            },
        });
    }

    // Soft delete
    async softDelete(id: string): Promise<Obligation> {
        return prisma.obligation.update({
            where: { id },
            data: { isActive: false },
        });
    }

    // Get obligation summary by category for a company
    async getSummaryByCompany(companyId: string): Promise<{
        category: string;
        total: number;
        highRisk: number;
    }[]> {
        const obligations = await prisma.obligation.groupBy({
            by: ['category'],
            where: { companyId, isActive: true },
            _count: { id: true },
        });

        // Get high risk count per category
        const result = await Promise.all(
            obligations.map(async (cat) => {
                const highRisk = await prisma.obligation.count({
                    where: {
                        companyId,
                        category: cat.category,
                        riskLevel: { in: ['HIGH', 'CRITICAL'] },
                        isActive: true,
                    },
                });
                return {
                    category: cat.category,
                    total: cat._count.id,
                    highRisk,
                };
            })
        );

        return result;
    }
}

export const obligationRepository = new ObligationRepository();
