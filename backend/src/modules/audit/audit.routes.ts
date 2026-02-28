import { FastifyInstance } from 'fastify';
import { auditService } from './audit.service';
import { z } from 'zod';

export async function auditRoutes(app: FastifyInstance) {

    // GET /audits - List with filters
    app.get('/', { preHandler: [app.authenticate] }, async (request: any, reply) => {
        const user = request.user; // Assuming JWT auth middleware populates this
        const { status, scope, typeId } = request.query as any;

        try {
            const audits = await auditService.listAudits(user, { status, scope, typeId });
            return { success: true, audits };
        } catch (error: any) {
            return reply.status(500).send({ success: false, message: error.message });
        }
    });

    // GET /audits/types - List available types
    app.get('/types', { preHandler: [app.authenticate] }, async (request, reply) => {
        try {
            const types = await auditService.listAuditTypes();
            return { success: true, types };
        } catch (error: any) {
            return reply.status(500).send({ success: false, message: error.message });
        }
    });

    // POST /audits - Schedule new
    app.post('/', { preHandler: [app.authenticate] }, async (request: any, reply) => {
        const user = request.user;
        const body = request.body as any;

        try {
            const audit = await auditService.createAudit({
                ...body,
                companyId: user.companyId // Enforce company
            });
            return { success: true, audit };
        } catch (error: any) {
            return reply.status(500).send({ success: false, message: error.message });
        }
    });

    // GET /audits/:id - Detail
    app.get('/:id', { preHandler: [app.authenticate] }, async (request: any, reply) => {
        const user = request.user;
        const { id } = request.params as any;

        try {
            const audit = await auditService.getAuditById(id, user);
            return { success: true, audit };
        } catch (error: any) {
            if (error.message.includes('Unauthorized')) {
                return reply.status(403).send({ success: false, message: error.message });
            }
            return reply.status(404).send({ success: false, message: 'Not Found' });
        }
    });

    // PATCH /audits/:id - Update results/team
    app.patch('/:id', { preHandler: [app.authenticate] }, async (request: any, reply) => {
        const user = request.user;
        const { id } = request.params as any;
        const body = request.body;

        try {
            // Check permission handled in service, but ideally prevent Employees from certain updates?
            // For MVP, allow team members to edit results.
            const updated = await auditService.updateAudit(id, { ...body, companyId: user.companyId }, user);
            return { success: true, audit: updated };
        } catch (error: any) {
            if (error.message.includes('Unauthorized')) {
                return reply.status(403).send({ success: false, message: error.message });
            }
            return reply.status(500).send({ success: false, message: error.message });
        }
    });

    // POST /audits/:id/start - Start execution (generate checklist)
    app.post('/:id/start', { preHandler: [app.authenticate] }, async (request: any, reply) => {
        const user = request.user;
        const { id } = request.params as any;

        try {
            const audit = await auditService.startAudit(id, user.userId, user.role, user.companyId);
            return { success: true, audit };
        } catch (error: any) {
            if (error.message.includes('Unauthorized')) {
                return reply.status(403).send({ success: false, message: error.message });
            }
            return reply.status(500).send({ success: false, message: error.message });
        }
    });

    // POST /audits/:id/complete - Complete and calculate score
    app.post('/:id/complete', { preHandler: [app.authenticate] }, async (request: any, reply) => {
        const user = request.user;
        const { id } = request.params as any;

        try {
            const audit = await auditService.completeAudit(id, user.id, user.role, user.companyId);
            return { success: true, audit };
        } catch (error: any) {
            if (error.message.includes('Unauthorized')) {
                return reply.status(403).send({ success: false, message: error.message });
            }
            return reply.status(500).send({ success: false, message: error.message });
        }
    });



    // POST /audits/:id/actions - Add CAP
    app.post('/:id/actions', { preHandler: [app.authenticate] }, async (request: any, reply) => {
        const { id } = request.params as any;
        const body = request.body;

        try {
            const action = await auditService.addCorrectiveAction(id, body);
            return { success: true, action };
        } catch (error: any) {
            return reply.status(500).send({ success: false, message: error.message });
        }
    });

    // DELETE /audits/:id - Delete Audit
    app.delete('/:id', { preHandler: [app.authenticate] }, async (request: any, reply) => {
        const user = request.user;
        const { id } = request.params as any;

        try {
            // Only admins or officers should be able to delete
            if (user.role !== 'COMPANY_ADMIN' && user.role !== 'COMPLIANCE_OFFICER') {
                return reply.status(403).send({ success: false, message: 'Unauthorized mechanism. Admins only.' });
            }

            await auditService.deleteAudit(id, user);
            return { success: true, message: 'Audit deleted successfully' };
        } catch (error: any) {
            if (error.message.includes('Unauthorized')) {
                return reply.status(403).send({ success: false, message: error.message });
            }
            return reply.status(500).send({ success: false, message: error.message });
        }
    });
}
