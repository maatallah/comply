
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const id = 'f1e2d3c4-b5a6-4078-9012-34567890abcd';
    const reg = await prisma.regulation.findUnique({ where: { id } });
    console.log('Regulation exists:', !!reg);
    if (reg) console.log(reg);
    else console.log('MISSING');
}

check()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
