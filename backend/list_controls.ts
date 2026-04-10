import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const controls = await prisma.control.findMany({
    select: { id: true, titleFr: true }
  });

  console.log('Available Controls:');
  controls.forEach(c => {
    console.log(`  - ${c.titleFr} (${c.id})`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
