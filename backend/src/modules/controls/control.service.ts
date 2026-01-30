import { controlRepository } from './control.repository';
import prisma from '../../shared/prisma';
import type { Control } from '@prisma/client';
import type { CreateControlInput, UpdateControlInput, ListControlsQuery } from './control.types';

// ==================== SERVICE ====================

export class ControlService {

    // Create control
    async createControl(companyId: string, data: CreateControlInput): Promise<Control> {
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

        return controlRepository.create(companyId, data);
    }

    // Get control by ID
    async getControlById(id: string, companyId: string): Promise<Control> {
        const control = await controlRepository.findById(id);

        if (!control) {
            throw new Error('CONTROL_NOT_FOUND');
        }

        if (control.companyId !== companyId) {
            throw new Error('ACCESS_DENIED');
        }

        return control;
    }

    // List controls
    async listControls(companyId: string, query: ListControlsQuery): Promise<{
        controls: Control[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const { controls, total } = await controlRepository.findByCompanyId(companyId, query);

        return {
            controls,
            total,
            page: query.page,
            limit: query.limit,
            totalPages: Math.ceil(total / query.limit),
        };
    }

    // Update control
    async updateControl(id: string, companyId: string, data: UpdateControlInput): Promise<Control> {
        const control = await controlRepository.findById(id);

        if (!control) {
            throw new Error('CONTROL_NOT_FOUND');
        }

        if (control.companyId !== companyId) {
            throw new Error('ACCESS_DENIED');
        }

        return controlRepository.update(id, data);
    }

    // Deactivate control
    async deactivateControl(id: string, companyId: string): Promise<Control> {
        const control = await controlRepository.findById(id);

        if (!control) {
            throw new Error('CONTROL_NOT_FOUND');
        }

        if (control.companyId !== companyId) {
            throw new Error('ACCESS_DENIED');
        }

        return controlRepository.softDelete(id);
    }

    // Get summary for an obligation
    async getControlSummary(obligationId: string, companyId: string): Promise<{
        total: number;
        completed: number;
        pending: number;
        overdue: number;
    }> {
        // Verify obligation belongs to company
        const obligation = await prisma.obligation.findUnique({
            where: { id: obligationId },
        });

        if (!obligation || obligation.companyId !== companyId) {
            throw new Error('ACCESS_DENIED');
        }

        return controlRepository.getSummaryByObligation(obligationId);
    }
}

export const controlService = new ControlService();
