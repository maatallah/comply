
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUrls() {
    try {
        const entries = await prisma.jortEntry.findMany({
            where: {
                date: { gt: new Date('2026-01-01') },
                pdfUrl: { not: null }
            },
            take: 5,
            orderBy: { date: 'desc' },
            select: { id: true, titleFr: true, pdfUrl: true, pdfUrlAr: true }
        });

        console.log("--- Database PDF URLs ---");
        entries.forEach(e => {
            console.log(`[${e.id}] ${e.titleFr.substring(0, 20)}...`);
            console.log(`  FR: ${e.pdfUrl}`);
            console.log(`  AR: ${e.pdfUrlAr}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkUrls();
