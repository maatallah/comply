import { checkRepository } from './check.repository';
import prisma from '../../shared/prisma';
import type { Check } from '@prisma/client';
import type { CreateCheckInput, UpdateCheckInput, ListChecksQuery } from './check.types';
import { alertService } from '../alerts/alert.service';
import { evidenceService } from '../evidence/evidence.service';

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

        // Link any evidence previously uploaded for this control that wasn't yet linked
        await evidenceService.linkToCheck(companyId, check.controlId, check.id);

        // Auto-trigger alert if non-compliant
        if (check.status === 'FAIL' || check.status === 'PARTIAL') {
            await alertService.createAlert({
                userId,
                companyId,
                titleFr: `Non-conformité détectée: ${control.titleFr}`,
                messageFr: `Le contrôle "${control.titleFr}" a été marqué comme ${check.status}. Findings: ${check.findings || 'N/A'}. Action corrective requise.`,
                type: 'NON_COMPLIANCE',
                severity: check.status === 'FAIL' ? 'HIGH' : 'MEDIUM',
            });
        }

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

        const updatedCheck = await checkRepository.update(id, data);

        // Trigger alert if status changed to non-compliant
        if ((data.status === 'FAIL' || data.status === 'PARTIAL') && check.status !== data.status) {
            await alertService.createAlert({
                userId: check.performedBy, // Use the person who performed the check or current user? Let's use current user if available, but service doesn't have it.
                companyId,
                titleFr: `Mise à jour Non-conformité: ${(check as any).control.titleFr}`,
                messageFr: `Le statut du contrôle "${(check as any).control.titleFr}" a été mis à jour à ${data.status}.`,
                type: 'NON_COMPLIANCE',
                severity: data.status === 'FAIL' ? 'HIGH' : 'MEDIUM',
            });
        }

        return updatedCheck;
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
