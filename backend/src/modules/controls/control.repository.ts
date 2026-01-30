import prisma from '../../shared/prisma';
import type { Control } from '@prisma/client';
import type { CreateControlInput, UpdateControlInput, ListControlsQuery } from './control.types';

// ==================== REPOSITORY ====================

export class ControlRepository {

    // Create control
    async create(companyId: string, data: CreateControlInput): Promise<Control> {
        return prisma.control.create({
            data: {
                companyId,
                obligationId: data.obligationId,
                titleFr: data.titleFr,
                titleAr: data.titleAr,
                descriptionFr: data.descriptionFr,
                controlType: data.controlType,
                expectedEvidence: data.expectedEvidence,
                frequency: data.frequency,
            },
            include: {
                obligation: {
                    select: { id: true, titleFr: true },
                },
            },
        });
    }

    // Find by ID
    async findById(id: string): Promise<Control | null> {
        return prisma.control.findUnique({
            where: { id },
            include: {
                obligation: {
                    select: { id: true, titleFr: true, companyId: true },
                },
                checks: {
                    orderBy: { checkDate: 'desc' },
                    take: 5,
                },
            },
        });
    }

    // Find controls by company with filters
    async findByCompanyId(
        companyId: string,
        query: ListControlsQuery
    ): Promise<{ controls: Control[]; total: number }> {
        const { page, limit, obligationId, controlType } = query;
        const skip = (page - 1) * limit;

        const where: any = { companyId, isActive: true };

        if (obligationId) where.obligationId = obligationId;
        if (controlType) where.controlType = controlType;

        const [controls, total] = await Promise.all([
            prisma.control.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    obligation: {
                        select: { id: true, titleFr: true },
                    },
                },
            }),
            prisma.control.count({ where }),
        ]);

        return { controls, total };
    }

    // Update
    async update(id: string, data: UpdateControlInput): Promise<Control> {
        return prisma.control.update({
            where: { id },
            data,
            include: {
                obligation: {
                    select: { id: true, titleFr: true },
                },
            },
        });
    }

    // Soft delete
    async softDelete(id: string): Promise<Control> {
        return prisma.control.update({
            where: { id },
            data: { isActive: false },
        });
    }

    // Get controls count by obligation
    async getCountByObligation(obligationId: string): Promise<number> {
        return prisma.control.count({
            where: { obligationId, isActive: true }
        });
    }
}

export const controlRepository = new ControlRepository();
