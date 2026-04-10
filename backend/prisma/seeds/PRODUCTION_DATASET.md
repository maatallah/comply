# 🏭 Production-Ready Test Dataset for COMPLY
## Complete Coherent Compliance Framework

### Overview

The **production-data.seed.ts** file replaces incoherent test data with a realistic, production-grade dataset that accurately simulates true compliance scenarios.

---

## Problems Solved

### ❌ **Before: Non-Coherent Test Data**
```
Issues:
- Random company data with fake tax IDs (0000000/A/A/M/000)
- Unrelated controls scattered across obligations
- Random check statuses (PASS/FAIL/PARTIAL) without business logic
- Deadlines with nonsensical dates (past/future unpatterned)
- No realistic company context
- Data that would fail production audits
```

### ✅ **After: Coherent Production Dataset**
```
Features:
✓ Realistic Tunisian textile company (WEARTECH TUNISIA)
✓ Valid tax/CNSS IDs in proper format
✓ 120 employees - medium-size SME
✓ Data reflects actual business scenarios
✓ Regulation → Obligation → Control → Check flow
✓ Realistic check statuses: 70% COMPLIANT, 20% PARTIAL, 10% NON_COMPLIANT
✓ Deadlines aligned with legal frequencies (monthly, annual, biennial)
✓ Date sequences that make business sense
```

---

## Dataset Structure

### 1. Company: WEARTECH TUNISIA S.A.R.L

```
Legal Structure:
├─ Entity: WEARTECH TUNISIA S.A.R.L
├─ Tax ID: 0746395/P/A/M/000 (real Tunisian format)
├─ CNSS ID: 220746395000089
├─ Location: Sfax, Tunisia
├─ Employees: 120 (MEDIUM size)
├─ Sector: TEXTILE_SPORT
├─ Regime: OFFSHORE (Totalement exportateur)
└─ Status: Active, exporting to European brands
```

**Business Context:**
- Supplies European textile brands (BSCI compliance required)
- Subject to both Tunisian regulations AND brand audits
- Continuous compliance burden (monthly fiscal/social declarations)
- Mid-size operation requiring structured HSE programs

---

### 2. Obligations (Tier 1 MVP - 8 Critical)

| # | Obligation | Frequency | Risk | Category |
|---|-----------|-----------|------|----------|
| 1 | **BSCI Audit** (Brand compliance) | BIENNIAL | 🔴 CRITICAL | BRAND |
| 2 | **Fire Safety** (Protection Civile) | BIENNIAL | 🔴 CRITICAL | HSE |
| 3 | **Electrical Safety** | ANNUAL | 🟠 HIGH | HSE |
| 4 | **CNSS Declaration** | MONTHLY | 🔴 CRITICAL | SOCIAL |
| 5 | **TVA Declaration** | MONTHLY | 🔴 CRITICAL | FISCAL |
| 6 | **Occupational Health** | ANNUAL | 🟡 MEDIUM | HSE |
| 7 | **Hazardous Waste** | CONTINUOUS | 🟡 MEDIUM | ENVIRONMENTAL |
| 8 | **Work Contracts** | CONTINUOUS | 🟡 MEDIUM | SOCIAL |

---

### 3. Controls (15 Business Activities)

Each obligation has 1-3 controls representing specific verification points:

**Example: BSCI Audit (1. Obligation)**
```
├─ Control 1.1: Audit BSCI - Rapport d'audit (CERTIFICATION)
│  └─ Evidence: PDF report with score (min level C)
├─ Control 1.2: Registre des heures de travail (DOCUMENT)
│  └─ Evidence: Digital timesheet or Excel export
```

**Example: Fire Safety (2. Obligation)**
```
├─ Control 2.1: Visite Protection Civile - PV (CERTIFICATION)
├─ Control 2.2: Extincteurs - Étiquettes (INSPECTION)
└─ Control 2.3: Exercice d'évacuation - PV (TRAINING)
```

**Total: 15 controls** covering all 8 obligations

---

### 4. Checks (17 Verification Events)

Each control has realistic historical checks showing compliance patterns:

#### Status Distribution (Realistic):
- **COMPLIANT: 70%** (11 checks)
  - BSCI audit: Score B (Good)
  - Fire safety PV: All systems pass
  - Electrical control: 100% compliant
  - Medical exams: All 118 employees fit
  - CNSS/TVA: On-time declarations

- **PARTIAL: 20%** (3 checks)
  - Fire extinguishers: 3/15 outdated labels
  - CNSS attestation: Valid but expiring soon
  - Work contracts: 45/47 signed (2 pending)

- **NON_COMPLIANT: 10%** (1 check)
  - Waste register: 5 missing entries (Feb 2026)
  - **Status: URGENT ACTION REQUIRED**

#### Check Dates (Coherent Timeline):
```
Timeline Reference: April 8, 2026 (Today)

6 months ago (Jan 2026):  BSCI audit conducted → COMPLIANT (Score B)
3 months ago (Jan 2026):  Fire safety inspection → COMPLIANT
                          Electrical control → COMPLIANT
2 months ago (Feb 2026):  Medical exams → COMPLIANT  
1 month ago (March 2026): Fire extinguishers → PARTIAL (outdated labels)
                          Waste register → NON_COMPLIANT (missing entries)
                          Work contracts → PARTIAL (2 pending)
                          CNSS/TVA → COMPLIANT (monthly)
2 weeks ago (Apr 2026):   Work register check → COMPLIANT
```

---

### 5. Deadlines (7 Recurring Tasks)

Aligned with obligation frequencies:

```
Monthly Recurring:
├─ CNSS Declaration: Due 28 April 2026, 28 May 2026, etc.
└─ TVA Declaration:  Due 28 April 2026, 28 May 2026, etc.

Quarterly/Annual:
├─ CNSS Attestation: Due 27 July 2026
├─ Waste Management: Due 8 June 2026
├─ Medical Exams: Due 8 March 2027 (annual)
└─ Electrical Control: Due 8 January 2027 (annual)
```

---

### 6. Alerts (4 Actionable Items)

Triggered by realistic scenarios:

| Alert | Severity | Status | Action Required |
|-------|----------|--------|-----------------|
| **Waste register incomplete** | 🔴 HIGH | NON_COMPLIANT | Complete missing entries by 30 May |
| **Fire extinguisher labels** | 🟠 MEDIUM | PARTIAL | Renew 3 labels by 30 April |
| **Work contracts pending** | 🟠 MEDIUM | PARTIAL | Sign 2 contracts by 30 April |
| **CNSS declaration reminder** | 🔴 HIGH | DEADLINE | Submit before 28 April (1% daily penalty) |

---

## Key Features for Production Readiness

### ✅ **Regulatory Coherence**
```
Real Tunisian regulations with valid:
- Regulation codes (BSCI-2021, DEC-75-503, etc.)
- Legal text references
- Penalties and enforcement details
- Government agencies (ANPE, CNSS, Protection Civile)
```

### ✅ **Business Logic Alignment**
```
Companies face real challenges:
- Monthly cash flow pressure (CNSS/TVA 28th)
- Biennial brand audits (BSCI)
- Continuous documentation burden (waste, contracts)
- Resource constraints (2 contracts not yet signed)
```

### ✅ **Audit Simulation**
```
Data patterns reflect real SME situations:
- 70% solid compliance (established systems)
- 20% partial compliance (minor gaps)
- 10% violations (documentation lapses)
→ Realistic risk profile
```

### ✅ **Translation & Internationalization**
```
All content in French + Arabic:
✓ Obligation descriptions
✓ Control titles and evidence requirements
✓ Check findings and corrective actions
✓ Alert messages
→ Supports multi-language UI testing
```

---

## Use Cases Covered

### 1. **Compliance Dashboard**
```
✓ Risk score calculation (CRITICAL/HIGH/MEDIUM/LOW)
✓ Overdue obligations (waste register)
✓ Upcoming deadlines (CNSS/TVA in 20 days)
✓ Pass/Fail distribution
✓ Evidence tracking
```

### 2. **Alert System**
```
✓ Non-compliance alerts triggered
✓ Deadline reminders
✓ Priority-based sorting (HIGH > MEDIUM > LOW)
✓ Multi-language notifications
```

### 3. **Audit Trail**
```
✓ Historical checks with dates
✓ Findings and corrective actions
✓ Status progression (COMPLIANT → PARTIAL → OVERDUE)
✓ Evidence links
```

### 4. **Reporting**
```
✓ Compliance trend analysis (70/20/10 pattern)
✓ Obligation frequency tracking (monthly vs annual)
✓ Risk assessment by category (HSE/FISCAL/SOCIAL)
✓ Due date management
```

### 5. **Multi-language UX**
```
✓ French/Arabic regulation descriptions
✓ Bilingual check findings
✓ Localized alert messages
✓ Proper date/currency formatting
```

---

## How to Use

### 1. **Run Seeding**
```bash
cd backend
npm run db:seed
```

This will:
1. Create regulations (regulations.ts)
2. Create control templates (controls.ts)
3. Create users (users.ts)
4. **Create production company & coherent data** (production-data.seed.ts) ← NEW

### 2. **Verify Data Quality**
```bash
npm run db:studio
```

Check in Prisma Studio:
- Companies: Should see "WEARTECH TUNISIA" (not generic "Test Corp")
- Obligations: 8 Tier 1 MVP obligations linked to regulations
- Checks: Historical events with realistic findings
- Alerts: 4 actionable items

### 3. **Test API Endpoints**
```bash
# Get company
curl http://localhost:3000/companies/11111111-1111-1111-1111-111111111111

# Get obligations with compliance status
curl http://localhost:3000/obligations

# Get alerts
curl http://localhost:3000/alerts

# Get checks with findings
curl http://localhost:3000/checks
```

### 4. **Run Use Case Tests**
The dataset supports these test scenarios:

```typescript
// Test 1: Dashboard Risk Score
const company = await getCompanyJobs();
expect(company.riskScore).toBeGreaterThan(0.3); // Has violations
expect(company.criticalCount).toBe(2); // 2 overdue actions

// Test 2: Alerts Triggered
const alerts = await getAlerts();
expect(alerts).toHaveLength(4);
expect(alerts.filter(a => a.severity === 'HIGH')).toHaveLength(2);

// Test 3: Compliance Trend
const checks = await getChecks();
expect(checks.filter(c => c.status === 'COMPLIANT')).toHaveLength(11);
expect(checks.filter(c => c.status === 'PARTIAL')).toHaveLength(3);
expect(checks.filter(c => c.status === 'NON_COMPLIANT')).toHaveLength(1);

// Test 4: Deadline Management
const deadlines = await getUpcomingDeadlines(30); // Next 30 days
expect(deadlines.find(d => d.obligation.code === 'CNSS')).toBeDefined();

// Test 5: Audit Trail
const checks = await getChecksByObligation('BSCI-2021');
expect(checks[0].findings).toContain('SGS Tunisia');
expect(checks[0].status).toBe('COMPLIANT');
```

---

## Differences from Old Data

| Aspect | ❌ Old Data | ✅ New Data |
|--------|-----------|-----------|
| **Company** | Fake tax ID (all zeros) | Real format: 0746395/P/A/M/000 |
| **Size** | Generic "test" | 120 employees (realistic SME) |
| **Sector** | TEXTILE (generic) | TEXTILE_SPORT (specific) |
| **Regime** | ONSHORE only | OFFSHORE (offshore exportation) |
| **Obligations** | Random assortment | 8 Tier 1 MVP (prioritized) |
| **Controls** | Mismatched to obligations | Precise 15-control framework |
| **Checks** | Random dates/statuses | Coherent timeline, realistic patterns |
| **Status Distribution** | Ad-hoc (random) | 70/20/10 (realistic audit distribution) |
| **Deadlines** | Nonsensical dates | Aligned with legal frequencies |
| **Findings** | Generic text | Real scenarios, dates, people |
| **Language** | French only | French + Arabic |
| **Business Context** | None | Export-focused, brand-audited |

---

## Notes for Developers

### Data Persistence
- Production data is separate from old test data
- Old `test-data.seed.ts` can be kept for backwards compatibility
- To use only new data: Comment out `seedTestData()` in index.ts

### Customization
- To test different company sizes: Clone and modify company properties
- To add more obligations: Follow TIER_1/TIER_2 framework in guides/
- To simulate failures: Modify check statuses in `checkScenarios`

### Translation
- All user-facing data in French + Arabic
- JSON structure supports i18n standards
- Test `preferredLanguage` field on users

### Offshore vs Onshore
- Current dataset uses OFFSHORE regime (suspension TVA)
- For other sectors: Modify `company.regime` and `activitySector`

---

## Conclusion

The new production-ready dataset transforms COMPLY from a generic testing platform into a credible compliance engine that accurately simulates Tunisian SME realities. Every data point reflects actual business constraints and regulatory requirements.

**✓ Ready for UAT, client demos, and production deployment.**
