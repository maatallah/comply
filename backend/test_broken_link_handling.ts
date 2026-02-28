
import { JortScraper } from './src/modules/jort/jort.scraper';
import { PrismaClient } from '@prisma/client';

const scraper = new JortScraper();
const prisma = new PrismaClient();

async function testHandling() {
    console.log("--- Testing Broken Link Handling (JORT 19) ---");

    // Target JORT 19 specifically
    const number = 19;
    const year = 2026;

    try {
        await scraper.scrapeSpecificJort(year, number.toString());
        console.log("✅ Scrape completed without error.");

        // Check DB
        const entries = await prisma.jortEntry.findMany({
            where: { jortNumber: '019' }
        });

        console.log(`Found ${entries.length} entries for JORT 19.`);
        entries.forEach(e => {
            console.log(`- ${e.titleFr.substring(0, 30)}... | PDF: ${e.pdfUrl}`);
        });

        if (entries.length > 0 && entries.every(e => e.pdfUrl === null)) {
            console.log("✅ SUCCESS: Entries saved with NULL PDF URL.");
        } else {
            console.log("❌ FAILURE: Entries not saved or PDF URL not null.");
        }

    } catch (e) {
        console.error("❌ Scrape failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

testHandling();
