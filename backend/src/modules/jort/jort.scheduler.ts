import cron from 'node-cron';
import { jortScraper } from './jort.scraper';

const CRON_SCHEDULE = process.env.JORT_SCRAPE_CRON || '0 8 * * *'; // Default: daily at 8 AM
const ENABLED = process.env.JORT_SCRAPE_ENABLED !== 'false'; // Default: enabled

let scheduledTask: cron.ScheduledTask | null = null;

export function startJortScheduler() {
    if (!ENABLED) {
        console.log('⏸️  JORT scheduler disabled (JORT_SCRAPE_ENABLED=false)');
        return;
    }

    if (!cron.validate(CRON_SCHEDULE)) {
        console.error(`❌ Invalid cron expression: ${CRON_SCHEDULE}`);
        return;
    }

    scheduledTask = cron.schedule(CRON_SCHEDULE, async () => {
        console.log(`\n⏰ [${new Date().toISOString()}] Scheduled JORT scrape starting...`);
        try {
            const result = await jortScraper.scrapeLatest();
            console.log(`✅ Scheduled scrape complete: ${result.stats.new} new, ${result.stats.duplicates} duplicates, ${result.stats.errors} errors`);

            // Run Gap Scan
            console.log('🔎 Running Gap Scan...');
            await jortScraper.scanMissingJorts();
            console.log('✅ Gap Scan complete');
        } catch (error: any) {
            console.error(`❌ Scheduled scrape failed: ${error.message}`);
        }
    });

    console.log(`⏰ JORT scheduler started — cron: "${CRON_SCHEDULE}"`);
}

export function stopJortScheduler() {
    if (scheduledTask) {
        scheduledTask.stop();
        scheduledTask = null;
        console.log('⏹️  JORT scheduler stopped');
    }
}
