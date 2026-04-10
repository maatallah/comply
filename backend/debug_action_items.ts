import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugActionItems() {
  console.log('🔍 Debugging Action Items API Response\n');

  // Get WEARTECH company
  const company = await prisma.company.findFirst({
    where: { legalName: { contains: 'WEARTECH' } }
  });

  if (!company) {
    console.log('❌ Company not found');
    return;
  }

  // Get all action items with their check details
  const actionItems = await prisma.actionItem.findMany({
    where: { check: { companyId: company.id } },
    include: {
      check: {
        include: {
          control: true
        }
      }
    }
  });

  console.log(`📊 Total Action Items in DB: ${actionItems.length}\n`);

  // Group by check/control
  const grouped: Record<string, any[]> = {};
  
  for (const item of actionItems) {
    const key = item.check?.control?.titleFr || 'Unknown Control';
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(item);
  }

  // Display grouped
  for (const [control, items] of Object.entries(grouped)) {
    console.log(`\n🔧 Control: ${control}`);
    console.log(`   Check ID: ${items[0].checkId}`);
    console.log(`   Items: ${items.length}`);
    
    for (const item of items) {
      console.log(`     - ${item.description}`);
      console.log(`       Status: ${item.status} | Priority: ${item.priority}`);
    }
  }

  // Check for waste register specifically
  console.log('\n\n🚨 WASTE REGISTER DEBUG:');
  const wasteCheck = await prisma.check.findFirst({
    where: {
      company: { legalName: { contains: 'WEARTECH' } },
      status: 'NON_COMPLIANT'
    },
    include: {
      control: true,
      actions: true
    }
  });

  if (wasteCheck) {
    console.log(`✅ Found waste register check:`);
    console.log(`   Check ID: ${wasteCheck.id}`);
    console.log(`   Control: ${wasteCheck.control.titleFr}`);
    console.log(`   Status: ${wasteCheck.status}`);
    console.log(`   Action Items: ${wasteCheck.actions.length}`);
    
    if (wasteCheck.actions.length > 0) {
      console.log(`   Details:`);
      for (const action of wasteCheck.actions) {
        console.log(`     - ${action.description}`);
        console.log(`       ID: ${action.id} | Status: ${action.status}`);
      }
    }
  } else {
    console.log('❌ Waste register check not found');
  }
}

debugActionItems().finally(() => prisma.$disconnect());
