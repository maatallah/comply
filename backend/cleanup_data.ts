import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanCompanyData() {
  console.log('🧹 Cleaning up old WEARTECH data...\n');

  // Get WEARTECH company
  const company = await prisma.company.findFirst({
    where: { legalName: { contains: 'WEARTECH' } }
  });

  if (!company) {
    console.log('❌ WEARTECH company not found');
    return;
  }

  console.log(`🔍 Found: ${company.legalName}`);

  // Delete in order of dependencies
  const alertCount = await prisma.alert.deleteMany({
    where: { companyId: company.id }
  });
  console.log(`  ✅ Deleted ${alertCount.count} old alerts`);

  const actionItemCount = await prisma.actionItem.deleteMany({
    where: { check: { companyId: company.id } }
  });
  console.log(`  ✅ Deleted ${actionItemCount.count} old action items`);

  const evidenceCount = await prisma.evidence.deleteMany({
    where: { companyId: company.id }
  });
  console.log(`  ✅ Deleted ${evidenceCount.count} old evidence files`);

  const checkCount = await prisma.check.deleteMany({
    where: { companyId: company.id }
  });
  console.log(`  ✅ Deleted ${checkCount.count} old checks`);

  const deadlineCount = await prisma.deadline.deleteMany({
    where: { companyId: company.id }
  });
  console.log(`  ✅ Deleted ${deadlineCount.count} old deadlines`);

  const obligationCount = await prisma.obligation.deleteMany({
    where: { companyId: company.id }
  });
  console.log(`  ✅ Deleted ${obligationCount.count} old obligations`);

  const controlCount = await prisma.control.deleteMany({
    where: { companyId: company.id }
  });
  console.log(`  ✅ Deleted ${controlCount.count} old controls`);

  console.log('\n✨ Cleanup complete! Ready for fresh seeding.\n');
}

cleanCompanyData().finally(() => prisma.$disconnect());
