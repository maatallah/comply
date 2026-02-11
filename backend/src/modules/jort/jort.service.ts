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
        const { page, limit, status, ministry, search } = query;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (status) where.status = status;
        if (ministry) where.ministry = { contains: ministry, mode: 'insensitive' };
        if (search) {
            where.OR = [
                { titleFr: { contains: search, mode: 'insensitive' } },
                { titleAr: { contains: search, mode: 'insensitive' } },
                { ministry: { contains: search, mode: 'insensitive' } },
                { type: { contains: search, mode: 'insensitive' } },
            ];
        }

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
            const { assessImpact } = require('./jort.impact');
            const impact = assessImpact(entry.titleFr, entry.titleAr, entry.ministry);

            // Build impact string
            let impactMsgFr = '';
            if (impact.categories.length > 0) {
                impactMsgFr = `\n\nDomaines impactés : ${impact.categories.join(', ')}`;
            }

            // Generate alerts for all companies
            const companies = await prisma.company.findMany({
                include: {
                    users: {
                        where: {
                            role: { in: ['COMPANY_ADMIN', 'COMPLIANCE_OFFICER'] },
                            isActive: true
                        }
                    }
                }
            });

            // Lazy load email service to avoid circular deps if any
            const { emailService } = require('../../shared/email/email.service');
            const { emailTemplates } = require('../../shared/email/email.templates');

            for (const company of companies) {
                // 1. Create In-App Alert
                await prisma.alert.create({
                    data: {
                        companyId: company.id,
                        type: 'REGULATORY_UPDATE',
                        severity: impact.score > 70 ? 'CRITICAL' : 'HIGH',
                        titleFr: `Veille JORT : ${entry.type || 'Nouveau texte'} - ${impact.categories[0] || 'Général'}`,
                        titleAr: entry.titleAr ? `متابعة الرائد الرسمي : ${entry.type || 'نص جديد'}` : null,
                        messageFr: `Une nouvelle publication pertinente a été identifiée : "${entry.titleFr}".${impactMsgFr}\nMerci de vérifier son impact sur vos activités.`,
                        messageAr: entry.titleAr ? `تم تحديد منشور جديد ذو صلة : "${entry.titleAr}". يرجى التحقق من تأثيره على أنشطتكم.` : null,
                    }
                });

                // 2. Send Email if High/Critical Impact (Score > 50)
                if (impact.score > 50 && company.users.length > 0) {
                    const emailHtml = emailTemplates.newRegulationAlert(entry, impact);
                    const recipients = company.users.map(u => u.email);

                    // Send in background, don't await blocking
                    emailService.sendEmail({
                        to: recipients,
                        subject: `[JORT] Nouvelle Réglementation : ${entry.titleFr.substring(0, 50)}...`,
                        html: emailHtml
                    }).catch((err: any) => console.error('Failed to send JORT email:', err));
                }
            }
        }

        return entry;
    }
}

export const jortService = new JortService();
