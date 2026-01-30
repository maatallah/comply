import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { deadlineService } from './deadline.service';
import {
    CreateDeadlineSchema,
    UpdateDeadlineSchema,
    ListDeadlinesQuerySchema,
} from './deadline.types';

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

export async function deadlineRoutes(app: FastifyInstance) {

    // ========== LIST DEADLINES ==========
    // GET /deadlines
    app.get('/deadlines', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
        const user = request.user;

        const parseResult = ListDeadlinesQuerySchema.safeParse(request.query);
        if (!parseResult.success) {
            return reply.status(400).send({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'Paramètres invalides' },
            });
        }

        const result = await deadlineService.listDeadlines(user.companyId, parseResult.data);

        return reply.send({
            success: true,
            data: result.deadlines,
            meta: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages,
            },
        });
    });

    // ========== GET UPCOMING SUMMARY ==========
    // GET /deadlines/summary
    app.get('/deadlines/summary', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
        const user = request.user;

        const summary = await deadlineService.getDeadlineSummary(user.companyId);

        return reply.send({
            success: true,
            data: summary,
        });
    });

    // ========== GET SINGLE DEADLINE ==========
    // GET /deadlines/:id
    app.get('/deadlines/:id', { preHandler: [app.authenticate] }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        try {
            const user = request.user;
            const { id } = request.params;

            const deadline = await deadlineService.getDeadlineById(id, user.companyId);

            return reply.send({
                success: true,
                data: deadline,
            });
        } catch (error: any) {
            if (error.message === 'DEADLINE_NOT_FOUND') {
                return reply.status(404).send({
                    success: false,
                    error: { code: 'DEADLINE_NOT_FOUND', message: 'Échéance introuvable' },
                });
            }
            throw error;
        }
    });

    // ========== CREATE DEADLINE ==========
    // POST /deadlines
    app.post('/deadlines', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const user = request.user;

            if (!['COMPANY_ADMIN', 'COMPLIANCE_OFFICER'].includes(user.role)) {
                return reply.status(403).send({
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Droits insuffisants' },
                });
            }

            const parseResult = CreateDeadlineSchema.safeParse(request.body);
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

            const deadline = await deadlineService.createDeadline(user.companyId, parseResult.data);

            return reply.status(201).send({
                success: true,
                data: deadline,
            });
        } catch (error: any) {
            if (error.message === 'OBLIGATION_NOT_FOUND') {
                return reply.status(404).send({
                    success: false,
                    error: { code: 'OBLIGATION_NOT_FOUND', message: 'Obligation introuvable' },
                });
            }
            throw error;
        }
    });

    // ========== MARK AS COMPLETED ==========
    // POST /deadlines/:id/complete
    app.post('/deadlines/:id/complete', { preHandler: [app.authenticate] }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        try {
            const user = request.user;
            const { id } = request.params;

            const deadline = await deadlineService.completeDeadline(id, user.companyId);

            return reply.send({
                success: true,
                data: deadline,
            });
        } catch (error: any) {
            if (error.message === 'DEADLINE_NOT_FOUND') {
                return reply.status(404).send({
                    success: false,
                    error: { code: 'DEADLINE_NOT_FOUND', message: 'Échéance introuvable' },
                });
            }
            throw error;
        }
    });

    // ========== UPDATE DEADLINE ==========
    // PUT /deadlines/:id
    app.put('/deadlines/:id', { preHandler: [app.authenticate] }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        try {
            const user = request.user;
            const { id } = request.params;

            const parseResult = UpdateDeadlineSchema.safeParse(request.body);
            if (!parseResult.success) {
                return reply.status(400).send({
                    success: false,
                    error: { code: 'VALIDATION_ERROR', message: 'Données invalides' },
                });
            }

            const deadline = await deadlineService.updateDeadline(id, user.companyId, parseResult.data);

            return reply.send({
                success: true,
                data: deadline,
            });
        } catch (error: any) {
            if (error.message === 'DEADLINE_NOT_FOUND') {
                return reply.status(404).send({
                    success: false,
                    error: { code: 'DEADLINE_NOT_FOUND', message: 'Échéance introuvable' },
                });
            }
            throw error;
        }
    });

    // ========== DELETE DEADLINE ==========
    // DELETE /deadlines/:id
    app.delete('/deadlines/:id', { preHandler: [app.authenticate] }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        try {
            const user = request.user;
            const { id } = request.params;

            if (user.role !== 'COMPANY_ADMIN') {
                return reply.status(403).send({
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Seuls les administrateurs peuvent supprimer' },
                });
            }

            await deadlineService.deleteDeadline(id, user.companyId);

            return reply.status(204).send();
        } catch (error: any) {
            if (error.message === 'DEADLINE_NOT_FOUND') {
                return reply.status(404).send({
                    success: false,
                    error: { code: 'DEADLINE_NOT_FOUND', message: 'Échéance introuvable' },
                });
            }
            throw error;
        }
    });
}
