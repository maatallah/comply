import { jortService } from './jort.service';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import prisma from '../../shared/prisma';

interface ScraperConfig {
    baseUrl: string;
    collections: string[];
    resultsPerPage: number;
    maxPages: number;
    sortField: 'date' | 'year' | 'relevance';
    sortOrder: 'a' | 'd';
}

interface ParsedEntry {
    titleFr: string;
    titleAr?: string;
    ministry?: string;
    ministryAr?: string;
    type?: string;
    date?: string;
    recordId: string;
    pdfUrl?: string;
    pdfUrlAr?: string;
}

interface ScraperStats {
    total: number;
    new: number;
    duplicates: number;
    errors: number;
}

export class JortScraper {
    private readonly config: ScraperConfig = {
        baseUrl: 'https://www.pist.tn',
        collections: ['JORT'], // Can expand to ['Loi', 'Décret', 'Arrêté'] for specific types
        resultsPerPage: 50,
        maxPages: 5, // Limit to prevent overwhelming the system
        sortField: 'date',
        sortOrder: 'd',
    };

    private xmlParser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
    });

    /**
     * Main scraping orchestrator
     * Strategy:
     * 1. Fetch XML search results from PIST.tn search API
     * 2. Parse Dublin Core metadata
     * 3. Extract FR/AR titles, ministry, type
     * 4. Deduplicate against existing database entries
     * 5. Fetch PDF URLs for new entries (with rate limiting)
     * 6. Insert new entries with PENDING status
     */
    async scrapeLatest(): Promise<{ stats: ScraperStats; entries: ParsedEntry[] }> {
        console.log('🔍 Starting PIST.tn Real Scrape...');

        const stats: ScraperStats = { total: 0, new: 0, duplicates: 0, errors: 0 };
        const allEntries: ParsedEntry[] = [];

        try {
            // Detect if website structure has changed
            await this.detectWebsiteChanges();

            for (const collection of this.config.collections) {
                console.log(`📚 Scraping collection: ${collection}`);

                const entries = await this.scrapeCollection(collection);
                stats.total += entries.length;

                // Deduplicate and process
                for (const entry of entries) {
                    try {
                        const isDuplicate = await this.isDuplicate(entry);

                        if (isDuplicate) {
                            stats.duplicates++;
                            console.log(`⏭️  Skipping duplicate: ${entry.titleFr.substring(0, 50)}...`);
                        } else {
                            // Fetch PDF URL for new entry
                            console.log(`📄 Fetching PDF for record ${entry.recordId}...`);
                            const pdfs = await this.extractPdfUrl(entry.recordId);
                            if (pdfs.pdfFr) {
                                entry.pdfUrl = pdfs.pdfFr;
                                console.log(`   └─ Found PDF (FR): ${pdfs.pdfFr}`);
                            }
                            if (pdfs.pdfAr) {
                                entry.pdfUrlAr = pdfs.pdfAr;
                                console.log(`   └─ Found PDF (AR): ${pdfs.pdfAr}`);
                            }
                            if (pdfs.jortNumber) {
                                console.log(`   └─ Found JORT Number: ${pdfs.jortNumber}`);
                            }

                            if (!pdfs.pdfFr && !pdfs.pdfAr) {
                                console.log(`   └─ No PDF found.`);
                            }

                            // Be polite to the server
                            await new Promise(resolve => setTimeout(resolve, 500));

                            await jortService.createEntry({
                                titleFr: entry.titleFr,
                                titleAr: entry.titleAr,
                                ministry: entry.ministry,
                                ministryAr: entry.ministryAr,
                                type: entry.type,
                                date: entry.date,
                                pdfUrl: entry.pdfUrl,
                                pdfUrlAr: entry.pdfUrlAr,
                                recordId: entry.recordId,
                                jortNumber: pdfs.jortNumber || undefined,
                            });
                            stats.new++;
                            allEntries.push(entry);
                            console.log(`✅ New entry: ${entry.titleFr.substring(0, 50)}...`);
                        }
                    } catch (error: any) {
                        stats.errors++;
                        console.error(`❌ Error processing entry: ${error.message}`);
                    }
                }
            }

            console.log('✅ PIST Scrape Complete');
            console.log(`📊 Stats: ${stats.new} new, ${stats.duplicates} duplicates, ${stats.errors} errors (${stats.total} total)`);

            return { stats, entries: allEntries };
        } catch (error: any) {
            console.error('❌ Scraper failed:', error.message);
            await this.alertScraperFailure(error);
            throw error;
        }
    }

    /**
     * Scrape a specific JORT number for a given year
     * Uses the advanced search pattern that proved more reliable for finding missing entries
     */
    async scrapeSpecificJort(year: number, number: string): Promise<number> {
        console.log(`🔍 Scraper: Targeting specific JORT N°${number}/${year}...`);
        const paddedNumber = number.toString().padStart(3, '0');

        // Note: PIST XML often returns French metadata even with ln=ar.
        // We fetch both just in case, but usually titleAr might be same as titleFr.
        // We rely on extractPdfUrl to generate the correct Arabic PDF link.

        const urlFr = `${this.config.baseUrl}/search?ln=fr&as=1&cc=JORT&m1=a&p1=${paddedNumber}&f1=jortnumber&op1=a&m2=a&p2=${year}&f2=jortyear&op2=a&of=xd&rg=50`;
        const urlAr = `${this.config.baseUrl}/search?ln=ar&as=1&cc=JORT&m1=a&p1=${paddedNumber}&f1=jortnumber&op1=a&m2=a&p2=${year}&f2=jortyear&op2=a&of=xd&rg=50`;

        try {
            const [respFr, respAr] = await Promise.all([
                axios.get(urlFr, { timeout: 30000, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }),
                axios.get(urlAr, { timeout: 30000, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } })
            ]);

            const recordsFr = this.extractRecordsFromResponse(respFr.data);
            const recordsAr = this.extractRecordsFromResponse(respAr.data);

            console.log(`   └─ Found ${recordsFr.length} FR / ${recordsAr.length} AR records`);

            // Map Arabic records
            const arMap = new Map<string, ParsedEntry>();
            for (const rec of recordsAr) {
                const parsed = this.parseDublinCoreEntry(rec);
                if (parsed) arMap.set(parsed.recordId, parsed);
            }

            let newCount = 0;
            for (const recFr of recordsFr) {
                const parsedFr = this.parseDublinCoreEntry(recFr);
                if (parsedFr) {
                    const parsedAr = arMap.get(parsedFr.recordId);

                    // Use Arabic title ONLY if it actually has Arabic characters
                    let titleAr = parsedAr?.titleFr;
                    if (titleAr && !/[\u0600-\u06FF]/.test(titleAr)) {
                        titleAr = undefined; // It's just French duplicate
                    }

                    const ministryAr = parsedAr?.ministry; // Same check could apply

                    // Fallback: If titleAr is missing, we might use titleFr or leave null.
                    // The UI will handle displaying titleFr if titleAr is missing.

                    const isDup = await this.isDuplicate(parsedFr);
                    if (!isDup) {
                        const pdfs = await this.extractPdfUrl(parsedFr.recordId);

                        await jortService.createEntry({
                            titleFr: parsedFr.titleFr,
                            titleAr: titleAr,
                            ministry: parsedFr.ministry,
                            ministryAr: ministryAr,
                            type: parsedFr.type,
                            date: parsedFr.date,
                            pdfUrl: pdfs.pdfFr || undefined,
                            pdfUrlAr: pdfs.pdfAr || undefined,
                            recordId: parsedFr.recordId,
                            jortNumber: pdfs.jortNumber || undefined,
                        });
                        newCount++;
                    }
                }
            }
            return newCount;

        } catch (error: any) {
            console.error(`❌ Error scraping specific jort ${number}/${year}:`, error.message);
            return 0;
        }
    }

    private extractRecordsFromResponse(xmlData: string): any[] {
        if (!xmlData || (!xmlData.includes('<collection') && !xmlData.includes('<record'))) {
            return [];
        }
        const jsonObj = this.xmlParser.parse(xmlData);
        return this.extractDublinCoreRecords(jsonObj);
    }

    /**
     * Scan for missing JORTs by checking sequence gaps
     * Strategy:
     * 1. Find latest JORT in database (by date)
     * 2. Extract year and number (if available) or assume based on date
     * 3. Propose next expected JORT (Latest + 1)
     * 4. Try to fetch it using scrapeSpecificJort
     * 5. Repeat until no more found (up to a limit)
     */
    async scanMissingJorts(): Promise<number> {
        console.log('🕵️‍♀️ Starting Missing JORT Scan...');
        let foundCount = 0;

        try {
            // 1. Get latest JORT entry
            const latestEntry = await prisma.jortEntry.findFirst({
                orderBy: { date: 'desc' },
                where: { type: { in: ['Loi', 'Décret', 'Arrêté'] } } // Filter mainly for official texts
            });

            if (!latestEntry || !latestEntry.date) {
                console.log('   └─ No previous entries found to base prediction on.');
                return 0;
            }

            const currentYear = new Date().getFullYear();
            const latestYear = latestEntry.date.getFullYear();

            let lastNumber = 0;
            if (latestEntry.jortNumber) {
                lastNumber = parseInt(latestEntry.jortNumber, 10);
            } else {
                if (latestYear < currentYear) {
                    lastNumber = 0;
                } else {
                    console.log('   └─ Cannot determine last JORT number (field is empty). Skipping gap scan.');
                    return 0;
                }
            }

            // If we are in a new year, start from 0
            let targetYear = latestYear;
            let startNumber = lastNumber + 1;

            if (latestYear < currentYear) {
                targetYear = currentYear;
                startNumber = 1;
            } else {
                // Heuristic: If we are early in the year (e.g. Feb) and lastNumber > 100, 
                // it implies we picked up a late publication from previous year that was mis-dated or just noise.
                // Force a check from 1 if we have NO low numbers? 
                // Better: Just clamp it. If we are in Feb, max JORT is probably ~20-30.
                const currentMonth = new Date().getMonth() + 1;
                if (currentMonth <= 2 && lastNumber > 50) {
                    console.log(`   ⚠️ Suspiciously high JORT number (${lastNumber}) for early year. Resetting scan to 1.`);
                    startNumber = 1;
                    // We might want to scan up to current expected? 
                    // Let's just start from 1 and scan until we hit failures.
                }
            }

            console.log(`   └─ Latest known: Year ${latestYear}, Num ${lastNumber}. Scanning from ${targetYear}/${startNumber}...`);

            // Try to fetch next numbers. 
            // If we reset to 1, we might need to scan quite a few.
            // Let's bump MAX_GAP_TRY to 10 to be safe, or higher if we successfully find some.
            const MAX_GAP_TRY = 10;
            let consecutiveFailures = 0;
            let currentNumber = startNumber;

            while (consecutiveFailures < MAX_GAP_TRY && currentNumber < 200) { // Safety cap 200
                const numString = currentNumber.toString().padStart(3, '0');
                const count = await this.scrapeSpecificJort(targetYear, numString);

                if (count > 0) {
                    console.log(`   ✅ Found missing JORT N°${numString}/${targetYear}!`);
                    foundCount += count;
                    consecutiveFailures = 0;
                } else {
                    console.log(`   ❌ JORT N°${numString}/${targetYear} not found.`);
                    consecutiveFailures++;
                }

                currentNumber++;
            }

        } catch (error: any) {
            console.error(`❌ Gap scan failed: ${error.message}`);
        }

        console.log(`🕵️‍♀️ Missing JORT Scan Complete: Found ${foundCount} entries.`);
        return foundCount;
    }

    /**
     * Scrape a specific collection
     */
    /**
     * Scrape a specific collection
     */
    private async scrapeCollection(collection: string): Promise<ParsedEntry[]> {
        const entries: ParsedEntry[] = [];

        // Build search URL with XML export
        // Uses config.sortField (sf) and config.sortOrder (so)
        const baseUrl = `${this.config.baseUrl}/search?cc=${collection}&sf=${this.config.sortField}&so=${this.config.sortOrder}&rg=${this.config.resultsPerPage}&of=xd`;
        const urlFr = `${baseUrl}&ln=fr`;
        const urlAr = `${baseUrl}&ln=ar`;

        console.log(`📡 Fetching Collection: ${collection}`);
        console.log(`   FR: ${urlFr}`);
        console.log(`   AR: ${urlAr}`);

        try {
            const [respFr, respAr] = await Promise.all([
                axios.get(urlFr, { timeout: 30000, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }),
                axios.get(urlAr, { timeout: 30000, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } })
            ]);

            const recordsFr = this.extractRecordsFromResponse(respFr.data);
            const recordsAr = this.extractRecordsFromResponse(respAr.data);

            console.log(`📊 Found ${recordsFr.length} FR / ${recordsAr.length} AR records`);

            // Map Arabic records
            const arMap = new Map<string, ParsedEntry>();
            for (const rec of recordsAr) {
                const parsed = this.parseDublinCoreEntry(rec);
                if (parsed) arMap.set(parsed.recordId, parsed);
            }

            for (const recFr of recordsFr) {
                const parsedFr = this.parseDublinCoreEntry(recFr);
                if (parsedFr) {
                    const parsedAr = arMap.get(parsedFr.recordId);

                    // Merge AR data (Title/Ministry)
                    if (parsedAr) {
                        if (parsedAr.titleFr && /[\u0600-\u06FF]/.test(parsedAr.titleFr)) {
                            parsedFr.titleAr = parsedAr.titleFr;
                        }
                        if (parsedAr.ministry) {
                            parsedFr.ministryAr = parsedAr.ministry;
                        }
                    }

                    entries.push(parsedFr);
                }
            }

            return entries;
        } catch (error: any) {
            if (error.response?.status === 404) {
                console.warn(`⚠️  Collection ${collection} not found or empty`);
                return [];
            }
            throw new Error(`Failed to scrape collection ${collection}: ${error.message}`);
        }
    }

    /**
     * Extract PDF URL from record detail page (FR and AR)
     * Also extracts JORT number from PDF filename if possible (e.g. Jo0182026.pdf -> 018)
     */
    private async extractPdfUrl(recordId: string): Promise<{ pdfFr: string | null, pdfAr: string | null, jortNumber: string | null }> {
        try {
            const detailUrl = `${this.config.baseUrl}/record/${recordId}?ln=fr`;
            const response = await axios.get(detailUrl, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
            });

            const html = response.data;
            const allPdfMatches = [...html.matchAll(/href="([^"]+\.pdf)"/g)];

            let pdfFr: string | null = null;
            let pdfAr: string | null = null;
            let jortNumber: string | null = null;

            for (const match of allPdfMatches) {
                let url = match[1];
                if (!url.startsWith('http')) {
                    url = `${this.config.baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
                }

                // Extract JORT Number from filename if possible
                // Pattern: Jo0182026.pdf or Ja0182026.pdf
                const filenameMatch = url.match(/(?:Jo|Ja)(\d{3})(\d{4})\.pdf/i);
                if (filenameMatch) {
                    jortNumber = filenameMatch[1];
                }

                if (url.includes('/Jo') || url.toLowerCase().includes('fr')) {
                    pdfFr = url;
                } else if (url.includes('/Ja') || url.toLowerCase().includes('ar')) {
                    pdfAr = url;
                }
            }

            // Fallback: if only one found and unsure, assign to Fr (default)
            if (!pdfFr && !pdfAr && allPdfMatches.length > 0) {
                let url = allPdfMatches[0][1];
                if (!url.startsWith('http')) {
                    url = `${this.config.baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
                }
                pdfFr = url;

                // Try extract number again in fallback
                const filenameMatch = pdfFr.match(/(?:Jo|Ja)(\d{3})(\d{4})\.pdf/i);
                if (filenameMatch) {
                    jortNumber = filenameMatch[1];
                }
            }

            // Verify if PDF links are actually reachable
            if (pdfFr) {
                const isValid = await this.verifyPdfLink(pdfFr);
                if (!isValid) {
                    console.warn(`⚠️  PDF Link found but unreachable (404): ${pdfFr}`);
                    pdfFr = null;
                }
            }
            if (pdfAr) {
                const isValid = await this.verifyPdfLink(pdfAr);
                if (!isValid) {
                    console.warn(`⚠️  Arabic PDF Link found but unreachable (404): ${pdfAr}`);
                    pdfAr = null;
                }
            }

            return { pdfFr, pdfAr, jortNumber };
        } catch (error: any) {
            console.warn(`⚠️  Failed to extract PDF for record ${recordId}: ${error.message}`);
            return { pdfFr: null, pdfAr: null, jortNumber: null };
        }
    }

    /**
     * Verifies if a PDF link is reachable via HEAD request
     */
    private async verifyPdfLink(url: string): Promise<boolean> {
        try {
            await axios.head(url, {
                timeout: 5000,
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
                validateStatus: (status) => status === 200
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Extract Dublin Core records from parsed XML
     */
    private extractDublinCoreRecords(parsed: any): any[] {
        const collection = parsed?.collection;
        if (!collection) return [];

        const dcElements = collection['dc:dc'];
        if (!dcElements) return [];

        // Handle both single record and array of records
        return Array.isArray(dcElements) ? dcElements : [dcElements];
    }

    /**
     * Parse a single Dublin Core entry
     */
    private parseDublinCoreEntry(dc: any): ParsedEntry | null {
        try {
            let rawTitle = dc['dc:title'];
            let rawCreator = dc['dc:creator'];
            const date = dc['dc:date'];
            const identifier = dc['dc:identifier'];

            if (!rawTitle || !identifier) {
                return null;
            }

            // Extract record ID
            const recordIdMatch = identifier.match(/\/record\/(\d+)/);
            const recordId = recordIdMatch ? recordIdMatch[1] : '';

            let titleFr = '';
            let titleAr: string | undefined = undefined;

            // Handle title being an array (multiple dc:title tags) or string
            if (Array.isArray(rawTitle)) {
                // Heuristic: Arabic title contains Arabic chars, French doesn't (or has few)
                const arIndex = rawTitle.findIndex((t: string) => /[\u0600-\u06FF]/.test(t));
                if (arIndex !== -1) {
                    titleAr = rawTitle[arIndex].trim();
                    // Assume the other one is French, or join all others
                    titleFr = rawTitle.filter((_, i) => i !== arIndex).join(' / ').trim();
                } else {
                    titleFr = rawTitle.join(' / ').trim();
                }
            } else {
                // IDK if it's mixed or just one language
                const split = this.splitMixedTitle(rawTitle);
                titleFr = split.titleFr;
                titleAr = split.titleAr;
            }

            // Similar logic for Creator (Ministry)
            let ministry: string | undefined = undefined;
            let ministryAr: string | undefined = undefined;

            if (Array.isArray(rawCreator)) {
                const arIndex = rawCreator.findIndex((c: string) => /[\u0600-\u06FF]/.test(c));
                if (arIndex !== -1) {
                    ministryAr = rawCreator[arIndex].trim();
                    ministry = rawCreator.filter((_, i) => i !== arIndex).join(' / ').trim();
                } else {
                    ministry = rawCreator.join(' / ').trim();
                }
            } else {
                ministry = rawCreator;
            }

            // Extract type
            let type = this.extractType(titleFr);
            if (!type && titleAr) {
                type = this.extractTypeAr(titleAr);
            }

            // Fallback for ministry extraction from title if creator was empty/insufficient
            if (!ministry) {
                ministry = this.extractMinistry(titleFr);
            }
            if (!ministryAr && titleAr) {
                ministryAr = this.extractMinistryAr(titleAr);
            }

            // If we have an Arabic ministry but no French one, use it as fallback? 
            // Better to keep them separate in DB, but JortEntry.ministry is the primary display.
            // If ministry is empty but ministryAr exists, maybe fill ministry with translated/transliterated or just keep empty?
            // For now, let's allow ministry to be empty if only Arabic is present, or fill it.
            if (!ministry && ministryAr) {
                // ministry = ministryAr; // Optional: use Arabic as fallback for main field
            }
            if (!ministry && ministryAr) {
                ministry = ministryAr; // Fallback to Arabic ministry name if French is missing
            }

            return {
                titleFr,
                titleAr,
                ministry,
                ministryAr,
                type,
                date: date || undefined,
                recordId,
                pdfUrl: undefined // Will be filled later
            };
        } catch (error: any) {
            console.error(`Error parsing DC entry: ${error.message}`);
            return null;
        }
    }

    /**
     * Split mixed FR/AR title
     * Example: "Loi n° 2019-35 du 16 Avril 2019,  يتعلق بإتمام القانون عدد 11"
     * Returns: { titleFr: "Loi n° 2019-35 du 16 Avril 2019", titleAr: "يتعلق بإتمام القانون عدد 11" }
     */
    private splitMixedTitle(title: string): { titleFr: string; titleAr?: string } {
        // Arabic characters pattern
        const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

        // Find first Arabic character
        const arabicStartIndex = title.search(arabicPattern);

        if (arabicStartIndex === -1) {
            // No Arabic, treat entire title as French
            return { titleFr: title.trim() };
        }

        // Split at the Arabic start, clean up commas and whitespace
        const titleFr = title.substring(0, arabicStartIndex).replace(/,\s*$/, '').trim();
        const titleAr = title.substring(arabicStartIndex).trim();

        return { titleFr, titleAr };
    }

    /**
     * Extract document type from title (French)
     */
    private extractType(title: string): string | undefined {
        const typePatterns = [
            { pattern: /^Loi\s+(?:constitutionnelle|organique|d'orientation)?/i, type: 'Loi' },
            { pattern: /^Décret-[Ll]oi/i, type: 'Décret-Loi' },
            { pattern: /^Décret\s+(?:présidentiel|gouvernemental)?/i, type: 'Décret' },
            { pattern: /^Arrêté/i, type: 'Arrêté' },
            { pattern: /^Circulaire/i, type: 'Circulaire' },
            { pattern: /^Convention/i, type: 'Convention' },
            { pattern: /^Décision/i, type: 'Décision' },
        ];

        for (const { pattern, type } of typePatterns) {
            if (pattern.test(title)) {
                return type;
            }
        }

        return undefined;
    }

    /**
     * Extract document type from title (Arabic)
     */
    private extractTypeAr(title: string): string | undefined {
        const typePatterns = [
            { pattern: /^قانون (?:أنساسي|دستوري)?/i, type: 'Loi' }, // Law
            { pattern: /^مرسوم/i, type: 'Décret-Loi' }, // Decree-Law
            { pattern: /^أمر (?:رئاسي|حكومي)?/i, type: 'Décret' }, // Decree
            { pattern: /^قرار/i, type: 'Arrêté' }, // Order
            { pattern: /^منشور/i, type: 'Circulaire' }, // Circular
            { pattern: /^اتفاقية/i, type: 'Convention' }, // Convention
        ];

        for (const { pattern, type } of typePatterns) {
            if (pattern.test(title)) {
                return type;
            }
        }

        return undefined;
    }

    /**
     * Extract ministry from title (Arabic)
     * Heuristic: Look for "من وزير..." or "من رئيس..."
     */
    private extractMinistryAr(title: string): string | undefined {
        // Pattern 1: Explicit "from Minister of X"
        // Example: "قرار من وزير الداخلية..."
        const fromMinisterMatch = title.match(/قرار من (وزير|كاتب دولة) ([\u0600-\u06FF ]+)/);
        if (fromMinisterMatch) {
            return `${fromMinisterMatch[1]} ${fromMinisterMatch[2]}`.trim();
        }

        // Pattern 2: "Order of the Minister of..."
        // A bit harder in Arabic without specific "from", usually starts with Type

        return undefined;
    }

    /**
     * Extract ministry from title (fallback if creator is not available)
     */
    private extractMinistry(title: string): string | undefined {
        // Look for ministry mentions in title
        const ministryPatterns = [
            /ministre?\s+(?:de|des|du)\s+([^,\.]+)/i,
            /ministère\s+(?:de|des|du)\s+([^,\.]+)/i,
            /présidence\s+de\s+la\s+république/i,
        ];

        for (const pattern of ministryPatterns) {
            const match = title.match(pattern);
            if (match) {
                return match[1]?.trim() || match[0].trim();
            }
        }

        return undefined;
    }

    /**
     * Check if entry already exists in database
     * If exists but recordId is missing, update it
     */
    private async isDuplicate(entry: ParsedEntry): Promise<boolean> {
        // Check by title (French) to avoid duplicates
        const existing = await prisma.jortEntry.findFirst({
            where: {
                titleFr: entry.titleFr,
            },
        });

        if (existing) {
            let updated = false;
            const updateData: any = {};

            // Backfill recordId
            if (!existing.recordId && entry.recordId) {
                console.log(`🔄 Backfilling recordId for: ${entry.titleFr.substring(0, 30)}...`);
                updateData.recordId = entry.recordId;
                updated = true;
            }

            // Backfill Arabic Title if missing (Self-Healing)
            if (!existing.titleAr && !entry.titleAr && (existing.recordId || entry.recordId)) {
                const targetRecordId = existing.recordId || entry.recordId;
                console.log(`🌍 Backfilling Arabic Title for: ${targetRecordId}...`);
                // Add a small delay
                await new Promise(resolve => setTimeout(resolve, 500));

                const detailData = await this.extractDetailsFromPage(targetRecordId!);
                if (detailData.titleAr) {
                    updateData.titleAr = detailData.titleAr;
                    updated = true;
                    console.log(`   └─ Found Title AR: ${detailData.titleAr.substring(0, 30)}...`);
                }
                if (detailData.ministryAr && !existing.ministryAr) {
                    updateData.ministryAr = detailData.ministryAr;
                    updated = true;
                }
            } else if (!existing.titleAr && entry.titleAr) {
                updateData.titleAr = entry.titleAr;
                updated = true;
            }

            // Backfill recordId
            if (!existing.recordId && entry.recordId) {
                console.log(`🔄 Backfilling recordId for: ${entry.titleFr.substring(0, 30)}...`);
                updateData.recordId = entry.recordId;
                updated = true;
            }

            // Backfill Ministry Ar
            if (!existing.ministryAr && entry.ministryAr) {
                console.log(`🔄 Backfilling ministryAr for: ${entry.titleFr.substring(0, 30)}...`);
                updateData.ministryAr = entry.ministryAr;
                updated = true;
            }

            // Backfill Type if missing
            if (!existing.type && entry.type) {
                console.log(`🔄 Backfilling type for: ${entry.titleFr.substring(0, 30)}...`);
                updateData.type = entry.type;
                updated = true;
            }

            // Check if we need to backfill PDF URL (Self-Healing)
            if (!existing.pdfUrl && (existing.recordId || entry.recordId)) {
                // Use the available recordId
                const targetRecordId = existing.recordId || entry.recordId;
                console.log(`📄 Backfilling PDF for existing record: ${targetRecordId}...`);

                // Add a small delay to respect server
                await new Promise(resolve => setTimeout(resolve, 500));

                const pdfUrls = await this.extractPdfUrl(targetRecordId!);
                if (pdfUrls.pdfFr) {
                    updateData.pdfUrl = pdfUrls.pdfFr;
                    updated = true;
                    console.log(`   └─ Found PDF FR: ${pdfUrls.pdfFr}`);
                }
                if (pdfUrls.pdfAr) {
                    updateData.pdfUrlAr = pdfUrls.pdfAr;
                    updated = true;
                    console.log(`   └─ Found PDF AR: ${pdfUrls.pdfAr}`);
                }
            }

            if (updated) {
                await prisma.jortEntry.update({
                    where: { id: existing.id },
                    data: updateData
                });
            }
            return true;
        }

        return false;
    }

    /**
     * Extract details from the record page (when Dublin Core is incomplete)
     */
    private async extractDetailsFromPage(recordId: string): Promise<{ titleAr?: string, ministryAr?: string }> {
        try {
            const detailUrl = `${this.config.baseUrl}/record/${recordId}?ln=ar`; // Request Arabic version
            const response = await axios.get(detailUrl, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
            });

            const html = response.data;
            const result: { titleAr?: string, ministryAr?: string } = {};

            // Heuristic extraction from HTML structure
            // Look for title in metadata table (simplified regex)
            // Example: <td class="metadataFieldValue">...Arabic Title...</td>
            const titleMatch = html.match(/<td[^>]*class="metadataFieldValue"[^>]*>\s*([^\n<]+[\u0600-\u06FF][^\n<]+)\s*<\/td>/i);
            if (titleMatch) {
                result.titleAr = titleMatch[1].trim();
            }

            // Try to extract Ministry from Arabic text if possible
            if (result.titleAr) {
                const ministryMatch = result.titleAr.match(/(?:وزير|كاتب دولة) ([^،,]+)/);
                if (ministryMatch) {
                    result.ministryAr = `وزارة ${ministryMatch[1].trim()}`;
                }
            }

            return result;
        } catch (error) {
            console.warn(`Failed to extract details for ${recordId}`);
            return {};
        }
    }

    /**
     * Detect severe website changes by testing key endpoints
     */
    private async detectWebsiteChanges(): Promise<void> {
        try {
            // Test 1: Homepage accessible
            await axios.get(this.config.baseUrl, { timeout: 10000 });

            // Test 2: Collection page returns expected structure
            const testUrl = `${this.config.baseUrl}/collection/JORT?ln=fr`;
            const response = await axios.get(testUrl, { timeout: 10000 });

            // Check for expected content
            if (!response.data.includes('Décret') && !response.data.includes('collection')) {
                throw new Error('Collection page structure changed - expected content not found');
            }

            // Test 3: XML export endpoint works
            const xmlTestUrl = `${this.config.baseUrl}/search?cc=JORT&rg=1&of=xd`;
            const xmlResponse = await axios.get(xmlTestUrl, { timeout: 10000 });

            if (!xmlResponse.data.includes('dc:dc') && !xmlResponse.data.includes('Dublin')) {
                throw new Error('XML export format changed - Dublin Core structure not found');
            }

            console.log('✅ Website structure validation passed');
        } catch (error: any) {
            console.error('⚠️  Website structure validation failed:', error.message);
            await this.alertWebsiteChange(error);
            throw new Error(`Website structure changed or unavailable: ${error.message}`);
        }
    }

    /**
     * Sanitize error message for user display
     * Maps technical errors to user-friendly messages
     */
    private sanitizeErrorMessage(error: any): { fr: string, ar: string } {
        const msg = error.message || '';

        if (msg.includes('ENOTFOUND') || msg.includes('EAI_AGAIN')) {
            return {
                fr: "Problème de connexion au serveur source (PIST.tn)",
                ar: "مشكلة في الاتصال بالخادم المصدر"
            };
        }
        if (msg.includes('ETIMEDOUT') || msg.includes('timeout')) {
            return {
                fr: "Le serveur source ne répond pas (Délai dépassé)",
                ar: "الخادم المصدر لا يستجيب (انتهت المهلة)"
            };
        }
        if (msg.includes('404')) {
            return {
                fr: "Ressource introuvable sur le site source",
                ar: "المورد غير موجود على الموقع المصدر"
            };
        }
        if (msg.includes('403') || msg.includes('401')) {
            return {
                fr: "Accès refusé par le site source",
                ar: "تم رفض الوصول من قبل الموقع المصدر"
            };
        }
        if (msg.includes('500') || msg.includes('502') || msg.includes('503')) {
            return {
                fr: "Erreur interne du site source",
                ar: "خطأ داخلي في الموقع المصدر"
            };
        }

        // Default generic message
        return {
            fr: "Une erreur technique est survenue lors de la communication avec PIST.tn",
            ar: "حدث خطأ فني أثناء الاتصال بـ PIST.tn"
        };
    }

    /**
     * Alert system for scraper failures
     */
    private async alertScraperFailure(error: Error): Promise<void> {
        console.error('🚨 CRITICAL: Scraper failed:', error.message); // Keep raw error in server logs

        const sanitized = this.sanitizeErrorMessage(error);

        try {
            // Create system alert for all companies
            const companies = await prisma.company.findMany();

            for (const company of companies) {
                await prisma.alert.create({
                    data: {
                        companyId: company.id,
                        type: 'SYSTEM',
                        severity: 'CRITICAL',
                        titleFr: 'Échec du scraper JORT',
                        titleAr: 'فشل في استخراج بيانات الرائد الرسمي',
                        messageFr: `Le système de veille réglementaire a rencontré une erreur : ${sanitized.fr}.`,
                        messageAr: `واجه نظام المراقبة التنظيمية خطأ: ${sanitized.ar}.`,
                    },
                });
            }
        } catch (alertError: any) {
            console.error('Failed to create alerts:', alertError.message);
        }
    }

    /**
     * Alert system for website structure changes
     */
    private async alertWebsiteChange(error: Error): Promise<void> {
        console.warn('⚠️  Website structure change detected:', error.message); // Keep raw error in logs

        const sanitized = this.sanitizeErrorMessage(error);

        try {
            const companies = await prisma.company.findMany();

            for (const company of companies) {
                await prisma.alert.create({
                    data: {
                        companyId: company.id,
                        type: 'SYSTEM',
                        severity: 'HIGH',
                        titleFr: 'Anomalie détectée sur le site PIST.tn',
                        titleAr: 'تم اكتشاف خلل في موقع PIST.tn',
                        messageFr: `Le scraper a détecté une anomalie d'accès au site PIST.tn : ${sanitized.fr}.`,
                        messageAr: `اكتشف النظام شذوذًا في الوصول إلى موقع PIST.tn: ${sanitized.ar}.`,
                    },
                });
            }
        } catch (alertError: any) {
            console.error('Failed to create website change alerts:', alertError.message);
        }
    }
}

export const jortScraper = new JortScraper();
