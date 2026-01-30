import { z } from 'zod';

// ==================== ENUMS ====================

export const DeadlineStatus = {
    PENDING: 'PENDING',       // Not yet due
    COMPLETED: 'COMPLETED',   // Marked as done
    OVERDUE: 'OVERDUE',       // Past due date
} as const;

// ==================== ZOD SCHEMAS ====================

export const CreateDeadlineSchema = z.object({
    obligationId: z.string().uuid('ID d\'obligation invalide'),
    dueDate: z.string().datetime('Date d\'échéance invalide'),
    isRecurring: z.boolean().default(false),
});

export const UpdateDeadlineSchema = z.object({
    status: z.enum(['PENDING', 'COMPLETED', 'OVERDUE']).optional(),
    completedAt: z.string().datetime().optional(),
});

export const ListDeadlinesQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    obligationId: z.string().uuid().optional(),
    status: z.enum(['PENDING', 'COMPLETED', 'OVERDUE']).optional(),
    upcoming: z.coerce.boolean().optional(), // Only future deadlines
    days: z.coerce.number().int().min(1).max(365).default(30), // Look ahead days
});

// ==================== TYPES ====================

export type CreateDeadlineInput = z.infer<typeof CreateDeadlineSchema>;
export type UpdateDeadlineInput = z.infer<typeof UpdateDeadlineSchema>;
export type ListDeadlinesQuery = z.infer<typeof ListDeadlinesQuerySchema>;
