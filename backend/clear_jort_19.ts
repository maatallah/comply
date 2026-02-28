
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clear() {
    try {
        const result = await prisma.jortEntry.deleteMany({
            where: { jortNumber: '019' }
        });
        console.log(`Deleted ${result.count} JORT 19 entries.`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

clear();
