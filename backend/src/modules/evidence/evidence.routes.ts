import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { evidenceService } from './evidence.service';
import {
    CreateEvidenceSchema,
    ListEvidenceQuerySchema,
} from './evidence.types';

// Extend Fastify types
declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
    interface FastifyRequest {
        user: {
            userId: string;
            companyId: string;
            email: string;
            role: string;
        };
    }
}

// ==================== ROUTES ====================

export async function evidenceRoutes(app: FastifyInstance) {

    // ========== LIST EVIDENCE ==========
    // GET /evidence
    app.get('/evidence', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
        const user = request.user;

        const parseResult = ListEvidenceQuerySchema.safeParse(request.query);
        if (!parseResult.success) {
            return reply.status(400).send({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'Paramètres invalides' },
            });
        }

        const result = await evidenceService.listEvidence(user.companyId, parseResult.data);

        return reply.send({
            success: true,
            data: result.evidence,
            meta: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages,
            },
        });
    });

    // ========== GET SINGLE EVIDENCE ==========
    // GET /evidence/:id
    app.get('/evidence/:id', { preHandler: [app.authenticate] }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        try {
            const user = request.user;
            const { id } = request.params;

            const evidence = await evidenceService.getEvidenceById(id, user.companyId);

            return reply.send({
                success: true,
                data: evidence,
            });
        } catch (error: any) {
            if (error.message === 'EVIDENCE_NOT_FOUND') {
                return reply.status(404).send({
                    success: false,
                    error: { code: 'EVIDENCE_NOT_FOUND', message: 'Preuve introuvable' },
                });
            }
            throw error;
        }
    });

    // ========== UPLOAD EVIDENCE (metadata only - file upload handled separately) ==========
    // POST /evidence
    app.post('/evidence', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const user = request.user;

            const parseResult = CreateEvidenceSchema.safeParse(request.body);
            if (!parseResult.success) {
                return reply.status(400).send({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Données invalides',
                        details: parseResult.error.flatten().fieldErrors,
                    },
                });
            }

            const evidence = await evidenceService.createEvidence(user.companyId, user.userId, parseResult.data);

            return reply.status(201).send({
                success: true,
                data: evidence,
            });
        } catch (error: any) {
            if (error.message === 'CHECK_NOT_FOUND') {
                return reply.status(404).send({
                    success: false,
                    error: { code: 'CHECK_NOT_FOUND', message: 'Vérification introuvable' },
                });
            }
            throw error;
        }
    });

    // ========== DELETE EVIDENCE ==========
    // DELETE /evidence/:id
    app.delete('/evidence/:id', { preHandler: [app.authenticate] }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        try {
            const user = request.user;
            const { id } = request.params;

            await evidenceService.deleteEvidence(id, user.companyId);

            return reply.status(204).send();
        } catch (error: any) {
            if (error.message === 'EVIDENCE_NOT_FOUND') {
                return reply.status(404).send({
                    success: false,
                    error: { code: 'EVIDENCE_NOT_FOUND', message: 'Preuve introuvable' },
                });
            }
            throw error;
        }
    });
}
