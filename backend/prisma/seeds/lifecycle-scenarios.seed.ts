import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🌱 Seeding Comprehensive Lifecycle Scenarios (Oct 2025 - Jun 2026)\n');

  // Find company
  const company = await prisma.company.findFirst({
    where: { taxId: '0746395/P/A/M/000' }
  });

  if (!company) {
    throw new Error('Company not found. Run main seed first.');
  }

  // Find user
  const user = await prisma.user.findFirst({
    where: { email: 'cpt.systeme@gnet.tn' }
  });

  if (!user) {
    throw new Error('User not found. Run main seed first.');
  }

  console.log(`✅ Company: ${company.legalName}`);
  console.log(`✅ User: ${user.email}\n`);

  // Get first 5 controls
  const controls = await prisma.control.findMany({
    take: 5,
    orderBy: { createdAt: 'asc' }
  });

  if (controls.length < 5) {
    throw new Error(`Not enough controls found (${controls.length}). Run main seed first.`);
  }

  const [bsciControl, fireControl, wasteControl, cnssControl, contractsControl] = controls;

  console.log(`📊 Using Controls:`);
  controls.forEach((c, i) => console.log(`  ${i + 1}. ${c.titleFr}`));
  console.log('');

  // ========== SCENARIO 1: RESOLVED ISSUE (October 2025) ==========
  console.log('📋 SCENARIO 1: Resolved Issue (Historical - Oct 2025)');

  const check1 = await prisma.check.create({
    data: {
      companyId: company.id,
      controlId: bsciControl.id,
      checkDate: new Date('2025-10-15'),
      performedBy: user.id,
      status: 'NON_COMPLIANT',
      findings: 'BSCI audit reveals 2 critical findings: (1) Registre des heures incomplete for 12 employees. (2) Medical screening missing for 3 new hires.',
    },
  });

  // Actions for resolved issue (all completed)
  await prisma.actionItem.create({
    data: {
      checkId: check1.id,
      description: 'Reconstruct missing work hours from manual timesheets and payroll records',
      status: 'COMPLETED',
      priority: 'CRITICAL',
      dueDate: new Date('2025-11-10'),
      assignedTo: user.id,
    },
  });

  await prisma.actionItem.create({
    data: {
      checkId: check1.id,
      description: 'Schedule medical checkups for 3 new hires with CNAM-approved physician',
      status: 'COMPLETED',
      priority: 'CRITICAL',
      dueDate: new Date('2025-11-15'),
      assignedTo: user.id,
    },
  });

  // Follow-up check in December showing resolution
  const check1b = await prisma.check.create({
    data: {
      companyId: company.id,
      controlId: check1.control?.id || (await prisma.control.findFirst({ where: { titleFr: { contains: 'Audit BSCI' } } }))!.id,
      checkDate: new Date('2025-12-20'),
      performedBy: user.id,
      status: 'COMPLIANT',
      findings: 'All corrective actions verified. Work register complete, medical certificates filed. BSCI score: B (Acceptable).',
    },
  });

  // Completion action
  await prisma.actionItem.create({
    data: {
      checkId: check1b.id,
      description: 'BSCI compliance verification audit - all items closed',
      status: 'COMPLETED',
      priority: 'HIGH',
      dueDate: new Date('2025-12-20'),
      assignedTo: user.id,
    },
  });

  console.log('  ✅ Resolved in December 2025\n');

  // ========== SCENARIO 2: ONGOING WORK (In Progress - March-April) ==========
  console.log('📋 SCENARIO 2: Ongoing Work (In Progress - March)');

  const check2 = await prisma.check.create({
    data: {
      companyId: company.id,
      controlId: (await prisma.control.findFirst({
        where: { titleFr: { contains: 'Extincteurs' } }
      }))!.id,
      checkDate: new Date('2026-03-20'),
      performedBy: user.id,
      status: 'PARTIAL',
      findings: '12/15 fire extinguishers have valid inspection labels (expires Dec 2025). 3 extinguishers in storage zone need new labels and certification.',
    },
  });

  // Action 1: Procurement in progress
  await prisma.actionItem.create({
    data: {
      checkId: check2.id,
      description: 'Obtain inspection and labeling from INRS-certified contractor for 3 extinguishers',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: new Date('2026-04-30'),
      assignedTo: user.id,
    },
  });

  // Action 2: Pending follow-up
  await prisma.actionItem.create({
    data: {
      checkId: check2.id,
      description: 'Verify new labels are installed and take documentation photos',
      status: 'PENDING',
      priority: 'MEDIUM',
      dueDate: new Date('2026-05-15'),
      assignedTo: user.id,
    },
  });

  console.log('  ✅ Started March 25, ongoing\n');

  // ========== SCENARIO 3: CRITICAL NON-COMPLIANCE (Cascading Actions) ==========
  console.log('📋 SCENARIO 3: Critical Non-Compliance (Cascading Actions)');

  const check3 = await prisma.check.create({
    data: {
      companyId: company.id,
      controlId: (await prisma.control.findFirst({
        where: { titleFr: { contains: 'Registre des déchets' } }
      }))!.id,
      checkDate: new Date('2026-02-25'),
      performedBy: user.id,
      status: 'NON_COMPLIANT',
      findings: 'Critical gaps in waste register: 5 waste shipments from February missing BSD slips. 3 entries from March lack required documentation. Current data incomplete for 8 days in March 2026.',
    },
  });

  // Cascading action 1: Data recovery (already in progress)
  await prisma.actionItem.create({
    data: {
      checkId: check3.id,
      description: 'Contact GEVAL to recover BSD slips for 5 February waste shipments',
      status: 'IN_PROGRESS',
      priority: 'CRITICAL',
      dueDate: new Date('2026-05-15'),
      assignedTo: user.id,
    },
  });

  // Cascading action 2: Current data update (in progress)
  await prisma.actionItem.create({
    data: {
      checkId: check3.id,
      description: 'Complete March 2026 entries with missing weights, dates, and BSD references',
      status: 'IN_PROGRESS',
      priority: 'CRITICAL',
      dueDate: new Date('2026-05-20'),
      assignedTo: user.id,
    },
  });

  // Cascading action 3: Training (pending after data recovery)
  await prisma.actionItem.create({
    data: {
      checkId: check3.id,
      description: 'Train waste management coordinator on proper documentation procedures',
      status: 'PENDING',
      priority: 'HIGH',
      dueDate: new Date('2026-05-25'),
      assignedTo: user.id,
    },
  });

  // Cascading action 4: Verification audit (pending after training)
  await prisma.actionItem.create({
    data: {
      checkId: check3.id,
      description: 'Internal compliance audit: verify all recovered data and process improvements',
      status: 'PENDING',
      priority: 'MEDIUM',
      dueDate: new Date('2026-06-15'),
      assignedTo: user.id,
    },
  });

  console.log('  ✅ 4 cascading actions (2 IN_PROGRESS, 2 PENDING)\n');

  // ========== SCENARIO 4: ROUTINE COMPLIANCE WITH UPCOMING DEADLINE ==========
  console.log('📋 SCENARIO 4: Routine Compliance (Upcoming Deadline)');

  const check4 = await prisma.check.create({
    data: {
      companyId: company.id,
      controlId: (await prisma.control.findFirst({
        where: { titleFr: { contains: 'Attestation.*CNSS' } }
      }))!.id,
      checkDate: new Date('2026-03-15'),
      performedBy: user.id,
      status: 'COMPLIANT',
      findings: 'CNSS attestation valid until 15 June 2026 (96 days remaining). All payment records in order.',
    },
  });

  // Pending renewal action (future)
  await prisma.actionItem.create({
    data: {
      checkId: check4.id,
      description: 'Initiate CNSS attestation renewal process (deadline: 1 June 2026)',
      status: 'PENDING',
      priority: 'HIGH',
      dueDate: new Date('2026-06-01'),
      assignedTo: user.id,
    },
  });

  console.log('  ✅ Compliant, renewal pending in June\n');

  // ========== SCENARIO 5: MULTIPLE PENDING ITEMS ==========
  console.log('📋 SCENARIO 5: Multiple Pending Items (New Hires)');

  const check5 = await prisma.check.create({
    data: {
      companyId: company.id,
      controlId: (await prisma.control.findFirst({
        where: { titleFr: { contains: 'Contrats.*travail' } }
      }))!.id,
      checkDate: new Date('2026-04-05'),
      performedBy: user.id,
      status: 'PARTIAL',
      findings: '115 existing contracts on file and current. 2 new hires from March still lack signed contracts. Probation period ends 30 April 2026.',
    },
  });

  await prisma.actionItem.create({
    data: {
      checkId: check5.id,
      description: 'Finalize employment contracts for 2 new hires (hired 20 & 22 March)',
      status: 'PENDING',
      priority: 'HIGH',
      dueDate: new Date('2026-04-25'),
      assignedTo: user.id,
    },
  });

  await prisma.actionItem.create({
    data: {
      checkId: check5.id,
      description: 'Obtain signatures from both new hires and management',
      status: 'PENDING',
      priority: 'HIGH',
      dueDate: new Date('2026-04-28'),
      assignedTo: user.id,
    },
  });

  console.log('  ✅ 2 pending items, deadline 30 April\n');

  // ========== ADD EVIDENCE FILES ==========
  console.log('📎 Adding Evidence Files\n');

  // Evidence for resolved BSCI issue
  await prisma.evidence.create({
    data: {
      companyId: company.id,
      checkId: check1.id,
      fileName: 'BSCI_Initial_Audit_Oct2025.pdf',
      filePath: '/evidence/audits/bsci_oct_2025.pdf',
      fileType: 'PDF',
      fileSize: 3200000,
      description: 'Initial BSCI audit report - October 2025 - SGS certification',
    },
  });

  await prisma.evidence.create({
    data: {
      companyId: company.id,
      checkId: check1b.id,
      fileName: 'BSCI_Follow_up_Dec2025.pdf',
      filePath: '/evidence/audits/bsci_followup_dec_2025.pdf',
      fileType: 'PDF',
      fileSize: 2500000,
      description: 'Follow-up verification audit - December 2025 - All corrective actions verified',
    },
  });

  // Evidence for extinguishers
  await prisma.evidence.create({
    data: {
      companyId: company.id,
      checkId: check2.id,
      fileName: 'Extinguisher_Inspection_Labels.zip',
      filePath: '/evidence/fire_safety/extinguisher_photos.zip',
      fileType: 'ZIP',
      fileSize: 4500000,
      description: '47 photos of all fire extinguishers showing current label status',
    },
  });

  // Evidence for waste register
  await prisma.evidence.create({
    data: {
      companyId: company.id,
      checkId: check3.id,
      fileName: 'Waste_Register_Analysis_Feb2026.xlsx',
      filePath: '/evidence/waste/register_analysis_feb_2026.xlsx',
      fileType: 'XLSX',
      fileSize: 512000,
      description: 'Detailed analysis of missing entries, timeline of discrepancies, and recovery plan',
    },
  });

  // Evidence for CNSS
  await prisma.evidence.create({
    data: {
      companyId: company.id,
      checkId: check4.id,
      fileName: 'CNSS_Attestation_2026.pdf',
      filePath: '/evidence/payroll/cnss_attestation_2026.pdf',
      fileType: 'PDF',
      fileSize: 256000,
      description: 'Current CNSS attestation - valid until 15 June 2026',
    },
  });

  // ========== ADD DEADLINES ==========
  console.log('📅 Adding Deadlines\n');

  // Extinguisher compliance deadline
  await prisma.deadline.create({
    data: {
      companyId: company.id,
      obligationId: (await prisma.obligation.findFirst({
        where: { titleFr: { contains: 'Extincteurs' } }
      }))!.id,
      dueDate: new Date('2026-04-30'),
      status: 'PENDING',
    },
  });

  // CNSS renewal deadline
  await prisma.deadline.create({
    data: {
      companyId: company.id,
      obligationId: (await prisma.obligation.findFirst({
        where: { titleFr: { contains: 'CNSS' } }
      }))!.id,
      dueDate: new Date('2026-06-01'),
      status: 'PENDING',
    },
  });

  // Waste register correction deadline
  await prisma.deadline.create({
    data: {
      companyId: company.id,
      obligationId: (await prisma.obligation.findFirst({
        where: { titleFr: { contains: 'Déchets' } }
      }))!.id,
      dueDate: new Date('2026-06-15'),
      status: 'PENDING',
    },
  });

  // New hire contracts deadline
  await prisma.deadline.create({
    data: {
      companyId: company.id,
      obligationId: (await prisma.obligation.findFirst({
        where: { titleFr: { contains: 'Contrats' } }
      }))!.id,
      dueDate: new Date('2026-04-30'),
      status: 'PENDING',
    },
  });

  // ========== ADD ALERTS ==========
  console.log('🚨 Adding Alerts\n');

  // Alert for critical waste issue
  await prisma.alert.create({
    data: {
      companyId: company.id,
      type: 'NON_COMPLIANCE',
      severity: 'HIGH',
      titleFr: 'Vous avez une non-conformité critique: Registre des déchets',
      messageFr: 'Le registre des déchets présente des lacunes critiques (5 BSD manquants en février, 3 entrées incomplètes en mars). 4 actions correctives ont été créées. Délai: 15 juin 2026.',
      checkId: check3.id,
    },
  });

  // Alert for upcoming CNSS renewal
  await prisma.alert.create({
    data: {
      companyId: company.id,
      type: 'DEADLINE_REMINDER',
      severity: 'MEDIUM',
      titleFr: 'Rappel: Renouvellement attestation CNSS',
      messageFr: 'Votre attestation CNSS expire le 15 juin 2026 (66 jours restants). Commencez le renouvellement avant le 1er juin.',
      checkId: check4.id,
    },
  });

  // Alert for extinguisher compliance
  await prisma.alert.create({
    data: {
      companyId: company.id,
      type: 'DEADLINE_REMINDER',
      severity: 'MEDIUM',
      titleFr: 'Attention: Renouvellement étiquettes extincteurs',
      messageFr: '3 extincteurs nécessitent l\'inspection et le renouvellement des étiquettes avant fin avril 2026.',
      checkId: check2.id,
    },
  });

  // Alert for new hire contracts
  await prisma.alert.create({
    data: {
      companyId: company.id,
      type: 'DEADLINE_REMINDER',
      severity: 'MEDIUM',
      titleFr: 'Urgence: Finaliser contrats pour 2 nouveaux recrutés',
      messageFr: '2 employés embauchés en mars 2026 doivent avoir leurs contrats signés avant la fin de la période de stage (30 avril 2026).',
      checkId: check5.id,
    },
  });

  console.log('\n✨ Lifecycle scenarios seeded successfully!\n');
  console.log('📊 Summary:');
  console.log('  Scenario 1: Resolved issue (Oct-Dec 2025) - 2 completed actions');
  console.log('  Scenario 2: Ongoing work (March-May 2026) - 1 in progress, 1 pending');
  console.log('  Scenario 3: Critical non-compliance (Feb-Jun 2026) - 2 in progress, 2 pending (cascading)');
  console.log('  Scenario 4: Routine compliance (Mar-Jun 2026) - 1 pending renewal');
  console.log('  Scenario 5: Multiple pending (Mar-May 2026) - 2 pending items');
  console.log('\n  Total: 15 checks, 11 action items, 5 evidence files, 4 deadlines, 4 alerts\n');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
