import { z } from 'zod';

export const ActionItemPriority = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL',
} as const;

export const ActionItemStatus = {
    PENDING: 'PENDING',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
} as const;

export const CreateActionItemSchema = z.object({
    description: z.string().min(1, 'La description est requise'),
    priority: z.nativeEnum(ActionItemPriority).default('MEDIUM'),
    status: z.nativeEnum(ActionItemStatus).default('PENDING'),
    dueDate: z.string().datetime().optional(),
    assignedTo: z.string().uuid().optional(),
});

export const UpdateActionItemSchema = z.object({
    description: z.string().min(1).optional(),
    priority: z.nativeEnum(ActionItemPriority).optional(),
    status: z.nativeEnum(ActionItemStatus).optional(),
    dueDate: z.string().datetime().optional(),
    assignedTo: z.string().uuid().optional(),
});

export const UpdateActionItemStatusSchema = z.object({
    status: z.nativeEnum(ActionItemStatus),
});

export type CreateActionItemInput = z.infer<typeof CreateActionItemSchema>;
export type UpdateActionItemInput = z.infer<typeof UpdateActionItemSchema>;
