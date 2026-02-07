import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { evidenceService } from './evidence.service';
import {
    ListEvidenceQuerySchema,
} from './evidence.types';
import path from 'path';
import fs from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';

const pump = promisify(pipeline);

// ==================== ROUTES ====================

export async function evidenceRoutes(app: FastifyInstance) {

    // ========== LIST EVIDENCE ==========
    // GET /evidence
    app.get('/evidence', { preHandler: [app.authenticate] }, async (request: any, reply: FastifyReply) => {
        const user = request.user;

        const parseResult = ListEvidenceQuerySchema.safeParse(request.query);
        if (!parseResult.success) {
            return reply.status(400).send({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'Paramètres invalides' }
            });
        }

        const result = await evidenceService.listEvidence(user.companyId, parseResult.data);

        return reply.send({
            success: true,
            data: result.evidence,
            meta: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages,
            },
        });
    });

    // ========== UPLOAD FILE ==========
    // POST /evidence/upload
    app.post('/evidence/upload', { preHandler: [app.authenticate] }, async (request: any, reply: FastifyReply) => {
        const user = request.user;

        const data = await request.file();
        if (!data) {
            return reply.status(400).send({
                success: false,
                error: { code: 'NO_FILE', message: 'Aucun fichier fourni' }
            });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const extension = path.extname(data.filename);
        const savedFilename = `${timestamp}-${Math.round(Math.random() * 1e9)}${extension}`;
        const uploadPath = path.join(__dirname, '../../uploads', savedFilename);

        // Ensure directory exists (fallback)
        const uploadsDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Save file
        await pump(data.file, fs.createWriteStream(uploadPath));

        // Get non-file fields
        const fields = data.fields as any;
        const checkId = fields.checkId?.value;
        const controlId = fields.controlId?.value;
        const description = fields.description?.value;
        const metadataString = fields.metadata?.value;

        let metadata = {};
        if (metadataString) {
            try {
                metadata = JSON.parse(metadataString);
            } catch (e: any) {
                app.log.error(e, 'Failed to parse evidence metadata');
            }
        }

        // Require either checkId or controlId
        if (!checkId && !controlId) {
            if (fs.existsSync(uploadPath)) fs.unlinkSync(uploadPath);
            return reply.status(400).send({
                success: false,
                error: { code: 'MISSING_ID', message: 'checkId ou controlId est requis' }
            });
        }

        try {
            const stats = fs.statSync(uploadPath);
            const evidence = await evidenceService.createEvidence(user.companyId, user.userId, {
                checkId: checkId || undefined,
                controlId: controlId || undefined,
                fileName: data.filename,
                fileType: data.mimetype,
                filePath: `/uploads/${savedFilename}`,
                fileSize: stats.size,
                description,
                metadata,
            });

            return reply.status(201).send({
                success: true,
                data: evidence,
            });
        } catch (error: any) {
            if (fs.existsSync(uploadPath)) fs.unlinkSync(uploadPath);

            if (error.message === 'CHECK_NOT_FOUND') {
                return reply.status(404).send({
                    success: false,
                    error: { code: 'CHECK_NOT_FOUND', message: 'Vérification introuvable' },
                });
            }
            throw error;
        }
    });

    // ========== GET SINGLE EVIDENCE ==========
    // GET /evidence/:id
    app.get('/evidence/:id', { preHandler: [app.authenticate] }, async (request: any, reply: FastifyReply) => {
        try {
            const user = request.user;
            const { id } = request.params;

            const evidence = await evidenceService.getEvidenceById(id, user.companyId);

            return reply.send({
                success: true,
                data: evidence,
            });
        } catch (error: any) {
            if (error.message === 'EVIDENCE_NOT_FOUND') {
                return reply.status(404).send({
                    success: false,
                    error: { code: 'EVIDENCE_NOT_FOUND', message: 'Preuve introuvable' },
                });
            }
            throw error;
        }
    });

    // ========== DELETE EVIDENCE ==========
    // DELETE /evidence/:id
    app.delete('/evidence/:id', { preHandler: [app.authenticate] }, async (request: any, reply: FastifyReply) => {
        try {
            const user = request.user;
            const { id } = request.params;

            await evidenceService.deleteEvidence(id, user.companyId);

            return reply.status(204).send();
        } catch (error: any) {
            if (error.message === 'EVIDENCE_NOT_FOUND') {
                return reply.status(404).send({
                    success: false,
                    error: { code: 'EVIDENCE_NOT_FOUND', message: 'Preuve introuvable' },
                });
            }
            throw error;
        }
    });

    // ========== SERVE FILE (for preview) ==========
    // GET /evidence/file/:id
    app.get('/evidence/file/:id', { preHandler: [app.authenticate] }, async (request: any, reply: FastifyReply) => {
        try {
            const user = request.user;
            const { id } = request.params;

            const evidence = await evidenceService.getEvidenceById(id, user.companyId);

            // Build the full file path
            const filePath = path.join(__dirname, '../..', evidence.filePath);

            if (!fs.existsSync(filePath)) {
                return reply.status(404).send({
                    success: false,
                    error: { code: 'FILE_NOT_FOUND', message: 'Fichier non trouvé' },
                });
            }

            // Set appropriate content type
            reply.header('Content-Type', evidence.fileType || 'application/octet-stream');
            reply.header('Content-Disposition', `inline; filename="${evidence.fileName}"`);

            const stream = fs.createReadStream(filePath);
            return reply.send(stream);
        } catch (error: any) {
            if (error.message === 'EVIDENCE_NOT_FOUND') {
                return reply.status(404).send({
                    success: false,
                    error: { code: 'EVIDENCE_NOT_FOUND', message: 'Preuve introuvable' },
                });
            }
            throw error;
        }
    });
}
