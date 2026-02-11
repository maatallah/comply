import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { checkService } from './check.service';
import {
    CreateCheckSchema,
    UpdateCheckSchema,
    ListChecksQuerySchema,
} from './check.types';

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

export async function checkRoutes(app: FastifyInstance) {

    // ========== LIST CHECKS ==========
    // GET /checks
    app.get('/checks', { preHandler: [app.authenticate] }, async (request, reply) => {
        const user = request.user;

        const parseResult = ListChecksQuerySchema.safeParse(request.query);
        if (!parseResult.success) {
            return reply.status(400).send({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'Paramètres invalides' },
            });
        }

        const result = await checkService.listChecks(user.companyId, parseResult.data);

        return reply.send({
            success: true,
            data: result.checks,
            meta: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages,
            },
        });
    });

    // ========== GET SINGLE CHECK ==========
    // GET /checks/:id
    app.get<{ Params: { id: string } }>('/checks/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
        try {
            const user = request.user;
            const { id } = request.params;

            const check = await checkService.getCheckById(id, user.companyId);

            return reply.send({
                success: true,
                data: check,
            });
        } catch (error: any) {
            if (error.message === 'CHECK_NOT_FOUND') {
                return reply.status(404).send({
                    success: false,
                    error: { code: 'CHECK_NOT_FOUND', message: 'Vérification introuvable' },
                });
            }
            if (error.message === 'ACCESS_DENIED') {
                return reply.status(403).send({
                    success: false,
                    error: { code: 'ACCESS_DENIED', message: 'Accès refusé' },
                });
            }
            throw error;
        }
    });

    // ========== CREATE CHECK (Record verification) ==========
    // POST /checks
    app.post('/checks', { preHandler: [app.authenticate] }, async (request, reply) => {
        try {
            const user = request.user;

            const parseResult = CreateCheckSchema.safeParse(request.body);
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

            const check = await checkService.createCheck(user.companyId, user.userId, parseResult.data);

            return reply.status(201).send({
                success: true,
                data: check,
            });
        } catch (error: any) {
            if (error.message === 'CONTROL_NOT_FOUND') {
                return reply.status(404).send({
                    success: false,
                    error: { code: 'CONTROL_NOT_FOUND', message: 'Contrôle introuvable' },
                });
            }
            if (error.message === 'ACCESS_DENIED') {
                return reply.status(403).send({
                    success: false,
                    error: { code: 'ACCESS_DENIED', message: 'Accès refusé' },
                });
            }
            throw error;
        }
    });

    // ========== UPDATE CHECK ==========
    // PUT /checks/:id
    app.put<{ Params: { id: string } }>('/checks/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
        try {
            const user = request.user;
            const { id } = request.params;

            const parseResult = UpdateCheckSchema.safeParse(request.body);
            if (!parseResult.success) {
                return reply.status(400).send({
                    success: false,
                    error: { code: 'VALIDATION_ERROR', message: 'Données invalides' },
                });
            }

            const check = await checkService.updateCheck(id, user.companyId, parseResult.data);

            return reply.send({
                success: true,
                data: check,
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

    // ========== DELETE CHECK ==========
    // DELETE /checks/:id
    app.delete<{ Params: { id: string } }>('/checks/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
        try {
            const user = request.user;
            const { id } = request.params;

            if (user.role !== 'COMPANY_ADMIN') {
                return reply.status(403).send({
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Seuls les administrateurs peuvent supprimer' },
                });
            }

            await checkService.deleteCheck(id, user.companyId);

            return reply.status(204).send();
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

    // ========== EMAIL CHECK RESULT ==========
    // POST /checks/:id/email
    app.post<{ Params: { id: string }, Body: { email?: string } }>('/checks/:id/email', { preHandler: [app.authenticate] }, async (request, reply) => {
        try {
            const user = request.user;
            const { id } = request.params;
            const targetEmail = request.body?.email || user.email;

            await checkService.emailCheckResult(id, user.companyId, targetEmail);

            return reply.send({
                success: true,
                message: 'Email envoyé avec succès'
            });
        } catch (error: any) {
            if (error.message === 'CHECK_NOT_FOUND') {
                return reply.status(404).send({
                    success: false,
                    error: { code: 'CHECK_NOT_FOUND', message: 'Vérification introuvable' },
                });
            }
            if (error.message === 'ACCESS_DENIED') {
                return reply.status(403).send({
                    success: false,
                    error: { code: 'ACCESS_DENIED', message: 'Accès refusé' },
                });
            }
            throw error;
        }
    });
}
