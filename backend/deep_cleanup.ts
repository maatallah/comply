import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanAllData() {
  console.log('🧹 DEEP CLEANUP: Removing all compliance data (keeping users & companies)\n');

  // Delete in reverse order of dependencies
  const auditCount = await prisma.audit.deleteMany({});
  console.log(`  ✅ Deleted ${auditCount.count} audits`);

  const alertCount = await prisma.alert.deleteMany({});
  console.log(`  ✅ Deleted ${alertCount.count} alerts`);

  const actionItemCount = await prisma.actionItem.deleteMany({});
  console.log(`  ✅ Deleted ${actionItemCount.count} action items`);

  const evidenceCount = await prisma.evidence.deleteMany({});
  console.log(`  ✅ Deleted ${evidenceCount.count} evidence files`);

  const checkCount = await prisma.check.deleteMany({});
  console.log(`  ✅ Deleted ${checkCount.count} checks`);

  const deadlineCount = await prisma.deadline.deleteMany({});
  console.log(`  ✅ Deleted ${deadlineCount.count} deadlines`);

  const controlCount = await prisma.control.deleteMany({});
  console.log(`  ✅ Deleted ${controlCount.count} controls`);

  const obligationCount = await prisma.obligation.deleteMany({});
  console.log(`  ✅ Deleted ${obligationCount.count} obligations`);

  console.log('\n✨ Deep cleanup complete!\n');
  console.log('📊 Remaining data:');
  
  const companies = await prisma.company.findMany();
  console.log(`   - Companies: ${companies.length}`);
  
  const users = await prisma.user.findMany();
  console.log(`   - Users: ${users.length}\n`);
  
  console.log('✨ Ready for fresh seeding!\n');
}

cleanAllData().finally(() => prisma.$disconnect());
