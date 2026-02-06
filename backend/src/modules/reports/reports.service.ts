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
                const doc = new PDFDocument({ margin: 50, size: 'A4' });
                const chunks: Buffer[] = [];

                doc.on('data', (chunk: Buffer) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                // ==================== HEADER ====================
                doc.fontSize(22).fillColor('#1e3a8a').text('Rapport de Conformité', { align: 'center' });
                doc.moveDown(0.3);
                doc.fontSize(14).fillColor('#475569').text(company?.legalName || 'N/A', { align: 'center' });
                doc.moveDown(0.2);
                doc.fontSize(10).fillColor('#94a3b8').text(`Généré le ${new Date().toLocaleDateString('fr-TN')}`, { align: 'center' });
                doc.moveDown(1);

                // ==================== SCORE SUMMARY ====================
                doc.fontSize(14).fillColor('#1e3a8a').text('Résumé de Conformité', { underline: true });
                doc.moveDown(0.5);

                // Score info in a simple format
                const scoreColor = compliance.overallScore >= 70 ? '#166534' : compliance.overallScore >= 40 ? '#ca8a04' : '#dc2626';
                doc.fontSize(36).fillColor(scoreColor).text(`${compliance.overallScore}%`, { continued: false });
                doc.fontSize(11).fillColor('#475569').text('Score de Conformité Global');
                doc.moveDown(0.5);

                doc.fontSize(10).fillColor('#374151');
                doc.text(`- Contrôles conformes: ${compliance.passedControls} / ${compliance.totalControls}`);
                doc.text(`- Échéances en retard: ${compliance.overdueDeadlines}`);
                doc.text(`- Échéances à venir (30j): ${compliance.upcomingDeadlines}`);
                doc.moveDown(1);

                // ==================== CATEGORY BREAKDOWN ====================
                if (compliance.categories.length > 0) {
                    doc.fontSize(14).fillColor('#1e3a8a').text('Conformité par Catégorie', { underline: true });
                    doc.moveDown(0.5);

                    doc.fontSize(10).fillColor('#374151');
                    for (const cat of compliance.categories) {
                        const catLabel = cat.category.replace(/_/g, ' ');
                        const pct = cat.compliancePercent;
                        const pctColor = pct >= 70 ? '#166534' : pct >= 40 ? '#ca8a04' : '#dc2626';
                        doc.fillColor(pctColor).text(`${pct}%`, { continued: true });
                        doc.fillColor('#374151').text(` - ${catLabel} (${cat.passedControls}/${cat.totalControls} contrôles)`);
                    }
                    doc.moveDown(1);
                }

                // ==================== OBLIGATIONS LIST ====================
                doc.fontSize(14).fillColor('#1e3a8a').text('Liste des Obligations', { underline: true });

                doc.moveDown(0.5);

                if (obligations.length === 0) {
                    doc.fontSize(10).fillColor('#6b7280').text('Aucune obligation souscrite pour le moment.');
                } else {
                    let currentCategory = '';

                    for (const ob of obligations) {
                        // Category header
                        if (ob.category !== currentCategory) {
                            currentCategory = ob.category;
                            doc.moveDown(0.3);
                            doc.fontSize(11).fillColor('#3b82f6').text(`> ${currentCategory.replace(/_/g, ' ')}`);
                            doc.moveDown(0.3);
                        }

                        // Obligation title
                        doc.fontSize(10).fillColor('#1f2937').text(`- ${ob.titleFr}`);

                        // Obligation details
                        const riskColors: Record<string, string> = {
                            'CRITICAL': '#dc2626',
                            'HIGH': '#ea580c',
                            'MEDIUM': '#ca8a04',
                            'LOW': '#16a34a'
                        };
                        doc.fontSize(8).fillColor('#6b7280')
                            .text(`    Régulation: ${ob.regulation?.code || 'N/A'} | Fréquence: ${ob.frequency} | Risque: `, { continued: true });
                        doc.fillColor(riskColors[ob.riskLevel] || '#6b7280').text(ob.riskLevel);

                        // Controls
                        if (ob.controls.length > 0) {
                            for (const ctrl of ob.controls) {
                                const lastCheck = ctrl.checks[0];
                                let statusIcon = '[ ]';
                                let statusColor = '#94a3b8';

                                if (lastCheck) {
                                    if (lastCheck.status === 'PASS') {
                                        statusIcon = '[OK]';
                                        statusColor = '#16a34a';
                                    } else if (lastCheck.status === 'FAIL') {
                                        statusIcon = '[X]';
                                        statusColor = '#dc2626';
                                    } else {
                                        statusIcon = '[~]';
                                        statusColor = '#ca8a04';
                                    }
                                }
                                doc.fontSize(8).fillColor(statusColor).text(`      ${statusIcon} ${ctrl.titleFr}`);
                            }
                        }
                    }
                }

                doc.moveDown(2);
                doc.fontSize(8).fillColor('#94a3b8').text('— Généré par TuniCompliance —', { align: 'center' });

                doc.end();
            } catch (err) {
                reject(err);
            }
        });
    }
}

export const reportsService = new ReportsService();
