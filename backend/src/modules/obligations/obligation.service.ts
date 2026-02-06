import { obligationRepository } from './obligation.repository';
import prisma from '../../shared/prisma';
import type { Obligation } from '@prisma/client';
import type { CreateObligationInput, UpdateObligationInput, ListObligationsQuery } from './obligation.types';
import { OFFSHORE_OBLIGATION_TEMPLATES } from './offshore-templates';

// ==================== SERVICE ====================

export class ObligationService {

    // Subscribe company to a regulation (create obligation)
    async createObligation(companyId: string, data: CreateObligationInput): Promise<Obligation> {
        // Check if regulation exists
        const regulation = await prisma.regulation.findUnique({
            where: { id: data.regulationId },
        });

        if (!regulation) {
            throw new Error('REGULATION_NOT_FOUND');
        }

        // Check if company already subscribed to this specific obligation
        const exists = await obligationRepository.existsForCompany(companyId, data.regulationId, data.titleFr);
        if (exists) {
            throw new Error('OBLIGATION_ALREADY_EXISTS');
        }

        // Use regulation title if not provided
        const titleFr = data.titleFr || regulation.titleFr;
        const titleAr = data.titleAr || regulation.titleAr || undefined;
        const descriptionFr = data.descriptionFr || regulation.descriptionFr || undefined;
        const descriptionAr = data.descriptionAr || regulation.descriptionAr || undefined;

        const obligation = await obligationRepository.create(companyId, {
            ...data,
            titleFr,
            titleAr,
            descriptionFr,
            descriptionAr,
            category: regulation.category,
        });

        // Create first deadline if specified
        if (data.firstDeadline) {
            await prisma.deadline.create({
                data: {
                    companyId,
                    obligationId: obligation.id,
                    dueDate: new Date(data.firstDeadline),
                    status: 'PENDING',
                    isRecurring: data.frequency !== 'CONTINUOUS',
                },
            });
        }

        return obligation;
    }

    // Get obligation by ID (with company check)
    async getObligationById(id: string, companyId: string): Promise<Obligation> {
        const obligation = await obligationRepository.findById(id);

        if (!obligation) {
            throw new Error('OBLIGATION_NOT_FOUND');
        }

        // Multi-tenancy check
        if (obligation.companyId !== companyId) {
            throw new Error('ACCESS_DENIED');
        }

        return obligation;
    }

    // List obligations for company
    async listObligations(companyId: string, query: ListObligationsQuery): Promise<{
        obligations: Obligation[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const { obligations, total } = await obligationRepository.findByCompanyId(companyId, query);

        return {
            obligations,
            total,
            page: query.page,
            limit: query.limit,
            totalPages: Math.ceil(total / query.limit),
        };
    }

    // Get summary dashboard data
    async getObligationSummary(companyId: string): Promise<{
        totalObligations: number;
        byCategory: { category: string; total: number; highRisk: number }[];
        highRiskCount: number;
    }> {
        const byCategory = await obligationRepository.getSummaryByCompany(companyId);

        const totalObligations = byCategory.reduce((sum, cat) => sum + cat.total, 0);
        const highRiskCount = byCategory.reduce((sum, cat) => sum + cat.highRisk, 0);

        return {
            totalObligations,
            byCategory,
            highRiskCount,
        };
    }

    // Update obligation
    async updateObligation(id: string, companyId: string, data: UpdateObligationInput): Promise<Obligation> {
        const obligation = await obligationRepository.findById(id);

        if (!obligation) {
            throw new Error('OBLIGATION_NOT_FOUND');
        }

        if (obligation.companyId !== companyId) {
            throw new Error('ACCESS_DENIED');
        }

        return obligationRepository.update(id, data);
    }

    // Deactivate obligation
    async deactivateObligation(id: string, companyId: string): Promise<Obligation> {
        const obligation = await obligationRepository.findById(id);

        if (!obligation) {
            throw new Error('OBLIGATION_NOT_FOUND');
        }

        if (obligation.companyId !== companyId) {
            throw new Error('ACCESS_DENIED');
        }

        return obligationRepository.softDelete(id);
    }

    // Subscribe company to all Tier 1 regulations at once
    async subscribeToTier1(companyId: string): Promise<Obligation[]> {
        const tier1Codes = [
            'BSCI-2021',
            'DEC-75-503',
            'DEC-2000-1985',
            'CNSS-LOI-60-30',
            'TVA-CGI-2016',
            'MT-LOI-94-28',
            'ANGED-DEC-2005',
            'CT-LOI-66-27',
        ];

        const regulations = await prisma.regulation.findMany({
            where: { code: { in: tier1Codes } },
        });

        const created: Obligation[] = [];

        for (const reg of regulations) {
            // Skip if already subscribed
            const exists = await obligationRepository.existsForCompany(companyId, reg.id);
            if (exists) continue;

            // Default frequencies based on regulation
            const frequencyMap: Record<string, string> = {
                'BSCI-2021': 'BIENNIAL',
                'DEC-75-503': 'BIENNIAL',
                'DEC-2000-1985': 'ANNUAL',
                'CNSS-LOI-60-30': 'MONTHLY',
                'TVA-CGI-2016': 'MONTHLY',
                'MT-LOI-94-28': 'ANNUAL',
                'ANGED-DEC-2005': 'MONTHLY',
                'CT-LOI-66-27': 'CONTINUOUS',
            };

            const obligation = await obligationRepository.create(companyId, {
                regulationId: reg.id,
                titleFr: reg.titleFr,
                titleAr: reg.titleAr || undefined,
                descriptionFr: reg.descriptionFr || undefined,
                descriptionAr: reg.descriptionAr || undefined,
                category: reg.category,
                frequency: frequencyMap[reg.code] as any || 'ANNUAL',
                riskLevel: 'MEDIUM',
            });

            created.push(obligation);
        }

        return created;
    }

    // Subscribe to Offshore specific obligations
    async subscribeToOffshore(companyId: string): Promise<Obligation[]> {
        const created: Obligation[] = [];
        for (const template of OFFSHORE_OBLIGATION_TEMPLATES) {
            // Check if already exists (active)
            const exists = await obligationRepository.existsForCompany(companyId, template.regulationId, template.titleFr);
            if (exists) continue;

            // Check if exists but inactive (re-activate)
            const inactive = await prisma.obligation.findFirst({
                where: {
                    companyId,
                    regulationId: template.regulationId,
                    titleFr: template.titleFr,
                    isActive: false,
                }
            });

            if (inactive) {
                const reactivated = await obligationRepository.update(inactive.id, { isActive: true });
                created.push(reactivated);
            } else {
                const obligation = await this.createObligation(companyId, template as any);
                created.push(obligation);
            }
        }
        return created;
    }

    // Unsubscribe from Offshore (Deactivate)
    async unsubscribeFromOffshore(companyId: string): Promise<void> {
        await prisma.obligation.updateMany({
            where: {
                companyId,
                regulationId: 'f1e2d3c4-b5a6-4078-9012-34567890abcd',
                isActive: true,
            },
            data: { isActive: false },
        });
    }
}

export const obligationService = new ObligationService();
