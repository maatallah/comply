import { deadlineRepository } from './deadline.repository';
import prisma from '../../shared/prisma';
import type { Deadline } from '@prisma/client';
import type { CreateDeadlineInput, UpdateDeadlineInput, ListDeadlinesQuery } from './deadline.types';

// ==================== SERVICE ====================

export class DeadlineService {

    // Create deadline
    async createDeadline(companyId: string, data: CreateDeadlineInput): Promise<Deadline> {
        // Verify obligation exists and belongs to company
        const obligation = await prisma.obligation.findUnique({
            where: { id: data.obligationId },
        });

        if (!obligation) {
            throw new Error('OBLIGATION_NOT_FOUND');
        }

        if (obligation.companyId !== companyId) {
            throw new Error('ACCESS_DENIED');
        }

        return deadlineRepository.create(companyId, data);
    }

    // Get deadline by ID
    async getDeadlineById(id: string, companyId: string): Promise<Deadline> {
        const deadline = await deadlineRepository.findById(id);

        if (!deadline) {
            throw new Error('DEADLINE_NOT_FOUND');
        }

        if (deadline.companyId !== companyId) {
            throw new Error('ACCESS_DENIED');
        }

        return deadline;
    }

    // List deadlines
    async listDeadlines(companyId: string, query: ListDeadlinesQuery): Promise<{
        deadlines: Deadline[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const { deadlines, total } = await deadlineRepository.findByCompanyId(companyId, query);

        return {
            deadlines,
            total,
            page: query.page,
            limit: query.limit,
            totalPages: Math.ceil(total / query.limit),
        };
    }

    // Mark deadline as completed
    async completeDeadline(id: string, companyId: string): Promise<Deadline> {
        const deadline = await deadlineRepository.findById(id);

        if (!deadline) {
            throw new Error('DEADLINE_NOT_FOUND');
        }

        if (deadline.companyId !== companyId) {
            throw new Error('ACCESS_DENIED');
        }

        return deadlineRepository.update(id, {
            status: 'COMPLETED',
            completedAt: new Date().toISOString(),
        });
    }

    // Update deadline
    async updateDeadline(id: string, companyId: string, data: UpdateDeadlineInput): Promise<Deadline> {
        const deadline = await deadlineRepository.findById(id);

        if (!deadline) {
            throw new Error('DEADLINE_NOT_FOUND');
        }

        if (deadline.companyId !== companyId) {
            throw new Error('ACCESS_DENIED');
        }

        return deadlineRepository.update(id, data);
    }

    // Delete deadline
    async deleteDeadline(id: string, companyId: string): Promise<void> {
        const deadline = await deadlineRepository.findById(id);

        if (!deadline) {
            throw new Error('DEADLINE_NOT_FOUND');
        }

        if (deadline.companyId !== companyId) {
            throw new Error('ACCESS_DENIED');
        }

        await deadlineRepository.delete(id);
    }

    // Get dashboard summary
    async getDeadlineSummary(companyId: string): Promise<{
        dueSoon: number;
        overdue: number;
    }> {
        return deadlineRepository.getUpcomingCount(companyId);
    }
}

export const deadlineService = new DeadlineService();
