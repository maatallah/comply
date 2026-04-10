import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyData() {
  console.log('📊 Verifying Data Relationships...\n');

  // Get WEARTECH company
  const company = await prisma.company.findFirst({
    where: { legalName: { contains: 'WEARTECH' } }
  });

  if (!company) {
    console.log('❌ WEARTECH company not found');
    return;
  }

  console.log(`✅ Company: ${company.legalName}`);
  console.log(`   Tax ID: ${company.taxId} | CNSS: ${company.cnssId}\n`);

  // Get alerts with their related data
  const alerts = await prisma.alert.findMany({
    where: { companyId: company.id },
    include: {
      check: {
        include: {
          control: true,
          actions: true,
          evidence: true
        }
      }
    }
  });

  console.log(`📢 Alerts: ${alerts.length} found\n`);

  for (const alert of alerts) {
    console.log(`  🔔 Alert: ${alert.titleFr}`);
    console.log(`     Message: ${alert.messageFr}`);
    console.log(`     Status: ${alert.severity}`);

    if (alert.check) {
      console.log(`     ✓ Linked Check: ${alert.check.status}`);
      console.log(`     ✓ Control: ${alert.check.control?.titleFr || 'N/A'}`);

      if (alert.check.actions.length > 0) {
        console.log(`     ✓ Action Items: ${alert.check.actions.length}`);
        for (const item of alert.check.actions) {
          console.log(`        - ${item.description} (${item.priority})`);
        }
      } else {
        console.log(`     ⚠️  NO ACTION ITEMS`);
      }

      if (alert.check.evidence.length > 0) {
        console.log(`     ✓ Evidence: ${alert.check.evidence.length} files`);
      }
    } else {
      console.log(`     ❌ NO LINKED CHECK`);
    }
    console.log();
  }

  // Summary stats
  console.log('\n📊 Summary Statistics:\n');

  const checks = await prisma.check.findMany({
    where: { companyId: company.id },
    include: { actions: true, evidence: true, alerts: true }
  });

  console.log(`  Checks: ${checks.length}`);
  console.log(`    - With action items: ${checks.filter(c => c.actions.length > 0).length}`);
  console.log(`    - With evidence: ${checks.filter(c => c.evidence.length > 0).length}`);
  console.log(`    - With alerts: ${checks.filter(c => c.alerts.length > 0).length}`);

  const actionItems = await prisma.actionItem.findMany({
    where: { check: { companyId: company.id } }
  });

  console.log(`\n  Action Items: ${actionItems.length}`);

  const evidence = await prisma.evidence.findMany({
    where: { companyId: company.id }
  });

  console.log(`  Evidence Files: ${evidence.length}`);
}

verifyData().finally(() => prisma.$disconnect());
