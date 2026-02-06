import { z } from 'zod';

// ==================== ZOD SCHEMAS ====================

export const CreateEvidenceSchema = z.object({
    checkId: z.string().uuid().optional(),
    controlId: z.string().uuid().optional(),
    fileName: z.string().min(1, 'Nom de fichier requis'),
    fileType: z.string().min(1, 'Type de fichier requis'),
    filePath: z.string().min(1, 'Chemin de fichier requis'),
    fileSize: z.number().int().positive('Taille invalide'),
    description: z.string().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
});

export const UpdateEvidenceSchema = z.object({
    description: z.string().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
});

export const ListEvidenceQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    checkId: z.string().uuid().optional(),
});

// ==================== TYPES ====================

export type CreateEvidenceInput = z.infer<typeof CreateEvidenceSchema>;
export type UpdateEvidenceInput = z.infer<typeof UpdateEvidenceSchema>;
export type ListEvidenceQuery = z.infer<typeof ListEvidenceQuerySchema>;
