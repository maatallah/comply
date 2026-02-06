import prisma from '../../shared/prisma';
import type { Evidence } from '@prisma/client';
import type { CreateEvidenceInput, UpdateEvidenceInput, ListEvidenceQuery } from './evidence.types';

// ==================== REPOSITORY ====================

export class EvidenceRepository {

    // Create evidence record
    async create(companyId: string, data: CreateEvidenceInput): Promise<Evidence> {
        return prisma.evidence.create({
            data: {
                companyId,
                checkId: data.checkId || null,
                controlId: data.controlId || null,
                fileName: data.fileName,
                fileType: data.fileType,
                filePath: data.filePath,
                fileSize: data.fileSize,
                description: data.description,
                metadata: (data.metadata || {}) as any,
            } as any,
            include: {
                check: {
                    select: { id: true, status: true },
                },
            },
        });
    }

    // Find by ID
    async findById(id: string): Promise<Evidence | null> {
        return prisma.evidence.findUnique({
            where: { id },
            include: {
                check: {
                    select: { id: true, status: true, companyId: true },
                },
            },
        });
    }

    // Find evidence by company with filters
    async findByCompanyId(
        companyId: string,
        query: ListEvidenceQuery
    ): Promise<{ evidence: Evidence[]; total: number }> {
        const { page, limit, checkId } = query;
        const skip = (page - 1) * limit;

        const where: any = { companyId };

        if (checkId) where.checkId = checkId;

        const [evidence, total] = await Promise.all([
            prisma.evidence.findMany({
                where,
                skip,
                take: limit,
                orderBy: { uploadedAt: 'desc' },
                include: {
                    check: {
                        select: { id: true, status: true },
                    },
                },
            }),
            prisma.evidence.count({ where }),
        ]);

        return { evidence, total };
    }

    // Update
    async update(id: string, data: UpdateEvidenceInput): Promise<Evidence> {
        return prisma.evidence.update({
            where: { id },
            data,
        });
    }

    // Delete
    async delete(id: string): Promise<Evidence> {
        return prisma.evidence.delete({
            where: { id },
        });
    }
}

export const evidenceRepository = new EvidenceRepository();
