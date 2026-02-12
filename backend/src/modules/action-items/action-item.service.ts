import prisma from '../../shared/prisma';
import { CreateActionItemInput, UpdateActionItemInput } from './action-item.types';

export class ActionItemService {

    async createActionItem(checkId: string, data: CreateActionItemInput) {
        return prisma.actionItem.create({
            data: {
                checkId,
                ...data,
            },
        });
    }

    async getActionItemsByCheck(checkId: string) {
        return prisma.actionItem.findMany({
            where: { checkId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateActionItem(id: string, data: UpdateActionItemInput) {
        return prisma.actionItem.update({
            where: { id },
            data,
        });
    }

    async deleteActionItem(id: string) {
        return prisma.actionItem.delete({
            where: { id },
        });
    }

    async updateStatus(id: string, status: string) {
        return prisma.actionItem.update({
            where: { id },
            data: { status },
        });
    }
}

export const actionItemService = new ActionItemService();
