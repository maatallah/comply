import { checkRepository } from './check.repository';
import prisma from '../../shared/prisma';
import type { Check } from '@prisma/client';
import type { CreateCheckInput, UpdateCheckInput, ListChecksQuery } from './check.types';

// ==================== SERVICE ====================

export class CheckService {

    // Create check (record a verification)
    async createCheck(companyId: string, userId: string, data: CreateCheckInput): Promise<Check> {
        // Verify control exists and belongs to company
        const control = await prisma.control.findUnique({
            where: { id: data.controlId },
        });

        if (!control) {
            throw new Error('CONTROL_NOT_FOUND');
        }

        if (control.companyId !== companyId) {
            throw new Error('ACCESS_DENIED');
        }

        // Create the check
        const check = await checkRepository.create(companyId, data);

        return check;
    }

    // Get check by ID
    async getCheckById(id: string, companyId: string): Promise<Check> {
        const check = await checkRepository.findById(id);

        if (!check) {
            throw new Error('CHECK_NOT_FOUND');
        }

        if (check.companyId !== companyId) {
            throw new Error('ACCESS_DENIED');
        }

        return check;
    }

    // List checks
    async listChecks(companyId: string, query: ListChecksQuery): Promise<{
        checks: Check[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const { checks, total } = await checkRepository.findByCompanyId(companyId, query);

        return {
            checks,
            total,
            page: query.page,
            limit: query.limit,
            totalPages: Math.ceil(total / query.limit),
        };
    }

    // Update check
    async updateCheck(id: string, companyId: string, data: UpdateCheckInput): Promise<Check> {
        const check = await checkRepository.findById(id);

        if (!check) {
            throw new Error('CHECK_NOT_FOUND');
        }

        if (check.companyId !== companyId) {
            throw new Error('ACCESS_DENIED');
        }

        return checkRepository.update(id, data);
    }

    // Delete check
    async deleteCheck(id: string, companyId: string): Promise<void> {
        const check = await checkRepository.findById(id);

        if (!check) {
            throw new Error('CHECK_NOT_FOUND');
        }

        if (check.companyId !== companyId) {
            throw new Error('ACCESS_DENIED');
        }

        await checkRepository.delete(id);
    }
}

export const checkService = new CheckService();
