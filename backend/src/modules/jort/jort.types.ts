import { z } from 'zod';

// ==================== ZOD SCHEMAS ====================

export const JortEntryStatus = {
    PENDING: 'PENDING',
    RELEVANT: 'RELEVANT',
    IGNORED: 'IGNORED',
} as const;

export const CreateJortEntrySchema = z.object({
    titleFr: z.string().min(1),
    titleAr: z.string().optional(),
    ministry: z.string().optional(),
    ministryAr: z.string().optional(),
    type: z.string().optional(), // Law, Decree, etc.
    jortNumber: z.string().optional(),
    recordId: z.string().optional(),
    date: z.string().datetime().optional(),
    pdfUrl: z.string().url().optional(),
    pdfUrlAr: z.string().url().optional(),
});

export const ListJortQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: z.enum(['PENDING', 'RELEVANT', 'IGNORED']).optional(),
    ministry: z.string().optional(),
    search: z.string().optional(),
    year: z.coerce.number().int().min(1900).max(2100).optional(),
    month: z.coerce.number().int().min(1).max(12).optional(),
    noiseLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM').optional(),
});

// ==================== TYPES ====================

export type CreateJortEntryInput = z.infer<typeof CreateJortEntrySchema>;
export type ListJortQuery = z.infer<typeof ListJortQuerySchema>;
