"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.jortScraper = exports.JortScraper = void 0;
var jort_service_1 = require("./jort.service");
var axios_1 = require("axios");
var fast_xml_parser_1 = require("fast-xml-parser");
var prisma_1 = require("../../shared/prisma");
var JortScraper = /** @class */ (function () {
    function JortScraper() {
        this.config = {
            baseUrl: 'https://www.pist.tn',
            collections: ['JORT'], // Can expand to ['Loi', 'Décret', 'Arrêté'] for specific types
            resultsPerPage: 50,
            maxPages: 5, // Limit to prevent overwhelming the system
            sortField: 'date',
            sortOrder: 'd',
        };
        this.xmlParser = new fast_xml_parser_1.XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
        });
    }
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
    JortScraper.prototype.scrapeLatest = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stats, allEntries, _i, _a, collection, entries, _b, entries_1, entry, isDuplicate, pdfs, error_1, error_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        console.log('🔍 Starting PIST.tn Real Scrape...');
                        stats = { total: 0, new: 0, duplicates: 0, errors: 0 };
                        allEntries = [];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 17, , 19]);
                        // Detect if website structure has changed
                        return [4 /*yield*/, this.detectWebsiteChanges()];
                    case 2:
                        // Detect if website structure has changed
                        _c.sent();
                        _i = 0, _a = this.config.collections;
                        _c.label = 3;
                    case 3:
                        if (!(_i < _a.length)) return [3 /*break*/, 16];
                        collection = _a[_i];
                        console.log("\uD83D\uDCDA Scraping collection: ".concat(collection));
                        return [4 /*yield*/, this.scrapeCollection(collection)];
                    case 4:
                        entries = _c.sent();
                        stats.total += entries.length;
                        _b = 0, entries_1 = entries;
                        _c.label = 5;
                    case 5:
                        if (!(_b < entries_1.length)) return [3 /*break*/, 15];
                        entry = entries_1[_b];
                        _c.label = 6;
                    case 6:
                        _c.trys.push([6, 13, , 14]);
                        return [4 /*yield*/, this.isDuplicate(entry)];
                    case 7:
                        isDuplicate = _c.sent();
                        if (!isDuplicate) return [3 /*break*/, 8];
                        stats.duplicates++;
                        console.log("\u23ED\uFE0F  Skipping duplicate: ".concat(entry.titleFr.substring(0, 50), "..."));
                        return [3 /*break*/, 12];
                    case 8:
                        // Fetch PDF URL for new entry
                        console.log("\uD83D\uDCC4 Fetching PDF for record ".concat(entry.recordId, "..."));
                        return [4 /*yield*/, this.extractPdfUrl(entry.recordId)];
                    case 9:
                        pdfs = _c.sent();
                        if (pdfs.pdfFr) {
                            entry.pdfUrl = pdfs.pdfFr;
                            console.log("   \u2514\u2500 Found PDF (FR): ".concat(pdfs.pdfFr));
                        }
                        if (pdfs.pdfAr) {
                            entry.pdfUrlAr = pdfs.pdfAr;
                            console.log("   \u2514\u2500 Found PDF (AR): ".concat(pdfs.pdfAr));
                        }
                        if (pdfs.jortNumber) {
                            console.log("   \u2514\u2500 Found JORT Number: ".concat(pdfs.jortNumber));
                        }
                        if (!pdfs.pdfFr && !pdfs.pdfAr) {
                            console.log("   \u2514\u2500 No PDF found.");
                        }
                        // Be polite to the server
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 500); })];
                    case 10:
                        // Be polite to the server
                        _c.sent();
                        return [4 /*yield*/, jort_service_1.jortService.createEntry({
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
                            })];
                    case 11:
                        _c.sent();
                        stats.new++;
                        allEntries.push(entry);
                        console.log("\u2705 New entry: ".concat(entry.titleFr.substring(0, 50), "..."));
                        _c.label = 12;
                    case 12: return [3 /*break*/, 14];
                    case 13:
                        error_1 = _c.sent();
                        stats.errors++;
                        console.error("\u274C Error processing entry: ".concat(error_1.message));
                        return [3 /*break*/, 14];
                    case 14:
                        _b++;
                        return [3 /*break*/, 5];
                    case 15:
                        _i++;
                        return [3 /*break*/, 3];
                    case 16:
                        console.log('✅ PIST Scrape Complete');
                        console.log("\uD83D\uDCCA Stats: ".concat(stats.new, " new, ").concat(stats.duplicates, " duplicates, ").concat(stats.errors, " errors (").concat(stats.total, " total)"));
                        return [2 /*return*/, { stats: stats, entries: allEntries }];
                    case 17:
                        error_2 = _c.sent();
                        console.error('❌ Scraper failed:', error_2.message);
                        return [4 /*yield*/, this.alertScraperFailure(error_2)];
                    case 18:
                        _c.sent();
                        throw error_2;
                    case 19: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Scrape a specific JORT number for a given year
     * Uses the advanced search pattern that proved more reliable for finding missing entries
     */
    JortScraper.prototype.scrapeSpecificJort = function (year, number) {
        return __awaiter(this, void 0, void 0, function () {
            var url, response, jsonObj, records, newCount, _i, records_1, record, parsed, isDup, pdfs, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("\uD83D\uDD0D Scraper: Targeting specific JORT N\u00B0".concat(number, "/").concat(year, "..."));
                        url = "".concat(this.config.baseUrl, "/search?ln=fr&as=1&cc=JORT&m1=a&p1=").concat(number, "&f1=jortnumber&op1=a&m2=a&p2=").concat(year, "&f2=jortyear&op2=a&of=xd&rg=50");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 9, , 10]);
                        return [4 /*yield*/, axios_1.default.get(url, {
                                timeout: 30000,
                                headers: {
                                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                                },
                            })];
                    case 2:
                        response = _a.sent();
                        if (!response.data || (!response.data.includes('<collection') && !response.data.includes('<record'))) {
                            console.warn('⚠️  Expected XML response but got something else');
                            return [2 /*return*/, 0];
                        }
                        jsonObj = this.xmlParser.parse(response.data);
                        records = this.extractDublinCoreRecords(jsonObj);
                        console.log("   \u2514\u2500 Found ".concat(records.length, " records for JORT ").concat(number, "/").concat(year));
                        newCount = 0;
                        _i = 0, records_1 = records;
                        _a.label = 3;
                    case 3:
                        if (!(_i < records_1.length)) return [3 /*break*/, 8];
                        record = records_1[_i];
                        parsed = this.parseDublinCoreEntry(record);
                        if (!parsed) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.isDuplicate(parsed)];
                    case 4:
                        isDup = _a.sent();
                        if (!!isDup) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.extractPdfUrl(parsed.recordId)];
                    case 5:
                        pdfs = _a.sent();
                        return [4 /*yield*/, jort_service_1.jortService.createEntry({
                                titleFr: parsed.titleFr,
                                titleAr: parsed.titleAr,
                                ministry: parsed.ministry,
                                ministryAr: parsed.ministryAr,
                                type: parsed.type,
                                date: parsed.date,
                                pdfUrl: pdfs.pdfFr || undefined,
                                pdfUrlAr: pdfs.pdfAr || undefined,
                                recordId: parsed.recordId,
                                jortNumber: pdfs.jortNumber || undefined,
                            })];
                    case 6:
                        _a.sent();
                        newCount++;
                        _a.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 3];
                    case 8: return [2 /*return*/, newCount];
                    case 9:
                        error_3 = _a.sent();
                        console.error("\u274C Error scraping specific jort ".concat(number, "/").concat(year, ":"), error_3.message);
                        return [2 /*return*/, 0];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Scan for missing JORTs by checking sequence gaps
     * Strategy:
     * 1. Find latest JORT in database (by date)
     * 2. Extract year and number (if available) or assume based on date
     * 3. Propose next expected JORT (Latest + 1)
     * 4. Try to fetch it using scrapeSpecificJort
     * 5. Repeat until no more found (up to a limit)
     */
    JortScraper.prototype.scanMissingJorts = function () {
        return __awaiter(this, void 0, void 0, function () {
            var foundCount, latestEntry, currentYear, latestYear, lastNumber, targetYear, startNumber, currentMonth, MAX_GAP_TRY, consecutiveFailures, currentNumber, numString, count, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🕵️‍♀️ Starting Missing JORT Scan...');
                        foundCount = 0;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, prisma_1.default.jortEntry.findFirst({
                                orderBy: { date: 'desc' },
                                where: { type: { in: ['Loi', 'Décret', 'Arrêté'] } } // Filter mainly for official texts
                            })];
                    case 2:
                        latestEntry = _a.sent();
                        if (!latestEntry || !latestEntry.date) {
                            console.log('   └─ No previous entries found to base prediction on.');
                            return [2 /*return*/, 0];
                        }
                        currentYear = new Date().getFullYear();
                        latestYear = latestEntry.date.getFullYear();
                        lastNumber = 0;
                        if (latestEntry.jortNumber) {
                            lastNumber = parseInt(latestEntry.jortNumber, 10);
                        }
                        else {
                            if (latestYear < currentYear) {
                                lastNumber = 0;
                            }
                            else {
                                console.log('   └─ Cannot determine last JORT number (field is empty). Skipping gap scan.');
                                return [2 /*return*/, 0];
                            }
                        }
                        targetYear = latestYear;
                        startNumber = lastNumber + 1;
                        if (latestYear < currentYear) {
                            targetYear = currentYear;
                            startNumber = 1;
                        }
                        else {
                            currentMonth = new Date().getMonth() + 1;
                            if (currentMonth <= 2 && lastNumber > 50) {
                                console.log("   \u26A0\uFE0F Suspiciously high JORT number (".concat(lastNumber, ") for early year. Resetting scan to 1."));
                                startNumber = 1;
                                // We might want to scan up to current expected? 
                                // Let's just start from 1 and scan until we hit failures.
                            }
                        }
                        console.log("   \u2514\u2500 Latest known: Year ".concat(latestYear, ", Num ").concat(lastNumber, ". Scanning from ").concat(targetYear, "/").concat(startNumber, "..."));
                        MAX_GAP_TRY = 10;
                        consecutiveFailures = 0;
                        currentNumber = startNumber;
                        _a.label = 3;
                    case 3:
                        if (!(consecutiveFailures < MAX_GAP_TRY && currentNumber < 200)) return [3 /*break*/, 5];
                        numString = currentNumber.toString().padStart(3, '0');
                        return [4 /*yield*/, this.scrapeSpecificJort(targetYear, numString)];
                    case 4:
                        count = _a.sent();
                        if (count > 0) {
                            console.log("   \u2705 Found missing JORT N\u00B0".concat(numString, "/").concat(targetYear, "!"));
                            foundCount += count;
                            consecutiveFailures = 0;
                        }
                        else {
                            console.log("   \u274C JORT N\u00B0".concat(numString, "/").concat(targetYear, " not found."));
                            consecutiveFailures++;
                        }
                        currentNumber++;
                        return [3 /*break*/, 3];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_4 = _a.sent();
                        console.error("\u274C Gap scan failed: ".concat(error_4.message));
                        return [3 /*break*/, 7];
                    case 7:
                        console.log("\uD83D\uDD75\uFE0F\u200D\u2640\uFE0F Missing JORT Scan Complete: Found ".concat(foundCount, " entries."));
                        return [2 /*return*/, foundCount];
                }
            });
        });
    };
    /**
     * Scrape a specific collection
     */
    JortScraper.prototype.scrapeCollection = function (collection) {
        return __awaiter(this, void 0, void 0, function () {
            var entries, searchUrl, response, xmlData, parsed, totalMatch, totalResults, dcRecords, _i, dcRecords_1, dc, entry, error_5;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        entries = [];
                        searchUrl = "".concat(this.config.baseUrl, "/search?cc=").concat(collection, "&sf=").concat(this.config.sortField, "&so=").concat(this.config.sortOrder, "&rg=").concat(this.config.resultsPerPage, "&of=xd");
                        console.log("\uD83D\uDCE1 Fetching: ".concat(searchUrl));
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default.get(searchUrl, {
                                timeout: 30000,
                                headers: {
                                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                                },
                            })];
                    case 2:
                        response = _b.sent();
                        xmlData = response.data;
                        parsed = this.xmlParser.parse(xmlData);
                        totalMatch = xmlData.match(/Search-Engine-Total-Number-Of-Results:\s*(\d+)/);
                        totalResults = totalMatch ? parseInt(totalMatch[1]) : 0;
                        console.log("\uD83D\uDCCA Total results in collection: ".concat(totalResults));
                        dcRecords = this.extractDublinCoreRecords(parsed);
                        for (_i = 0, dcRecords_1 = dcRecords; _i < dcRecords_1.length; _i++) {
                            dc = dcRecords_1[_i];
                            entry = this.parseDublinCoreEntry(dc);
                            if (entry) {
                                entries.push(entry);
                            }
                        }
                        return [2 /*return*/, entries];
                    case 3:
                        error_5 = _b.sent();
                        if (((_a = error_5.response) === null || _a === void 0 ? void 0 : _a.status) === 404) {
                            console.warn("\u26A0\uFE0F  Collection ".concat(collection, " not found or empty"));
                            return [2 /*return*/, []];
                        }
                        throw new Error("Failed to scrape collection ".concat(collection, ": ").concat(error_5.message));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Extract PDF URL from record detail page (FR and AR)
     * Also extracts JORT number from PDF filename if possible (e.g. Jo0182026.pdf -> 018)
     */
    JortScraper.prototype.extractPdfUrl = function (recordId) {
        return __awaiter(this, void 0, void 0, function () {
            var detailUrl, response, html, allPdfMatches, pdfFr, pdfAr, jortNumber, _i, allPdfMatches_1, match, url, filenameMatch, url, filenameMatch, isValid, isValid, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        detailUrl = "".concat(this.config.baseUrl, "/record/").concat(recordId, "?ln=fr");
                        return [4 /*yield*/, axios_1.default.get(detailUrl, {
                                timeout: 10000,
                                headers: {
                                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                                },
                            })];
                    case 1:
                        response = _a.sent();
                        html = response.data;
                        allPdfMatches = __spreadArray([], html.matchAll(/href="([^"]+\.pdf)"/g), true);
                        pdfFr = null;
                        pdfAr = null;
                        jortNumber = null;
                        for (_i = 0, allPdfMatches_1 = allPdfMatches; _i < allPdfMatches_1.length; _i++) {
                            match = allPdfMatches_1[_i];
                            url = match[1];
                            if (!url.startsWith('http')) {
                                url = "".concat(this.config.baseUrl).concat(url.startsWith('/') ? '' : '/').concat(url);
                            }
                            filenameMatch = url.match(/(?:Jo|Ja)(\d{3})(\d{4})\.pdf/i);
                            if (filenameMatch) {
                                jortNumber = filenameMatch[1];
                            }
                            if (url.includes('/Jo') || url.toLowerCase().includes('fr')) {
                                pdfFr = url;
                            }
                            else if (url.includes('/Ja') || url.toLowerCase().includes('ar')) {
                                pdfAr = url;
                            }
                        }
                        // Fallback: if only one found and unsure, assign to Fr (default)
                        if (!pdfFr && !pdfAr && allPdfMatches.length > 0) {
                            url = allPdfMatches[0][1];
                            if (!url.startsWith('http')) {
                                url = "".concat(this.config.baseUrl).concat(url.startsWith('/') ? '' : '/').concat(url);
                            }
                            pdfFr = url;
                            filenameMatch = pdfFr.match(/(?:Jo|Ja)(\d{3})(\d{4})\.pdf/i);
                            if (filenameMatch) {
                                jortNumber = filenameMatch[1];
                            }
                        }
                        if (!pdfFr) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.verifyPdfLink(pdfFr)];
                    case 2:
                        isValid = _a.sent();
                        if (!isValid) {
                            console.warn("\u26A0\uFE0F  PDF Link found but unreachable (404): ".concat(pdfFr));
                            pdfFr = null;
                        }
                        _a.label = 3;
                    case 3:
                        if (!pdfAr) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.verifyPdfLink(pdfAr)];
                    case 4:
                        isValid = _a.sent();
                        if (!isValid) {
                            console.warn("\u26A0\uFE0F  Arabic PDF Link found but unreachable (404): ".concat(pdfAr));
                            pdfAr = null;
                        }
                        _a.label = 5;
                    case 5: return [2 /*return*/, { pdfFr: pdfFr, pdfAr: pdfAr, jortNumber: jortNumber }];
                    case 6:
                        error_6 = _a.sent();
                        console.error("\u274C Failed to extract PDF URL for record ".concat(recordId, ":"), error_6);
                        return [2 /*return*/, { pdfFr: null, pdfAr: null, jortNumber: null }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Verifies if a PDF link is reachable via HEAD request
     */
    JortScraper.prototype.verifyPdfLink = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.head(url, {
                                timeout: 5000,
                                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
                                validateStatus: function (status) { return status === 200; }
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 2:
                        error_7 = _a.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return JortScraper;
}());
exports.JortScraper = JortScraper;
try { }
catch (error) {
    console.warn("\u26A0\uFE0F  Failed to extract PDF for record ".concat(recordId, ": ").concat(error.message));
    return { pdfFr: null, pdfAr: null, jortNumber: null };
}
extractDublinCoreRecords(parsed, any);
any[];
{
    var collection = parsed === null || parsed === void 0 ? void 0 : parsed.collection;
    if (!collection)
        return [];
    var dcElements = collection['dc:dc'];
    if (!dcElements)
        return [];
    // Handle both single record and array of records
    return Array.isArray(dcElements) ? dcElements : [dcElements];
}
parseDublinCoreEntry(dc, any);
ParsedEntry | null;
{
    try {
        var title = dc['dc:title'];
        var creator = dc['dc:creator'];
        var date = dc['dc:date'];
        var identifier = dc['dc:identifier'];
        if (!title || !identifier) {
            return null;
        }
        // Extract record ID from identifier (e.g., http://www.pist.tn/record/201575)
        var recordIdMatch = identifier.match(/\/record\/(\d+)/);
        var recordId = recordIdMatch ? recordIdMatch[1] : '';
        // Separate French and Arabic from mixed title
        var _b = this.splitMixedTitle(title), titleFr = _b.titleFr, titleAr = _b.titleAr;
        // If Arabic title is missing, mark for detailed fetch (we can't await here easily in map)
        // better strategy: return what we have, and enhance in a separate step or just return as is
        // For now, let's keep it sync here and enhance in scrapeLatest or isDuplicate
        // Extract type from title (e.g., "Loi n°", "Décret n°", "Arrêté")
        // improved to handle Arabic titles if French is missing or generic
        var type = this.extractType(titleFr);
        if (!type && titleAr) {
            type = this.extractTypeAr(titleAr);
        }
        // Extract ministry from creator or title
        // improved to handle Arabic titles
        var ministry = creator || this.extractMinistry(titleFr);
        var ministryAr = undefined;
        if (titleAr) {
            ministryAr = this.extractMinistryAr(titleAr);
            // If we didn't get a ministry from french/creator, try to map the arabic one or use it directly
            if (!ministry && ministryAr) {
                ministry = ministryAr; // Fallback to Arabic ministry name if French is missing
            }
        }
        return {
            titleFr: titleFr,
            titleAr: titleAr,
            ministry: ministry,
            ministryAr: ministryAr,
            type: type,
            date: date || undefined,
            recordId: recordId,
            pdfUrl: undefined // Will be filled later
        };
    }
    catch (error) {
        console.error("Error parsing DC entry: ".concat(error.message));
        return null;
    }
}
splitMixedTitle(title, string);
{
    titleFr: string;
    titleAr ?  : string;
}
{
    // Arabic characters pattern
    var arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    // Find first Arabic character
    var arabicStartIndex = title.search(arabicPattern);
    if (arabicStartIndex === -1) {
        // No Arabic, treat entire title as French
        return { titleFr: title.trim() };
    }
    // Split at the Arabic start, clean up commas and whitespace
    var titleFr = title.substring(0, arabicStartIndex).replace(/,\s*$/, '').trim();
    var titleAr = title.substring(arabicStartIndex).trim();
    return { titleFr: titleFr, titleAr: titleAr };
}
extractType(title, string);
string | undefined;
{
    var typePatterns = [
        { pattern: /^Loi\s+(?:constitutionnelle|organique|d'orientation)?/i, type: 'Loi' },
        { pattern: /^Décret-[Ll]oi/i, type: 'Décret-Loi' },
        { pattern: /^Décret\s+(?:présidentiel|gouvernemental)?/i, type: 'Décret' },
        { pattern: /^Arrêté/i, type: 'Arrêté' },
        { pattern: /^Circulaire/i, type: 'Circulaire' },
        { pattern: /^Convention/i, type: 'Convention' },
        { pattern: /^Décision/i, type: 'Décision' },
    ];
    for (var _i = 0, typePatterns_1 = typePatterns; _i < typePatterns_1.length; _i++) {
        var _c = typePatterns_1[_i], pattern = _c.pattern, type = _c.type;
        if (pattern.test(title)) {
            return type;
        }
    }
    return undefined;
}
extractTypeAr(title, string);
string | undefined;
{
    var typePatterns = [
        { pattern: /^قانون (?:أنساسي|دستوري)?/i, type: 'Loi' }, // Law
        { pattern: /^مرسوم/i, type: 'Décret-Loi' }, // Decree-Law
        { pattern: /^أمر (?:رئاسي|حكومي)?/i, type: 'Décret' }, // Decree
        { pattern: /^قرار/i, type: 'Arrêté' }, // Order
        { pattern: /^منشور/i, type: 'Circulaire' }, // Circular
        { pattern: /^اتفاقية/i, type: 'Convention' }, // Convention
    ];
    for (var _d = 0, typePatterns_2 = typePatterns; _d < typePatterns_2.length; _d++) {
        var _e = typePatterns_2[_d], pattern = _e.pattern, type = _e.type;
        if (pattern.test(title)) {
            return type;
        }
    }
    return undefined;
}
extractMinistryAr(title, string);
string | undefined;
{
    // Pattern 1: Explicit "from Minister of X"
    // Example: "قرار من وزير الداخلية..."
    var fromMinisterMatch = title.match(/قرار من (وزير|كاتب دولة) ([\u0600-\u06FF ]+)/);
    if (fromMinisterMatch) {
        return "".concat(fromMinisterMatch[1], " ").concat(fromMinisterMatch[2]).trim();
    }
    // Pattern 2: "Order of the Minister of..."
    // A bit harder in Arabic without specific "from", usually starts with Type
    return undefined;
}
extractMinistry(title, string);
string | undefined;
{
    // Look for ministry mentions in title
    var ministryPatterns = [
        /ministre?\s+(?:de|des|du)\s+([^,\.]+)/i,
        /ministère\s+(?:de|des|du)\s+([^,\.]+)/i,
        /présidence\s+de\s+la\s+république/i,
    ];
    for (var _f = 0, ministryPatterns_1 = ministryPatterns; _f < ministryPatterns_1.length; _f++) {
        var pattern = ministryPatterns_1[_f];
        var match = title.match(pattern);
        if (match) {
            return ((_a = match[1]) === null || _a === void 0 ? void 0 : _a.trim()) || match[0].trim();
        }
    }
    return undefined;
}
async;
isDuplicate(entry, ParsedEntry);
Promise < boolean > {
    // Check by title (French) to avoid duplicates
    const: existing = await prisma_1.default.jortEntry.findFirst({
        where: {
            titleFr: entry.titleFr,
        },
    }),
    if: function (existing) {
        var updated = false;
        var updateData = {};
        // Backfill recordId
        if (!existing.recordId && entry.recordId) {
            console.log("\uD83D\uDD04 Backfilling recordId for: ".concat(entry.titleFr.substring(0, 30), "..."));
            updateData.recordId = entry.recordId;
            updated = true;
        }
        // Backfill Arabic Title if missing (Self-Healing)
        if (!existing.titleAr && !entry.titleAr && (existing.recordId || entry.recordId)) {
            var targetRecordId = existing.recordId || entry.recordId;
            console.log("\uD83C\uDF0D Backfilling Arabic Title for: ".concat(targetRecordId, "..."));
            // Add a small delay
            yield new Promise(function (resolve) { return setTimeout(resolve, 500); });
            var detailData = yield this.extractDetailsFromPage(targetRecordId);
            if (detailData.titleAr) {
                updateData.titleAr = detailData.titleAr;
                updated = true;
                console.log("   \u2514\u2500 Found Title AR: ".concat(detailData.titleAr.substring(0, 30), "..."));
            }
            if (detailData.ministryAr && !existing.ministryAr) {
                updateData.ministryAr = detailData.ministryAr;
                updated = true;
            }
        }
        else if (!existing.titleAr && entry.titleAr) {
            updateData.titleAr = entry.titleAr;
            updated = true;
        }
        // Backfill recordId
        if (!existing.recordId && entry.recordId) {
            console.log("\uD83D\uDD04 Backfilling recordId for: ".concat(entry.titleFr.substring(0, 30), "..."));
            updateData.recordId = entry.recordId;
            updated = true;
        }
        // Backfill Ministry Ar
        if (!existing.ministryAr && entry.ministryAr) {
            console.log("\uD83D\uDD04 Backfilling ministryAr for: ".concat(entry.titleFr.substring(0, 30), "..."));
            updateData.ministryAr = entry.ministryAr;
            updated = true;
        }
        // Backfill Type if missing
        if (!existing.type && entry.type) {
            console.log("\uD83D\uDD04 Backfilling type for: ".concat(entry.titleFr.substring(0, 30), "..."));
            updateData.type = entry.type;
            updated = true;
        }
        // Check if we need to backfill PDF URL (Self-Healing)
        if (!existing.pdfUrl && (existing.recordId || entry.recordId)) {
            // Use the available recordId
            var targetRecordId = existing.recordId || entry.recordId;
            console.log("\uD83D\uDCC4 Backfilling PDF for existing record: ".concat(targetRecordId, "..."));
            // Add a small delay to respect server
            yield new Promise(function (resolve) { return setTimeout(resolve, 500); });
            var pdfUrls = yield this.extractPdfUrl(targetRecordId);
            if (pdfUrls.pdfFr) {
                updateData.pdfUrl = pdfUrls.pdfFr;
                updated = true;
                console.log("   \u2514\u2500 Found PDF FR: ".concat(pdfUrls.pdfFr));
            }
            if (pdfUrls.pdfAr) {
                updateData.pdfUrlAr = pdfUrls.pdfAr;
                updated = true;
                console.log("   \u2514\u2500 Found PDF AR: ".concat(pdfUrls.pdfAr));
            }
        }
        if (updated) {
            yield prisma_1.default.jortEntry.update({
                where: { id: existing.id },
                data: updateData
            });
        }
        return true;
    },
    return: false
};
async;
extractDetailsFromPage(recordId, string);
Promise < { titleAr: string, ministryAr: string } > {
    try: {
        const: detailUrl = "".concat(this.config.baseUrl, "/record/").concat(recordId, "?ln=ar"), // Request Arabic version
        const: response = await axios_1.default.get(detailUrl, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
        }),
        const: html = response.data,
        const: result
    }
};
{
    titleAr ?  : string, ministryAr ?  : string;
}
{ }
;
// Heuristic extraction from HTML structure
// Look for title in metadata table (simplified regex)
// Example: <td class="metadataFieldValue">...Arabic Title...</td>
var titleMatch = html.match(/<td[^>]*class="metadataFieldValue"[^>]*>\s*([^\n<]+[\u0600-\u06FF][^\n<]+)\s*<\/td>/i);
if (titleMatch) {
    result.titleAr = titleMatch[1].trim();
}
// Try to extract Ministry from Arabic text if possible
if (result.titleAr) {
    var ministryMatch = result.titleAr.match(/(?:وزير|كاتب دولة) ([^،,]+)/);
    if (ministryMatch) {
        result.ministryAr = "\u0648\u0632\u0627\u0631\u0629 ".concat(ministryMatch[1].trim());
    }
}
return result;
try { }
catch (error) {
    console.warn("Failed to extract details for ".concat(recordId));
    return {};
}
async;
detectWebsiteChanges();
Promise < void  > {
    try: {
        // Test 1: Homepage accessible
        await: await,
        axios: axios_1.default,
        : .get(this.config.baseUrl, { timeout: 10000 }),
        // Test 2: Collection page returns expected structure
        const: testUrl = "".concat(this.config.baseUrl, "/collection/JORT?ln=fr"),
        const: response = await axios_1.default.get(testUrl, { timeout: 10000 }),
        // Check for expected content
        if: function (, response) { },
        : .data.includes('Décret') && !response.data.includes('collection')
    }
};
{
    throw new Error('Collection page structure changed - expected content not found');
}
// Test 3: XML export endpoint works
var xmlTestUrl = "".concat(this.config.baseUrl, "/search?cc=JORT&rg=1&of=xd");
var xmlResponse = await axios_1.default.get(xmlTestUrl, { timeout: 10000 });
if (!xmlResponse.data.includes('dc:dc') && !xmlResponse.data.includes('Dublin')) {
    throw new Error('XML export format changed - Dublin Core structure not found');
}
console.log('✅ Website structure validation passed');
try { }
catch (error) {
    console.error('⚠️  Website structure validation failed:', error.message);
    await this.alertWebsiteChange(error);
    throw new Error("Website structure changed or unavailable: ".concat(error.message));
}
sanitizeErrorMessage(error, any);
{
    fr: string, ar;
    string;
}
{
    var msg = error.message || '';
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
async;
alertScraperFailure(error, Error);
Promise < void  > {
    console: console,
    : .error('🚨 CRITICAL: Scraper failed:', error.message), // Keep raw error in server logs
    const: sanitized = this.sanitizeErrorMessage(error),
    try: {
        // Create system alert for all companies
        const: companies = await prisma_1.default.company.findMany(),
        for: function (, company, of, companies) {
            yield prisma_1.default.alert.create({
                data: {
                    companyId: company.id,
                    type: 'SYSTEM',
                    severity: 'CRITICAL',
                    titleFr: 'Échec du scraper JORT',
                    titleAr: 'فشل في استخراج بيانات الرائد الرسمي',
                    messageFr: "Le syst\u00E8me de veille r\u00E9glementaire a rencontr\u00E9 une erreur : ".concat(sanitized.fr, "."),
                    messageAr: "\u0648\u0627\u062C\u0647 \u0646\u0638\u0627\u0645 \u0627\u0644\u0645\u0631\u0627\u0642\u0628\u0629 \u0627\u0644\u062A\u0646\u0638\u064A\u0645\u064A\u0629 \u062E\u0637\u0623: ".concat(sanitized.ar, "."),
                },
            });
        }
    },
    catch: function (alertError) {
        console.error('Failed to create alerts:', alertError.message);
    }
};
async;
alertWebsiteChange(error, Error);
Promise < void  > {
    console: console,
    : .warn('⚠️  Website structure change detected:', error.message), // Keep raw error in logs
    const: sanitized = this.sanitizeErrorMessage(error),
    try: {
        const: companies = await prisma_1.default.company.findMany(),
        for: function (, company, of, companies) {
            yield prisma_1.default.alert.create({
                data: {
                    companyId: company.id,
                    type: 'SYSTEM',
                    severity: 'HIGH',
                    titleFr: 'Anomalie détectée sur le site PIST.tn',
                    titleAr: 'تم اكتشاف خلل في موقع PIST.tn',
                    messageFr: "Le scraper a d\u00E9tect\u00E9 une anomalie d'acc\u00E8s au site PIST.tn : ".concat(sanitized.fr, "."),
                    messageAr: "\u0627\u0643\u062A\u0634\u0641 \u0627\u0644\u0646\u0638\u0627\u0645 \u0634\u0630\u0648\u0630\u064B\u0627 \u0641\u064A \u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0645\u0648\u0642\u0639 PIST.tn: ".concat(sanitized.ar, "."),
                },
            });
        }
    },
    catch: function (alertError) {
        console.error('Failed to create website change alerts:', alertError.message);
    }
};
exports.jortScraper = new JortScraper();
