
import { JortScraper } from '../../src/modules/jort/jort.scraper';
import prisma from '../../src/shared/prisma';
import { jortService } from '../../src/modules/jort/jort.service';

/**
 * Seed JORT with Real Data
 * 
 * This script uses the JortScraper to fetch varying types of regulations
 * (Laws, Decrees, Orders) to populate the database with rich, bilingual data.
 */
async function seedRealJort() {
    console.log('🌱 Starting Real JORT Seeding...');

    const scraper = new JortScraper();

    // We will scrape a few specific collections to get diverse data
    // collection "2024" for Laws, "2025" for latest
    // Note: The scraper logic handles "latest" by default, we'll use that.

    try {
        console.log('📡 Fetching latest entries from PIST.tn...');
        const result = await scraper.scrapeLatest();

        console.log('📊 Scrape Result:', result);
        console.log(`✅ Successfully seeded ${result.stats.new} new entries.`);

        // Verify Arabic data
        const arabicEntries = await prisma.jortEntry.findMany({
            where: {
                titleAr: { not: null }
            },
            take: 5,
            orderBy: { date: 'desc' }
        });

        console.log('\n🔍 Verification - Sample Arabic Entries:');
        arabicEntries.forEach(e => {
            console.log(`- [${e.type}] ${e.titleAr?.substring(0, 50)}...`);
            console.log(`  Ministry: ${e.ministryAr || 'N/A'}`);
            console.log(`  PDF (AR): ${e.pdfUrlAr || 'N/A'}`);
            console.log('---');
        });

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedRealJort();
