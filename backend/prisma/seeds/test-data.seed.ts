import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Test Data Seed - Creates comprehensive data for testing:
 * - Obligations for the first company
 * - Controls linked to obligations
 * - Checks with various statuses (PASS, FAIL, PARTIAL)
 * - Deadlines (past, upcoming, overdue)
 * - Alerts
 */
export async function seedTestData() {
    console.log('🧪 Seeding Test Data...\n');

    // Get the first company
    const company = await prisma.company.findUnique({
        where: { id: '11111111-1111-1111-1111-111111111111' },
        include: { users: true }
    });

    if (!company) {
        console.log('  ⚠️  No company found! Run base seed first.');
        return;
    }

    const user = company.users[0];
    if (!user) {
        console.log('  ⚠️  No user found in company!');
        return;
    }

    console.log(`  📍 Company: ${company.legalName}`);
    console.log(`  👤 User: ${user.firstName} ${user.lastName}\n`);

    // Get regulations to create obligations from
    const regulations = await prisma.regulation.findMany({ take: 5 });
    if (regulations.length === 0) {
        console.log('  ⚠️  No regulations found! Run base seed first.');
        return;
    }

    // ==================== CREATE OBLIGATIONS ====================
    console.log('  📋 Creating Obligations...');
    const obligationData = [
        { regulationCode: 'BSCI-2021', titleFr: 'Audit BSCI annuel', frequency: 'ANNUAL', riskLevel: 'CRITICAL', category: 'BRAND_AUDIT' },
        { regulationCode: 'FOTL-COC-2025', titleFr: 'Audit Fruit of the Loom', frequency: 'ANNUAL', riskLevel: 'CRITICAL', category: 'BRAND_AUDIT' },
        { regulationCode: 'DEC-75-503', titleFr: 'Visite Protection Civile', frequency: 'BIENNIAL', riskLevel: 'HIGH', category: 'HSE' },
        { regulationCode: 'DEC-75-503', titleFr: 'Vérification extincteurs', frequency: 'ANNUAL', riskLevel: 'MEDIUM', category: 'HSE' },
        { regulationCode: 'DEC-2000-1985', titleFr: 'Contrôle électrique', frequency: 'ANNUAL', riskLevel: 'HIGH', category: 'HSE' },
        { regulationCode: 'CNSS-LOI-60-30', titleFr: 'Déclaration CNSS mensuelle', frequency: 'MONTHLY', riskLevel: 'HIGH', category: 'SOCIAL' },
        { regulationCode: 'TVA-CGI-2016', titleFr: 'Déclaration TVA mensuelle', frequency: 'MONTHLY', riskLevel: 'HIGH', category: 'FISCAL' },
        { regulationCode: 'MT-LOI-94-28', titleFr: 'Visite médicale annuelle', frequency: 'ANNUAL', riskLevel: 'MEDIUM', category: 'HSE' },
        { regulationCode: 'ANGED-DEC-2005', titleFr: 'Registre des déchets', frequency: 'MONTHLY', riskLevel: 'MEDIUM', category: 'ENVIRONMENTAL' },
    ];

    const createdObligations: any[] = [];

    for (const ob of obligationData) {
        const regulation = regulations.find(r => r.code === ob.regulationCode) || regulations[0];

        const existing = await prisma.obligation.findFirst({
            where: {
                companyId: company.id,
                titleFr: ob.titleFr
            }
        });

        if (existing) {
            createdObligations.push(existing);
            console.log(`     ⏭️  ${ob.titleFr} (exists)`);
            continue;
        }

        const created = await prisma.obligation.create({
            data: {
                companyId: company.id,
                regulationId: regulation.id,
                titleFr: ob.titleFr,
                frequency: ob.frequency,
                riskLevel: ob.riskLevel,
                category: ob.category,
            }
        });
        createdObligations.push(created);
        console.log(`     ✅ ${ob.titleFr}`);
    }

    // ==================== CREATE CONTROLS ====================
    console.log('\n  🔍 Creating Controls...');
    const controlData = [
        { obligationTitle: 'Audit BSCI annuel', titleFr: 'Rapport d\'audit BSCI', controlType: 'CERTIFICATION', expectedEvidence: 'Rapport PDF avec score', frequency: 'ANNUAL' },
        { obligationTitle: 'Audit Fruit of the Loom', titleFr: 'Rapport d\'audit FOTL', controlType: 'CERTIFICATION', expectedEvidence: 'Rapport d\'audit complet (Vert/Jaune)', frequency: 'ANNUAL' },
        { obligationTitle: 'Audit BSCI annuel', titleFr: 'Registre heures de travail', controlType: 'DOCUMENT', expectedEvidence: 'Export pointeuse', frequency: 'CONTINUOUS' },
        { obligationTitle: 'Visite Protection Civile', titleFr: 'PV Protection Civile', controlType: 'CERTIFICATION', expectedEvidence: 'PV signé + cachet', frequency: 'BIENNIAL' },
        { obligationTitle: 'Vérification extincteurs', titleFr: 'Étiquettes extincteurs', controlType: 'INSPECTION', expectedEvidence: 'Photos des étiquettes', frequency: 'ANNUAL' },
        { obligationTitle: 'Contrôle électrique', titleFr: 'Rapport APAVE/BV', controlType: 'CERTIFICATION', expectedEvidence: 'Rapport technique', frequency: 'ANNUAL' },
        { obligationTitle: 'Déclaration CNSS mensuelle', titleFr: 'Bordereau CNSS', controlType: 'DOCUMENT', expectedEvidence: 'Déclaration + reçu', frequency: 'MONTHLY' },
        { obligationTitle: 'Déclaration TVA mensuelle', titleFr: 'Déclaration TVA', controlType: 'DOCUMENT', expectedEvidence: 'Formulaire + reçu paiement', frequency: 'MONTHLY' },
        { obligationTitle: 'Visite médicale annuelle', titleFr: 'Fiches d\'aptitude', controlType: 'DOCUMENT', expectedEvidence: 'Fiches médicales', frequency: 'ANNUAL' },
        { obligationTitle: 'Registre des déchets', titleFr: 'Registre déchets', controlType: 'DOCUMENT', expectedEvidence: 'Registre à jour', frequency: 'MONTHLY' },
    ];

    const createdControls: any[] = [];

    for (const ctrl of controlData) {
        const obligation = createdObligations.find(o => o.titleFr === ctrl.obligationTitle);
        if (!obligation) continue;

        const existing = await prisma.control.findFirst({
            where: {
                companyId: company.id,
                titleFr: ctrl.titleFr
            }
        });

        if (existing) {
            createdControls.push(existing);
            console.log(`     ⏭️  ${ctrl.titleFr} (exists)`);
            continue;
        }

        const created = await prisma.control.create({
            data: {
                companyId: company.id,
                obligationId: obligation.id,
                titleFr: ctrl.titleFr,
                controlType: ctrl.controlType,
                expectedEvidence: ctrl.expectedEvidence,
                frequency: ctrl.frequency,
            }
        });
        createdControls.push(created);
        console.log(`     ✅ ${ctrl.titleFr}`);
    }

    // ==================== CREATE CHECKS (VERIFICATION RESULTS) ====================
    console.log('\n  ✅ Creating Checks (verification results)...');

    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const checkStatuses = ['PASS', 'PASS', 'PASS', 'FAIL', 'PARTIAL', 'PASS', 'FAIL', 'PASS', 'PARTIAL'];

    for (let i = 0; i < createdControls.length && i < checkStatuses.length; i++) {
        const control = createdControls[i];
        const status = checkStatuses[i];

        // Check if already has checks
        const existingCheck = await prisma.check.findFirst({
            where: { controlId: control.id }
        });

        if (existingCheck) {
            console.log(`     ⏭️  ${control.titleFr} (has check)`);
            continue;
        }

        const checkDate = i % 2 === 0 ? oneMonthAgo : twoMonthsAgo;

        await prisma.check.create({
            data: {
                companyId: company.id,
                controlId: control.id,
                performedBy: user.id,
                checkDate: checkDate,
                status: status,
                findings: status === 'FAIL' ? 'Non-conformité détectée. Action requise.' :
                    status === 'PARTIAL' ? 'Conformité partielle. Amélioration nécessaire.' :
                        'Conforme. Aucune action requise.',
                correctiveActions: status === 'FAIL' ? 'Planifier la mise en conformité avant 30 jours' :
                    status === 'PARTIAL' ? 'Compléter les documents manquants' : null,
            }
        });
        console.log(`     ✅ ${control.titleFr} → ${status}`);
    }

    // ==================== CREATE DEADLINES ====================
    console.log('\n  📅 Creating Deadlines...');

    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const deadlineData = [
        { obligationTitle: 'Déclaration CNSS mensuelle', dueDate: tomorrow, status: 'PENDING', notes: 'Declaration février' },
        { obligationTitle: 'Déclaration TVA mensuelle', dueDate: nextWeek, status: 'PENDING', notes: 'TVA février' },
        { obligationTitle: 'Vérification extincteurs', dueDate: nextMonth, status: 'PENDING', notes: 'Inspection annuelle' },
        { obligationTitle: 'Visite médicale annuelle', dueDate: yesterday, status: 'PENDING', notes: 'URGENT - En retard!' },
        { obligationTitle: 'Registre des déchets', dueDate: lastWeek, status: 'PENDING', notes: 'URGENT - En retard!' },
    ];

    for (const dl of deadlineData) {
        const obligation = createdObligations.find(o => o.titleFr === dl.obligationTitle);
        if (!obligation) continue;

        const existing = await prisma.deadline.findFirst({
            where: {
                companyId: company.id,
                obligationId: obligation.id,
                dueDate: dl.dueDate,
            }
        });

        if (existing) {
            console.log(`     ⏭️  ${dl.obligationTitle} (exists)`);
            continue;
        }

        await prisma.deadline.create({
            data: {
                companyId: company.id,
                obligationId: obligation.id,
                dueDate: dl.dueDate,
                status: dl.status,
                isRecurring: true,
            }
        });
        console.log(`     ✅ ${dl.obligationTitle} → ${dl.dueDate.toISOString().split('T')[0]}`);
    }

    // ==================== CREATE ALERTS ====================
    console.log('\n  🔔 Creating Alerts...');

    const alertData = [
        { type: 'DEADLINE_REMINDER', titleFr: 'Échéance proche', messageFr: 'Déclaration CNSS due demain!', severity: 'WARNING' },
        { type: 'OVERDUE', titleFr: 'Échéance dépassée', messageFr: 'Visite médicale en retard depuis hier', severity: 'CRITICAL' },
        { type: 'OVERDUE', titleFr: 'Échéance dépassée', messageFr: 'Registre des déchets en retard depuis 7 jours', severity: 'CRITICAL' },
        { type: 'NON_COMPLIANCE', titleFr: 'Non-conformité', messageFr: 'Rapport APAVE/BV - Non-conformité détectée', severity: 'HIGH' },
        { type: 'NON_COMPLIANCE', titleFr: 'Conformité partielle', messageFr: 'Fiches d\'aptitude - Conformité partielle', severity: 'MEDIUM' },
    ];

    for (const alert of alertData) {
        const existing = await prisma.alert.findFirst({
            where: {
                companyId: company.id,
                messageFr: alert.messageFr
            }
        });

        if (existing) {
            console.log(`     ⏭️  ${alert.type} (exists)`);
            continue;
        }

        await prisma.alert.create({
            data: {
                companyId: company.id,
                userId: user.id,
                type: alert.type,
                titleFr: alert.titleFr,
                messageFr: alert.messageFr,
                severity: alert.severity,
                isRead: false,
            }
        });
        console.log(`     ✅ ${alert.type}: ${alert.messageFr.slice(0, 40)}...`);
    }

    // ==================== CREATE AUDITS & TYPES ====================
    console.log('\n  📋 Creating Audit Types...');

    const auditTypesData = [
        { name: 'BSCI Full Audit', nameAr: 'تدقيق BSCI الكامل', category: 'SOCIAL', scope: 'EXTERNAL', frequency: 24, description: 'Audit social complet par organisme tiers (TÜV, SGS...)', descriptionAr: 'تدقيق اجتماعي كامل من قبل جهة خارجية (TÜV, SGS...)' },
        { name: 'Fruit of the Loom CoC', nameAr: 'تدقيق مدونة سلوك FOTL', category: 'BRAND', scope: 'EXTERNAL', frequency: 12, description: 'Audit Code de Conduite FOTL', descriptionAr: 'تدقيق مدونة السلوك فروت أوف ذا لوم' },
        { name: 'Mock Audit BSCI', nameAr: 'تدقيق تجريبي BSCI', category: 'SOCIAL', scope: 'INTERNAL', frequency: 6, description: 'Auto-évaluation blanche avant audit officiel', descriptionAr: 'تقييم ذاتي تجريبي قبل التدقيق الرسمي' },
        { name: 'Inspection Mensuelle HSE', nameAr: 'جولة تفتيش شهرية للصحة والسلامة', category: 'HSE', scope: 'INTERNAL', frequency: 1, description: 'Ronde sécurité et hygiène mensuelle', descriptionAr: 'جولة شهرية للسلامة والصحة المهنية' },
    ];

    const createdTypes: any[] = [];

    for (const t of auditTypesData) {
        const upserted = await prisma.auditType.upsert({
            where: { name: t.name },
            update: { nameAr: t.nameAr, descriptionAr: t.descriptionAr },
            create: t,
        });
        createdTypes.push(upserted);
        console.log(`     ✅ ${t.name} / ${t.nameAr}`);
    }

    console.log('\n  🔍 Creating Sample Audits...');

    const bsciType = createdTypes.find(t => t.name === 'BSCI Full Audit');
    const mockType = createdTypes.find(t => t.name === 'Mock Audit BSCI');

    // Create an External Audit
    if (bsciType) {
        const existingAudit = await prisma.audit.findFirst({
            where: { companyId: company.id, auditTypeId: bsciType.id }
        });

        if (!existingAudit) {
            await prisma.audit.create({
                data: {
                    companyId: company.id,
                    auditTypeId: bsciType.id,
                    scheduledDate: new Date('2026-06-15'),
                    status: 'SCHEDULED',
                    auditorName: 'SGS Tunisia',
                }
            });
            console.log(`     ✅ Scheduled External Audit: BSCI (June 2026)`);
        }
    }

    // Create a Completed Internal Audit with CAP
    if (mockType) {
        const existingInternal = await prisma.audit.findFirst({
            where: { companyId: company.id, auditTypeId: mockType.id }
        });

        if (!existingInternal) {
            const audit = await prisma.audit.create({
                data: {
                    companyId: company.id,
                    auditTypeId: mockType.id,
                    scheduledDate: new Date('2026-01-10'),
                    performedDate: new Date('2026-01-10'),
                    status: 'COMPLETED',
                    score: 85,
                    ratingLabel: 'B',
                    leadAuditorId: user.id,
                    auditTeam: {
                        connect: [{ id: user.id }]
                    },
                    resultSummary: 'Bon niveau général. Quelques écarts mineurs sur la signalétique.',
                }
            });
            console.log(`     ✅ Completed Internal Audit: Mock BSCI (Score 85, Team: ${user.firstName})`);

            // Add CAP
            await prisma.correctiveAction.create({
                data: {
                    auditId: audit.id,
                    description: 'Signalétique extincteurs manquante dans l\'atelier 2',
                    severity: 'MINOR',
                    status: 'OPEN',
                    assignedTo: user.id,
                    dueDate: new Date('2026-01-25'),
                }
            });
            console.log(`     └─ Added Corrective Action: Signalétique manquante`);
        }
    }

    console.log('\n✨ Test data seeding complete!\n');

    // Summary
    const summary = {
        obligations: await prisma.obligation.count({ where: { companyId: company.id } }),
        controls: await prisma.control.count({ where: { companyId: company.id } }),
        checks: await prisma.check.count({ where: { companyId: company.id } }),
        deadlines: await prisma.deadline.count({ where: { companyId: company.id } }),
        alerts: await prisma.alert.count({ where: { companyId: company.id } }),
        audits: await prisma.audit.count({ where: { companyId: company.id } }),
    };

    console.log('📊 Summary:');
    console.log(`   - Obligations: ${summary.obligations}`);
    console.log(`   - Controls: ${summary.controls}`);
    console.log(`   - Checks: ${summary.checks}`);
    console.log(`   - Deadlines: ${summary.deadlines}`);
    console.log(`   - Alerts: ${summary.alerts}`);
    console.log(`   - Audits: ${summary.audits}`);
}

// Run if called directly
if (require.main === module) {
    seedTestData()
        .then(() => prisma.$disconnect())
        .catch((e) => {
            console.error(e);
            prisma.$disconnect();
            process.exit(1);
        });
}
