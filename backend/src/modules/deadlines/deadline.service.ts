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

    // Mark deadline as completed (and create next if recurring)
    async completeDeadline(id: string, companyId: string): Promise<Deadline> {
        const deadline = await deadlineRepository.findById(id);

        if (!deadline) {
            throw new Error('DEADLINE_NOT_FOUND');
        }

        if (deadline.companyId !== companyId) {
            throw new Error('ACCESS_DENIED');
        }

        // Mark as completed
        const completed = await deadlineRepository.update(id, {
            status: 'COMPLETED',
            completedAt: new Date().toISOString(),
        });

        // If recurring, create the next deadline based on the obligation's frequency
        if (deadline.isRecurring) {
            const obligation = await prisma.obligation.findUnique({
                where: { id: deadline.obligationId },
            });

            if (obligation) {
                // Calculate next due date based on frequency
                const currentDueDate = new Date(deadline.dueDate);
                let nextDueDate = new Date(currentDueDate);

                switch (obligation.frequency) {
                    case 'MONTHLY':
                        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
                        break;
                    case 'QUARTERLY':
                        nextDueDate.setMonth(nextDueDate.getMonth() + 3);
                        break;
                    case 'ANNUAL':
                        nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
                        break;
                    case 'BIENNIAL':
                        nextDueDate.setFullYear(nextDueDate.getFullYear() + 2);
                        break;
                    case 'TRIENNIAL':
                        nextDueDate.setFullYear(nextDueDate.getFullYear() + 3);
                        break;
                    default:
                        // CONTINUOUS or unknown: default to monthly
                        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
                }

                // Create next deadline
                await deadlineRepository.create(companyId, {
                    obligationId: deadline.obligationId,
                    dueDate: nextDueDate.toISOString(),
                    isRecurring: true,
                });
            }
        }

        return completed;
    }

    // Revert deadline to pending (undo completion)
    async revertDeadline(id: string, companyId: string): Promise<Deadline> {
        const deadline = await deadlineRepository.findById(id);

        if (!deadline) {
            throw new Error('DEADLINE_NOT_FOUND');
        }

        if (deadline.companyId !== companyId) {
            throw new Error('ACCESS_DENIED');
        }

        if (deadline.status !== 'COMPLETED') {
            throw new Error('DEADLINE_NOT_COMPLETED');
        }

        return deadlineRepository.update(id, {
            status: 'PENDING',
            completedAt: undefined,
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
