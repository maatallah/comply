# 🏗️ MVP Technical Architecture
## Modular Monolith Approach for Tunisian Compliance SaaS

> [!IMPORTANT]
> This is **Phase 1 architecture** - designed for rapid MVP delivery, not premature scaling.
> We evolve to microservices **only when scaling pain appears**.

---

## 1. Architecture Philosophy

### ❌ What We're NOT Building (Yet)

- Microservices
- Kubernetes clusters
- Redis caching layer
- Elasticsearch
- RabbitMQ message queues
- API Gateway
- Service mesh

### ✅ What We ARE Building

- **Modular monolith** - One codebase, clear module boundaries
- **PostgreSQL only** - ACID compliance, JSON support, full-text search
- **Simple file storage** - Local or MinIO single-node
- **Background jobs** - In-process or simple queue
- **JWT auth** - Stateless, scalable

---

## 2. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER                          │
│                                                             │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │   Web App    │         │  Mobile PWA  │                 │
│  │   (React)    │         │   (React)    │                 │
│  └──────────────┘         └──────────────┘                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ HTTPS/REST
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND MONOLITH                          │
│                   (Fastify + TypeScript)                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Auth Middleware (JWT)                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────┬──────────────┬──────────────┐            │
│  │   Module:    │   Module:    │   Module:    │            │
│  │   Companies  │ Obligations  │  Deadlines   │            │
│  └──────────────┴──────────────┴──────────────┘            │
│                                                             │
│  ┌──────────────┬──────────────┬──────────────┐            │
│  │   Module:    │   Module:    │   Module:    │            │
│  │   Controls   │    Checks    │   Evidence   │            │
│  └──────────────┴──────────────┴──────────────┘            │
│                                                             │
│  ┌──────────────┬──────────────┬──────────────┐            │
│  │   Module:    │   Module:    │   Module:    │            │
│  │    Alerts    │    Audits    │   Scoring    │            │
│  └──────────────┴──────────────┴──────────────┘            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                              │
│                                                             │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │  PostgreSQL  │         │    MinIO     │                 │
│  │   (Primary)  │         │ (Files/Docs) │                 │
│  └──────────────┘         └──────────────┘                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | React 18 + TypeScript | Industry standard, rich ecosystem |
| **Mobile** | React PWA | Code reuse, offline capability, no app store |
| **Backend** | Fastify (Node.js) | Fast, TypeScript-first, low overhead |
| **Database** | PostgreSQL 15+ | ACID, JSONB, full-text search, proven |
| **ORM** | Prisma or Drizzle | Type-safe, migrations, good DX |
| **Auth** | JWT + bcrypt | Stateless, scalable, standard |
| **File Storage** | MinIO (S3-compatible) | Self-hosted, Tunisia data sovereignty |
| **Background Jobs** | Node-cron (MVP) → BullMQ (later) | Start simple, scale when needed |
| **i18n** | react-i18next | Industry standard, pluralization, RTL support |
| **Logging** | Pino | Structured JSON logs, performant |
| **Validation** | Zod | TypeScript schema validation |
| **Hosting** | Tunisia Cloud / OVH | Data sovereignty compliance |

---

## 3.1. Internationalization & RTL Support

> [!IMPORTANT]
> **Language Strategy for Tunisian Market**:
> - **Primary**: French (default UI language)
> - **Secondary**: Arabic (RTL support for content display)
> - Target users are bilingual but primarily use French for business systems

### Technology Choice

| Aspect | Solution | Why |
|--------|----------|-----|
| **i18n Library** | react-i18next | Best React i18n solution, namespace support, dynamic loading |
| **RTL Support** | CSS logical properties + `dir` attribute | Native browser RTL, no extra library |
| **Fonts** | Noto Sans (French) + Cairo/Tajawal (Arabic) | Production-ready web fonts with Arabic support |
| **Date/Time** | date-fns with locale support | Lightweight, tree-shakeable |
| **Number Format** | Intl.NumberFormat API | Native browser API, locale-aware |

### Implementation Strategy

#### Frontend Structure

```
src/
├── i18n/
│   ├── index.ts                 # i18next config
│   ├── locales/
│   │   ├── fr/
│   │   │   ├── common.json      # Shared terminology
│   │   │   ├── dashboard.json   # Dashboard texts
│   │   │   ├── obligations.json # Obligation module
│   │   │   ├── alerts.json      # Alerts module
│   │   │   └── errors.json      # Error messages
│   │   └── ar/
│   │       ├── common.json
│   │       ├── dashboard.json
│   │       ├── obligations.json
│   │       ├── alerts.json
│   │       └── errors.json
│   └── rtl.css                  # RTL-specific overrides
```

#### i18next Configuration

```typescript
// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import frCommon from './locales/fr/common.json';
import frDashboard from './locales/fr/dashboard.json';
import arCommon from './locales/ar/common.json';
import arDashboard from './locales/ar/dashboard.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: {
        common: frCommon,
        dashboard: frDashboard,
        // ... other namespaces
      },
      ar: {
        common: arCommon,
        dashboard: arDashboard,
        // ... other namespaces
      }
    },
    fallbackLng: 'fr',              // Default to French
    defaultNS: 'common',
    ns: ['common', 'dashboard', 'obligations', 'alerts', 'errors'],
    
    interpolation: {
      escapeValue: false             // React already escapes
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
```

#### Translation File Example

```json
// locales/fr/dashboard.json
{
  "title": "Tableau de bord",
  "compliance_score": "Score de conformité",
  "upcoming_deadlines": "Échéances à venir",
  "overdue": "En retard",
  "compliant": "Conforme",
  "alerts": {
    "new": "{{count}} nouvelle alerte",
    "new_plural": "{{count}} nouvelles alertes"
  }
}

// locales/ar/dashboard.json
{
  "title": "لوحة القيادة",
  "compliance_score": "نتيجة الامتثال",
  "upcoming_deadlines": "المواعيد النهائية القادمة",
  "overdue": "متأخر",
  "compliant": "متوافق",
  "alerts": {
    "new": "تنبيه جديد",
    "new_plural": "{{count}} تنبيهات جديدة"
  }
}
```

#### React Component Usage

```typescript
// Dashboard.tsx
import { useTranslation } from 'react-i18next';

export function Dashboard() {
  const { t, i18n } = useTranslation('dashboard');
  
  return (
    <div dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <h1>{t('title')}</h1>
      <div className="score">
        <span>{t('compliance_score')}</span>
        <span>85%</span>
      </div>
      <p>{t('alerts.new', { count: 5 })}</p>
    </div>
  );
}
```

### RTL Support Implementation

#### Global CSS Configuration

```css
/* src/styles/globals.css */

/* Use CSS logical properties for automatic RTL support */
:root {
  --spacing-start: 1rem;  /* margin-inline-start instead of margin-left */
  --spacing-end: 1rem;
}

/* Automatically handle RTL */
[dir="rtl"] {
  font-family: 'Cairo', 'Tajawal', sans-serif;
}

[dir="ltr"] {
  font-family: 'Noto Sans', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Use logical properties everywhere */
.card {
  padding-inline-start: 1rem;    /* Not padding-left */
  padding-inline-end: 1rem;      /* Not padding-right */
  margin-inline-start: auto;     /* Not margin-left */
}

.header {
  text-align: start;             /* Not left */
}

/* Icons that should flip in RTL */
.icon-arrow {
  transform: scaleX(var(--rtl-flip, 1));
}

[dir="rtl"] .icon-arrow {
  --rtl-flip: -1;
}
```

#### RTL-Specific Overrides

```css
/* src/i18n/rtl.css */

/* Only use when logical properties aren't enough */
[dir="rtl"] {
  /* Numbers should stay LTR in Arabic */
  .number, .date, .amount {
    direction: ltr;
    display: inline-block;
  }
  
  /* Adjust specific components */
  .sidebar {
    border-inline-start: none;
    border-inline-end: 1px solid #ddd;
  }
}
```

### Language Switcher Component

```typescript
// components/LanguageSwitcher.tsx
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  // Update document direction when language changes
  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);
  
  const changeLanguage = (lng: 'fr' | 'ar') => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };
  
  return (
    <div className="language-switcher">
      <button
        onClick={() => changeLanguage('fr')}
        className={i18n.language === 'fr' ? 'active' : ''}
      >
        Français
      </button>
      <button
        onClick={() => changeLanguage('ar')}
        className={i18n.language === 'ar' ? 'active' : ''}
      >
        العربية
      </button>
    </div>
  );
}
```

### Backend i18n Support

```typescript
// Backend: Return localized messages based on Accept-Language header

// shared/i18n.ts
const messages = {
  fr: {
    COMPANY_NOT_FOUND: "Entreprise introuvable",
    OBLIGATION_CREATED: "Obligation créée avec succès"
  },
  ar: {
    COMPANY_NOT_FOUND: "الشركة غير موجودة",
    OBLIGATION_CREATED: "تم إنشاء الالتزام بنجاح"
  }
};

export function getLocalizedMessage(key: string, lang: 'fr' | 'ar' = 'fr') {
  return messages[lang][key] || messages['fr'][key];
}

// app.ts - Add language detection middleware
app.addHook('preHandler', (req, reply, done) => {
  const lang = req.headers['accept-language']?.includes('ar') ? 'ar' : 'fr';
  req.lang = lang;
  done();
});
```

### Database Localization

```sql
-- Store regulatory content in both languages
CREATE TABLE regulations (
  id UUID PRIMARY KEY,
  code TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  title_ar TEXT,
  description_fr TEXT,
  description_ar TEXT,
  -- ... other fields
);

-- Query helper
SELECT 
  CASE 
    WHEN :lang = 'ar' AND title_ar IS NOT NULL THEN title_ar
    ELSE title_fr
  END as title
FROM regulations;
```

### Date & Number Formatting

```typescript
// utils/format.ts
import { format } from 'date-fns';
import { fr, ar } from 'date-fns/locale';

export function formatDate(date: Date, lng: 'fr' | 'ar') {
  return format(date, 'PPP', {
    locale: lng === 'ar' ? ar : fr
  });
}

export function formatNumber(value: number, lng: 'fr' | 'ar') {
  return new Intl.NumberFormat(lng === 'ar' ? 'ar-TN' : 'fr-TN').format(value);
}

export function formatCurrency(value: number, lng: 'fr' | 'ar') {
  return new Intl.NumberFormat(lng === 'ar' ? 'ar-TN' : 'fr-TN', {
    style: 'currency',
    currency: 'TND'
  }).format(value);
}

// Usage
formatDate(new Date(), 'fr')  // "27 janvier 2026"
formatDate(new Date(), 'ar')  // "٢٧ يناير ٢٠٢٦"
formatCurrency(1500, 'fr')    // "1 500,00 TND"
```

### Font Loading

```html
<!-- index.html -->
<head>
  <!-- Google Fonts for French -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <!-- Google Fonts for Arabic -->
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
```

### Testing i18n

```typescript
// Dashboard.test.tsx
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

describe('Dashboard i18n', () => {
  it('displays French text by default', () => {
    i18n.changeLanguage('fr');
    render(
      <I18nextProvider i18n={i18n}>
        <Dashboard />
      </I18nextProvider>
    );
    expect(screen.getByText('Tableau de bord')).toBeInTheDocument();
  });
  
  it('displays Arabic text when switched', () => {
    i18n.changeLanguage('ar');
    render(
      <I18nextProvider i18n={i18n}>
        <Dashboard />
      </I18nextProvider>
    );
    expect(screen.getByText('لوحة القيادة')).toBeInTheDocument();
    expect(document.documentElement.dir).toBe('rtl');
  });
});
```

### Critical i18n Rules

> [!WARNING]
> **Developers MUST follow these rules:**

1. ✅ **Never hardcode text** - Always use `t('key')`
2. ✅ **Use logical CSS properties** - `margin-inline-start` not `margin-left`
3. ✅ **Numbers stay LTR** - Force direction for dates, amounts
4. ✅ **Test both directions** - Ensure layout works in RTL
5. ✅ **Namespace translations** - Group by module, not one huge file
6. ✅ **Provide fallback** - Always have French translation
7. ✅ **Store user preference** - Save language choice to localStorage + DB

---

## 4. Backend Module Structure

```
src/
├── modules/
│   ├── companies/
│   │   ├── company.entity.ts
│   │   ├── company.repo.ts
│   │   ├── company.service.ts
│   │   ├── company.routes.ts
│   │   └── company.validation.ts
│   │
│   ├── users/
│   │   ├── user.entity.ts
│   │   ├── user.repo.ts
│   │   ├── user.service.ts
│   │   ├── user.routes.ts
│   │   └── auth.middleware.ts
│   │
│   ├── obligations/
│   │   ├── obligation.entity.ts
│   │   ├── obligation.repo.ts
│   │   ├── obligation.service.ts
│   │   └── obligation.routes.ts
│   │
│   ├── controls/
│   │   ├── control.entity.ts
│   │   ├── control.repo.ts
│   │   ├── control.service.ts
│   │   └── control.routes.ts
│   │
│   ├── checks/
│   │   ├── check.entity.ts
│   │   ├── check.repo.ts
│   │   ├── check.service.ts
│   │   └── check.routes.ts
│   │
│   ├── evidence/
│   │   ├── evidence.entity.ts
│   │   ├── evidence.repo.ts
│   │   ├── evidence.service.ts
│   │   └── evidence.routes.ts
│   │
│   ├── deadlines/
│   │   ├── deadline.entity.ts
│   │   ├── deadline.repo.ts
│   │   ├── deadline.service.ts
│   │   └── deadline.routes.ts
│   │
│   ├── alerts/
│   │   ├── alert.entity.ts
│   │   ├── alert.repo.ts
│   │   ├── alert.service.ts
│   │   └── alert.routes.ts
│   │
│   └── scoring/
│       ├── scoring.service.ts
│       └── scoring.routes.ts
│
├── shared/
│   ├── db.ts                  # Database connection
│   ├── logger.ts              # Pino logger
│   ├── config.ts              # Environment config
│   └── types.ts               # Shared types
│
├── jobs/
│   ├── deadline.job.ts        # Daily deadline calculation
│   └── scoring.job.ts         # Periodic compliance scoring
│
├── app.ts                     # Fastify app setup
└── server.ts                  # Entry point
```

---

## 5. Module Architecture Pattern

Each module follows the **Repository-Service-Route** pattern:

```typescript
// 1. Entity (Data shape)
export interface Company {
  id: string;
  name: string;
  taxId: string;
}

// 2. Repository (Database only)
export class CompanyRepo {
  async findById(id: string): Promise<Company | null> {
    return db.query('SELECT * FROM companies WHERE id = $1', [id]);
  }
  
  async create(data: Company): Promise<Company> {
    return db.query('INSERT INTO companies ...');
  }
}

// 3. Service (Business logic)
export class CompanyService {
  constructor(private repo: CompanyRepo) {}
  
  async getCompany(id: string): Promise<Company> {
    const company = await this.repo.findById(id);
    if (!company) throw new Error('Company not found');
    return company;
  }
}

// 4. Routes (HTTP layer)
export function companyRoutes(app: FastifyInstance) {
  app.get('/companies/:id', async (req, reply) => {
    const company = await companyService.getCompany(req.params.id);
    return company;
  });
}
```

---

## 6. Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as Database

    U->>F: Enter email/password
    F->>B: POST /auth/login
    B->>DB: Find user by email
    DB-->>B: User record
    B->>B: Verify password (bcrypt)
    B->>B: Generate JWT token
    B-->>F: { token, user }
    F->>F: Store token (localStorage)
    
    Note over F,B: Subsequent requests
    F->>B: GET /obligations<br/>Header: Authorization Bearer {token}
    B->>B: Verify JWT
    B->>B: Extract companyId from token
    B->>DB: Query WITH companyId filter
    DB-->>B: Company-specific data
    B-->>F: Response
```

---

## 7. Database Strategy

### PostgreSQL Capabilities

| Feature | How We Use It |
|---------|---------------|
| **JSONB** | Store flexible metadata (control details, audit findings) |
| **Full-text search** | Search regulations, obligations (no Elasticsearch needed) |
| **Triggers** | Auto-update timestamps, audit logs |
| **Row-level security** | Enforce multi-tenancy at DB level (optional) |
| **Indexes** | Fast lookups on companyId, dates, statuses |

### Example Full-Text Search

```sql
-- Add search column
ALTER TABLE regulations 
ADD COLUMN search_vector tsvector;

-- Create index
CREATE INDEX regulations_search_idx 
ON regulations USING gin(search_vector);

-- Search query
SELECT * FROM regulations 
WHERE search_vector @@ to_tsquery('french', 'médecine & travail');
```

---

## 8. File Storage Strategy

### MVP: MinIO Single Node

```typescript
// evidence.service.ts
import { S3Client } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT,
  region: 'tn-tunis-1',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY,
    secretAccessKey: process.env.MINIO_SECRET_KEY
  }
});

async function uploadEvidence(file: File, checkId: string) {
  const key = `evidence/${checkId}/${file.name}`;
  
  await s3.putObject({
    Bucket: 'compliance-evidence',
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype
  });
  
  return { filePath: key };
}
```

---

## 9. Background Jobs

### MVP: Node-cron

```typescript
// jobs/deadline.job.ts
import cron from 'node-cron';

// Run daily at 6 AM
cron.schedule('0 6 * * *', async () => {
  console.log('Running deadline calculation job');
  
  // 1. Find upcoming deadlines
  const upcomingDeadlines = await deadlineRepo.findUpcoming();
  
  // 2. Create alerts for 30, 7, 1 day warnings
  for (const deadline of upcomingDeadlines) {
    const daysUntil = calculateDaysUntil(deadline.dueDate);
    
    if ([30, 7, 1].includes(daysUntil)) {
      await alertService.createAlert(deadline);
    }
  }
  
  // 3. Mark overdue deadlines
  await deadlineRepo.markOverdue();
});
```

### Phase 2: BullMQ (when needed)

```typescript
import { Queue, Worker } from 'bullmq';

const deadlineQueue = new Queue('deadlines', {
  connection: { host: 'localhost', port: 6379 }
});

// Add job
await deadlineQueue.add('calculate', { companyId });

// Process job
const worker = new Worker('deadlines', async (job) => {
  await processDeadlines(job.data.companyId);
});
```

---

## 10. API Design

### RESTful Endpoints

```
# Companies
POST   /companies                 # Create company
GET    /companies/:id             # Get company
PUT    /companies/:id             # Update company

# Auth
POST   /auth/login                # Login
POST   /auth/logout               # Logout
GET    /auth/me                   # Current user

# Obligations
GET    /obligations               # List (filtered by company)
GET    /obligations/:id           # Get one
POST   /obligations               # Create

# Controls
GET    /obligations/:id/controls  # Controls for obligation
POST   /controls                  # Create control

# Checks
POST   /controls/:id/checks       # Perform check
GET    /checks/:id                # Get check details

# Evidence
POST   /checks/:id/evidence       # Upload evidence
GET    /checks/:id/evidence       # List evidence

# Deadlines
GET    /deadlines/upcoming        # Upcoming deadlines
POST   /deadlines/:id/complete    # Mark complete

# Alerts
GET    /alerts                    # User alerts
POST   /alerts/:id/read           # Mark read

# Scoring
GET    /compliance/score          # Company score
```

### Response Format

```typescript
// Success
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-01-27T10:00:00Z"
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "OBLIGATION_NOT_FOUND",
    "message": "Obligation does not exist",
    "details": {}
  }
}
```

---

## 10.1. Error Handling Strategy

> [!WARNING]
> **Standardized error handling is critical for:**
> - Consistent UX across all modules
> - Easier debugging and monitoring
> - Localized error messages (FR/AR)
> - Compliance with Tunisia data protection

### Error Code Taxonomy

All errors follow the format: `CATEGORY_XXX` where XXX is a unique number.

```typescript
// shared/errors.ts
export enum ErrorCode {
  // ============ AUTHENTICATION (AUTH_XXX) ============
  AUTH_INVALID_CREDENTIALS = 'AUTH_001',
  AUTH_TOKEN_EXPIRED = 'AUTH_002',
  AUTH_TOKEN_INVALID = 'AUTH_003',
  AUTH_USER_INACTIVE = 'AUTH_004',
  AUTH_USER_NOT_FOUND = 'AUTH_005',
  AUTH_INSUFFICIENT_PERMISSIONS = 'AUTH_006',
  
  // ============ VALIDATION (VAL_XXX) ============
  VAL_REQUIRED_FIELD = 'VAL_001',
  VAL_INVALID_EMAIL = 'VAL_002',
  VAL_INVALID_TAX_ID = 'VAL_003',      // Tunisia: XXXXXXX/X/A/M/XXX
  VAL_INVALID_CNSS_ID = 'VAL_004',     // Tunisia: numeric format
  VAL_INVALID_DATE = 'VAL_005',
  VAL_FILE_TOO_LARGE = 'VAL_006',      // > 10MB
  VAL_INVALID_FILE_TYPE = 'VAL_007',   // Not PDF/image
  VAL_INVALID_PHONE = 'VAL_008',       // Tunisia: +216XXXXXXXX
  
  // ============ BUSINESS LOGIC (BIZ_XXX) ============
  BIZ_COMPANY_NOT_FOUND = 'BIZ_001',
  BIZ_OBLIGATION_NOT_FOUND = 'BIZ_002',
  BIZ_DEADLINE_ALREADY_COMPLETED = 'BIZ_003',
  BIZ_DEADLINE_NOT_FOUND = 'BIZ_004',
  BIZ_CONTROL_NOT_FOUND = 'BIZ_005',
  BIZ_CHECK_NOT_FOUND = 'BIZ_006',
  BIZ_EVIDENCE_NOT_FOUND = 'BIZ_007',
  BIZ_AUDIT_EXPIRED = 'BIZ_008',
  BIZ_DUPLICATE_ENTRY = 'BIZ_009',
  BIZ_INVALID_TRANSITION = 'BIZ_010',  // e.g., can't complete overdue deadline
  
  // ============ AUTHORIZATION (AUTHZ_XXX) ============
  AUTHZ_ACCESS_DENIED = 'AUTHZ_001',
  AUTHZ_COMPANY_MISMATCH = 'AUTHZ_002', // User accessing other company's data
  AUTHZ_ROLE_INSUFFICIENT = 'AUTHZ_003', // EMPLOYEE trying to delete obligation
  
  // ============ SYSTEM (SYS_XXX) ============
  SYS_DATABASE_ERROR = 'SYS_001',
  SYS_FILE_STORAGE_ERROR = 'SYS_002',
  SYS_EMAIL_SEND_FAILED = 'SYS_003',
  SYS_INTERNAL_ERROR = 'SYS_999',
  
  // ============ RATE LIMITING (RATE_XXX) ============
  RATE_TOO_MANY_REQUESTS = 'RATE_001',
  RATE_QUOTA_EXCEEDED = 'RATE_002',     // Monthly upload limit
}
```

### Localized Error Messages

```typescript
// shared/error-messages.ts
export const errorMessages = {
  fr: {
    // Authentication
    AUTH_001: "Email ou mot de passe incorrect",
    AUTH_002: "Votre session a expiré. Veuillez vous reconnecter",
    AUTH_003: "Token d'authentification invalide",
    AUTH_004: "Votre compte est désactivé. Contactez l'administrateur",
    AUTH_006: "Vous n'avez pas les permissions nécessaires",
    
    // Validation
    VAL_001: "Le champ {{field}} est obligatoire",
    VAL_002: "L'adresse email est invalide",
    VAL_003: "Le matricule fiscal doit être au format XXXXXXX/X/A/M/XXX",
    VAL_004: "L'identifiant CNSS est invalide",
    VAL_006: "Le fichier est trop volumineux (max 10 Mo)",
    VAL_007: "Type de fichier non autorisé. Utilisez PDF, JPG ou PNG",
    VAL_008: "Le numéro de téléphone doit être au format +216XXXXXXXX",
    
    // Business Logic
    BIZ_001: "Entreprise introuvable",
    BIZ_002: "Obligation introuvable",
    BIZ_003: "Cette échéance est déjà marquée comme terminée",
    BIZ_008: "L'audit a expiré. Veuillez renouveler",
    BIZ_009: "Cette entrée existe déjà",
    
    // Authorization
    AUTHZ_001: "Accès refusé",
    AUTHZ_002: "Vous ne pouvez pas accéder aux données d'une autre entreprise",
    AUTHZ_003: "Votre rôle ne permet pas cette action",
    
    // System
    SYS_001: "Erreur de base de données. Veuillez réessayer",
    SYS_003: "Impossible d'envoyer l'email. Vérifiez votre connexion",
    SYS_999: "Erreur interne du serveur",
    
    // Rate limiting
    RATE_001: "Trop de requêtes. Veuillez patienter",
  },
  
  ar: {
    // Authentication
    AUTH_001: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    AUTH_002: "انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى",
    AUTH_003: "رمز المصادقة غير صالح",
    AUTH_004: "تم تعطيل حسابك. اتصل بالمسؤول",
    AUTH_006: "ليس لديك الأذونات اللازمة",
    
    // Validation
    VAL_001: "الحقل {{field}} مطلوب",
    VAL_002: "عنوان البريد الإلكتروني غير صالح",
    VAL_003: "يجب أن يكون المعرف الضريبي بالصيغة XXXXXXX/X/A/M/XXX",
    VAL_006: "الملف كبير جدًا (الحد الأقصى 10 ميجابايت)",
    VAL_007: "نوع الملف غير مسموح. استخدم PDF أو JPG أو PNG",
    
    // Business Logic
    BIZ_001: "الشركة غير موجودة",
    BIZ_002: "الالتزام غير موجود",
    BIZ_003: "تم بالفعل وضع علامة على هذا الموعد النهائي كمكتمل",
    
    // Authorization
    AUTHZ_001: "تم رفض الوصول",
    AUTHZ_002: "لا يمكنك الوصول إلى بيانات شركة أخرى",
    
    // System
    SYS_999: "خطأ في الخادم الداخلي",
    RATE_001: "طلبات كثيرة جدًا. يرجى الانتظار",
  }
};
```

### Error Response Structure

```typescript
// All API errors follow this structure
interface ApiError {
  success: false;
  error: {
    code: ErrorCode;
    message: string;            // Localized
    field?: string;             // For validation errors
    details?: Record<string, any>;
    timestamp: string;
    requestId: string;          // For support/debugging
  };
}

// Example error responses
{
  "success": false,
  "error": {
    "code": "VAL_003",
    "message": "Le matricule fiscal doit être au format XXXXXXX/X/A/M/XXX",
    "field": "taxId",
    "details": {
      "provided": "123456",
      "expected": "XXXXXXX/X/A/M/XXX"
    },
    "timestamp": "2026-01-27T15:30:00Z",
    "requestId": "req_abc123"
  }
}

{
  "success": false,
  "error": {
    "code": "AUTHZ_002",
    "message": "Vous ne pouvez pas accéder aux données d'une autre entreprise",
    "details": {
      "yourCompanyId": "comp_123",
      "attemptedAccess": "comp_456"
    },
    "timestamp": "2026-01-27T15:30:00Z",
    "requestId": "req_def456"
  }
}
```

### Backend Error Handling

```typescript
// shared/errors.ts
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public statusCode: number,
    public field?: string,
    public details?: Record<string, any>
  ) {
    super(code);
    this.name = 'AppError';
  }
}

// Factory functions for common errors
export const Errors = {
  invalidCredentials: () => 
    new AppError(ErrorCode.AUTH_INVALID_CREDENTIALS, 401),
  
  companyNotFound: (companyId: string) =>
    new AppError(ErrorCode.BIZ_COMPANY_NOT_FOUND, 404, undefined, { companyId }),
  
  invalidTaxId: (provided: string) =>
    new AppError(ErrorCode.VAL_INVALID_TAX_ID, 400, 'taxId', { 
      provided, 
      expected: 'XXXXXXX/X/A/M/XXX' 
    }),
  
  accessDenied: (reason?: string) =>
    new AppError(ErrorCode.AUTHZ_ACCESS_DENIED, 403, undefined, { reason }),
    
  companyMismatch: (userCompanyId: string, attemptedCompanyId: string) =>
    new AppError(ErrorCode.AUTHZ_COMPANY_MISMATCH, 403, undefined, {
      yourCompanyId: userCompanyId,
      attemptedAccess: attemptedCompanyId
    }),
};

// Global error handler middleware
// app.ts
app.setErrorHandler((error, request, reply) => {
  const requestId = request.id;
  
  // Log error for debugging
  logger.error({
    err: error,
    requestId,
    url: request.url,
    method: request.method,
    userId: request.user?.id,
  }, 'Request error');
  
  // Handle known AppError
  if (error instanceof AppError) {
    const lang = request.lang || 'fr';
    let message = errorMessages[lang][error.code] || error.code;
    
    // Replace placeholders (e.g., {{field}})
    if (error.field) {
      message = message.replace('{{field}}', error.field);
    }
    
    return reply.status(error.statusCode).send({
      success: false,
      error: {
        code: error.code,
        message,
        field: error.field,
        details: error.details,
        timestamp: new Date().toISOString(),
        requestId,
      }
    });
  }
  
  // Handle validation errors (Zod, etc.)
  if (error.validation) {
    return reply.status(400).send({
      success: false,
      error: {
        code: ErrorCode.VAL_REQUIRED_FIELD,
        message: 'Validation error',
        details: error.validation,
        timestamp: new Date().toISOString(),
        requestId,
      }
    });
  }
  
  // Unknown error - don't leak details
  logger.error({ err: error, requestId }, 'Unhandled error');
  return reply.status(500).send({
    success: false,
    error: {
      code: ErrorCode.SYS_INTERNAL_ERROR,
      message: 'Une erreur est survenue',
      timestamp: new Date().toISOString(),
      requestId,
    }
  });
});
```

### Frontend Error Handling

```typescript
// utils/api.ts
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': i18n.language,
        ...options?.headers,
      },
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new ApiError(data.error);
    }
    
    return data.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network error
    throw new ApiError({
      code: 'SYS_NETWORK_ERROR',
      message: 'Impossible de contacter le serveur',
    });
  }
}

class ApiError extends Error {
  constructor(public error: {
    code: string;
    message: string;
    field?: string;
    details?: any;
  }) {
    super(error.message);
    this.name = 'ApiError';
  }
}

// Component usage
const MyComponent = () => {
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async () => {
    try {
      await apiRequest('/obligations', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      toast.success('Obligation créée');
    } catch (err) {
      if (err instanceof ApiError) {
        // Show localized error
        setError(err.error.message);
        
        // Field-specific error
        if (err.error.field) {
          setFieldError(err.error.field, err.error.message);
        }
        
        // Handle specific errors
        if (err.error.code === 'AUTH_002') {
          // Token expired - redirect to login
          navigate('/login');
        }
      } else {
        setError('Une erreur est survenue');
      }
    }
  };
};
```

### UX Error Patterns

#### Toast Notifications (Temporary)
```typescript
// For non-critical errors
toast.error('Le fichier est trop volumineux');
toast.warning('Cette échéance est bientôt due');
toast.success('Échéance marquée comme terminée');
```

#### Inline Form Errors (Field-specific)
```jsx
<Input
  name="taxId"
  error={errors.taxId?.message}
  helperText="Format: XXXXXXX/X/A/M/XXX"
/>
```

#### Error Boundaries (Critical)
```jsx
// For unrecoverable errors
<ErrorBoundary
  fallback={
    <div>
      <h1>Une erreur est survenue</h1>
      <p>Veuillez recharger la page</p>
      <button onClick={() => window.location.reload()}>
        Recharger
      </button>
    </div>
  }
>
  <App />
</ErrorBoundary>
```

### Tunisia-Specific Validations

```typescript
// utils/validators.ts

// Matricule fiscal: XXXXXXX/X/A/M/XXX
export function validateTaxId(taxId: string): boolean {
  const regex = /^\d{7}\/[A-Z]\/[A-Z]\/[A-Z]\/\d{3}$/;
  return regex.test(taxId);
}

// CNSS: numeric
export function validateCNSSId(cnssId: string): boolean {
  const regex = /^\d{7,10}$/;
  return regex.test(cnssId);
}

// Tunisia phone: +216XXXXXXXX (8 digits after +216)
export function validateTunisiaPhone(phone: string): boolean {
  const regex = /^\+216[2-9]\d{7}$/;
  return regex.test(phone);
}

// Zod schemas
import { z } from 'zod';

export const CompanySchema = z.object({
  legalName: z.string().min(3, 'Minimum 3 caractères'),
  taxId: z.string().refine(validateTaxId, {
    message: 'Format invalide: XXXXXXX/X/A/M/XXX'
  }),
  cnssId: z.string().refine(validateCNSSId, {
    message: 'Identifiant CNSS invalide'
  }).optional(),
  phone: z.string().refine(validateTunisiaPhone, {
    message: 'Format invalide: +216XXXXXXXX'
  }).optional(),
});
```

### Error Monitoring

```typescript
// Integration with Sentry
import * as Sentry from '@sentry/node';

app.setErrorHandler((error, request, reply) => {
  // Send to Sentry for 5xx errors
  if (error.statusCode >= 500) {
    Sentry.captureException(error, {
      user: {
        id: request.user?.id,
        companyId: request.user?.companyId,
      },
      tags: {
        errorCode: error.code,
      },
      extra: {
        requestId: request.id,
        url: request.url,
      },
    });
  }
  
  // Continue with error response...
});
```

### Critical Error Handling Rules

> [!WARNING]
> **Developers MUST follow these rules:**

1. ✅ **Never expose stack traces** to users (security risk)
2. ✅ **Always log `requestId`** for support debugging
3. ✅ **Localize all user-facing errors** (FR/AR)
4. ✅ **Use typed error codes** - no free text errors
5. ✅ **Validate Tunisia-specific formats** (Tax ID, CNSS)
6. ✅ **Rate limit error responses** - prevent enumeration attacks
7. ✅ **Monitor error rates** - alert on spike
8. ✅ **Graceful degradation** - app remains usable even with errors

---

## 11. Security Measures

| Layer | Implementation |
|-------|----------------|
| **Authentication** | JWT tokens (15min access, 7day refresh) |
| **Authorization** | Role-based middleware checks |
| **Data Isolation** | All queries filtered by `companyId` |
| **Passwords** | Bcrypt hash (salt rounds: 12) |
| **HTTPS** | Enforce TLS 1.3 in production |
| **Rate Limiting** | Fastify rate-limit plugin |
| **Input Validation** | Zod schemas on all endpoints |
| **SQL Injection** | Parameterized queries only |
| **XSS** | Content Security Policy headers |

---

## 12. Deployment Architecture (MVP)

```
┌─────────────────────────────────────────────────┐
│             Cloudflare (CDN + WAF)              │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│       Nginx (Reverse Proxy + SSL)               │
└─────────────────────────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
         ▼                         ▼
┌─────────────────┐      ┌─────────────────┐
│   Backend App   │      │   Backend App   │
│   (PM2/Docker)  │      │   (PM2/Docker)  │
└─────────────────┘      └─────────────────┘
         │                         │
         └────────────┬────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │    PostgreSQL 15       │
         │    (Primary + Replica) │
         └────────────────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │    MinIO Storage       │
         └────────────────────────┘
```

### Hosting Options (Tunisia Compliance)

1. **Tunisia Cloud** - Local provider, data sovereignty
2. **OVH Graveline (France)** - EU GDPR compliant
3. **Hetzner Germany** - Cost-effective, EU-based

---

## 13. Monitoring & Observability

### MVP Stack

- **Logging**: Pino → Local files → Loki (later)
- **Errors**: Sentry (free tier)
- **Uptime**: UptimeRobot
- **Metrics**: Fastify built-in metrics → Prometheus (later)

```typescript
// logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
});

// app.ts
app.addHook('preHandler', (req, reply, done) => {
  req.log.info({ url: req.url, method: req.method }, 'Request received');
  done();
});
```

---

## 14. Testing Strategy

| Type | Tool | Coverage Target |
|------|------|-----------------|
| **Unit** | Vitest | 80%+ for services |
| **Integration** | Supertest + Vitest | Critical API endpoints |
| **E2E** | Playwright | Key user flows |
| **Load** | k6 | (Phase 2) |

```typescript
// company.service.test.ts
import { describe, it, expect } from 'vitest';
import { CompanyService } from './company.service';

describe('CompanyService', () => {
  it('should create company', async () => {
    const service = new CompanyService(mockRepo);
    const company = await service.create({...});
    expect(company.id).toBeDefined();
  });
});
```

---

## 15. Phase 2 Evolution Path

### When to Scale

| Pain Point | Solution |
|-----------|----------|
| **Heavy background jobs** | Extract to separate worker service + Redis queue |
| **Search performance** | Add Elasticsearch for regulations/obligations |
| **High traffic** | Add Redis caching layer |
| **File storage scale** | Migrate to S3 or distributed MinIO |
| **Module coupling** | Extract module to microservice |
| **Database load** | Read replicas, connection pooling (PgBouncer) |

### Microservice Extraction Example

```
Current: Monolith with evidence module

Phase 2: 
  - Extract evidence to separate service
  - Communicate via HTTP/gRPC
  - Independent scaling
  - Own database if needed
```

---

## 16. Development Workflow

### Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Setup PostgreSQL (Docker)
docker run -d \
  --name comply-db \
  -e POSTGRES_PASSWORD=dev \
  -p 5432:5432 \
  postgres:15

# 3. Run migrations
npm run db:migrate

# 4. Seed data (optional)
npm run db:seed

# 5. Start dev server
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/comply

# Auth
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=15m

# File Storage
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# App
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug
```

---

## 17. Critical Rules for Developers

> [!WARNING]
> **Agents and developers MUST follow these rules:**

1. ✅ **Module isolation** - No cross-module imports of repos/services
2. ✅ **Repository pattern** - Database logic ONLY in repos
3. ✅ **Service layer** - Business logic ONLY in services
4. ✅ **Auth middleware** - Apply to ALL protected routes
5. ✅ **CompanyId filter** - EVERY query must filter by companyId
6. ✅ **Input validation** - Use Zod schemas, never trust client
7. ✅ **Error handling** - Try/catch in routes, structured errors
8. ✅ **Logging** - Log important events, not everything
9. ✅ **Type safety** - TypeScript strict mode, no `any`
10. ✅ **Migrations** - Database changes via migrations, never manual SQL

---

## 18. Success Metrics (MVP)

| Metric | Target |
|--------|--------|
| **Page load** | < 2s |
| **API response** | < 200ms (p95) |
| **Uptime** | > 99.5% |
| **Database queries** | < 50ms (p95) |
| **Test coverage** | > 70% |

---

## 19. Next Steps

### Implementation Order

1. ✅ Setup backend skeleton (Fastify + TypeScript)
2. ✅ Database setup (PostgreSQL + Prisma)
3. ✅ Implement Company module
4. ✅ Implement Users + Auth
5. ✅ Implement Obligations
6. ✅ Implement Controls → Checks → Evidence
7. ✅ Implement Deadlines + Alerts
8. ✅ Implement Scoring
9. ✅ Frontend integration
10. ✅ Testing + Deployment

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-27  
**Maintained By**: Architecture Team

**Next Document**: See [DATA_MODEL_V2.md](./DATA_MODEL_V2.md) for entity definitions
