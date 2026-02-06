import prisma from '../../shared/prisma';
import type { Check } from '@prisma/client';
import type { CreateCheckInput, UpdateCheckInput, ListChecksQuery } from './check.types';

// ==================== REPOSITORY ====================

export class CheckRepository {

    // Create check
    async create(companyId: string, data: CreateCheckInput): Promise<Check> {
        return prisma.check.create({
            data: {
                companyId,
                controlId: data.controlId,
                checkDate: data.checkDate ? new Date(data.checkDate) : new Date(),
                status: data.status,
                findings: data.findings,
                correctiveActions: data.correctiveActions,
                performedBy: data.checkedBy || '',
                nextCheckDue: data.nextCheckDate ? new Date(data.nextCheckDate) : null,
            },
            include: {
                control: {
                    select: { id: true, titleFr: true },
                },
                evidence: true,
            },
        });
    }

    // Find by ID
    async findById(id: string): Promise<Check | null> {
        return prisma.check.findUnique({
            where: { id },
            include: {
                control: {
                    select: { id: true, titleFr: true, companyId: true },
                },
                evidence: true,
            },
        });
    }

    // Find checks by company with filters
    async findByCompanyId(
        companyId: string,
        query: ListChecksQuery
    ): Promise<{ checks: Check[]; total: number }> {
        const { page, limit, controlId, status, fromDate, toDate } = query;
        const skip = (page - 1) * limit;

        const where: any = { companyId };

        if (controlId) where.controlId = controlId;
        if (status) where.status = status;
        if (fromDate || toDate) {
            where.checkDate = {};
            if (fromDate) where.checkDate.gte = new Date(fromDate);
            if (toDate) where.checkDate.lte = new Date(toDate);
        }

        if (query.hasActionPlan === true) {
            where.correctiveActions = { not: null, notIn: [''] };
        } else if (query.hasActionPlan === false) {
            where.correctiveActions = { in: [null, ''] };
        }

        const [checks, total] = await Promise.all([
            prisma.check.findMany({
                where,
                skip,
                take: limit,
                orderBy: { checkDate: 'desc' },
                include: {
                    control: {
                        select: { id: true, titleFr: true },
                    },
                    evidence: {
                        select: { id: true, fileName: true, fileType: true },
                    },
                },
            }),
            prisma.check.count({ where }),
        ]);

        return { checks, total };
    }

    // Update
    async update(id: string, data: UpdateCheckInput): Promise<Check> {
        return prisma.check.update({
            where: { id },
            data: {
                ...data,
                checkDate: data.checkDate ? new Date(data.checkDate) : undefined,
                nextCheckDue: data.nextCheckDate ? new Date(data.nextCheckDate) : undefined,
            },
            include: {
                control: {
                    select: { id: true, titleFr: true },
                },
                evidence: true,
            },
        });
    }

    // Delete (hard delete since checks are records)
    async delete(id: string): Promise<Check> {
        return prisma.check.delete({
            where: { id },
        });
    }

    // Get latest check for a control
    async getLatestForControl(controlId: string): Promise<Check | null> {
        return prisma.check.findFirst({
            where: { controlId },
            orderBy: { checkDate: 'desc' },
            include: {
                evidence: true,
            },
        });
    }
}

export const checkRepository = new CheckRepository();
