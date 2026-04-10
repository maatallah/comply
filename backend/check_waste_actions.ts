import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find waste register check
  const wasteCheck = await prisma.check.findFirst({
    where: { description: { contains: 'Registre des déchets' } }
  });

  if (!wasteCheck) {
    console.log('❌ Waste register check not found');
    return;
  }

  console.log('✅ Found waste register check:', wasteCheck.id);
  console.log('   Status:', wasteCheck.status);
  console.log('   Description:', wasteCheck.description);
  
  // Find action items for this check
  const actions = await prisma.actionItem.findMany({
    where: { checkId: wasteCheck.id },
    include: { check: true }
  });

  console.log(`\n📋 Action Items for Waste Register Check (${actions.length} found):\n`);
  
  actions.forEach((action, i) => {
    console.log(`${i + 1}. ${action.status} - ${action.priority}`);
    console.log(`   ${action.description.substring(0, 80)}...`);
    console.log(`   Due: ${action.dueDate.toLocaleDateString()}\n`);
  });

  // Also check if there's an alert for this check
  const alerts = await prisma.alert.findMany({
    where: { checkId: wasteCheck.id }
  });

  console.log(`\n🚨 Alerts for this check (${alerts.length} found):`);
  alerts.forEach(alert => {
    console.log(`   - [${alert.severity}] ${alert.titleFr}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
