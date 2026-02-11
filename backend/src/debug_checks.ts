
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- USERS ---');
    const users = await prisma.user.findMany();
    // console.log(users);
    if (users.length === 0) {
        console.log('No users found.');
        return;
    }
    const companyId = users[0].companyId;
    console.log(`Using Company ID: ${companyId}`);

    console.log('\n--- CHECKS (All) ---');
    const allChecks = await prisma.check.findMany({
        where: { companyId },
        include: { control: { select: { titleFr: true } } }
    });
    console.table(allChecks.map(c => ({
        id: c.id,
        control: c.control.titleFr,
        status: c.status,
        actions: c.correctiveActions ? c.correctiveActions.substring(0, 20) : 'NULL'
    })));

    console.log('\n--- CHECKS (FAIL/PARTIAL) ---');
    const failedChecks = await prisma.check.findMany({
        where: {
            companyId,
            status: { in: ['FAIL', 'PARTIAL'] }
        }
    });
    console.log(`Found ${failedChecks.length} failed checks.`);

    console.log('\n--- ALERTS ---');
    const alerts = await prisma.alert.findMany({
        where: { companyId },
        take: 5,
        orderBy: { createdAt: 'desc' }
    });
    console.table(alerts.map(a => ({ id: a.id, type: a.type, checkId: a.checkId })));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
