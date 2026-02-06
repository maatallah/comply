
import { FastifyInstance } from 'fastify';
import { AlertController } from './alert.controller';

const alertController = new AlertController();

export async function alertRoutes(fastify: FastifyInstance) {

    // Get unread alerts
    fastify.get('/', {
        onRequest: [fastify.authenticate]
    }, alertController.getMyAlerts);

    // Get unread count
    fastify.get('/unread-count', {
        onRequest: [fastify.authenticate]
    }, alertController.getUnreadCount);

    // Mark all as read
    fastify.put('/read-all', {
        onRequest: [fastify.authenticate]
    }, alertController.markAllAsRead);

    // DELETE ALL alerts (Debug/Test)
    fastify.delete('/clear-all', {
        onRequest: [fastify.authenticate]
    }, alertController.deleteAllAlerts);

    // DELETE single alert
    fastify.delete('/:id', {
        onRequest: [fastify.authenticate]
    }, alertController.deleteAlert);

    // BULK action (read/delete)
    fastify.post('/bulk', {
        onRequest: [fastify.authenticate]
    }, alertController.bulkAction);

    // GENERATE test alerts (Debug/Test)
    fastify.post('/test-generate', {
        onRequest: [fastify.authenticate]
    }, alertController.generateTestAlerts);

    // Internal/Admin endpoint to trigger a scan
    fastify.post('/scan', {
        onRequest: [fastify.authenticate]
    }, alertController.triggerScan);
}
