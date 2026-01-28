# 💻 What Gets Coded vs Documentation
## TuniCompliance - Code vs Reference Guide

> [!IMPORTANT]
> **Personas & Pilots are NOT in the codebase** - they're design tools for developers.

---

## ❌ **NOT Coded** (Documentation Only)

### 1. Personas (USER_PERSONAS.md)

**Aicha, Mohamed, Fatma** → These are **fictional characters for design guidance only**.

**They NEVER appear in code.**

**How developers use them:**
```typescript
// ❌ WRONG - Don't do this!
if (user.name === "Aicha") {
  // Special logic for Aicha
}

// ✅ RIGHT - Use personas for design decisions (in your head/meetings)
// Developer thinks: "Aicha needs simple dashboard"
// Then codes:
function getDashboard(user: User) {
  return {
    upcomingDeadlines: getNext3Deadlines(user.companyId), // Simple, not 20 metrics
    complianceScore: calculateScore(user.companyId),       // Big number (Aicha wants this)
    quickActions: ['Upload Evidence', 'View Alerts']      // Quick access (Aicha is busy)
  };
}
```

**Personas guide the DESIGN, not the CODE.**

---

### 2. Pilot Customers

**SportWear Tunisia SARL** → This is a **real company**, but they're just **normal users** in your database.

**No special code for pilots:**

```typescript
// ❌ WRONG - Don't do this!
if (company.name === "SportWear Tunisia SARL") {
  enableBetaFeatures = true;
}

// ✅ RIGHT - Pilots are regular companies
// Just add a flag if needed:
interface Company {
  id: string;
  name: string;
  isPilot: boolean;  // ← Optional flag for analytics/support priority
}

// In database:
companies:
  - id: "comp_001"
    name: "SportWear Tunisia SARL"
    isPilot: true  // ← Just metadata, not special logic
```

**Pilots are regular users, maybe with a flag for internal tracking.**

---

## ✅ **DOES Get Coded** (In Database/Code)

### 1. The 8 Tier 1 Obligations

From `MVP_SCOPE.md` → These **ARE seeded in the database**.

```typescript
// prisma/seeds/obligations.seed.ts
export const TIER_1_OBLIGATIONS = [
  {
    id: 'obl_001',
    title_fr: 'Audit BSCI',
    title_ar: 'تدقيق BSCI',
    category: 'BRAND_AUDIT',
    frequency: 'BIENNIAL',
    riskLevel: 'CRITICAL',
    regulationId: 'reg_bsci_2.0',
  },
  {
    id: 'obl_002',
    title_fr: 'Contrôle sécurité incendie',
    title_ar: 'فحص السلامة من الحرائق',
    category: 'HSE',
    frequency: 'ANNUAL',
    riskLevel: 'CRITICAL',
    regulationId: 'reg_fire_safety',
  },
  // ... rest of 8 obligations
];

// Command to seed:
// npm run db:seed
```

**These obligations are REAL DATA in your database.**

---

### 2. Regulatory Data

From `COMPLIANCE_DOMAIN_REFERENCE.md` → **Regulations ARE seeded**.

```typescript
// prisma/seeds/regulations.seed.ts
export const TUNISIA_REGULATIONS = [
  {
    id: 'reg_fire_safety',
    code: 'Décret 75-503',
    title_fr: 'Sécurité incendie',
    title_ar: 'السلامة من الحرائق',
    authority: 'PROTECTION_CIVILE',
    category: 'HSE',
    description_fr: 'Contrôle installations, exercices évacuation',
    effectiveDate: new Date('1975-01-01'),
  },
  {
    id: 'reg_cnss',
    code: 'Code Sécurité Sociale',
    title_fr: 'Déclaration CNSS',
    title_ar: 'إعلان الضمان الاجتماعي',
    authority: 'CNSS',
    category: 'SOCIAL',
    description_fr: 'Cotisations sociales trimestrielles',
    effectiveDate: new Date('1960-01-01'),
  },
  // ... all regulations from COMPLIANCE_DOMAIN_REFERENCE.md
];
```

**This data powers your obligation library.**

---

### 3. User Roles

From personas → We extract **role types** and code them as enums.

```typescript
// shared/types.ts
export enum UserRole {
  COMPANY_ADMIN = 'COMPANY_ADMIN',     // ← Inspired by Mohamed persona
  COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER', // ← Aicha persona
  EMPLOYEE = 'EMPLOYEE',                // ← Salma persona
  AUDITOR = 'AUDITOR'                   // ← Karim persona (Phase 2)
}

// ❌ NOT coded: "Aicha is 35 years old, works at SportWear"
// ✅ CODED: Role types that represent user categories
```

---

### 4. Tunisia-Specific Validations

From architecture docs → **Validation rules ARE coded**.

```typescript
// utils/validators.ts

// From MVP_TECH_ARCHITECTURE.md - Error Handling section
export function validateTaxId(taxId: string): boolean {
  // Tunisia matricule fiscal format: XXXXXXX/X/A/M/XXX
  const regex = /^\d{7}\/[A-Z]\/[A-Z]\/[A-Z]\/\d{3}$/;
  return regex.test(taxId);
}

export function validateCNSSId(cnssId: string): boolean {
  // Tunisia CNSS format: 7-10 digits
  const regex = /^\d{7,10}$/;
  return regex.test(cnssId);
}

export function validateTunisiaPhone(phone: string): boolean {
  // Tunisia phone: +216XXXXXXXX
  const regex = /^\+216[2-9]\d{7}$/;
  return regex.test(phone);
}
```

**These business rules from docs become actual code.**

---

### 5. Data Model Entities

From `DATA_MODEL_V2.md` → **All entities ARE coded exactly as specified**.

```typescript
// modules/companies/company.entity.ts

// This MUST match DATA_MODEL_V2.md exactly
export interface Company {
  id: string;
  legalName: string;
  tradeName?: string;
  taxId: string;        // ← Validated with validateTaxId()
  cnssId?: string;      // ← Validated with validateCNSSId()
  activitySector: SectorEnum;
  companySize: SizeEnum;
  address?: string;
  phone?: string;       // ← Validated with validateTunisiaPhone()
  email?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// This is a DIRECT translation from DATA_MODEL_V2.md
```

**Zero deviation from the locked data model.**

---

### 6. Error Codes & Messages

From `MVP_TECH_ARCHITECTURE.md` → **Error codes ARE coded**.

```typescript
// shared/errors.ts
export enum ErrorCode {
  AUTH_INVALID_CREDENTIALS = 'AUTH_001',
  VAL_INVALID_TAX_ID = 'VAL_003',
  BIZ_COMPANY_NOT_FOUND = 'BIZ_001',
  // ... all codes from architecture doc
}

// shared/error-messages.ts
export const errorMessages = {
  fr: {
    AUTH_001: "Email ou mot de passe incorrect",
    VAL_003: "Le matricule fiscal doit être au format XXXXXXX/X/A/M/XXX",
    // ... all French messages
  },
  ar: {
    AUTH_001: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    // ... all Arabic messages
  }
};
```

**Error handling strategy becomes real code.**

---

## 📊 Summary Table

| Item | Source Document | Goes in Code? | Example |
|------|----------------|---------------|---------|
| **Aicha persona** | USER_PERSONAS.md | ❌ NO | Design reference only |
| **Pilot companies** | Testing phase | ❌ NO (just regular users) | Normal companies in DB |
| **8 Tier 1 obligations** | MVP_SCOPE.md | ✅ YES | Database seed |
| **Regulations** | COMPLIANCE_DOMAIN_REFERENCE.md | ✅ YES | Database seed |
| **User roles** | USER_PERSONAS.md (inspired by) | ✅ YES | TypeScript enum |
| **Data model** | DATA_MODEL_V2.md | ✅ YES | Entities, DB schema |
| **Error codes** | MVP_TECH_ARCHITECTURE.md | ✅ YES | Enums + messages |
| **Tunisia validators** | MVP_TECH_ARCHITECTURE.md | ✅ YES | Functions |
| **i18n structure** | MVP_TECH_ARCHITECTURE.md | ✅ YES | Translation files |

---

## 🎯 Concrete Example: Dashboard Feature

### From Persona (Design Phase)
```markdown
# USER_PERSONAS.md

Aicha needs:
- See next 3 deadlines at a glance
- Quick upload evidence button
- Simple compliance score (not complex analytics)
```

**This is NOT coded directly.**

---

### To Code (Implementation Phase)

**Step 1**: Developer reads persona, plans dashboard

**Step 2**: Codes it:

```typescript
// modules/dashboard/dashboard.service.ts

export class DashboardService {
  async getDashboard(companyId: string) {
    // Based on Aicha's needs: "Next 3 deadlines"
    const upcomingDeadlines = await this.deadlineRepo.findUpcoming({
      companyId,
      limit: 3,  // ← Only 3, not 20 (Aicha wants simple)
      orderBy: 'dueDate',
    });

    // Based on Mohamed's needs: "Compliance score"
    const score = await this.scoringService.calculate(companyId);

    return {
      complianceScore: score,
      upcomingDeadlines,
      quickActions: [
        { label: 'Upload Evidence', route: '/evidence/upload' },
        { label: 'View Alerts', route: '/alerts' },
      ],
    };
  }
}
```

**Persona influenced the design (3 deadlines, not 20), but "Aicha" is NOT in the code.**

---

### Step 3: Pilot Tests It

**SportWear Tunisia** (pilot) uses dashboard:

**Feedback**: 
- ✅ "3 deadlines is perfect!"
- ❌ "But can we see 7 days of tasks, not just 3?"

**Developer decision**:
- Keep 3 as default (Aicha persona validated)
- Add "View all" link (pilot request)

**Code update**:
```typescript
return {
  complianceScore: score,
  upcomingDeadlines: upcomingDeadlines.slice(0, 3), // Show 3
  upcomingDeadlinesCount: upcomingDeadlines.length, // Total count
  actions: [
    { label: 'View All Deadlines', route: '/deadlines' }, // ← New from pilot feedback
  ],
};
```

**Pilot feedback improved the code, but pilot company name is NOT in code.**

---

## 🔐 What About Locked Documents?

**Question**: "Are locked documents hardcoded?"

**Answer**: 
- ❌ **NOT hardcoded verbatim**
- ✅ **Translated into code** following the specs exactly

**Example**:

### Locked Document (DATA_MODEL_V2.md)
```markdown
## COMPANY Entity

- id: string (UUID)
- legalName: string (required)
- taxId: string (required, unique, Tunisia format)
- cnssId: string (optional)
```

### Becomes Code
```typescript
// Prisma schema (or SQL)
model Company {
  id        String   @id @default(uuid())
  legalName String   @map("legal_name")
  taxId     String   @unique @map("tax_id")
  cnssId    String?  @map("cnss_id")
}

// TypeScript entity (exact match)
export interface Company {
  id: string;
  legalName: string;
  taxId: string;
  cnssId?: string;
}
```

**The spec from the locked doc is IMPLEMENTED, not copy-pasted.**

---

## 🚀 Practical Workflow

### Phase 1: Design (Docs Only)
1. Write personas (Aicha, Mohamed) → `USER_PERSONAS.md`
2. Define scope (8 obligations) → `MVP_SCOPE.md`
3. Design data model → `DATA_MODEL_V2.md`
4. **Lock all documents** 🔒

**No code yet!**

---

### Phase 2: Implementation (Code)
1. Read locked docs
2. Create seed files for obligations/regulations
3. Generate Prisma schema from DATA_MODEL_V2.md
4. Write validators from architecture doc
5. Build features guided by personas (but personas stay in docs)

**Code = Implementation of specs from docs**

---

### Phase 3: Testing (Pilots)
1. Recruit real companies
2. They use the app as normal users
3. Give feedback → Update roadmap
4. Pilots remain regular companies in DB

**Pilots = Real data, not special-cased**

---

## ✅ Final Answer

**Your question**: "Are personas/pilots hardcoded?"

**Answer**:
- ❌ **Personas**: Never in code, only in developer's minds
- ❌ **Pilots**: Regular users, maybe with `isPilot: true` flag
- ✅ **Obligations**: YES, seeded from MVP_SCOPE.md
- ✅ **Regulations**: YES, seeded from COMPLIANCE_DOMAIN_REFERENCE.md
- ✅ **Data Model**: YES, translated to TypeScript/SQL
- ✅ **Error Codes**: YES, from MVP_TECH_ARCHITECTURE.md

**Think of it this way**:
- **Docs = Blueprint** 📐
- **Code = Building** 🏗️
- **Personas = Design principles** (guide the architect)
- **Locked docs = Specifications** (must be followed exactly)

---

**Still unclear? Ask me:**
- "Show me the exact seed file for obligations"
- "How do I translate DATA_MODEL_V2.md to Prisma schema?"
- "What gets committed to Git vs what stays local?"
