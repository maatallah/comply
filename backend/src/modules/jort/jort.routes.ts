import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { jortService } from './jort.service';
import { CreateJortEntrySchema, ListJortQuerySchema } from './jort.types';

export async function jortRoutes(app: FastifyInstance) {

    // GET /jort-feed
    app.get('/jort-feed', async (request: FastifyRequest, reply: FastifyReply) => {
        const query = ListJortQuerySchema.parse(request.query);
        const result = await jortService.listEntries(query);
        return reply.send({ success: true, ...result });
    });

    // POST /jort-feed/:id/process
    app.post('/jort-feed/:id/process', { preHandler: [app.authenticate] }, async (request: any, reply: FastifyReply) => {
        const { id } = request.params;
        const { status } = request.body as { status: 'RELEVANT' | 'IGNORED' };

        if (!['RELEVANT', 'IGNORED'].includes(status)) {
            return reply.status(400).send({ success: false, error: 'Invalid status' });
        }

        const entry = await jortService.updateStatus(id, status);
        return reply.send({ success: true, data: entry });
    });

    // Manual creation (for debugging or manual curation)
    app.post('/jort-feed', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
        const data = CreateJortEntrySchema.parse(request.body);
        const entry = await jortService.createEntry(data);
        return reply.status(201).send({ success: true, data: entry });
    });
}
