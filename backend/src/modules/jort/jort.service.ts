import prisma from '../../shared/prisma';
import type { JortEntry } from '@prisma/client';
import type { CreateJortEntryInput, ListJortQuery } from './jort.types';

export class JortService {

    async createEntry(data: CreateJortEntryInput): Promise<JortEntry> {
        return prisma.jortEntry.create({
            data: {
                ...data,
                date: data.date ? new Date(data.date) : null,
            }
        });
    }

    async listEntries(query: ListJortQuery) {
        const { page, limit, status, ministry } = query;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (status) where.status = status;
        if (ministry) where.ministry = { contains: ministry, mode: 'insensitive' };

        const [entries, total] = await Promise.all([
            prisma.jortEntry.findMany({
                where,
                skip,
                take: limit,
                orderBy: { date: 'desc' },
            }),
            prisma.jortEntry.count({ where }),
        ]);

        return {
            entries,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async updateStatus(id: string, status: 'RELEVANT' | 'IGNORED'): Promise<JortEntry> {
        const entry = await prisma.jortEntry.update({
            where: { id },
            data: {
                status,
                processed: true
            }
        });

        if (status === 'RELEVANT') {
            // Generate alerts for all companies to notify them of a new regulatory update
            const companies = await prisma.company.findMany();

            for (const company of companies) {
                await prisma.alert.create({
                    data: {
                        companyId: company.id,
                        type: 'REGULATORY_UPDATE',
                        severity: 'HIGH',
                        titleFr: `Veille JORT : ${entry.type || 'Nouveau texte'} détecté`,
                        titleAr: entry.titleAr ? `متابعة الرائد الرسمي : ${entry.type || 'نص جديد'}` : null,
                        messageFr: `Une nouvelle publication pertinente a été identifiée : "${entry.titleFr}". Merci de vérifier son impact sur vos activités.`,
                        messageAr: entry.titleAr ? `تم تحديد منشور جديد ذو صلة : "${entry.titleAr}". يرجى التحقق من تأثيره على أنشطتكم.` : null,
                    }
                });
            }
        }

        return entry;
    }
}

export const jortService = new JortService();
