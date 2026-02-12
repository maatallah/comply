import { FastifyInstance } from 'fastify';
import { actionItemController } from './action-item.controller';

export async function actionItemRoutes(app: FastifyInstance) {
    app.post('/checks/:checkId/actions', { preHandler: [app.authenticate] }, actionItemController.create);
    app.get('/checks/:checkId/actions', { preHandler: [app.authenticate] }, actionItemController.listByCheck);
    app.put('/actions/:id', { preHandler: [app.authenticate] }, actionItemController.update);
    app.delete('/actions/:id', { preHandler: [app.authenticate] }, actionItemController.delete);
}
