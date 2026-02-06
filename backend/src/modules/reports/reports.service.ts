import PDFDocument from 'pdfkit';
import prisma from '../../shared/prisma';
import { scoringService } from '../scoring/scoring.service';

export class ReportsService {
    async generateObligationsPdf(companyId: string): Promise<Buffer> {
        return new Promise(async (resolve, reject) => {
            try {
                // Get company info
                const company = await prisma.company.findUnique({
                    where: { id: companyId },
                });

                // Get obligations with controls
                const obligations = await prisma.obligation.findMany({
                    where: { companyId, isActive: true },
                    include: {
                        regulation: { select: { titleFr: true, code: true } },
                        controls: {
                            where: { isActive: true },
                            include: {
                                checks: {
                                    orderBy: { checkDate: 'desc' },
                                    take: 1,
                                }
                            }
                        },
                    },
                    orderBy: { category: 'asc' },
                });

                // Get compliance breakdown
                const compliance = await scoringService.getComplianceBreakdown(companyId);

                // Create PDF
                const doc = new PDFDocument({ margin: 50 });
                const chunks: Buffer[] = [];

                doc.on('data', (chunk: Buffer) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                // Header
                doc.fontSize(20).fillColor('#1e3a8a').text('Rapport de Conformité', { align: 'center' });
                doc.moveDown(0.5);
                doc.fontSize(14).fillColor('#475569').text(company?.legalName || 'N/A', { align: 'center' });
                doc.moveDown(0.3);
                doc.fontSize(10).fillColor('#94a3b8').text(`Généré le ${new Date().toLocaleDateString('fr-TN')}`, { align: 'center' });
                doc.moveDown(1.5);

                // Compliance Score Summary
                doc.fontSize(16).fillColor('#1e3a8a').text('Résumé de Conformité');
                doc.moveDown(0.5);

                // Score box
                doc.rect(50, doc.y, 500, 60).fill('#f0fdf4');
                doc.fillColor('#166534').fontSize(28).text(`${compliance.overallScore}%`, 60, doc.y - 50, { width: 100 });
                doc.fontSize(12).fillColor('#475569').text('Score Global', 60, doc.y - 20);
                doc.fontSize(12).fillColor('#475569').text(`${compliance.passedControls} / ${compliance.totalControls} contrôles conformes`, 180, doc.y - 50);
                doc.text(`${compliance.overdueDeadlines} échéances en retard`, 180, doc.y - 20);
                doc.text(`${compliance.upcomingDeadlines} échéances à venir (30j)`, 350, doc.y - 20);

                doc.moveDown(3);

                // Category Breakdown
                doc.fontSize(16).fillColor('#1e3a8a').text('Conformité par Catégorie');
                doc.moveDown(0.5);

                for (const cat of compliance.categories) {
                    const categoryLabel = cat.category.replace(/_/g, ' ');
                    doc.fontSize(11).fillColor('#1f2937').text(`• ${categoryLabel}: ${cat.compliancePercent}% (${cat.passedControls}/${cat.totalControls})`);
                }

                doc.moveDown(1.5);

                // Obligations List
                doc.fontSize(16).fillColor('#1e3a8a').text('Liste des Obligations');
                doc.moveDown(0.5);

                let currentCategory = '';
                for (const ob of obligations) {
                    if (ob.category !== currentCategory) {
                        currentCategory = ob.category;
                        doc.moveDown(0.5);
                        doc.fontSize(13).fillColor('#3b82f6').text(currentCategory.replace(/_/g, ' '));
                        doc.moveDown(0.3);
                    }

                    const riskColor = ob.riskLevel === 'CRITICAL' ? '#ef4444' : ob.riskLevel === 'HIGH' ? '#f97316' : ob.riskLevel === 'MEDIUM' ? '#f59e0b' : '#22c55e';
                    doc.fontSize(11).fillColor('#1f2937').text(`${ob.titleFr}`);
                    doc.fontSize(9).fillColor('#6b7280').text(`   Régulation: ${ob.regulation?.code || 'N/A'} | Fréquence: ${ob.frequency} | Risque: `, { continued: true });
                    doc.fillColor(riskColor).text(ob.riskLevel);

                    // Controls status
                    if (ob.controls.length > 0) {
                        for (const ctrl of ob.controls) {
                            const lastCheck = ctrl.checks[0];
                            const statusIcon = lastCheck ? (lastCheck.status === 'PASS' ? '✓' : lastCheck.status === 'FAIL' ? '✗' : '◐') : '○';
                            const statusColor = lastCheck ? (lastCheck.status === 'PASS' ? '#22c55e' : lastCheck.status === 'FAIL' ? '#ef4444' : '#f59e0b') : '#94a3b8';
                            doc.fontSize(9).fillColor(statusColor).text(`      ${statusIcon} ${ctrl.titleFr}`);
                        }
                    }
                    doc.moveDown(0.3);
                }

                doc.end();
            } catch (err) {
                reject(err);
            }
        });
    }
}

export const reportsService = new ReportsService();
