import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { jortService } from './jort.service';
import { jortScraper } from './jort.scraper';
import { CreateJortEntrySchema, ListJortQuerySchema } from './jort.types';

export async function jortRoutes(app: FastifyInstance) {

    // GET /jort-feed (list entries)
    app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
        const query = ListJortQuerySchema.parse(request.query);
        const result = await jortService.listEntries(query);
        return reply.send({ success: true, ...result });
    });

    // GET /jort-feed/years (available years)
    app.get('/years', async (request: FastifyRequest, reply: FastifyReply) => {
        const years = await jortService.getAvailableYears();
        return reply.send({ success: true, years });
    });

    // GET /jort-feed/stats/:year (monthly stats)
    app.get('/stats/:year', async (request: any, reply: FastifyReply) => {
        const { year } = request.params;
        const { status, noiseLevel } = request.query as { status?: 'PENDING' | 'RELEVANT' | 'IGNORED', noiseLevel?: 'LOW' | 'MEDIUM' | 'HIGH' };
        const stats = await jortService.getMonthlyStats(Number(year), status, noiseLevel);
        const serialized = stats.map(s => ({ month: s.month, count: s.count }));
        return reply.send({ success: true, stats: serialized });
    });

    // POST /jort-feed/:id/process
    app.post('/:id/process', { preHandler: [app.authenticate] }, async (request: any, reply: FastifyReply) => {
        const { id } = request.params;
        const { status } = request.body as { status: 'RELEVANT' | 'IGNORED' };

        if (!['RELEVANT', 'IGNORED'].includes(status)) {
            return reply.status(400).send({ success: false, error: 'Invalid status' });
        }

        const entry = await jortService.updateStatus(id, status);
        return reply.send({ success: true, data: entry });
    });

    // Manual creation (for debugging or manual curation)
    app.post('/', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
        const data = CreateJortEntrySchema.parse(request.body);
        const entry = await jortService.createEntry(data);
        return reply.status(201).send({ success: true, data: entry });
    });

    // Trigger scraper (for testing/manual trigger - no auth for convenience)
    app.post('/scrape', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const results = await jortScraper.scrapeLatest();
            return reply.send({ success: true, message: 'Scrape complete', data: results });
        } catch (error: any) {
            request.log.error(`Manual scrape failed: ${error.message}`);
            return reply.status(500).send({
                success: false,
                error: 'Scraping failed due to a technical error. Please check system alerts.'
            });
        }
    });
}
