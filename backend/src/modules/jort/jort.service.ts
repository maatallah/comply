import prisma from '../../shared/prisma';
import type { JortEntry } from '@prisma/client';
import type { CreateJortEntryInput, ListJortQuery } from './jort.types';

export class JortService {

    async createEntry(data: CreateJortEntryInput): Promise<JortEntry> {
        return prisma.jortEntry.create({
            data: {
                ...data,
                recordId: data.recordId || `MANUAL-${Date.now()}`,
                date: data.date ? new Date(data.date) : null,
            }
        });
    }

    async listEntries(query: ListJortQuery) {
        const { page, limit, status, ministry, search, year, month } = query;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (status) where.status = status;
        if (ministry) where.ministry = { contains: ministry, mode: 'insensitive' };

        // Date Filtering
        if (year) {
            const startDate = new Date(Date.UTC(year, month ? month - 1 : 0, 1));
            const endDate = month
                ? new Date(Date.UTC(year, month, 1)) // First day of next month
                : new Date(Date.UTC(year + 1, 0, 1)); // First day of next year

            where.date = {
                gte: startDate,
                lt: endDate
            };
        }

        if (search) {
            where.OR = [
                { titleFr: { contains: search, mode: 'insensitive' } },
                { titleAr: { contains: search, mode: 'insensitive' } },
                { ministry: { contains: search, mode: 'insensitive' } },
                { type: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Noise Filtering
        const noiseLevel = query.noiseLevel || 'MEDIUM';

        // Level 2: Medium (Filter out administrative acts)
        if (noiseLevel === 'MEDIUM' || noiseLevel === 'HIGH') {
            const NOISE_KEYWORDS = [
                'nomination', 'démission', 'fin de fonctions', 'recrutement',
                'concours', 'mutation', 'classement', 'détachement',
                'intégration', 'agrée', 'habilitation', 'tableau d\'avancement',
                'expropriation', 'école nationale', 'session de formation', 'organigramme',
                'examen professionnel'
            ];

            // Allow admin keyword filter BUT we must be careful not to override existing AND/OR structure
            // We use 'AND' to combine with other filters
            const keywordFilters = NOISE_KEYWORDS.map(k => ({
                NOT: [
                    { titleFr: { contains: k, mode: 'insensitive' } },
                    // Also check Arabic if possible, but keywords are French for now. 
                    // Most JORT titles are bilingual so checking French is usually enough for type detection.
                ]
            }));

            // Combine into main where
            if (!where.AND) where.AND = [];
            if (Array.isArray(where.AND)) {
                where.AND.push(...keywordFilters);
            } else {
                where.AND = [where.AND, ...keywordFilters];
            }
        }

        // Level 3: Severe (Filter out non-economic ministries)
        if (noiseLevel === 'HIGH') {
            const IGNORED_MINISTRIES = [
                'éducation', 'enseignement', 'jeunesse', 'sport',
                'culture', 'religieux', 'famille', 'intérieur'
            ];

            const ministryFilters = IGNORED_MINISTRIES.map(m => ({
                NOT: { ministry: { contains: m, mode: 'insensitive' } }
            }));

            if (!where.AND) where.AND = [];
            if (Array.isArray(where.AND)) {
                where.AND.push(...ministryFilters);
            }
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

    async getAvailableYears(): Promise<number[]> {
        // Group by year extract from date
        // Prisma doesn't support distinct on date parts easily, so we might need raw query or fetch dates
        // Efficient way:
        const years = await prisma.$queryRaw<{ year: number }[]>`
            SELECT DISTINCT EXTRACT(YEAR FROM date)::int as year 
            FROM "jort_entries" 
            WHERE date IS NOT NULL 
            ORDER BY year DESC
        `;
        return years.map(y => y.year);
    }

    async getMonthlyStats(year: number, status?: 'PENDING' | 'RELEVANT' | 'IGNORED', noiseLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'): Promise<{ month: number; count: number }[]> {
        const where: any = {
            date: {
                gte: new Date(`${year}-01-01`),
                lt: new Date(`${year + 1}-01-01`),
            }
        };

        // Status filter
        if (status === 'PENDING') {
            where.processed = false;
        } else if (status === 'RELEVANT') {
            where.status = 'RELEVANT';
        } else if (status === 'IGNORED') {
            where.status = 'IGNORED';
        }

        // Noise Level Filtering (Duplicated from listEntries for now to be safe)
        // Level 2: Medium (Filter out administrative acts)
        if (noiseLevel === 'MEDIUM' || noiseLevel === 'HIGH') {
            const NOISE_KEYWORDS = [
                'nomination', 'démission', 'fin de fonctions', 'recrutement',
                'concours', 'mutation', 'classement', 'détachement',
                'intégration', 'agrée', 'habilitation', 'tableau d\'avancement',
                'expropriation', 'école nationale', 'session de formation', 'organigramme',
                'examen professionnel'
            ];

            const keywordFilters = NOISE_KEYWORDS.map(k => ({
                NOT: { titleFr: { contains: k, mode: 'insensitive' } }
            }));

            if (!where.AND) where.AND = [];
            if (Array.isArray(where.AND)) {
                where.AND.push(...keywordFilters);
            } else {
                where.AND = [where.AND, ...keywordFilters];
            }
        }

        // Level 3: Severe (Filter out non-economic ministries)
        if (noiseLevel === 'HIGH') {
            const IGNORED_MINISTRIES = [
                'éducation', 'enseignement', 'jeunesse', 'sport',
                'culture', 'religieux', 'famille', 'intérieur'
            ];

            const ministryFilters = IGNORED_MINISTRIES.map(m => ({
                NOT: { ministry: { contains: m, mode: 'insensitive' } }
            }));

            if (!where.AND) where.AND = [];
            if (Array.isArray(where.AND)) {
                where.AND.push(...ministryFilters);
            }
        }

        // Using groupBy because it's easier to build dynamic where clause than raw SQL
        const results = await prisma.jortEntry.groupBy({
            by: ['date'],
            where,
            _count: {
                _all: true
            }
        });

        // Aggregate by month (Prisma groupBy doesn't support extract month directly easily without raw, 
        // but we can aggregate in JS since the dataset for one year is small enough or use raw query with dynamically built where clause).
        // Actually, to respect the exact same filters as listEntries, reusing the logic is better.
        // Let's use Prisma to fetch all dates for the year matching filters, then agg in JS. 
        // It's not the most efficient for huge datasets but for JORT (few thousand per year) it's negligible.

        const entries = await prisma.jortEntry.findMany({
            where,
            select: { date: true }
        });

        const statsMap = new Map<number, number>();
        entries.forEach(e => {
            const month = new Date(e.date).getMonth() + 1;
            statsMap.set(month, (statsMap.get(month) || 0) + 1);
        });

        const stats: { month: number; count: number }[] = [];
        for (let i = 1; i <= 12; i++) {
            if (statsMap.has(i)) {
                stats.push({ month: i, count: statsMap.get(i)! });
            }
        }

        return stats.sort((a, b) => a.month - b.month);
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
