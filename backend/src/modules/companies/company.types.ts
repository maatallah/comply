import { z } from 'zod';

// ==================== ENUMS ====================

export const ActivitySector = {
    TEXTILE: 'TEXTILE',
    CONFECTION: 'CONFECTION',
    CONSTRUCTION: 'CONSTRUCTION',
    FOOD: 'FOOD',
    CHEMICAL: 'CHEMICAL',
    MECHANICAL: 'MECHANICAL',
    OTHER: 'OTHER',
} as const;

export const CompanySize = {
    MICRO: 'MICRO',       // 1-9 employees
    SMALL: 'SMALL',       // 10-49 employees
    MEDIUM: 'MEDIUM',     // 50-249 employees
    LARGE: 'LARGE',       // 250+ employees
} as const;

// ==================== VALIDATORS ====================

// Tunisia Tax ID: XXXXXXX/X/A/M/XXX (7 digits / letter / letter / letter / 3 digits)
export function validateTaxId(taxId: string): boolean {
    const regex = /^\d{7}\/[A-Z]\/[A-Z]\/[A-Z]\/\d{3}$/;
    return regex.test(taxId);
}

// Tunisia CNSS: 7-10 digits
export function validateCnssId(cnssId: string): boolean {
    const regex = /^\d{7,10}$/;
    return regex.test(cnssId);
}

// Tunisia phone: +216XXXXXXXX (8 digits after +216)
export function validateTunisiaPhone(phone: string): boolean {
    const regex = /^\+216[2-9]\d{7}$/;
    return regex.test(phone);
}

// ==================== ZOD SCHEMAS ====================

// Create Company - required fields
export const CreateCompanySchema = z.object({
    legalName: z.string().min(2, 'Le nom doit avoir au moins 2 caractères'),
    tradeName: z.string().nullable().optional(),
    taxId: z.string().refine(validateTaxId, {
        message: 'Matricule fiscal invalide. Format: XXXXXXX/X/A/M/XXX',
    }),
    cnssId: z.string().refine((val) => !val || validateCnssId(val), {
        message: 'Numéro CNSS invalide. Format: 7-10 chiffres',
    }).nullable().optional().or(z.literal('')),
    activitySector: z.enum(['TEXTILE', 'CONFECTION', 'CONSTRUCTION', 'FOOD', 'CHEMICAL', 'MECHANICAL', 'OTHER']),
    companySize: z.enum(['MICRO', 'SMALL', 'MEDIUM', 'LARGE']),
    employeeCount: z.number().int().positive().nullable().optional(),
    address: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    region: z.string().nullable().optional(),
    phone: z.string().refine((val) => !val || validateTunisiaPhone(val), {
        message: 'Numéro de téléphone invalide. Format: +216XXXXXXXX',
    }).nullable().optional().or(z.literal('')),
    email: z.string().email('Email invalide').nullable().optional().or(z.literal('')),
    website: z.string().url('URL invalide').nullable().optional().or(z.literal('')),
    regime: z.enum(['ONSHORE', 'OFFSHORE']).optional(),
});

// Update Company - all fields optional
export const UpdateCompanySchema = CreateCompanySchema.partial();

// Query parameters for listing
export const ListCompaniesQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional(),
    sector: z.enum(['TEXTILE', 'CONFECTION', 'CONSTRUCTION', 'FOOD', 'CHEMICAL', 'MECHANICAL', 'OTHER']).optional(),
    isActive: z.coerce.boolean().optional(),
});

// ==================== TYPES ====================

export type CreateCompanyInput = z.infer<typeof CreateCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof UpdateCompanySchema>;
export type ListCompaniesQuery = z.infer<typeof ListCompaniesQuerySchema>;
