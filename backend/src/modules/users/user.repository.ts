import prisma from '../../shared/prisma';
import type { User } from '@prisma/client';
import type { CreateUserInput, UpdateUserInput } from './user.types';

// ==================== REPOSITORY ====================

export class UserRepository {

    // Create user
    async create(companyId: string, data: CreateUserInput & { passwordHash: string }): Promise<User> {
        return prisma.user.create({
            data: {
                companyId,
                email: data.email,
                passwordHash: data.passwordHash,
                firstName: data.firstName,
                lastName: data.lastName,
                role: data.role,
                phone: data.phone || null,
                preferredLanguage: data.preferredLanguage || 'fr',
            },
        });
    }

    // Find by ID
    async findById(id: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id },
        });
    }

    // Find by email
    async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email },
        });
    }

    // Find users by company
    async findByCompanyId(companyId: string): Promise<User[]> {
        return prisma.user.findMany({
            where: { companyId, isActive: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    // Update user
    async update(id: string, data: Partial<UpdateUserInput & { passwordHash?: string; lastLoginAt?: Date }>): Promise<User> {
        return prisma.user.update({
            where: { id },
            data: {
                ...data,
                phone: data.phone === '' ? null : data.phone,
            },
        });
    }

    // Soft delete
    async softDelete(id: string): Promise<User> {
        return prisma.user.update({
            where: { id },
            data: { isActive: false },
        });
    }

    // Check email exists
    async emailExists(email: string, excludeId?: string): Promise<boolean> {
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });

        if (!user) return false;
        if (excludeId && user.id === excludeId) return false;
        return true;
    }

    // Count admins in company (protection against deleting last admin)
    async countAdmins(companyId: string): Promise<number> {
        return prisma.user.count({
            where: {
                companyId,
                role: 'COMPANY_ADMIN',
                isActive: true,
            },
        });
    }
}

export const userRepository = new UserRepository();
