import prisma from '../../shared/prisma';
import type { Deadline } from '@prisma/client';
import type { CreateDeadlineInput, UpdateDeadlineInput, ListDeadlinesQuery } from './deadline.types';

// ==================== REPOSITORY ====================

export class DeadlineRepository {

    // Create deadline
    async create(companyId: string, data: CreateDeadlineInput): Promise<Deadline> {
        return prisma.deadline.create({
            data: {
                companyId,
                obligationId: data.obligationId,
                dueDate: new Date(data.dueDate),
                isRecurring: data.isRecurring,
                status: 'PENDING',
            },
            include: {
                obligation: {
                    select: { id: true, titleFr: true },
                },
            },
        });
    }

    // Find by ID
    async findById(id: string): Promise<Deadline | null> {
        return prisma.deadline.findUnique({
            where: { id },
            include: {
                obligation: {
                    select: { id: true, titleFr: true, companyId: true },
                },
            },
        });
    }

    // Find deadlines by company with filters
    async findByCompanyId(
        companyId: string,
        query: ListDeadlinesQuery
    ): Promise<{ deadlines: Deadline[]; total: number }> {
        const { page, limit, obligationId, status, upcoming, days } = query;
        const skip = (page - 1) * limit;

        const where: any = { companyId };

        if (obligationId) where.obligationId = obligationId;
        if (status) where.status = status;

        if (upcoming) {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + days);
            where.dueDate = {
                gte: new Date(),
                lte: futureDate,
            };
            where.status = { in: ['PENDING', 'DUE_SOON'] };
        }

        const [deadlines, total] = await Promise.all([
            prisma.deadline.findMany({
                where,
                skip,
                take: limit,
                orderBy: { dueDate: 'asc' },
                include: {
                    obligation: {
                        select: { id: true, titleFr: true },
                    },
                },
            }),
            prisma.deadline.count({ where }),
        ]);

        return { deadlines, total };
    }

    // Update
    async update(id: string, data: UpdateDeadlineInput): Promise<Deadline> {
        return prisma.deadline.update({
            where: { id },
            data: {
                status: data.status,
                completedAt: data.completedAt ? new Date(data.completedAt) :
                    data.status === 'COMPLETED' ? new Date() : undefined,
            },
            include: {
                obligation: {
                    select: { id: true, titleFr: true },
                },
            },
        });
    }

    // Delete
    async delete(id: string): Promise<Deadline> {
        return prisma.deadline.delete({
            where: { id },
        });
    }

    // Get upcoming deadlines count
    async getUpcomingCount(companyId: string, days: number = 7): Promise<{
        dueSoon: number;
        overdue: number;
    }> {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);

        const [dueSoon, overdue] = await Promise.all([
            prisma.deadline.count({
                where: {
                    companyId,
                    status: { in: ['PENDING'] },
                    dueDate: {
                        gte: new Date(),
                        lte: futureDate,
                    },
                },
            }),
            prisma.deadline.count({
                where: {
                    companyId,
                    status: 'OVERDUE',
                },
            }),
        ]);

        return { dueSoon, overdue };
    }
}

export const deadlineRepository = new DeadlineRepository();
