import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { companyService } from './company.service';
import {
    CreateCompanySchema,
    UpdateCompanySchema,
    ListCompaniesQuerySchema,
    type CreateCompanyInput,
    type UpdateCompanyInput,
} from './company.types';

// ==================== ROUTES ====================
// HTTP layer - request/response handling

export async function companyRoutes(app: FastifyInstance) {

    // ========== CREATE COMPANY ==========
    // POST /companies
    app.post('/companies', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            // Validate request body
            const parseResult = CreateCompanySchema.safeParse(request.body);
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

            // Create company
            const company = await companyService.createCompany(parseResult.data);

            return reply.status(201).send({
                success: true,
                data: company,
            });
        } catch (error: any) {
            if (error.message === 'COMPANY_TAX_ID_EXISTS') {
                return reply.status(409).send({
                    success: false,
                    error: {
                        code: 'COMPANY_TAX_ID_EXISTS',
                        message: 'Ce matricule fiscal existe déjà',
                    },
                });
            }
            throw error;
        }
    });

    // ========== GET ALL COMPANIES ==========
    // GET /companies?page=1&limit=20&search=xxx&sector=TEXTILE
    app.get('/companies', async (request: FastifyRequest, reply: FastifyReply) => {
        // Validate query parameters
        const parseResult = ListCompaniesQuerySchema.safeParse(request.query);
        if (!parseResult.success) {
            return reply.status(400).send({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Paramètres invalides',
                    details: parseResult.error.flatten().fieldErrors,
                },
            });
        }

        const result = await companyService.listCompanies(parseResult.data);

        return reply.send({
            success: true,
            data: result.companies,
            meta: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages,
            },
        });
    });

    // ========== GET COMPANY BY ID ==========
    // GET /companies/:id
    app.get('/companies/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        try {
            const { id } = request.params;
            const company = await companyService.getCompanyById(id);

            return reply.send({
                success: true,
                data: company,
            });
        } catch (error: any) {
            if (error.message === 'COMPANY_NOT_FOUND') {
                return reply.status(404).send({
                    success: false,
                    error: {
                        code: 'COMPANY_NOT_FOUND',
                        message: 'Entreprise introuvable',
                    },
                });
            }
            throw error;
        }
    });

    // ========== UPDATE COMPANY ==========
    // PUT /companies/:id
    app.put('/companies/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        try {
            const { id } = request.params;

            // Validate request body
            const parseResult = UpdateCompanySchema.safeParse(request.body);
            if (!parseResult.success) {
                console.error('Update Company Validation Error:', JSON.stringify(parseResult.error.format(), null, 2));
                return reply.status(400).send({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Données invalides',
                        details: parseResult.error.flatten().fieldErrors,
                    },
                });
            }

            const company = await companyService.updateCompany(id, parseResult.data);

            return reply.send({
                success: true,
                data: company,
            });
        } catch (error: any) {
            if (error.message === 'COMPANY_NOT_FOUND') {
                return reply.status(404).send({
                    success: false,
                    error: {
                        code: 'COMPANY_NOT_FOUND',
                        message: 'Entreprise introuvable',
                    },
                });
            }
            if (error.message === 'COMPANY_TAX_ID_EXISTS') {
                return reply.status(409).send({
                    success: false,
                    error: {
                        code: 'COMPANY_TAX_ID_EXISTS',
                        message: 'Ce matricule fiscal existe déjà',
                    },
                });
            }
            throw error;
        }
    });

    // ========== DELETE COMPANY (Soft) ==========
    // DELETE /companies/:id
    app.delete('/companies/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        try {
            const { id } = request.params;
            await companyService.deactivateCompany(id);

            return reply.status(204).send();
        } catch (error: any) {
            if (error.message === 'COMPANY_NOT_FOUND') {
                return reply.status(404).send({
                    success: false,
                    error: {
                        code: 'COMPANY_NOT_FOUND',
                        message: 'Entreprise introuvable',
                    },
                });
            }
            throw error;
        }
    });
}
