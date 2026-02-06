import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { articleService } from './article.service';
import { CreateArticleSchema, UpdateArticleSchema } from './article.types';

export async function articleRoutes(app: FastifyInstance) {

    // GET /regulations/:regulationId/articles
    app.get('/regulations/:regulationId/articles', async (request: FastifyRequest, reply: FastifyReply) => {
        const { regulationId } = request.params as { regulationId: string };
        const articles = await articleService.getArticlesByRegulation(regulationId);
        return reply.send({ success: true, data: articles });
    });

    // POST /articles
    app.post('/articles', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
        // Only admins can manage articles
        const user = (request as any).user;
        if (user.role !== 'COMPANY_ADMIN' && user.role !== 'SUPER_ADMIN') {
            return reply.status(403).send({ success: false, error: 'Forbidden' });
        }

        const data = CreateArticleSchema.parse(request.body);
        const article = await articleService.createArticle(data);
        return reply.status(201).send({ success: true, data: article });
    });

    // PUT /articles/:id
    app.put('/articles/:id', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
        const user = (request as any).user;
        if (user.role !== 'COMPANY_ADMIN' && user.role !== 'SUPER_ADMIN') {
            return reply.status(403).send({ success: false, error: 'Forbidden' });
        }

        const { id } = request.params as { id: string };
        const data = UpdateArticleSchema.parse(request.body);
        const article = await articleService.updateArticle(id, data);
        return reply.send({ success: true, data: article });
    });

    // DELETE /articles/:id
    app.delete('/articles/:id', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
        const user = (request as any).user;
        if (user.role !== 'COMPANY_ADMIN' && user.role !== 'SUPER_ADMIN') {
            return reply.status(403).send({ success: false, error: 'Forbidden' });
        }

        const { id } = request.params as { id: string };
        await articleService.deleteArticle(id);
        return reply.send({ success: true });
    });
}
