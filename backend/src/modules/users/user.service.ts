import bcrypt from 'bcrypt';
import { userRepository } from './user.repository';
import { companyRepository } from '../companies/company.repository';
import prisma from '../../shared/prisma';
import type { User } from '@prisma/client';
import type {
    RegisterInput,
    LoginInput,
    CreateUserInput,
    UpdateUserInput,
    ChangePasswordInput,
    AuthResponse
} from './user.types';

const SALT_ROUNDS = 12;

// ==================== SERVICE ====================

export class UserService {

    // Register new company + admin user
    async register(data: RegisterInput): Promise<{ user: User; company: any }> {
        // Check if email exists
        const emailExists = await userRepository.emailExists(data.email);
        if (emailExists) {
            throw new Error('EMAIL_ALREADY_EXISTS');
        }

        // Check if Tax ID exists
        const taxIdExists = await companyRepository.taxIdExists(data.taxId);
        if (taxIdExists) {
            throw new Error('COMPANY_TAX_ID_EXISTS');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

        // Create company + user in transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create company
            const company = await tx.company.create({
                data: {
                    legalName: data.companyName,
                    taxId: data.taxId,
                    activitySector: data.activitySector,
                    companySize: data.companySize,
                },
            });

            // Create admin user
            const user = await tx.user.create({
                data: {
                    companyId: company.id,
                    email: data.email,
                    passwordHash,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    role: 'COMPANY_ADMIN',
                    phone: data.phone || null,
                    preferredLanguage: data.preferredLanguage,
                },
            });

            return { user, company };
        });

        return result;
    }

    // Login
    async login(data: LoginInput): Promise<User> {
        // Find user
        const user = await userRepository.findByEmail(data.email);
        if (!user) {
            throw new Error('INVALID_CREDENTIALS');
        }

        // Check if active
        if (!user.isActive) {
            throw new Error('USER_INACTIVE');
        }

        // Verify password
        const valid = await bcrypt.compare(data.password, user.passwordHash);
        if (!valid) {
            throw new Error('INVALID_CREDENTIALS');
        }

        // Update last login
        await userRepository.update(user.id, { lastLoginAt: new Date() });

        return user;
    }

    // Create user (by admin)
    async createUser(companyId: string, data: CreateUserInput): Promise<User> {
        // Check email exists
        const emailExists = await userRepository.emailExists(data.email);
        if (emailExists) {
            throw new Error('EMAIL_ALREADY_EXISTS');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

        return userRepository.create(companyId, {
            ...data,
            passwordHash,
        });
    }

    // Get user by ID
    async getUserById(id: string, companyId: string): Promise<User> {
        const user = await userRepository.findById(id);
        if (!user) {
            throw new Error('USER_NOT_FOUND');
        }

        // Multi-tenancy check
        if (user.companyId !== companyId) {
            throw new Error('ACCESS_DENIED');
        }

        return user;
    }

    // List users for company
    async listUsers(companyId: string): Promise<User[]> {
        return userRepository.findByCompanyId(companyId);
    }

    // Update user
    async updateUser(id: string, companyId: string, data: UpdateUserInput): Promise<User> {
        const user = await userRepository.findById(id);
        if (!user) {
            throw new Error('USER_NOT_FOUND');
        }

        // Multi-tenancy check
        if (user.companyId !== companyId) {
            throw new Error('ACCESS_DENIED');
        }

        return userRepository.update(id, data);
    }

    // Change password
    async changePassword(userId: string, data: ChangePasswordInput): Promise<void> {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new Error('USER_NOT_FOUND');
        }

        // Verify current password
        const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
        if (!valid) {
            throw new Error('INVALID_CURRENT_PASSWORD');
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(data.newPassword, SALT_ROUNDS);
        await userRepository.update(userId, { passwordHash });
    }

    // Deactivate user
    async deactivateUser(id: string, companyId: string, requesterId: string): Promise<User> {
        const user = await userRepository.findById(id);
        if (!user) {
            throw new Error('USER_NOT_FOUND');
        }

        // Multi-tenancy check
        if (user.companyId !== companyId) {
            throw new Error('ACCESS_DENIED');
        }

        // Can't deactivate yourself
        if (user.id === requesterId) {
            throw new Error('CANNOT_DEACTIVATE_SELF');
        }

        // Don't allow deactivating last admin
        if (user.role === 'COMPANY_ADMIN') {
            const adminCount = await userRepository.countAdmins(companyId);
            if (adminCount <= 1) {
                throw new Error('CANNOT_DELETE_LAST_ADMIN');
            }
        }

        return userRepository.softDelete(id);
    }
}

export const userService = new UserService();
