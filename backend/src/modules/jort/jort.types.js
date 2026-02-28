"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListJortQuerySchema = exports.CreateJortEntrySchema = exports.JortEntryStatus = void 0;
var zod_1 = require("zod");
// ==================== ZOD SCHEMAS ====================
exports.JortEntryStatus = {
    PENDING: 'PENDING',
    RELEVANT: 'RELEVANT',
    IGNORED: 'IGNORED',
};
exports.CreateJortEntrySchema = zod_1.z.object({
    titleFr: zod_1.z.string().min(1),
    titleAr: zod_1.z.string().optional(),
    ministry: zod_1.z.string().optional(),
    ministryAr: zod_1.z.string().optional(),
    type: zod_1.z.string().optional(), // Law, Decree, etc.
    jortNumber: zod_1.z.string().optional(),
    recordId: zod_1.z.string().optional(),
    date: zod_1.z.string().datetime().optional(),
    pdfUrl: zod_1.z.string().url().optional(),
    pdfUrlAr: zod_1.z.string().url().optional(),
});
exports.ListJortQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    status: zod_1.z.enum(['PENDING', 'RELEVANT', 'IGNORED']).optional(),
    ministry: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
});
