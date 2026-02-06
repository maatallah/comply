import { z } from 'zod';

// ==================== ENUMS ====================

export const CheckStatus = {
    PENDING: 'PENDING',       // Not yet checked
    PASS: 'PASS',             // Verification passed
    FAIL: 'FAIL',             // Verification failed
    PARTIAL: 'PARTIAL',       // Partially compliant
    NOT_APPLICABLE: 'NOT_APPLICABLE', // N/A for this period
} as const;

// ==================== ZOD SCHEMAS ====================

export const CreateCheckSchema = z.object({
    controlId: z.string().uuid('ID de contrôle invalide'),
    checkDate: z.string().datetime().optional(), // Defaults to now
    status: z.enum(['PENDING', 'PASS', 'FAIL', 'PARTIAL', 'NOT_APPLICABLE']),
    findings: z.string().optional(), // What was found
    correctiveActions: z.string().optional(), // Steps to fix if FAIL/PARTIAL
    checkedBy: z.string().optional(), // Name of person who checked
    nextCheckDate: z.string().datetime().optional(),
});

export const UpdateCheckSchema = z.object({
    status: z.enum(['PENDING', 'PASS', 'FAIL', 'PARTIAL', 'NOT_APPLICABLE']).optional(),
    checkDate: z.string().datetime().optional(),
    findings: z.string().optional(),
    correctiveActions: z.string().optional(),
    checkedBy: z.string().optional(),
    nextCheckDate: z.string().datetime().optional(),
});

export const ListChecksQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    controlId: z.string().uuid().optional(),
    status: z.enum(['PENDING', 'PASS', 'FAIL', 'PARTIAL', 'NOT_APPLICABLE']).optional(),
    fromDate: z.string().datetime().optional(),
    toDate: z.string().datetime().optional(),
    hasActionPlan: z.coerce.boolean().optional(), // Filter checks that have corrective actions
});

// ==================== TYPES ====================

export type CreateCheckInput = z.infer<typeof CreateCheckSchema>;
export type UpdateCheckInput = z.infer<typeof UpdateCheckSchema>;
export type ListChecksQuery = z.infer<typeof ListChecksQuerySchema>;
