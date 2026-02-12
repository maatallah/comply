import { FastifyReply, FastifyRequest } from 'fastify';
import { actionItemService } from './action-item.service';
import { CreateActionItemSchema, UpdateActionItemSchema } from './action-item.types';

export class ActionItemController {

    async create(request: FastifyRequest<{ Params: { checkId: string }, Body: any }>, reply: FastifyReply) {
        const { checkId } = request.params;
        const parseResult = CreateActionItemSchema.safeParse(request.body);

        if (!parseResult.success) {
            return reply.status(400).send({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'Invalid data', details: parseResult.error.format() },
            });
        }

        const actionItem = await actionItemService.createActionItem(checkId, parseResult.data);
        return reply.status(201).send({ success: true, data: actionItem });
    }

    async listByCheck(request: FastifyRequest<{ Params: { checkId: string } }>, reply: FastifyReply) {
        const { checkId } = request.params;
        const actionItems = await actionItemService.getActionItemsByCheck(checkId);
        return reply.send({ success: true, data: actionItems });
    }

    async update(request: FastifyRequest<{ Params: { id: string }, Body: any }>, reply: FastifyReply) {
        const { id } = request.params;
        const parseResult = UpdateActionItemSchema.safeParse(request.body);

        if (!parseResult.success) {
            return reply.status(400).send({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'Invalid data', details: parseResult.error.format() },
            });
        }

        const actionItem = await actionItemService.updateActionItem(id, parseResult.data);
        return reply.send({ success: true, data: actionItem });
    }

    async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const { id } = request.params;
        await actionItemService.deleteActionItem(id);
        return reply.status(204).send();
    }
}

export const actionItemController = new ActionItemController();
