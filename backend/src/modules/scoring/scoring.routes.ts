import type { FastifyInstance } from 'fastify';
import { scoringService } from './scoring.service';

export async function scoringRoutes(app: FastifyInstance) {
    // Get compliance breakdown for current company
    app.get('/breakdown', {
        preHandler: [app.authenticate],
        handler: async (request, reply) => {
            const user = request.user as { companyId: string };

            const breakdown = await scoringService.getComplianceBreakdown(user.companyId);

            return reply.send({
                success: true,
                data: breakdown
            });
        }
    });
}
