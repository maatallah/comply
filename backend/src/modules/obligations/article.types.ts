import { z } from 'zod';

// ==================== ZOD SCHEMAS ====================

export const CreateArticleSchema = z.object({
    regulationId: z.string().uuid(),
    number: z.string().min(1),
    contentFr: z.string().optional(),
    contentAr: z.string().optional(),
});

export const UpdateArticleSchema = z.object({
    number: z.string().optional(),
    contentFr: z.string().optional(),
    contentAr: z.string().optional(),
});

// ==================== TYPES ====================

export type CreateArticleInput = z.infer<typeof CreateArticleSchema>;
export type UpdateArticleInput = z.infer<typeof UpdateArticleSchema>;
