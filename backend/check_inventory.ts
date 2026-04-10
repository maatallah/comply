import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

(async () => {
  const company = await prisma.company.findFirst({
    where: { taxId: '0746395/P/A/M/000' }
  });

  console.log('📊 DATABASE INVENTORY\n');
  console.log(`Company: ${company?.legalName}`);

  const checks = await prisma.check.findMany({
    where: { companyId: company?.id },
    include: { control: true }
  });
  console.log(`\nChecks: ${checks.length}`);
  checks.forEach(c => {
    console.log(`  - ${c.control.titleFr} (${c.status})`);
  });

  const actionItems = await prisma.actionItem.findMany({
    where: {
      check: {
        companyId: company?.id
      }
    }
  });
  console.log(`\nAction Items: ${actionItems.length}`);

  const deadlines = await prisma.deadline.findMany({
    where: { companyId: company?.id }
  });
  console.log(`Deadlines: ${deadlines.length}`);

  const evidence = await prisma.evidence.findMany({
    where: { companyId: company?.id }
  });
  console.log(`Evidence: ${evidence.length}`);

  const alerts = await prisma.alert.findMany({
    where: { companyId: company?.id }
  });
  console.log(`Alerts: ${alerts.length}`);

  await prisma.$disconnect();
})();
