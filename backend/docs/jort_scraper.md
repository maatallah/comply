# JORT Scraper & Regulatory Watch - Technical Documentation

## 1. System Overview 🏗️
The **JORT Scraper** is an automated system designed to monitor the *Journal Officiel de la République Tunisienne* (JORT) via the PIST.tn portal. It fetches new regulatory texts (Laws, Decrees, Orders), stores them in the local database, assesses their impact on compliance, and alerts users.

### Architecture
- **Source**: PIST.tn (National Legal Information Portal)
- **Engine**: Node.js / TypeScript (Backend)
- **Database**: PostgreSQL (via Prisma)
- **Scheduling**: `node-cron`
- **Frontend**: React (RegulatoryFeed)

---

## 2. Module Mapping 🗺️

### A. JortScraper Module (`jort.scraper.ts`)
The core engine responsible for interacting with external sources.

| Function / Method | Visibility | Role & Purpose |
|-------------------|------------|----------------|
| **`scrapeLatest()`** | `public` | **Orchestrator**. The main entry point. <br>1. Validates website structure (`detectWebsiteChanges`).<br>2. Iterates configured collections (JORT).<br>3. Orchestrates fetching, parsing, PDF extraction, deduplication, and saving.<br>4. Generates execution stats. |
| **`scrapeCollection(collection)`** | `private` | **Data Fetching**. Constructs the dynamic search query (`sf=date` for latest) to PIST.tn, fetches the XML response, and extracts Dublin Core metadata. Handles HTTP errors and empty results. |
| **`extractPdfUrl(recordId)`** | `private` | **Content Enrichment**. Fetches the HTML detail page for a specific record to find the official PDF link. Uses regex to match `Jo*.pdf` (Official Journal) or `Ja*.pdf` (Annex/Arabic). Includes **rate limiting** (500ms) to respect server policies. |
| **`detectWebsiteChanges()`** | `private` | **Self-Test / Integrity**. Proactively checks if the target website structure has changed (CSS classes, API responses) before scraping. Prevents silent failures by alerting admins if the scraper needs maintenance. |
| **`isDuplicate(entry)`** | `private` | **Deduplication**. Checks if an entry already exists in the DB (by French title). **Self-Healing**: If an entry exists but lacks a `recordId`, it updates the existing record with the ID (backfill strategy). |
| **`sanitizeErrorMessage(error)`** | `private` | **Security**. Specific helper that maps raw technical errors (`ENOTFOUND`, `ETIMEDOUT`, `404`) to user-friendly, localized messages to prevent leaking internal stack traces or network topology in alerts. |
| **`alertScraperFailure(error)`** | `private` | **Monitoring**. Creates a `CRITICAL` system alert if the scrape job fails completely. Uses sanitized error messages. |

### B. JortService Module (`jort.service.ts`)
Handles business logic and database interactions.

| Function / Method | Role & Purpose |
|-------------------|----------------|
| **`createEntry(data)`** | **Persistence**. Validates input data (Zod schema) and inserts a new `JortEntry` into the PostgreSQL database. |
| **`listEntries(query)`** | **Retrieval**. Returns paginated, filtered, and sorted JORT entries for the frontend API. Supports search by title, ministry, and type. |
| **`updateStatus(id, status)`** | **Workflow**. Updates the status of an entry (`PENDING` → `RELEVANT` or `IGNORED`). <br>⚡ **Trigger**: If status becomes `RELEVANT`, it automatically triggers `assessImpact()` and generates `REGULATORY_UPDATE` alerts for all companies. |

### C. JortScheduler Module (`jort.scheduler.ts`)
Manages automated execution.

| Function / Method | Role & Purpose |
|-------------------|----------------|
| **`startJortScheduler()`** | **Initialization**. Starts the cron job based on `JORT_SCRAPE_CRON` (default 8:00 AM). Checks `JORT_SCRAPE_ENABLED` flag. |
| **`cron.schedule(...)`** | **Execution**. The actual scheduled task that calls `jortScraper.scrapeLatest()` and logs the outcome (stats or errors) to the server console. |

### D. Impact Assessment Engine (`jort.impact.ts`)
Intelligence layer for relevance analysis.

| Function / Method | Role & Purpose |
|-------------------|----------------|
| **`assessImpact(title, ...)`** | **Analysis**. Analyzes the text of a regulation to determine its relevance to specific compliance domains (Work, Tax, HSE). |
| **`IMPACT_RULES`** | **Configuration**. Static ruleset mapping keywords (e.g., "salarié", "cnss") to Categories ("Droit du travail") and Compliance Controls ("RH-001"). |
| **Scoring Logic** | **Heuristic**. Calculates a relevance score (0-100) based on:<br>1. **Type**: Loi (+50) > Décret (+30) > Arrêté (+20)<br>2. **Source**: Social/Finance ministries (+20)<br>3. **Content**: Keyword matches (+15 per match) |

---

## 3. Data Flow 🔄

1.  **Trigger**: Cron Job (8:00 AM) OR Manual API Call (`POST /jort-feed/scrape`).
2.  **Fetch**: Scraper requests XML from PIST.tn (sorted by date desc).
3.  **Parse**: XML is converted to `ParsedEntry` objects.
4.  **Check**: Scraper checks DB for duplicates.
5.  **Enrich**: If new, Scraper fetches detail page to find PDF URL.
6.  **Save**: New entry saved with status `PENDING`.
7.  **Review**: User reviews entry in UI.
8.  **Process**: User marks as `RELEVANT`.
9.  **Alert**: System calculates impact and creates Alerts for all subscriptions.

## 4. Security Measures 🔒

- **Error Sanitization**: No raw network errors exposed to client/alerts.
- **Rate Limiting**: Delays between requests to prevent IP bans.
- **Input Validation**: Zod schemas ensure data integrity before DB insertion.
- **Fail-Safe**: Website structure validation prevents garbage data ingestion.
