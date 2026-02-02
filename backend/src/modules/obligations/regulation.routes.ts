import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../../shared/prisma';
import { z } from 'zod';

// Validation schemas
const CreateRegulationSchema = z.object({
    code: z.string().min(3, 'Le code doit avoir au moins 3 caractères'),
    titleFr: z.string().min(5, 'Le titre doit avoir au moins 5 caractères'),
    titleAr: z.string().optional(),
    descriptionFr: z.string().optional(),
    descriptionAr: z.string().optional(),
    category: z.enum(['HSE', 'FISCAL', 'SOCIAL', 'ENVIRONMENTAL', 'BRAND_AUDIT', 'QUALITY']),
    authority: z.string().min(2, 'L\'autorité est obligatoire'),
    sourceUrl: z.string().optional(),
});

const UpdateRegulationSchema = CreateRegulationSchema.partial();

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

// ==================== REGULATIONS ROUTES ====================

export async function regulationRoutes(app: FastifyInstance) {

    // ========== LIST ALL REGULATIONS ==========
    // GET /regulations
    app.get('/regulations', async (request: FastifyRequest, reply: FastifyReply) => {
        const regulations = await prisma.regulation.findMany({
            where: { isActive: true },
            orderBy: { category: 'asc' },
        });

        return reply.send({
            success: true,
            data: regulations,
            meta: {
                total: regulations.length,
            },
        });
    });

    // ========== GET REGULATION BY ID ==========
    // GET /regulations/:id
    app.get('/regulations/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        const { id } = request.params;

        const regulation = await prisma.regulation.findUnique({
            where: { id },
        });

        if (!regulation) {
            return reply.status(404).send({
                success: false,
                error: {
                    code: 'REGULATION_NOT_FOUND',
                    message: 'Réglementation introuvable',
                },
            });
        }

        return reply.send({
            success: true,
            data: regulation,
        });
    });

    // ========== GET REGULATIONS BY CATEGORY ==========
    // GET /regulations/category/:category
    app.get('/regulations/category/:category', async (request: FastifyRequest<{ Params: { category: string } }>, reply: FastifyReply) => {
        const { category } = request.params;

        const validCategories = ['HSE', 'FISCAL', 'SOCIAL', 'ENVIRONMENTAL', 'BRAND_AUDIT', 'QUALITY'];
        if (!validCategories.includes(category.toUpperCase())) {
            return reply.status(400).send({
                success: false,
                error: {
                    code: 'INVALID_CATEGORY',
                    message: `Catégorie invalide. Valeurs acceptées: ${validCategories.join(', ')}`,
                },
            });
        }

        const regulations = await prisma.regulation.findMany({
            where: {
                category: category.toUpperCase(),
                isActive: true,
            },
            orderBy: { code: 'asc' },
        });

        return reply.send({
            success: true,
            data: regulations,
            meta: {
                category: category.toUpperCase(),
                total: regulations.length,
            },
        });
    });

    // ========== CREATE REGULATION ==========
    // POST /regulations (Admin only)
    app.post('/regulations', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const user = request.user;

            // Only PLATFORM_ADMIN or COMPANY_ADMIN can create regulations
            if (!['PLATFORM_ADMIN', 'COMPANY_ADMIN'].includes(user.role)) {
                return reply.status(403).send({
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Droits insuffisants' },
                });
            }

            const parseResult = CreateRegulationSchema.safeParse(request.body);
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

            // Check if code already exists
            const existingCode = await prisma.regulation.findUnique({
                where: { code: parseResult.data.code },
            });
            if (existingCode) {
                return reply.status(409).send({
                    success: false,
                    error: { code: 'REGULATION_CODE_EXISTS', message: 'Ce code de réglementation existe déjà' },
                });
            }

            const regulation = await prisma.regulation.create({
                data: parseResult.data,
            });

            return reply.status(201).send({
                success: true,
                data: regulation,
            });
        } catch (error) {
            throw error;
        }
    });

    // ========== UPDATE REGULATION ==========
    // PUT /regulations/:id (Admin only)
    app.put('/regulations/:id', { preHandler: [app.authenticate] }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        try {
            const user = request.user;
            const { id } = request.params;

            if (!['PLATFORM_ADMIN', 'COMPANY_ADMIN'].includes(user.role)) {
                return reply.status(403).send({
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Droits insuffisants' },
                });
            }

            const regulation = await prisma.regulation.findUnique({ where: { id } });
            if (!regulation) {
                return reply.status(404).send({
                    success: false,
                    error: { code: 'REGULATION_NOT_FOUND', message: 'Réglementation introuvable' },
                });
            }

            const parseResult = UpdateRegulationSchema.safeParse(request.body);
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

            // Check if new code already exists (if changing code)
            if (parseResult.data.code && parseResult.data.code !== regulation.code) {
                const existingCode = await prisma.regulation.findUnique({
                    where: { code: parseResult.data.code },
                });
                if (existingCode) {
                    return reply.status(409).send({
                        success: false,
                        error: { code: 'REGULATION_CODE_EXISTS', message: 'Ce code de réglementation existe déjà' },
                    });
                }
            }

            const updated = await prisma.regulation.update({
                where: { id },
                data: parseResult.data,
            });

            return reply.send({
                success: true,
                data: updated,
            });
        } catch (error) {
            throw error;
        }
    });

    // ========== DELETE REGULATION ==========
    // DELETE /regulations/:id (Admin only - soft delete)
    app.delete('/regulations/:id', { preHandler: [app.authenticate] }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        try {
            const user = request.user;
            const { id } = request.params;

            if (!['PLATFORM_ADMIN', 'COMPANY_ADMIN'].includes(user.role)) {
                return reply.status(403).send({
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Droits insuffisants' },
                });
            }

            const regulation = await prisma.regulation.findUnique({ where: { id } });
            if (!regulation) {
                return reply.status(404).send({
                    success: false,
                    error: { code: 'REGULATION_NOT_FOUND', message: 'Réglementation introuvable' },
                });
            }

            // Check if any obligations are linked
            const linkedObligations = await prisma.obligation.count({
                where: { regulationId: id, isActive: true },
            });
            if (linkedObligations > 0) {
                return reply.status(409).send({
                    success: false,
                    error: {
                        code: 'REGULATION_HAS_OBLIGATIONS',
                        message: `Cette réglementation est liée à ${linkedObligations} obligation(s) active(s). Supprimez-les d'abord.`,
                    },
                });
            }

            // Soft delete
            await prisma.regulation.update({
                where: { id },
                data: { isActive: false },
            });

            return reply.status(204).send();
        } catch (error) {
            throw error;
        }
    });
}
