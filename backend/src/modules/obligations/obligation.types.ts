import { z } from 'zod';

// ==================== ENUMS ====================

export const ObligationCategory = {
    HSE: 'HSE',                     // Health, Safety, Environment
    FISCAL: 'FISCAL',               // Tax obligations
    SOCIAL: 'SOCIAL',               // Labor/social security
    ENVIRONMENTAL: 'ENVIRONMENTAL', // Environmental regulations
    BRAND_AUDIT: 'BRAND_AUDIT',     // BSCI, Disney, etc.
    QUALITY: 'QUALITY',             // ISO, certifications
} as const;

export const ObligationFrequency = {
    CONTINUOUS: 'CONTINUOUS',   // Ongoing (e.g., work contracts)
    MONTHLY: 'MONTHLY',         // Every month (CNSS, TVA)
    QUARTERLY: 'QUARTERLY',     // Every 3 months
    ANNUAL: 'ANNUAL',           // Once a year
    BIENNIAL: 'BIENNIAL',       // Every 2 years
    TRIENNIAL: 'TRIENNIAL',     // Every 3 years
} as const;

export const RiskLevel = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL',
} as const;

// ==================== ZOD SCHEMAS ====================

// Create obligation for a company (subscribe to a regulation)
export const CreateObligationSchema = z.object({
    regulationId: z.string().uuid('ID de réglementation invalide'),
    titleFr: z.string().min(5, 'Le titre doit avoir au moins 5 caractères').optional(),
    titleAr: z.string().optional(),
    descriptionFr: z.string().optional(),
    descriptionAr: z.string().optional(),
    frequency: z.enum(['CONTINUOUS', 'MONTHLY', 'QUARTERLY', 'ANNUAL', 'BIENNIAL', 'TRIENNIAL']),
    riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
    articleId: z.string().uuid('ID d\'article invalide').optional(),
    // First deadline date (optional, will calculate from frequency)
    firstDeadline: z.string().datetime().optional(),
});

// Update obligation
export const UpdateObligationSchema = z.object({
    titleFr: z.string().min(5).optional(),
    titleAr: z.string().optional(),
    descriptionFr: z.string().optional(),
    descriptionAr: z.string().optional(),
    frequency: z.enum(['CONTINUOUS', 'MONTHLY', 'QUARTERLY', 'ANNUAL', 'BIENNIAL', 'TRIENNIAL']).optional(),
    riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    articleId: z.string().uuid().optional(),
    isActive: z.boolean().optional(),
});

// Query for listing
export const ListObligationsQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    category: z.enum(['HSE', 'FISCAL', 'SOCIAL', 'ENVIRONMENTAL', 'BRAND_AUDIT', 'QUALITY']).optional(),
    riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    isActive: z.coerce.boolean().default(true),
});

// ==================== TYPES ====================

export type CreateObligationInput = z.infer<typeof CreateObligationSchema>;
export type UpdateObligationInput = z.infer<typeof UpdateObligationSchema>;
export type ListObligationsQuery = z.infer<typeof ListObligationsQuerySchema>;
