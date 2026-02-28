const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const testUpdate = async () => {
    try {
        const audit = await prisma.audit.findUnique({ where: { id: '056bf93c-9361-4e5c-8432-d7944c35c7a2' } });
        console.log("Found audit:", audit.id, audit.companyId);

        const updated = await prisma.audit.update({
            where: { id: audit.id },
            data: {
                companyId: audit.companyId,
                scheduledDate: new Date('2026-03-03'),
                auditorName: 'Adam'
            }
        });
        console.log("Updated!", updated);
    } catch (err) {
        console.error("Prisma error:", err);
    } finally {
        await prisma.$disconnect();
    }
};

testUpdate();
