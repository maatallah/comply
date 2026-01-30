import { z } from 'zod';

// ==================== ENUMS ====================

export const ControlType = {
    DOCUMENT: 'DOCUMENT',         // Document to maintain
    CERTIFICATION: 'CERTIFICATION', // External certification needed
    INSPECTION: 'INSPECTION',     // Physical inspection required
    TRAINING: 'TRAINING',         // Training to complete
    DECLARATION: 'DECLARATION',   // Periodic declaration
    AUDIT: 'AUDIT',              // Internal/external audit
} as const;

// ==================== ZOD SCHEMAS ====================

export const CreateControlSchema = z.object({
    obligationId: z.string().uuid('ID d\'obligation invalide'),
    titleFr: z.string().min(3, 'Le titre doit avoir au moins 3 caractères'),
    titleAr: z.string().optional(),
    descriptionFr: z.string().optional(),
    controlType: z.enum(['DOCUMENT', 'CERTIFICATION', 'INSPECTION', 'TRAINING', 'DECLARATION', 'AUDIT']),
    expectedEvidence: z.string().optional(),
    frequency: z.enum(['CONTINUOUS', 'MONTHLY', 'QUARTERLY', 'ANNUAL', 'BIENNIAL', 'TRIENNIAL']),
});

export const UpdateControlSchema = z.object({
    titleFr: z.string().min(3).optional(),
    titleAr: z.string().optional(),
    descriptionFr: z.string().optional(),
    controlType: z.enum(['DOCUMENT', 'CERTIFICATION', 'INSPECTION', 'TRAINING', 'DECLARATION', 'AUDIT']).optional(),
    expectedEvidence: z.string().optional(),
    frequency: z.enum(['CONTINUOUS', 'MONTHLY', 'QUARTERLY', 'ANNUAL', 'BIENNIAL', 'TRIENNIAL']).optional(),
    isActive: z.boolean().optional(),
});

export const ListControlsQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    obligationId: z.string().uuid().optional(),
    controlType: z.enum(['DOCUMENT', 'CERTIFICATION', 'INSPECTION', 'TRAINING', 'DECLARATION', 'AUDIT']).optional(),
});

// ==================== TYPES ====================

export type CreateControlInput = z.infer<typeof CreateControlSchema>;
export type UpdateControlInput = z.infer<typeof UpdateControlSchema>;
export type ListControlsQuery = z.infer<typeof ListControlsQuerySchema>;
