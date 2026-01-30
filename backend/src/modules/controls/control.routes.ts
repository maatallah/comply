import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { controlService } from './control.service';
import {
    CreateControlSchema,
    UpdateControlSchema,
    ListControlsQuerySchema,
} from './control.types';

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

export async function controlRoutes(app: FastifyInstance) {

    // ========== LIST CONTROLS ==========
    // GET /controls
    app.get('/controls', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
        const user = request.user;

        const parseResult = ListControlsQuerySchema.safeParse(request.query);
        if (!parseResult.success) {
            return reply.status(400).send({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'Paramètres invalides' },
            });
        }

        const result = await controlService.listControls(user.companyId, parseResult.data);

        return reply.send({
            success: true,
            data: result.controls,
            meta: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages,
            },
        });
    });

    // ========== GET SINGLE CONTROL ==========
    // GET /controls/:id
    app.get('/controls/:id', { preHandler: [app.authenticate] }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        try {
            const user = request.user;
            const { id } = request.params;

            const control = await controlService.getControlById(id, user.companyId);

            return reply.send({
                success: true,
                data: control,
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

    // ========== CREATE CONTROL ==========
    // POST /controls
    app.post('/controls', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const user = request.user;

            if (!['COMPANY_ADMIN', 'COMPLIANCE_OFFICER'].includes(user.role)) {
                return reply.status(403).send({
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Droits insuffisants' },
                });
            }

            const parseResult = CreateControlSchema.safeParse(request.body);
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

            const control = await controlService.createControl(user.companyId, parseResult.data);

            return reply.status(201).send({
                success: true,
                data: control,
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

    // ========== UPDATE CONTROL ==========
    // PUT /controls/:id
    app.put('/controls/:id', { preHandler: [app.authenticate] }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        try {
            const user = request.user;
            const { id } = request.params;

            if (!['COMPANY_ADMIN', 'COMPLIANCE_OFFICER'].includes(user.role)) {
                return reply.status(403).send({
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Droits insuffisants' },
                });
            }

            const parseResult = UpdateControlSchema.safeParse(request.body);
            if (!parseResult.success) {
                return reply.status(400).send({
                    success: false,
                    error: { code: 'VALIDATION_ERROR', message: 'Données invalides' },
                });
            }

            const control = await controlService.updateControl(id, user.companyId, parseResult.data);

            return reply.send({
                success: true,
                data: control,
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

    // ========== DELETE CONTROL ==========
    // DELETE /controls/:id
    app.delete('/controls/:id', { preHandler: [app.authenticate] }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        try {
            const user = request.user;
            const { id } = request.params;

            if (user.role !== 'COMPANY_ADMIN') {
                return reply.status(403).send({
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Seuls les administrateurs peuvent supprimer' },
                });
            }

            await controlService.deactivateControl(id, user.companyId);

            return reply.status(204).send();
        } catch (error: any) {
            if (error.message === 'CONTROL_NOT_FOUND') {
                return reply.status(404).send({
                    success: false,
                    error: { code: 'CONTROL_NOT_FOUND', message: 'Contrôle introuvable' },
                });
            }
            throw error;
        }
    });
}
