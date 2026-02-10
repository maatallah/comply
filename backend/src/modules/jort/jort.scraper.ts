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
    type?: string;
    date?: string;
    recordId: string;
    pdfUrl?: string; // Enhanced to be possibly undefined initially, then filled
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
                            const pdfUrl = await this.extractPdfUrl(entry.recordId);
                            if (pdfUrl) {
                                entry.pdfUrl = pdfUrl;
                                console.log(`   └─ Found PDF: ${pdfUrl}`);
                            } else {
                                console.log(`   └─ No PDF found.`);
                            }

                            // Be polite to the server
                            await new Promise(resolve => setTimeout(resolve, 500));

                            await jortService.createEntry({
                                titleFr: entry.titleFr,
                                titleAr: entry.titleAr,
                                ministry: entry.ministry,
                                type: entry.type,
                                date: entry.date,
                                pdfUrl: entry.pdfUrl,
                                recordId: entry.recordId,
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
     * Scrape a specific collection
     */
    private async scrapeCollection(collection: string): Promise<ParsedEntry[]> {
        const entries: ParsedEntry[] = [];

        // Build search URL with XML export
        // Uses config.sortField (sf) and config.sortOrder (so)
        const searchUrl = `${this.config.baseUrl}/search?cc=${collection}&sf=${this.config.sortField}&so=${this.config.sortOrder}&rg=${this.config.resultsPerPage}&of=xd`;

        console.log(`📡 Fetching: ${searchUrl}`);

        try {
            const response = await axios.get(searchUrl, {
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
            });

            const xmlData = response.data;
            const parsed = this.xmlParser.parse(xmlData);

            // Extract total count from XML comment (if available)
            const totalMatch = xmlData.match(/Search-Engine-Total-Number-Of-Results:\s*(\d+)/);
            const totalResults = totalMatch ? parseInt(totalMatch[1]) : 0;
            console.log(`📊 Total results in collection: ${totalResults}`);

            // Parse Dublin Core records
            const dcRecords = this.extractDublinCoreRecords(parsed);

            for (const dc of dcRecords) {
                const entry = this.parseDublinCoreEntry(dc);
                if (entry) {
                    entries.push(entry);
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
     * Extract PDF URL from record detail page
     */
    private async extractPdfUrl(recordId: string): Promise<string | undefined> {
        try {
            const detailUrl = `${this.config.baseUrl}/record/${recordId}?ln=fr`;
            const response = await axios.get(detailUrl, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
            });

            const html = response.data;

            // Look for patterns like: /jort/2026/2026F/Jo0142026.pdf
            // Regex to find JORT PDF links. Matches Jo (Journal Officiel) or Ja (Journal Arab?)
            const frenchPdfPattern = /href="([^"]*\/jort\/[^"]*\/(?:Jo|Ja)[^"]*\.pdf)"/i;
            let match = html.match(frenchPdfPattern);

            if (!match) {
                // Fallback to any JORT PDF link if French specific not found
                const anyPdfPattern = /href="([^"]*\/jort\/[^"]*\.pdf)"/i;
                match = html.match(anyPdfPattern);
            }

            if (match && match[1]) {
                const relativeUrl = match[1];
                // Ensure full URL
                if (relativeUrl.startsWith('http')) {
                    return relativeUrl;
                }
                return `${this.config.baseUrl}${relativeUrl.startsWith('/') ? '' : '/'}${relativeUrl}`;
            }

            return undefined;
        } catch (error: any) {
            console.warn(`⚠️  Failed to extract PDF for record ${recordId}: ${error.message}`);
            return undefined;
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
            const title = dc['dc:title'];
            const creator = dc['dc:creator'];
            const date = dc['dc:date'];
            const identifier = dc['dc:identifier'];

            if (!title || !identifier) {
                return null;
            }

            // Extract record ID from identifier (e.g., http://www.pist.tn/record/201575)
            const recordIdMatch = identifier.match(/\/record\/(\d+)/);
            const recordId = recordIdMatch ? recordIdMatch[1] : '';

            // Separate French and Arabic from mixed title
            const { titleFr, titleAr } = this.splitMixedTitle(title);

            // Extract type from title (e.g., "Loi n°", "Décret n°", "Arrêté")
            const type = this.extractType(titleFr);

            // Extract ministry from creator or title
            const ministry = creator || this.extractMinistry(titleFr);

            return {
                titleFr,
                titleAr,
                ministry,
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
     * Extract document type from title
     */
    private extractType(title: string): string | undefined {
        const typePatterns = [
            { pattern: /^Loi\s+(?:constitutionnelle|organique|d'orientation)?/i, type: 'Loi' },
            { pattern: /^Décret-[Ll]oi/i, type: 'Décret-Loi' },
            { pattern: /^Décret\s+(?:présidentiel|gouvernemental)?/i, type: 'Décret' },
            { pattern: /^Arrêté/i, type: 'Arrêté' },
            { pattern: /^Circulaire/i, type: 'Circulaire' },
            { pattern: /^Convention/i, type: 'Convention' },
        ];

        for (const { pattern, type } of typePatterns) {
            if (pattern.test(title)) {
                return type;
            }
        }

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
            // Check if we need to backfill recordId
            if (!existing.recordId && entry.recordId) {
                console.log(`🔄 Backfilling recordId for: ${entry.titleFr.substring(0, 30)}...`);
                await prisma.jortEntry.update({
                    where: { id: existing.id },
                    data: { recordId: entry.recordId }
                });
            }
            return true;
        }

        return false;
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
