import prisma from '../../shared/prisma';

interface CategoryScore {
    category: string;
    totalControls: number;
    passedControls: number;
    failedControls: number;
    partialControls: number;
    notCheckedControls: number;
    compliancePercent: number;
}

interface ComplianceBreakdown {
    overallScore: number;
    totalControls: number;
    passedControls: number;
    categories: CategoryScore[];
    overdueDeadlines: number;
    upcomingDeadlines: number;
}

export class ScoringService {

    async getComplianceBreakdown(companyId: string): Promise<ComplianceBreakdown> {
        // Get all active controls with their latest check
        const controls = await prisma.control.findMany({
            where: {
                companyId,
                isActive: true,
            },
            include: {
                obligation: {
                    select: { category: true }
                },
                checks: {
                    orderBy: { checkDate: 'desc' },
                    take: 1,
                }
            }
        });

        // Group by category
        const categoryMap = new Map<string, { total: number; passed: number; failed: number; partial: number; notChecked: number }>();

        for (const control of controls) {
            const category = control.obligation?.category || 'UNKNOWN';
            
            if (!categoryMap.has(category)) {
                categoryMap.set(category, { total: 0, passed: 0, failed: 0, partial: 0, notChecked: 0 });
            }

            const cat = categoryMap.get(category)!;
            cat.total++;

            const latestCheck = control.checks[0];
            if (!latestCheck) {
                cat.notChecked++;
            } else if (latestCheck.status === 'PASS') {
                cat.passed++;
            } else if (latestCheck.status === 'FAIL') {
                cat.failed++;
            } else {
                cat.partial++;
            }
        }

        // Build category scores
        const categories: CategoryScore[] = [];
        let totalPassed = 0;

        for (const [category, data] of categoryMap.entries()) {
            const compliancePercent = data.total > 0 
                ? Math.round((data.passed / data.total) * 100) 
                : 0;
            
            totalPassed += data.passed;

            categories.push({
                category,
                totalControls: data.total,
                passedControls: data.passed,
                failedControls: data.failed,
                partialControls: data.partial,
                notCheckedControls: data.notChecked,
                compliancePercent,
            });
        }

        // Get deadlines
        const now = new Date();
        const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const [overdueDeadlines, upcomingDeadlines] = await Promise.all([
            prisma.deadline.count({
                where: {
                    companyId,
                    status: 'PENDING',
                    dueDate: { lt: now }
                }
            }),
            prisma.deadline.count({
                where: {
                    companyId,
                    status: 'PENDING',
                    dueDate: { gte: now, lte: thirtyDaysLater }
                }
            })
        ]);

        const totalControls = controls.length;
        const overallScore = totalControls > 0 
            ? Math.round((totalPassed / totalControls) * 100) 
            : 0;

        return {
            overallScore,
            totalControls,
            passedControls: totalPassed,
            categories,
            overdueDeadlines,
            upcomingDeadlines,
        };
    }
}

export const scoringService = new ScoringService();
