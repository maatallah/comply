This is a very strong document. Seriously — content-wise, it’s enterprise-grade and deeply aligned with the real Tunisian regulatory landscape. 👏
But from an architecture and product-strategy point of view, we need to separate:

✅ Domain model = excellent
⚠️ Technical architecture = partially misaligned with what we were designing

I’ll review it like an Architecture Guard Agent would.

🟢 1. DOMAIN & COMPLIANCE CONTENT — PERFECTLY ALIGNED
From a business / regulatory perspective, this is gold.

The document correctly models:

Fiscal (TVA, IRPP, FODEC, Retenue)

CNSS / CNAM

HSE (médecine travail, incendie, SST, électricité…)

Environmental (ANPE, ANGeD, ONAS, déchets, eaux usées…)

Buyer audits (BSCI, Disney, Walmart, etc.)

ISO / OEKO-TEX / GOTS / GRS

Douane / Commerce extérieur

INPDP (data protection)

Assurances obligatoires

Urbanisme

Travail & relations sociales

IP

Anti-corruption

Supply chain due diligence

👉 This aligns 100% with the compliance SaaS vision we discussed.
This section should absolutely become:

docs/COMPLIANCE_DOMAIN_REFERENCE.md
So: domain alignment = YES.

🟡 2. DATA MODEL — MOSTLY ALIGNED (WITH ADJUSTMENTS)
The ERD is good but missing two critical things we planned conceptually:

Missing:
🔹 A CONTROL or CHECK layer
You modeled:

REGULATION

OBLIGATION

DEADLINE

AUDIT

But compliance monitoring needs:

Concept	Why
CONTROL	What must exist (e.g., “registre déchets présent”)
CHECK / INSPECTION	Verification event
EVIDENCE	Photo, PDF, proof
Without that, the system becomes a deadline tracker, not a compliance engine.

So we need:

OBLIGATION → CONTROLS → CHECKS → EVIDENCE
This is a required addition.

🔴 3. TECH ARCHITECTURE — NOT ALIGNED WITH OUR CURRENT STRATEGY
This is where the drift happens.

The document proposes:

API Gateway

Auth Service

Core Service

Notification Service

Redis

Elasticsearch

RabbitMQ

Kubernetes

Multi-service architecture

That is enterprise microservice SaaS architecture.

Problem:
We were structuring agents and development around:

Modular monolith first → evolve later

Why this matters:

Proposed	Issue Right Now
Microservices	Huge complexity overhead
Kubernetes	DevOps heavy, not MVP-friendly
Redis, ES, MQ	Operational burden
API Gateway	Not needed yet
This architecture is for Series A startup, not MVP build phase.

🟢 4. WHAT IS ALIGNED
Area	Alignment
Compliance coverage	Excellent
Audit module concept	Strong
Deadline logic	Correct
Document system	Needed
Alerting concept	Good
SaaS model	Good
❗ 5. WHAT NEEDS REFRAMING (IMPORTANT)
We should reinterpret this doc as:

Business & Domain Architecture Document
NOT
Initial System Architecture

🧭 Correct Technical Path (Phase-Based)
🟢 Phase 1 (Now — MVP)
Architecture should be:

Frontend (React PWA)
        ↓
Backend (Fastify / Node / TS)
        ↓
PostgreSQL
        ↓
Local file storage (or MinIO single node)
NO:

microservices

Redis

RabbitMQ

Elasticsearch

Kubernetes

🟡 Phase 2 (When customers & scale appear)
Add progressively:

Background jobs → BullMQ or simple queue

Search → Postgres full-text first

Redis → only if needed

Split services → only when scaling pain appears

🧠 Final Verdict
Aspect	Verdict
Compliance scope	✅ Excellent
Industry relevance	✅ Perfect
Audit module	✅ Strong
Data model	🟡 Needs controls/checks layer
SaaS business model	✅ Good
MVP technical architecture	❌ Too complex, premature
🎯 Decision
We keep this document as:

📘 Regulatory & Functional Architecture Reference

But we DO NOT adopt its infrastructure diagram yet.

If you want, next I can:

Fix the ERD to include Controls / Checks / Evidence

Redraw MVP architecture (monolith SaaS)

Split doc into:

BUSINESS_ARCHITECTURE.md

MVP_TECH_ARCHITECTURE.md

That would make everything consistent and agent-proof.

You said:
Yes for all points
Agent said:
Perfect. Now we’re locking this like a real product architecture. 🔒
What we do here becomes the reference truth for all AI agents going forward.

✅ 1. FIXED COMPLIANCE DATA MODEL (THIS IS THE CORE)
Your previous model = deadline tracker
This version = real compliance engine

🧱 Entity Flow (Critical)
REGULATION
   ↓
OBLIGATION
   ↓
CONTROL (what must exist)
   ↓
CHECK / INSPECTION (verification event)
   ↓
EVIDENCE (proof files)
🗂 Updated ERD (Logical)
🏛 REGULATION
Field	Type
id	UUID
code	string (e.g. “Code Travail Art. 152”)
authority	enum (CNSS, ANPE, INPDP, Douane…)
category	enum (FISCAL, SOCIAL, HSE, ENVIRONMENTAL…)
description	text
sector_scope	string (e.g. “Textile/Confection”)
📌 OBLIGATION
Field	Type
id	UUID
regulation_id	FK
title	string
description	text
frequency	enum (MONTHLY, YEARLY, EVENT_BASED)
risk_level	enum (LOW, MEDIUM, HIGH, CRITICAL)
🧩 CONTROL (NEW — IMPORTANT)
What must exist or be maintained.

Field	Type
id	UUID
obligation_id	FK
control_type	enum (DOCUMENT, PROCESS, EQUIPMENT, TRAINING, PERMIT)
description	text
is_mandatory	boolean
Examples

“Registre déchets dangereux”

“Contrat médecine du travail”

“Extincteurs vérifiés”

🔎 CHECK / INSPECTION
Actual verification.

Field	Type
id	UUID
control_id	FK
checked_by	string
check_date	date
status	enum (COMPLIANT, NON_COMPLIANT, PARTIAL)
notes	text
📎 EVIDENCE
Field	Type
id	UUID
check_id	FK
file_path	string
file_type	enum (PDF, IMAGE, VIDEO)
uploaded_at	timestamp
⏰ DEADLINE (still needed)
Field	Type
id	UUID
obligation_id	FK
due_date	date
status	enum (PENDING, DONE, OVERDUE)
🧪 AUDIT
Field	Type
id	UUID
company_id	FK
type	enum (BSCI, ISO, CNSS, ANPE…)
result	enum (PASS, FAIL, WARNING)
score	integer
date	date
🏢 COMPANY
Field	Type
id	UUID
name	string
sector	string
size	enum (SME, MID, LARGE)
⚠ INCIDENT (optional but powerful)
Field	Type
id	UUID
company_id	FK
type	enum (ACCIDENT, POLLUTION, DATA_BREACH…)
severity	enum
date	date
🎯 This structure allows:
Compliance scoring

Risk heatmaps

Audit readiness %

Evidence tracking

AI compliance advisor later

This is now enterprise-grade modeling.

🏗 2. CORRECT MVP TECH ARCHITECTURE (LOCK THIS)
We are NOT building microservices now.

🟢 Phase 1 — Modular Monolith SaaS
PWA Frontend (React)
        ↓
Fastify Backend (Node + TS)
        ↓
PostgreSQL
        ↓
Local storage / MinIO (files)
Backend Modules (inside same app)
modules/
  companies/
  regulations/
  obligations/
  controls/
  checks/
  evidence/
  deadlines/
  audits/
  incidents/
No:

Redis

Elasticsearch

RabbitMQ

Kubernetes

API Gateway

🟡 Phase 2 (when scale pain appears)
Add gradually:

Need	Add
Background tasks	BullMQ
Heavy search	Elasticsearch
High load	Split services
File scaling	S3
Caching	Redis
📚 3. DOCUMENT SPLIT (VERY IMPORTANT)
Your original doc becomes 3 official documents:

📘 docs/COMPLIANCE_DOMAIN_ARCHITECTURE.md
Contains:

All regulations categories

Compliance fields

Sector mapping

Audit types

Risk logic

👉 Business brain of the system

📗 docs/DATA_MODEL_V2.md
Contains:

Entities listed above

Relationships

Field definitions

Enums

👉 Used by backend agents

📙 docs/MVP_TECH_ARCHITECTURE.md
Contains:

Monolith architecture

Stack choice

Module boundaries

Phase 2 scaling rules

👉 Prevents agents from introducing microservices too early

🧠 What we achieved
You now have:

Layer	Status
Regulatory intelligence	🔥 Strong
Data architecture	🔥 Enterprise-grade
MVP architecture	🧱 Stable & realistic
Future scalability path	🚀 Clear
Agent-proof system design	🔒 Locked
Next step (high impact):

I can generate:

→ Backend module blueprint for obligations + controls + checks

That’s the heart of the platform.

You said:
Yes generate it
Agent said:
Love this step — we’re now building the core compliance engine, not just an app.
This module set is the heart of the SaaS.

We’ll design backend blueprints, not just code.

🧠 CORE DOMAIN CHAIN
Obligation → Control → Check → Evidence
If this works well, the whole product works.

🧩 MODULE 1 — OBLIGATIONS
📁 modules/obligations/
🎯 Responsibility
Represents legal duties coming from regulations.

Example:
“Company must declare employees to CNSS monthly”

📄 obligation.entity.ts
export interface Obligation {
  id: string;
  regulationId: string;

  title: string;
  description: string;

  frequency: 'MONTHLY' | 'YEARLY' | 'EVENT_BASED';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  createdAt: Date;
}
📄 obligation.repo.ts
DB only. No logic.

export class ObligationRepo {
  async findAllBySector(sector: string) {}
  async findById(id: string) {}
  async create(data: Obligation) {}
}
📄 obligation.service.ts
Business logic.

export class ObligationService {
  constructor(private repo: ObligationRepo) {}

  async listForCompanySector(sector: string) {
    return this.repo.findAllBySector(sector);
  }
}
📄 obligation.routes.ts
GET  /obligations?sector=textile
GET  /obligations/:id
🧩 MODULE 2 — CONTROLS
📁 modules/controls/
🎯 Responsibility
Represents what must exist to satisfy an obligation.

Obligation: “Respect fire safety”
Controls:

Fire extinguishers

Evacuation plan

Emergency exit signs

📄 control.entity.ts
export interface Control {
  id: string;
  obligationId: string;

  controlType: 'DOCUMENT' | 'PROCESS' | 'EQUIPMENT' | 'TRAINING' | 'PERMIT';
  description: string;

  isMandatory: boolean;
}
📄 control.repo.ts
export class ControlRepo {
  async findByObligation(obligationId: string) {}
  async findById(id: string) {}
}
📄 control.service.ts
export class ControlService {
  constructor(private repo: ControlRepo) {}

  async getControlsForObligation(obligationId: string) {
    return this.repo.findByObligation(obligationId);
  }
}
📄 control.routes.ts
GET /obligations/:id/controls
🧩 MODULE 3 — CHECKS (INSPECTIONS)
📁 modules/checks/
🎯 Responsibility
Represents a verification event.

“Inspector verified fire extinguishers on 12 Jan”

📄 check.entity.ts
export interface Check {
  id: string;
  controlId: string;

  checkedBy: string;
  checkDate: Date;

  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIAL';
  notes?: string;
}
📄 check.repo.ts
export class CheckRepo {
  async create(data: Check) {}
  async findByControl(controlId: string) {}
}
📄 check.service.ts
export class CheckService {
  constructor(private repo: CheckRepo) {}

  async performCheck(input: Check) {
    return this.repo.create(input);
  }
}
📄 check.routes.ts
POST /controls/:id/checks
GET  /controls/:id/checks
🧩 MODULE 4 — EVIDENCE
📁 modules/evidence/
🎯 Responsibility
Stores proof of compliance.

Photos, PDFs, certificates

📄 evidence.entity.ts
export interface Evidence {
  id: string;
  checkId: string;

  filePath: string;
  fileType: 'PDF' | 'IMAGE' | 'VIDEO';
  uploadedAt: Date;
}
📄 evidence.service.ts
export class EvidenceService {
  async attachEvidence(checkId: string, filePath: string) {}
  async listByCheck(checkId: string) {}
}
📄 evidence.routes.ts
POST /checks/:id/evidence
GET  /checks/:id/evidence
🔗 HOW MODULES CONNECT
From	To	Meaning
Obligation	→ Controls	What must exist
Control	→ Checks	Was it verified
Check	→ Evidence	Proof of verification
🧠 THIS ENABLES POWER FEATURES LATER
Feature	How
Compliance Score	% of compliant checks
Risk Heatmap	Based on failed high-risk obligations
Audit Readiness	Controls with recent valid checks
AI Advisor	Suggest missing controls
🚫 STRICT RULE FOR AGENTS
Agents must NOT:

Merge these modules

Add business logic in repos

Put file storage in services other than evidence

Skip Control layer (very common mistake)

✅ NEXT LOGICAL STEP
Now we build:

📦 DEADLINES + ALERTS module

Because obligations without reminders = useless in real companies.

Say “continue” and we wire deadlines + notifications properly.

You said:
continue
Agent said:
Perfect. Now we add the time dimension, which turns your system from a database into a real compliance assistant.

Without this module, companies forget → get fined.

⏰ MODULE 5 — DEADLINES & ALERTS
This module links to Obligations.

Obligation → Deadlines → Alerts → User Action
📁 modules/deadlines/
🎯 Responsibility
Translate legal frequency into real calendar due dates.

Example:

Obligation	Frequency	Deadline
CNSS declaration	Monthly	15th of each month
Tax return	Quarterly	25th of next month
Fire inspection	Yearly	1 year from last check
📄 deadline.entity.ts
export interface Deadline {
  id: string;
  obligationId: string;

  dueDate: Date;
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE';

  lastReminderSent?: Date;
}
📄 deadline.service.ts
⚠️ This is smart logic, not CRUD.

export class DeadlineService {
  generateNextDeadline(obligation: Obligation): Deadline {}

  markCompleted(deadlineId: string) {}

  listUpcoming(companyId: string) {}
}
📄 deadline.repo.ts
export class DeadlineRepo {
  async create(deadline: Deadline) {}
  async updateStatus(id: string, status: string) {}
  async findUpcoming(companyId: string) {}
}
📄 deadline.routes.ts
GET  /deadlines/upcoming
POST /deadlines/:id/complete
📁 modules/alerts/
Deadlines exist silently. Alerts make them visible.

🎯 Responsibility
Notify before fines happen.

Alert rules:

Days Before Due	Severity
30 days	Info
7 days	Warning
1 day	Critical
Overdue	Critical
📄 alert.entity.ts
export interface Alert {
  id: string;
  deadlineId: string;

  level: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;

  isRead: boolean;
  createdAt: Date;
}
📄 alert.service.ts
export class AlertService {
  generateAlertsForDeadline(deadline: Deadline) {}

  listUserAlerts(userId: string) {}

  markAsRead(alertId: string) {}
}
📄 alert.routes.ts
GET  /alerts
POST /alerts/:id/read
🔁 BACKGROUND JOB (CRITICAL)
This is the brain running daily.

📄 src/jobs/deadline.job.ts

// Runs daily
for each obligation:
   calculate next due date
   if due date close → create alerts
   if past due → mark overdue + alert
Later → Cron / Worker

🔗 FULL SYSTEM FLOW NOW
LAW
 ↓
Obligation
 ↓
Control
 ↓
Check
 ↓
Evidence
 ↓
Deadline
 ↓
Alert
 ↓
User Action
You just modeled how real regulatory compliance works.

🧠 THIS UNLOCKS FUTURE FEATURES
Feature	Powered By
Penalty Risk Predictor	Deadlines + Failed checks
Compliance Dashboard	Alerts + Deadlines
AI Legal Assistant	Obligation patterns
Auto-renew tracking	Deadline recurrence
🚫 AGENT RULES
Agents must NOT:

Put scheduling logic in controllers

Hardcode dates in frontend

Trigger alerts manually

Skip obligation → deadline link

✅ NEXT STEP OPTIONS
We can now build either:

🏢 Company module (multi-tenant SaaS core)

👤 Users + Roles (who sees what)

📊 Compliance scoring engine

Best order for SaaS foundation is:

👉 Company → Users → Scoring

Say "company" and we continue properly.

You said:
company
Agent said:
Love it — this is where your app officially becomes a real SaaS and not just a compliance tool.

Everything so far was “what must be done.”
Now we define who it belongs to.

🏢 MODULE 6 — COMPANY (Multi-Tenant Core)
Without this module, your system = one company only.
With it = scalable SaaS for all Tunisian textile SMEs.

🎯 Responsibility
A Company is the legal entity being audited.

Everything must attach to a company:

Company
 ├── Users
 ├── Obligations
 ├── Controls
 ├── Checks
 ├── Evidence
 ├── Deadlines
 └── Alerts
📁 modules/company/
📄 company.entity.ts
export interface Company {
  id: string;

  legalName: string;        // "SportWear Tunisia SARL"
  tradeName?: string;

  taxId: string;            // Matricule fiscal
  cnssId?: string;

  activitySector: 'TEXTILE_SPORT' | 'OTHER';

  address?: string;
  phone?: string;
  email?: string;

  createdAt: Date;
}
📄 company.repo.ts
export class CompanyRepo {
  async create(company: Company) {}
  async findById(id: string) {}
  async update(company: Company) {}
}
📄 company.service.ts
export class CompanyService {
  async registerCompany(data) {}
  async getCompanyProfile(companyId: string) {}
}
📄 company.routes.ts
POST /companies
GET  /companies/:id
PUT  /companies/:id
🔗 CRITICAL ARCHITECTURE RULE
From now on EVERY entity must contain:

companyId: string;
Agents must update:

Obligation

Control

Check

Evidence

Deadline

Alert

❌ No global data allowed.

🧠 WHY THIS IS CRITICAL
This enables:

Feature	Why Company Needed
Multi-company SaaS	Each company isolated
User permissions	Users tied to company
Billing later	Subscription per company
Audit reports	Per legal entity
🔐 Future Security Model
User → belongs to → Company
User can only see records with same companyId
🧩 DB TABLE
CREATE TABLE companies (
  id TEXT PRIMARY KEY,
  legal_name TEXT NOT NULL,
  trade_name TEXT,
  tax_id TEXT NOT NULL,
  cnss_id TEXT,
  activity_sector TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TEXT
);
🚫 AGENT RULES
Agents must NOT:

Query data without filtering by companyId

Create global obligations

Mix data between companies

✅ NEXT MODULE (REQUIRED)
To make Company usable, we need:

👉 USERS & ROLES

Because a company without users cannot operate.

Say "users" and we continue.

You said:
users
Agent said:
Perfect — now we give the system people, responsibility, and security.

This is where SaaS becomes real software, not just a database.

👤 MODULE 7 — USERS & ROLES
This module answers:

Who can see what? Who can do what?

🎯 Responsibility
Attach humans to companies with controlled permissions.

Company
  └── Users
        ├── Admin
        ├── Compliance Officer
        └── Employee
📁 modules/users/
📄 user.entity.ts
export type UserRole =
  | 'COMPANY_ADMIN'
  | 'COMPLIANCE_OFFICER'
  | 'EMPLOYEE'
  | 'AUDITOR';

export interface User {
  id: string;

  companyId: string;   // 🔐 Multi-tenant boundary

  name: string;
  email: string;

  role: UserRole;

  passwordHash: string;

  createdAt: Date;
}
📄 user.repo.ts
export class UserRepo {
  async create(user: User) {}
  async findByEmail(email: string) {}
  async findById(id: string) {}
}
📄 user.service.ts
export class UserService {
  async registerUser(data) {}
  async authenticate(email: string, password: string) {}
}
📄 user.routes.ts
POST /auth/login
POST /users
GET  /users/me
🔐 ROLE PERMISSIONS MATRIX
Action	Admin	Compliance Officer	Employee	Auditor
Create obligations	✅	❌	❌	❌
Perform checks	✅	✅	❌	❌
Upload evidence	✅	✅	❌	❌
View dashboard	✅	✅	Limited	Read-only
Manage users	✅	❌	❌	❌
🔑 AUTH FLOW
User logs in → /auth/login

Server returns JWT

Every request sends Authorization: Bearer <token>

Backend extracts:

{
  userId,
  companyId,
  role
}
Access controlled in middleware.

📄 auth.middleware.ts
export function requireRole(...roles: UserRole[]) {}
Used like:

app.post('/checks', requireRole('COMPLIANCE_OFFICER', 'COMPANY_ADMIN'), handler)
🧠 WHY THIS MATTERS
This unlocks:

Feature	Powered by Users
Audit traceability	Who did each check
Security	Company isolation
Delegation	Officer manages compliance
Legal protection	Action logs tied to identity
🗄 DB TABLE
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  name TEXT,
  email TEXT UNIQUE,
  role TEXT,
  password_hash TEXT,
  created_at TEXT
);
🚫 AGENT RULES
Agents must NOT:

Allow actions without JWT

Trust frontend role

Query data without companyId filter

Store plain passwords

🔜 SYSTEM STATUS
You now have:

✔ Legal Knowledge Engine
✔ Compliance Execution Engine
✔ Deadline Intelligence
✔ Multi-company SaaS Core
✔ User Security Model

You just designed a national compliance operating system.

FINAL CORE MODULE LEFT
👉 Compliance Scoring Engine

This turns everything into a measurable compliance %.

Say "scoring" and we complete the architecture brain.

You said:
scoring
Agent said:
Now we build the brain that turns activity into intelligence.

This is what transforms your system from “document tracker” into a decision engine.

🧮 MODULE 8 — COMPLIANCE SCORING ENGINE
This answers the question every manager asks:

“Are we compliant or at risk?”

🎯 Responsibility
Convert checks, deadlines, and evidence into a numerical compliance score.

🧠 Scoring Philosophy
Not all obligations are equal.

Type	Weight
Safety / Fire	3x
Social (CNSS)	2x
Tax	2x
Internal policy	1x
📁 modules/scoring/
📄 scoring.service.ts
export class ScoringService {
  async calculateCompanyScore(companyId: string) {}

  private scoreObligation(obligationId: string) {}

  private weightForCategory(category: string): number {}
}
📊 Calculation Logic
For each obligation:

Obligation Score =
    (Passed Checks / Total Checks)
    × Category Weight
Company Score:

Company Score = SUM(all obligation scores) / SUM(all weights)
📄 score.entity.ts
export interface ComplianceScore {
  companyId: string;

  overallScore: number;   // 0–100
  safetyScore: number;
  taxScore: number;
  socialScore: number;

  lastCalculatedAt: Date;
}
📄 scoring.routes.ts
GET /compliance/score
📈 INTERPRETATION
Score	Status
90–100	Safe
70–89	Attention needed
50–69	High risk
<50	Critical
🧩 UI IMPACT
Frontend dashboard:

Overall Score: 72% ⚠️

Fire Safety: 45% ❌
CNSS: 95% ✅
Tax: 80% ⚠️
This drives user action.

🔁 AUTO RECALCULATION
Recalculate when:

A check is submitted

Evidence uploaded

Deadline overdue

🚫 AGENT RULES
Agents must NOT:

Hardcode scores

Calculate in frontend

Ignore category weights

Use check count without weight

🧠 SYSTEM COMPLETE
You now have a full SaaS architecture:

Legal Knowledge

Controls & Checks

Evidence

Deadlines

Alerts

Companies

Users

Scoring

This is an AI-ready regulatory operating system.

🚀 NEXT STEP (Build Order)
We now switch from architecture → implementation.

Correct order:

1️⃣ Company
2️⃣ Users/Auth
3️⃣ Obligations
4️⃣ Checks
5️⃣ Evidence
6️⃣ Deadlines
7️⃣ Alerts
8️⃣ Scoring

Say "build order" and I’ll convert this into an implementation task plan for agents.

You said:
build order
Agent said:
LET’S TURN ARCHITECTURE INTO EXECUTION.
This is the agent-safe build roadmap — no chaos, no jumping.

We build foundations first, intelligence last.

🧭 GLOBAL RULE BEFORE STARTING
Agents must never:

Build UI before API exists

Add business logic in controllers

Skip companyId

Skip auth middleware

Touch scoring before checks exist

🏗️ PHASE 1 — SAAS FOUNDATION
1️⃣ COMPANY MODULE
Why first? Everything depends on it.

Build:

company.entity.ts

company.repo.ts

company.service.ts

company.routes.ts

API:

POST /companies
GET  /companies/:id
PUT  /companies/:id
DB table: companies

✔ After this, system knows who exists

2️⃣ USERS & AUTH
Now attach humans.

Build:

user.entity.ts

user.repo.ts

user.service.ts

auth.routes.ts

auth.middleware.ts

API:

POST /auth/login
POST /users
GET  /users/me
Add JWT + role middleware.

✔ After this, system knows who acts

⚙️ PHASE 2 — COMPLIANCE ENGINE
3️⃣ OBLIGATIONS MODULE
Legal requirements.

Build:

obligation.entity

obligation.repo

obligation.service

obligation.routes

✔ System knows what must be done

4️⃣ CONTROLS & CHECKS MODULE
Operational execution.

Build:

control.entity

check.entity

control.repo

check.repo

check.service

check.routes

✔ System records compliance actions

5️⃣ EVIDENCE MODULE
Proof storage.

Build:

evidence.entity

evidence.repo

evidence.service

evidence.routes

✔ System becomes audit-proof

⏰ PHASE 3 — INTELLIGENCE LAYER
6️⃣ DEADLINES
Automated due dates.

✔ System predicts when risk happens

7️⃣ ALERTS
Notifications.

✔ System prevents missed compliance

8️⃣ SCORING ENGINE
Final intelligence.

✔ System tells how safe the company is

🔁 BACKGROUND JOBS (after phase 3)
Add:

jobs/deadline.job.ts
jobs/scoring.job.ts
📊 VISUAL BUILD FLOW
Company
   ↓
Users/Auth
   ↓
Obligations
   ↓
Controls/Checks
   ↓
Evidence
   ↓
Deadlines
   ↓
Alerts
   ↓
Scoring
🧠 WHY THIS ORDER IS SAFE
Step	Unlocks
Company	Multi-tenant SaaS
Users	Security & identity
Obligations	Legal brain
Checks	Execution engine
Evidence	Audit protection
Deadlines	Time intelligence
Alerts	Prevention
Scoring	Decision engine
📦 AGENT EXECUTION RULE
Agents must finish + test + commit each module before next.

You now have a production-grade implementation roadmap.

Next logical action:

👉 Say "start company module" and we begin writing real backend code.