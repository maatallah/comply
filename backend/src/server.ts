import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import dotenv from 'dotenv';
import { companyRoutes } from './modules/companies';
import { userRoutes } from './modules/users';
import { regulationRoutes } from './modules/obligations';

// Load environment variables
dotenv.config();

// Extend Fastify types for JWT
declare module 'fastify' {
    interface FastifyInstance {
        authenticate: any;
    }
}

declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload: {
            userId: string;
            companyId: string;
            email: string;
            role: string;
        };
        user: {
            userId: string;
            companyId: string;
            email: string;
            role: string;
        };
    }
}

const app = Fastify({
    logger: {
        level: process.env.LOG_LEVEL || 'info',
    },
});

// Health check route
app.get('/health', async () => {
    return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
    };
});

// Root route
app.get('/', async () => {
    return {
        app: 'TuniCompliance API',
        version: '1.0.0',
        documentation: '/docs',
        endpoints: {
            health: 'GET /health',
            register: 'POST /auth/register',
            login: 'POST /auth/login',
            companies: 'GET /companies',
            users: 'GET /users',
        },
    };
});

// Start server
const start = async () => {
    try {
        // Register CORS
        await app.register(cors, {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            credentials: true,
        });

        // Register JWT
        await app.register(jwt, {
            secret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
        });

        // Authentication decorator
        app.decorate('authenticate', async function (request: any, reply: any) {
            try {
                await request.jwtVerify();
            } catch (err) {
                reply.status(401).send({
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Token invalide ou expiré',
                    },
                });
            }
        });

        // Register module routes
        await app.register(companyRoutes);
        await app.register(userRoutes);
        await app.register(regulationRoutes);

        const port = Number(process.env.PORT) || 3000;
        await app.listen({ port, host: '0.0.0.0' });
        console.log(`🚀 Server running on http://localhost:${port}`);
        console.log(`📊 Health check: http://localhost:${port}/health`);
        console.log(`🔐 Auth: POST /auth/register, POST /auth/login`);
        console.log(`🏢 Companies: /companies`);
        console.log(`👤 Users: /users`);
        console.log(`📜 Regulations: /regulations`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();

