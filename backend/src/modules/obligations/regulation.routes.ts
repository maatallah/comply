import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../../shared/prisma';

// ==================== REGULATIONS ROUTES ====================
// Public routes - regulations are reference data

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
}
