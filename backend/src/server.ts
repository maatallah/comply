import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import dotenv from 'dotenv';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'path';
import fs from 'fs';
import { companyRoutes } from './modules/companies';
import { userRoutes } from './modules/users';
import { regulationRoutes, obligationRoutes, articleRoutes } from './modules/obligations';
import { controlRoutes } from './modules/controls';
import { checkRoutes } from './modules/checks';
import { evidenceRoutes } from './modules/evidence';
import { deadlineRoutes } from './modules/deadlines';
import { alertRoutes } from './modules/alerts';
import { jortRoutes } from './modules/jort/jort.routes';
import { scoringRoutes } from './modules/scoring';
import { reportsRoutes } from './modules/reports';

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
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:5174',
            process.env.FRONTEND_URL
        ].filter(Boolean) as string[];

        await app.register(cors, {
            origin: allowedOrigins,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        });

        // Register JWT
        await app.register(jwt, {
            secret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
        });

        // Register Multipart for file uploads
        await app.register(multipart, {
            limits: {
                fileSize: 10 * 1024 * 1024 // 10MB
            }
        });

        // Register Static for serving uploads
        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        await app.register(fastifyStatic, {
            root: uploadsDir,
            prefix: '/uploads/',
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
        await app.register(obligationRoutes);
        await app.register(articleRoutes);
        await app.register(controlRoutes);
        await app.register(checkRoutes);
        await app.register(evidenceRoutes);
        await app.register(deadlineRoutes);
        await app.register(alertRoutes, { prefix: '/alerts' });
        await app.register(jortRoutes, { prefix: '/jort-feed' });
        await app.register(scoringRoutes, { prefix: '/scoring' });
        await app.register(reportsRoutes, { prefix: '/reports' });

        const port = Number(process.env.PORT) || 3000;
        await app.listen({ port, host: '0.0.0.0' });
        console.log(`🚀 Server running on http://localhost:${port}`);
        console.log(`📊 Health check: http://localhost:${port}/health`);
        console.log(`🔐 Auth: POST /auth/register, POST /auth/login`);
        console.log(`🏢 Companies: /companies`);
        console.log(`👤 Users: /users`);
        console.log(`📜 Regulations: /regulations`);
        console.log(`📋 Obligations: /obligations`);
        console.log(`🔧 Controls: /controls`);
        console.log(`✅ Checks: /checks`);
        console.log(`📄 Evidence: /evidence`);
        console.log(`⏰ Deadlines: /deadlines`);
        console.log(`🔔 Alerts: /alerts`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();

