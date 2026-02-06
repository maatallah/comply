import type { FastifyInstance } from 'fastify';
import { reportsService } from './reports.service';

export async function reportsRoutes(app: FastifyInstance) {
    // Generate PDF report for obligations
    app.get('/obligations-pdf', {
        preHandler: [app.authenticate],
        handler: async (request, reply) => {
            const user = request.user as { companyId: string };

            try {
                const pdfBuffer = await reportsService.generateObligationsPdf(user.companyId);

                reply
                    .header('Content-Type', 'application/pdf')
                    .header('Content-Disposition', 'attachment; filename="rapport-conformite.pdf"')
                    .send(pdfBuffer);
            } catch (error) {
                console.error('PDF generation error:', error);
                reply.status(500).send({
                    success: false,
                    error: { code: 'PDF_ERROR', message: 'Erreur lors de la génération du PDF' }
                });
            }
        }
    });
}
