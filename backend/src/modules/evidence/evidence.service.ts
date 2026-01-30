import { evidenceRepository } from './evidence.repository';
import prisma from '../../shared/prisma';
import type { Evidence } from '@prisma/client';
import type { CreateEvidenceInput, ListEvidenceQuery } from './evidence.types';

// ==================== SERVICE ====================

export class EvidenceService {

    // Create evidence
    async createEvidence(companyId: string, data: CreateEvidenceInput): Promise<Evidence> {
        // Verify check exists and belongs to company
        const check = await prisma.check.findUnique({
            where: { id: data.checkId },
        });

        if (!check) {
            throw new Error('CHECK_NOT_FOUND');
        }

        if (check.companyId !== companyId) {
            throw new Error('ACCESS_DENIED');
        }

        return evidenceRepository.create(companyId, data);
    }

    // Get evidence by ID
    async getEvidenceById(id: string, companyId: string): Promise<Evidence> {
        const evidence = await evidenceRepository.findById(id);

        if (!evidence) {
            throw new Error('EVIDENCE_NOT_FOUND');
        }

        if (evidence.companyId !== companyId) {
            throw new Error('ACCESS_DENIED');
        }

        return evidence;
    }

    // List evidence
    async listEvidence(companyId: string, query: ListEvidenceQuery): Promise<{
        evidence: Evidence[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const { evidence, total } = await evidenceRepository.findByCompanyId(companyId, query);

        return {
            evidence,
            total,
            page: query.page,
            limit: query.limit,
            totalPages: Math.ceil(total / query.limit),
        };
    }

    // Delete evidence
    async deleteEvidence(id: string, companyId: string): Promise<void> {
        const evidence = await evidenceRepository.findById(id);

        if (!evidence) {
            throw new Error('EVIDENCE_NOT_FOUND');
        }

        if (evidence.companyId !== companyId) {
            throw new Error('ACCESS_DENIED');
        }

        // TODO: Delete actual file from storage (MinIO/S3)
        await evidenceRepository.delete(id);
    }
}

export const evidenceService = new EvidenceService();
