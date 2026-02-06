
import { FastifyReply, FastifyRequest } from 'fastify';
import { AlertService } from './alert.service';

const alertService = new AlertService();

export class AlertController {

    async getMyAlerts(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = request.user.userId;
            const { unreadOnly } = request.query as { unreadOnly?: string };
            const alerts = await alertService.getAlerts(userId, unreadOnly === 'true');
            return reply.send({ success: true, data: alerts });
        } catch (error: any) {
            return reply.status(500).send({ success: false, error: { message: error.message } });
        }
    }

    async getUnreadCount(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = request.user.userId;
            const count = await alertService.getUnreadCount(userId);
            return reply.send({ success: true, data: { count } });
        } catch (error: any) {
            return reply.status(500).send({ success: false, error: { message: error.message } });
        }
    }

    async markAsRead(request: any, reply: FastifyReply) {
        const userId = request.user.userId;
        const { id } = request.params;

        try {
            const alert = await alertService.markAsRead(id, userId);
            return reply.send({ success: true, data: alert });
        } catch (error: any) {
            return reply.status(404).send({ success: false, error: { message: error.message } });
        }
    }

    async markAllAsRead(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = request.user.userId;
            await alertService.markAllAsRead(userId);
            return reply.send({ success: true });
        } catch (error: any) {
            return reply.status(500).send({ success: false, error: { message: error.message } });
        }
    }

    async deleteAllAlerts(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = request.user.userId;
            await alertService.deleteAllAlerts(userId);
            return reply.send({ success: true });
        } catch (error: any) {
            return reply.status(500).send({ success: false, error: { message: error.message } });
        }
    }

    async deleteAlert(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = request.user.userId;
            const { id } = request.params as { id: string };
            await alertService.deleteAlert(id, userId);
            return reply.send({ success: true });
        } catch (error: any) {
            return reply.status(404).send({ success: false, error: { message: error.message } });
        }
    }

    async bulkAction(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = request.user.userId;
            const { ids, action } = request.body as { ids: string[], action: 'read' | 'delete' };

            if (action === 'read') {
                await alertService.markAlertsAsRead(ids, userId);
            } else if (action === 'delete') {
                await alertService.deleteAlerts(ids, userId);
            }

            return reply.send({ success: true });
        } catch (error: any) {
            return reply.status(500).send({ success: false, error: { message: error.message } });
        }
    }

    async generateTestAlerts(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = request.user.userId;
            const companyId = request.user.companyId;
            console.log('DEBUG: Generate alerts for:', { userId, companyId });

            if (!companyId) return reply.status(400).send({ success: false, error: { message: 'User has no company' } });

            const count = await alertService.generateTestAlerts(userId, companyId);
            return reply.send({ success: true, data: { count } });
        } catch (error: any) {
            console.error('ERROR in generateTestAlerts:', error);
            return reply.status(500).send({ success: false, error: { message: error.message } });
        }
    }

    /**
     * Internal/Admin endpoint to trigger a scan
     */
    async triggerScan(request: FastifyRequest, reply: FastifyReply) {
        // In a real app, this would be a CRON job.
        // For testing, we allow triggering it.
        const result = await alertService.scanAndGenerateAlerts();
        return reply.send({ success: true, ...result });
    }
}
