import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugWorkContracts() {
  console.log('🔍 Debugging Work Contracts vs Waste Register\n');

  // Get WEARTECH company
  const company = await prisma.company.findFirst({
    where: { legalName: { contains: 'WEARTECH' } }
  });

  if (!company) {
    console.log('❌ Company not found');
    return;
  }

  // Get ALL checks with action items
  const checks = await prisma.check.findMany({
    where: { companyId: company.id },
    include: {
      control: true,
      actions: true,
      alerts: true
    }
  });

  console.log(`📊 Total Checks: ${checks.length}\n`);

  for (const check of checks) {
    if (check.actions.length > 0 || check.alerts.length > 0) {
      console.log(`🔧 Check: ${check.control.titleFr}`);
      console.log(`   Status: ${check.status}`);
      console.log(`   Control ID: ${check.controlId}`);
      console.log(`   Check ID: ${check.id}`);
      
      if (check.actions.length > 0) {
        console.log(`   ✓ ${check.actions.length} Action Items:`);
        for (const action of check.actions) {
          console.log(`      - ${action.description.substring(0, 60)}...`);
        }
      }
      
      if (check.alerts.length > 0) {
        console.log(`   🔔 ${check.alerts.length} Alerts`);
      }
      
      console.log();
    }
  }
}

debugWorkContracts().finally(() => prisma.$disconnect());
