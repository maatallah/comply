import { z } from 'zod';

// ==================== ENUMS ====================

export const UserRole = {
    COMPANY_ADMIN: 'COMPANY_ADMIN',           // Can manage company, users, all data
    COMPLIANCE_OFFICER: 'COMPLIANCE_OFFICER', // Can manage obligations, checks, evidence
    EMPLOYEE: 'EMPLOYEE',                      // Read-only + own training records
} as const;

// ==================== ZOD SCHEMAS ====================

// Register new user (creates company + first admin user)
export const RegisterSchema = z.object({
    // Company info
    companyName: z.string().min(2, 'Le nom de l\'entreprise doit avoir au moins 2 caractères'),
    taxId: z.string().regex(/^\d{7}\/[A-Z]\/[A-Z]\/[A-Z]\/\d{3}$/, {
        message: 'Matricule fiscal invalide. Format: XXXXXXX/X/A/M/XXX',
    }),
    activitySector: z.enum(['TEXTILE', 'CONFECTION', 'CONSTRUCTION', 'FOOD', 'CHEMICAL', 'MECHANICAL', 'OTHER']),
    companySize: z.enum(['MICRO', 'SMALL', 'MEDIUM', 'LARGE']),

    // User info
    firstName: z.string().min(2, 'Le prénom doit avoir au moins 2 caractères'),
    lastName: z.string().min(2, 'Le nom doit avoir au moins 2 caractères'),
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Le mot de passe doit avoir au moins 8 caractères'),
    phone: z.string().regex(/^\+216[2-9]\d{7}$/, {
        message: 'Numéro invalide. Format: +216XXXXXXXX',
    }).optional(),
    preferredLanguage: z.enum(['fr', 'ar']).default('fr'),
});

// Login
export const LoginSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(1, 'Mot de passe requis'),
});

// Create user (by admin, for existing company)
export const CreateUserSchema = z.object({
    firstName: z.string().min(2, 'Le prénom doit avoir au moins 2 caractères'),
    lastName: z.string().min(2, 'Le nom doit avoir au moins 2 caractères'),
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Le mot de passe doit avoir au moins 8 caractères'),
    role: z.enum(['COMPANY_ADMIN', 'COMPLIANCE_OFFICER', 'EMPLOYEE']),
    phone: z.string().regex(/^\+216[2-9]\d{7}$/, {
        message: 'Numéro invalide. Format: +216XXXXXXXX',
    }).optional(),
    preferredLanguage: z.enum(['fr', 'ar']).default('fr'),
});

// Update user
export const UpdateUserSchema = z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    phone: z.string().regex(/^\+216[2-9]\d{7}$/).optional().or(z.literal('')),
    preferredLanguage: z.enum(['fr', 'ar']).optional(),
    role: z.enum(['COMPANY_ADMIN', 'COMPLIANCE_OFFICER', 'EMPLOYEE']).optional(),
});

// Change password
export const ChangePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
    newPassword: z.string().min(8, 'Le nouveau mot de passe doit avoir au moins 8 caractères'),
});

// ==================== TYPES ====================

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

// JWT Payload
export interface JwtPayload {
    userId: string;
    companyId: string;
    email: string;
    role: string;
}

// Auth response
export interface AuthResponse {
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        companyId: string;
    };
    accessToken: string;
    refreshToken: string;
}
