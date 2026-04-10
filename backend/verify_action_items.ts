import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

(async () => {
  const company = await prisma.company.findFirst({
    where: { taxId: '0746395/P/A/M/000' }
  });

  if (!company) {
    console.log('❌ Company not found');
    process.exit(0);
  }

  console.log('\n📋 ALL ACTION ITEMS IN DATABASE\n');
  
  const actionItems = await prisma.actionItem.findMany({
    where: { 
      check: {
        companyId: company.id
      }
    },
    include: {
      check: {
        include: {
          control: true
        }
      }
    },
    orderBy: [
      { check: { checkDate: 'desc' } },
      { priority: 'desc' }
    ]
  });

  console.log(`Total Action Items: ${actionItems.length}\n`);
  console.log('═'.repeat(100) + '\n');

  actionItems.forEach((item, idx) => {
    const statusEmoji = item.status === 'COMPLETED' ? '✅' : item.status === 'IN_PROGRESS' ? '🔄' : '⏳';
    const priorityEmoji = item.priority === 'CRITICAL' ? '🔴' : item.priority === 'HIGH' ? '🟠' : '🟡';
    
    console.log(`${idx + 1}. ${statusEmoji} ${item.description}`);
    console.log(`   Status: ${item.status} | Priority: ${priorityEmoji} ${item.priority}`);
    console.log(`   Check Control: ${item.check.control.titleFr}`);
    console.log(`   Due: ${item.dueDate.toLocaleDateString('fr-FR')}`);
    if (item.completedAt) console.log(`   Completed: ${item.completedAt.toLocaleDateString('fr-FR')}`);
    if (item.notes) console.log(`   Notes: ${item.notes}`);
    console.log('');
  });

  console.log('═'.repeat(100));
  console.log('\n📊 SUMMARY BY STATUS:\n');
  
  const byStatus = actionItems.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(byStatus).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });

  await prisma.$disconnect();
})();
