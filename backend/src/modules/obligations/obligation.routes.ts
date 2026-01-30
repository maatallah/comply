import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { obligationService } from './obligation.service';
import {
    CreateObligationSchema,
    UpdateObligationSchema,
    ListObligationsQuerySchema,
} from './obligation.types';

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

export async function obligationRoutes(app: FastifyInstance) {

    // ========== LIST COMPANY OBLIGATIONS ==========
    // GET /obligations
    app.get('/obligations', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
        const user = request.user;

        const parseResult = ListObligationsQuerySchema.safeParse(request.query);
        if (!parseResult.success) {
            return reply.status(400).send({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Paramètres invalides',
                    details: parseResult.error.flatten().fieldErrors,
                },
            });
        }

        const result = await obligationService.listObligations(user.companyId, parseResult.data);

        return reply.send({
            success: true,
            data: result.obligations,
            meta: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages,
            },
        });
    });

    // ========== GET OBLIGATION SUMMARY ==========
    // GET /obligations/summary
    app.get('/obligations/summary', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
        const user = request.user;

        const summary = await obligationService.getObligationSummary(user.companyId);

        return reply.send({
            success: true,
            data: summary,
        });
    });

    // ========== GET SINGLE OBLIGATION ==========
    // GET /obligations/:id
    app.get('/obligations/:id', { preHandler: [app.authenticate] }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        try {
            const user = request.user;
            const { id } = request.params;

            const obligation = await obligationService.getObligationById(id, user.companyId);

            return reply.send({
                success: true,
                data: obligation,
            });
        } catch (error: any) {
            if (error.message === 'OBLIGATION_NOT_FOUND') {
                return reply.status(404).send({
                    success: false,
                    error: { code: 'OBLIGATION_NOT_FOUND', message: 'Obligation introuvable' },
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

    // ========== SUBSCRIBE TO REGULATION ==========
    // POST /obligations
    app.post('/obligations', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const user = request.user;

            // Only admins and compliance officers can create
            if (!['COMPANY_ADMIN', 'COMPLIANCE_OFFICER'].includes(user.role)) {
                return reply.status(403).send({
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Droits insuffisants' },
                });
            }

            const parseResult = CreateObligationSchema.safeParse(request.body);
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

            const obligation = await obligationService.createObligation(user.companyId, parseResult.data);

            return reply.status(201).send({
                success: true,
                data: obligation,
            });
        } catch (error: any) {
            if (error.message === 'REGULATION_NOT_FOUND') {
                return reply.status(404).send({
                    success: false,
                    error: { code: 'REGULATION_NOT_FOUND', message: 'Réglementation introuvable' },
                });
            }
            if (error.message === 'OBLIGATION_ALREADY_EXISTS') {
                return reply.status(409).send({
                    success: false,
                    error: { code: 'OBLIGATION_ALREADY_EXISTS', message: 'Cette obligation existe déjà pour votre entreprise' },
                });
            }
            throw error;
        }
    });

    // ========== SUBSCRIBE TO ALL TIER 1 ==========
    // POST /obligations/subscribe-tier1
    app.post('/obligations/subscribe-tier1', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
        const user = request.user;

        // Only admins can bulk subscribe
        if (user.role !== 'COMPANY_ADMIN') {
            return reply.status(403).send({
                success: false,
                error: { code: 'FORBIDDEN', message: 'Seuls les administrateurs peuvent effectuer cette action' },
            });
        }

        const created = await obligationService.subscribeToTier1(user.companyId);

        return reply.status(201).send({
            success: true,
            message: `${created.length} obligations créées`,
            data: created,
        });
    });

    // ========== UPDATE OBLIGATION ==========
    // PUT /obligations/:id
    app.put('/obligations/:id', { preHandler: [app.authenticate] }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        try {
            const user = request.user;
            const { id } = request.params;

            if (!['COMPANY_ADMIN', 'COMPLIANCE_OFFICER'].includes(user.role)) {
                return reply.status(403).send({
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Droits insuffisants' },
                });
            }

            const parseResult = UpdateObligationSchema.safeParse(request.body);
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

            const obligation = await obligationService.updateObligation(id, user.companyId, parseResult.data);

            return reply.send({
                success: true,
                data: obligation,
            });
        } catch (error: any) {
            if (error.message === 'OBLIGATION_NOT_FOUND') {
                return reply.status(404).send({
                    success: false,
                    error: { code: 'OBLIGATION_NOT_FOUND', message: 'Obligation introuvable' },
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

    // ========== DELETE OBLIGATION ==========
    // DELETE /obligations/:id
    app.delete('/obligations/:id', { preHandler: [app.authenticate] }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        try {
            const user = request.user;
            const { id } = request.params;

            if (user.role !== 'COMPANY_ADMIN') {
                return reply.status(403).send({
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Seuls les administrateurs peuvent supprimer des obligations' },
                });
            }

            await obligationService.deactivateObligation(id, user.companyId);

            return reply.status(204).send();
        } catch (error: any) {
            if (error.message === 'OBLIGATION_NOT_FOUND') {
                return reply.status(404).send({
                    success: false,
                    error: { code: 'OBLIGATION_NOT_FOUND', message: 'Obligation introuvable' },
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
