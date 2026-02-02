import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { userService } from './user.service';
import {
    RegisterSchema,
    LoginSchema,
    CreateUserSchema,
    UpdateUserSchema,
    ChangePasswordSchema,
    type JwtPayload,
} from './user.types';

// Extend Fastify types for JWT
declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
    interface FastifyRequest {
        user: JwtPayload;
    }
}

// Helper: Calculate seconds until next midnight
function getSecondsUntilMidnight(): number {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0); // Next midnight
    return Math.floor((midnight.getTime() - now.getTime()) / 1000);
}

// ==================== ROUTES ====================

export async function userRoutes(app: FastifyInstance) {

    // ========== REGISTER (Public) ==========
    // POST /auth/register
    app.post('/auth/register', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const parseResult = RegisterSchema.safeParse(request.body);
            if (!parseResult.success) {
                return reply.status(400).send({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Données invalides',
                        details: parseResult.error.flatten().fieldErrors,
                    },
                });
            }

            const { user, company } = await userService.register(parseResult.data);

            // Generate tokens
            const payload: JwtPayload = {
                userId: user.id,
                companyId: user.companyId,
                email: user.email,
                role: user.role,
            };

            const accessToken = app.jwt.sign(payload, { expiresIn: process.env.JWT_ACCESS_EXPIRY || '1h' });
            const refreshToken = app.jwt.sign(payload, { expiresIn: getSecondsUntilMidnight() });

            return reply.status(201).send({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                        companyId: user.companyId,
                    },
                    company: {
                        id: company.id,
                        legalName: company.legalName,
                    },
                    accessToken,
                    refreshToken,
                },
            });
        } catch (error: any) {
            if (error.message === 'EMAIL_ALREADY_EXISTS') {
                return reply.status(409).send({
                    success: false,
                    error: { code: 'EMAIL_ALREADY_EXISTS', message: 'Cet email est déjà utilisé' },
                });
            }
            if (error.message === 'COMPANY_TAX_ID_EXISTS') {
                return reply.status(409).send({
                    success: false,
                    error: { code: 'COMPANY_TAX_ID_EXISTS', message: 'Ce matricule fiscal existe déjà' },
                });
            }
            throw error;
        }
    });

    // ========== LOGIN (Public) ==========
    // POST /auth/login
    app.post('/auth/login', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const parseResult = LoginSchema.safeParse(request.body);
            if (!parseResult.success) {
                return reply.status(400).send({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Données invalides',
                        details: parseResult.error.flatten().fieldErrors,
                    },
                });
            }

            const user = await userService.login(parseResult.data);

            // Generate tokens
            const payload: JwtPayload = {
                userId: user.id,
                companyId: user.companyId,
                email: user.email,
                role: user.role,
            };

            const accessToken = app.jwt.sign(payload, { expiresIn: process.env.JWT_ACCESS_EXPIRY || '1h' });
            const refreshToken = app.jwt.sign(payload, { expiresIn: getSecondsUntilMidnight() });

            return reply.send({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                        companyId: user.companyId,
                    },
                    accessToken,
                    refreshToken,
                },
            });
        } catch (error: any) {
            if (error.message === 'INVALID_CREDENTIALS') {
                return reply.status(401).send({
                    success: false,
                    error: { code: 'INVALID_CREDENTIALS', message: 'Email ou mot de passe incorrect' },
                });
            }
            if (error.message === 'USER_INACTIVE') {
                return reply.status(403).send({
                    success: false,
                    error: { code: 'USER_INACTIVE', message: 'Compte désactivé' },
                });
            }
            throw error;
        }
    });

    // ========== REFRESH TOKEN ==========
    // POST /auth/refresh
    app.post('/auth/refresh', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { refreshToken } = request.body as { refreshToken: string };

            if (!refreshToken) {
                return reply.status(400).send({
                    success: false,
                    error: { code: 'MISSING_TOKEN', message: 'Token de rafraîchissement manquant' },
                });
            }

            // Verify the refresh token
            const decoded = app.jwt.verify(refreshToken) as JwtPayload;

            // Generate new access token
            const payload: JwtPayload = {
                userId: decoded.userId,
                companyId: decoded.companyId,
                email: decoded.email,
                role: decoded.role,
            };

            const newAccessToken = app.jwt.sign(payload, { expiresIn: process.env.JWT_ACCESS_EXPIRY || '1h' });

            return reply.send({
                success: true,
                data: { accessToken: newAccessToken },
            });
        } catch (error: any) {
            return reply.status(401).send({
                success: false,
                error: { code: 'INVALID_REFRESH_TOKEN', message: 'Token de rafraîchissement invalide ou expiré' },
            });
        }
    });
    // GET /auth/me
    app.get('/auth/me', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
        const user = request.user as JwtPayload;

        return reply.send({
            success: true,
            data: user,
        });
    });

    // ========== LIST USERS (Protected, Admin only) ==========
    // GET /users
    app.get('/users', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
        const currentUser = request.user as JwtPayload;

        const users = await userService.listUsers(currentUser.companyId);

        return reply.send({
            success: true,
            data: users.map(u => ({
                id: u.id,
                email: u.email,
                firstName: u.firstName,
                lastName: u.lastName,
                role: u.role,
                isActive: u.isActive,
                lastLoginAt: u.lastLoginAt,
                createdAt: u.createdAt,
            })),
        });
    });

    // ========== CREATE USER (Protected, Admin only) ==========
    // POST /users
    app.post('/users', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const currentUser = request.user as JwtPayload;

            // Only admins can create users
            if (currentUser.role !== 'COMPANY_ADMIN') {
                return reply.status(403).send({
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Seuls les administrateurs peuvent créer des utilisateurs' },
                });
            }

            const parseResult = CreateUserSchema.safeParse(request.body);
            if (!parseResult.success) {
                return reply.status(400).send({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Données invalides',
                        details: parseResult.error.flatten().fieldErrors,
                    },
                });
            }

            const user = await userService.createUser(currentUser.companyId, parseResult.data);

            return reply.status(201).send({
                success: true,
                data: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
            });
        } catch (error: any) {
            if (error.message === 'EMAIL_ALREADY_EXISTS') {
                return reply.status(409).send({
                    success: false,
                    error: { code: 'EMAIL_ALREADY_EXISTS', message: 'Cet email est déjà utilisé' },
                });
            }
            throw error;
        }
    });

    // ========== CHANGE PASSWORD (Protected) ==========
    // POST /auth/change-password
    app.post('/auth/change-password', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const currentUser = request.user as JwtPayload;

            const parseResult = ChangePasswordSchema.safeParse(request.body);
            if (!parseResult.success) {
                return reply.status(400).send({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Données invalides',
                        details: parseResult.error.flatten().fieldErrors,
                    },
                });
            }

            await userService.changePassword(currentUser.userId, parseResult.data);

            return reply.send({
                success: true,
                message: 'Mot de passe changé avec succès',
            });
        } catch (error: any) {
            if (error.message === 'INVALID_CURRENT_PASSWORD') {
                return reply.status(400).send({
                    success: false,
                    error: { code: 'INVALID_CURRENT_PASSWORD', message: 'Mot de passe actuel incorrect' },
                });
            }
            throw error;
        }
    });

    // ========== DELETE USER (Protected, Admin only) ==========
    // DELETE /users/:id
    app.delete('/users/:id', { preHandler: [app.authenticate] }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        try {
            const currentUser = request.user as JwtPayload;
            const { id } = request.params;

            // Only admins can delete users
            if (currentUser.role !== 'COMPANY_ADMIN') {
                return reply.status(403).send({
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Seuls les administrateurs peuvent supprimer des utilisateurs' },
                });
            }

            await userService.deactivateUser(id, currentUser.companyId, currentUser.userId);

            return reply.status(204).send();
        } catch (error: any) {
            if (error.message === 'USER_NOT_FOUND') {
                return reply.status(404).send({
                    success: false,
                    error: { code: 'USER_NOT_FOUND', message: 'Utilisateur introuvable' },
                });
            }
            if (error.message === 'ACCESS_DENIED') {
                return reply.status(403).send({
                    success: false,
                    error: { code: 'ACCESS_DENIED', message: 'Accès refusé' },
                });
            }
            if (error.message === 'CANNOT_DEACTIVATE_SELF') {
                return reply.status(400).send({
                    success: false,
                    error: { code: 'CANNOT_DEACTIVATE_SELF', message: 'Vous ne pouvez pas vous désactiver vous-même' },
                });
            }
            if (error.message === 'CANNOT_DELETE_LAST_ADMIN') {
                return reply.status(400).send({
                    success: false,
                    error: { code: 'CANNOT_DELETE_LAST_ADMIN', message: 'Impossible de supprimer le dernier administrateur' },
                });
            }
            throw error;
        }
    });
}
