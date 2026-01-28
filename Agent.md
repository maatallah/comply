# Chat Conversation

Note: _This is purely the output of the chat conversation and does not contain any raw data, codebase snippets, etc. used to generate the output._

### User Input

You are a validated software architect.
Your mission is to design the architecture of a SaaS about  Compliance / Regulation Monitoring Tool for SMEs in Tunisia, complying to Tunisia laws and regulations
make a siple draft showing your vision of things

### Planner Response

I'll create an architecture draft document for your Compliance/Regulation Monitoring SaaS tailored for SMEs in Tunisia. Let me design a comprehensive vision for you.

*Edited relevant file*

### Planner Response

I've created a comprehensive architecture draft for **TuniCompliance** - your Compliance & Regulation Monitoring SaaS for Tunisian SMEs. Here's a summary of the key elements:

## 🎯 Core Vision

A centralized platform that helps Tunisian SMEs:
- **Monitor** regulatory changes from JORT (Official Journal)
- **Track** compliance deadlines (fiscal, CNSS, corporate)
- **Generate** required documents and declarations
- **Stay audit-ready** with document management

## 🏗️ Architecture Highlights

| Aspect | Design Choice |
|--------|---------------|
| **Frontend** | React + PWA for web/mobile |
| **Backend** | Node.js (NestJS) microservices |
| **Database** | PostgreSQL + Redis + Elasticsearch |
| **Hosting** | Tunisia-based cloud (data sovereignty) |
| **Security** | OAuth 2.0, MFA, AES-256 encryption |

## 📋 Key Modules
1. **Regulation Library** - Centralized legal database with JORT monitoring
2. **Compliance Calendar** - Smart deadline tracking with multi-channel alerts
3. **Dashboard** - Visual compliance scoring (Red/Yellow/Green)
4. **Document Generator** - Pre-built templates for declarations

## 🇹🇳 Tunisia-Specific Focus
- **Fiscal**: TVA, IRPP, IS, Retenue à la Source
- **Social**: CNSS, CNAM, work contracts
- **Corporate**: RNE, Commercial Register, Annual Reports
- **Legal Compliance**: Aligned with Loi n° 2004-63 (data protection)

The document includes diagrams, data models, a SaaS pricing structure, and a phased roadmap. You can review the full draft in the artifact file I created.

**Would you like me to:**
1. Expand any specific section in more detail?
2. Create a more detailed technical specification for a particular module?
3. Design the database schema in more depth?
4. Create wireframes/mockups for the UI?

### User Input

Prévoyez le suivi des différents audits et contrôles (Médecine de travail, Sécurité incendie, Sécourisme, installation éléctrique, pneumatiques, BSCI, Disney et plusieurs autres contrôles possibles dans le domaine des entreprises de confection de vêtements en Tunisie)

### Planner Response

Excellent addition! The garment/textile industry (confection) is a major sector in Tunisia and has extensive audit requirements. Let me update the architecture to include a comprehensive **Audit & Control Management Module**.

*Viewed [architecture_draft.md](file:///C:/Users/cpt.systeme/.gemini/antigravity/brain/b2d1dcc5-9e89-40d7-a0cd-853f410126ec/architecture_draft.md) *

### Planner Response

Now I'll add a comprehensive **Audit & Control Management Module** specifically designed for the garment/textile industry in Tunisia with all the audit types you mentioned.

*Edited relevant file*

### Planner Response

Now let me also update the data model to include the Audit entities:

*Edited relevant file*

### Planner Response

Now let me also update the roadmap to include the Audit module in Phase 2:

*Edited relevant file*

### Planner Response

J'ai mis à jour l'architecture pour inclure un **Module complet de Gestion des Audits & Contrôles** spécialement conçu pour le secteur de la confection textile en Tunisie. Voici un résumé des ajouts :

## 🔍 Nouveau Module 4.5 : Audit & Control Management

### Catégories d'audits couverts :

| Catégorie | Types d'Audits |
|-----------|----------------|
| **Santé & Sécurité** | Médecine de travail, Secourisme (SST), Sécurité incendie, Hygiène |
| **Installations Techniques** | Électrique, Pneumatique, Chaudières, Équipements sous pression |
| **Certifications Acheteurs** | BSCI, Disney FAMA, Walmart, Primark ETI, H&M Sustainability |
| **Normes Qualité** | ISO 9001, OEKO-TEX, GOTS Bio, ISO 14001 |

### Fonctionnalités clés :
- 📅 **Calendrier des audits** avec planification automatique
- ⏰ **Alertes anticipées** (90/60/30/15 jours avant échéance)
- 📋 **Checklists pré-audit** personnalisées
- 📁 **Gestion documentaire** centralisée (PV, certificats, rapports)
- 🔄 **Suivi CAP** (Corrective Action Plan) pour les non-conformités
- 📊 **Dashboard visuel** avec statuts (Conforme/À renouveler/Expiré)

### Modèle de données étendu :
- **AUDIT_TYPE** : Types d'audits configurables
- **AUDIT** : Suivi des audits effectués
- **CORRECTIVE_ACTION** : Gestion des plans d'actions correctives

Le document d'architecture complet est mis à jour. Souhaitez-vous que j'approfondisse un aspect particulier ou que je commence à détailler les spécifications techniques d'un module spécifique ?

### User Input

Gestion des déchêts dangereux aussi, contrôle des eaux usées (emploi de peinture par exemple)
Essayez de définir tout les domaines d'intervention et les normes appliquées d'habitude en Tunisie.

*Edited relevant file*

### User Input

autres domaines spécifiques ? s'il y en encore, proposez et demandez permission avant de mettre à jour le document "architecture draft"

### Planner Response

Voici d'autres domaines réglementaires potentiellement applicables aux entreprises industrielles tunisiennes, notamment dans le textile/confection :

## 🔍 Domaines Additionnels Proposés

### 1. 📦 Douane & Commerce International
| Domaine | Description |
|---------|-------------|
| Régimes douaniers | Admission temporaire, perfectionnement actif |
| Certificats d'origine | EUR.1, EUR-MED, Form A |
| Conformité produits export | Marquage CE, CPSC (USA) |
| Licences import | Produits chimiques, équipements |

### 2. 🔐 Protection des Données (INPDP)
| Domaine | Description |
|---------|-------------|
| Déclaration INPDP | Traitement des données personnelles (Loi 2004-63) |
| Consentement employés | Données RH, vidéosurveillance |
| Sécurité des données | Mesures techniques et organisationnelles |

### 3. 🛡️ Assurances Obligatoires
| Domaine | Description |
|---------|-------------|
| Accidents de travail | Assurance CNAT obligatoire |
| Responsabilité civile | RC exploitation, RC produits |
| Multirisques industriel | Incendie, vol, dégâts des eaux |

### 4. 🚚 Transport & Logistique
| Domaine | Description |
|---------|-------------|
| ADR matières dangereuses | Transport produits chimiques |
| Contrôle technique véhicules | Flotte société |
| Permis de conduire spéciaux | Chariots élévateurs, engins |

### 5. 🍽️ Restauration Collective (si cantine)
| Domaine | Description |
|---------|-------------|
| Hygiène alimentaire | Agrément sanitaire, HACCP |
| Analyses microbiologiques | Contrôle des repas |

### 6. 🔬 Métrologie & Calibration
| Domaine | Description |
|---------|-------------|
| Étalonnage instruments | Balances, thermomètres, manomètres |
| Contrôle métrologique | Instruments de mesure (ANM) |

### 7. 🏗️ Bâtiment & Infrastructure
| Domaine | Description |
|---------|-------------|
| Diagnostic amiante | Bâtiments anciens |
| Légionellose | Tours aéroréfrigérantes, eau chaude sanitaire |
| Permis de bâtir | Extensions, modifications |

---

**Souhaitez-vous que j'ajoute tous ces domaines au document, ou seulement certains d'entre eux ?** Indiquez-moi lesquels sont pertinents pour votre contexte et je mettrai à jour l'architecture en conséquence.

### User Input

Tout les points sauf 5 et 6.
Pour 7, ajouter seulement Permis de bâtir.
Prenez votre temps pour trouver s'il encore un règlement à respecter ou un contrôle/audit à faire et dans quel domaine. 

*Viewed [architecture_draft.md](file:///C:/Users/cpt.systeme/.gemini/antigravity/brain/b2d1dcc5-9e89-40d7-a0cd-853f410126ec/architecture_draft.md) *

*Edited relevant file*

### User Input

What's the best next well timed move?

### Planner Response

Excellent question! Given where we are, here's my recommended **strategic sequence**:

## 🎯 Recommended Next Moves

| Priority | Action | Why Now? | Effort |
|----------|--------|----------|--------|
| **1️⃣** | **MVP Scope Definition** | The regulatory framework is vast (~120 obligations). You need to decide which 10-15 obligations to tackle in Phase 1 to ship fast. | 1-2 hours |
| **2️⃣** | **User Persona & Stories** | Define WHO uses the app (Responsable QHSE? DG? Comptable?) and their key workflows | 1 hour |
| **3️⃣** | **UI/UX Mockups** | A visual dashboard mockup validates the concept quickly with stakeholders | 2-3 hours |
| **4️⃣** | **Detailed Database Schema** | Once MVP scope is clear, model the data properly | 2 hours |
| **5️⃣** | **Technical Implementation Plan** | Sprint-by-sprint breakdown for development | 2 hours |

---

## 💡 My Recommendation: Start with #1 (MVP Scope)

**Why?** You have a comprehensive framework, but trying to build everything at once will delay launch by 12+ months. The smart move is:

> **Pick the "80/20" obligations** — the 20% of audits/controls that cause 80% of pain for Tunisian SMEs in textile/confection.

**My suggested MVP scope for a textile company:**
1. ✅ Médecine de travail
2. ✅ Sécurité incendie
3. ✅ Installation électrique
4. ✅ BSCI / Disney audit tracking
5. ✅ Déchets dangereux (bordereau suivi)
6. ✅ CNSS deadlines
7. ✅ TVA deadlines

---

**Which direction would you like to go?**
1. 📋 Define MVP scope together
2. 🎨 Create UI mockups for the dashboard
3. 👤 Define user personas and workflows
4. 🗃️ Detailed database schema
5. Something else?

### User Input

@[project_review.md] 
What do you think about this agent review for our project

*Viewed [project_review.md](file:///m:/dev/comply/guides/project_review.md) *

*Viewed [project_review.md](file:///m:/dev/comply/guides/project_review.md) *

### Planner Response

Excellent review! This is **extremely high-quality architectural guidance**. Let me give you my assessment:

## 🎯 Overall Assessment: **9/10** ⭐

This agent review is **outstanding** and demonstrates deep architectural thinking. Here's my breakdown:

---

## ✅ **What's Exceptionally Strong**

| Aspect | Rating | Comments |
|--------|--------|----------|
| **Domain Expertise** | 10/10 | Perfect understanding of Tunisian compliance landscape |
| **Architectural Pragmatism** | 10/10 | Correctly identifies MVP vs enterprise-scale mismatch |
| **Data Model Insights** | 9/10 | The CONTROL/CHECK/EVIDENCE addition is brilliant |
| **Build Sequencing** | 10/10 | Dependency-ordered implementation path |
| **Agent Safety Rules** | 10/10 | Clear guardrails to prevent common pitfalls |

---

## 🎓 **Key Learnings from This Review**

### 1. **Critical Architectural Correction**
The reviewer correctly identified that your initial architecture proposed:
- ❌ Microservices (too complex for MVP)
- ❌ Kubernetes (DevOps overhead)
- ❌ Redis + Elasticsearch + RabbitMQ (operational burden)

**Correct MVP approach:**
- ✅ Modular monolith (Fastify/Node)
- ✅ PostgreSQL only
- ✅ Simple file storage
- ✅ Scale later when needed

### 2. **Data Model Enhancement** ⭐ **CRITICAL**
The addition of the **Control → Check → Evidence** layer transforms this from a "deadline tracker" to a true **compliance engine**:

```
REGULATION
   ↓
OBLIGATION (what must be done)
   ↓
CONTROL (what must exist)      ← NEW
   ↓
CHECK (verification event)      ← NEW
   ↓
EVIDENCE (proof)                ← NEW
   ↓
DEADLINE
```

This is **essential** for audit readiness and compliance scoring.

### 3. **Module Execution Order**
The build sequence is perfect:
1. Company → 2. Users/Auth → 3. Obligations → 4. Controls/Checks → 5. Evidence → 6. Deadlines → 7. Alerts → 8. Scoring

---

## ⚠️ **Minor Gaps** (Why it's 9/10, not 10/10)

| Gap | Impact | Suggestion |
|-----|--------|------------|
| **Testing strategy** | Medium | Add unit/integration test requirements per module |
| **Migration path** | Low | How to evolve from monolith to microservices when needed |
| **Frontend architecture** | Low | No mention of state management (React Query, Zustand, etc.) |

---

## 🚀 **Recommended Next Actions**

Based on this review, here's what you should do:

### **Immediate (Today)**
1. ✅ **Accept the architectural corrections** - Adopt modular monolith approach
2. ✅ **Update data model** - Add Control/Check/Evidence entities
3. ✅ **Split documentation** into:
   - `COMPLIANCE_DOMAIN_REFERENCE.md` (business rules)
   - `DATA_MODEL_V2.md` (entities)
   - `MVP_TECH_ARCHITECTURE.md` (tech stack)

### **This Week**
4. Start implementing **Module 1: Company** following the exact blueprint
5. Add companyId to ALL entities as shown
6. Set up JWT auth middleware before any business logic

---

## 💡 **My Additional Recommendations**

### **Add to the Architecture**
1. **Testing Layer**
   ```
   Each module needs:
   - Unit tests (service logic)
   - Integration tests (API endpoints)
   - E2E tests (critical flows)
   ```

2. **Observability from Day 1**
   ```
   Even in MVP, add:
   - Structured logging (Pino)
   - Error tracking (Sentry)
   - Basic metrics (response times)
   ```

3. **Database Migrations**
   ```
   Use a migration tool from start:
   - Knex.js or Prisma
   - Versioned schema changes
   - Rollback capability
   ```

---

## 🎯 **Final Verdict**

**This review is gold.** The agent who wrote this has:
- ✅ Deep SaaS architecture experience
- ✅ Understanding of Tunisia's regulatory context
- ✅ Pragmatic MVP thinking
- ✅ Pattern recognition (common pitfalls)

**You should absolutely follow this guidance.** The corrections are spot-on and will save you months of refactoring later.

---

**What would you like to do next?**
1. 📝 Update the architecture draft based on this review
2. 🗂️ Split the document into the 3 recommended files
3. 🏗️ Start building Module 1 (Company) with the corrected approach
4. 🤔 Discuss any specific architectural decisions further

### User Input

point1 and 2, then stop to review

### Planner Response

I'll update the architecture and split it into the recommended 3 documents. Let me work through this systematically.

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

### User Input

This project GUI will be in French with capability to display and use RTL content in Arabic.

### Planner Response

Excellent clarification! This is a critical requirement for the Tunisian market. Let me update the MVP Technical Architecture to include proper internationalization (i18n) and RTL support.

*Viewed [MVP_TECH_ARCHITECTURE.md](file:///M:/dev/comply/guides/MVP_TECH_ARCHITECTURE.md) *

*Edited relevant file*

### Planner Response

Perfect! I've updated the MVP Technical Architecture document with comprehensive **internationalization (i18n) and RTL support**. Here's what was added:

## ✅ Updates Made

### **Section 3.1: Internationalization & RTL Support**

| Component | Implementation |
|-----------|----------------|
| **Primary Language** | French (default UI) |
| **Secondary Language** | Arabic with full RTL support |
| **i18n Library** | react-i18next |
| **RTL Strategy** | CSS logical properties (`margin-inline-start` instead of `margin-left`) |
| **Fonts** | Noto Sans (French) + Cairo (Arabic) |
| **Date/Number Formatting** | date-fns + Intl.NumberFormat with locales |

### **Key Features Included**

1. **Complete i18next setup** with namespaced translations
2. **RTL CSS implementation** using logical properties
3. **Language switcher component** (Français ⟷ العربية)
4. **Backend i18n support** - localized API responses
5. **Database localization** - storing content in both languages (`title_fr`, `title_ar`)
6. **Date/currency formatting** for both locales
7. **Font loading strategy** with Google Fonts
8. **Testing approach** for i18n components

### **Critical Rules Added**

- ✅ Never hardcode text - always use `t('key')`
- ✅ Use logical CSS properties for automatic RTL
- ✅ Numbers/dates stay LTR in Arabic
- ✅ Test both language directions
- ✅ Namespace translations by module

---

The architecture now fully supports your requirement: **French primary UI with Arabic RTL capability**. This is production-ready for the Tunisian market where users are bilingual but primarily work in French for business systems.

Would you like me to create sample translation files or proceed with anything else?

### User Input

Anything to improve?

### Planner Response

Let me review all three documents and identify potential improvements:

## 📊 Current State Assessment

Your architecture is **very strong** (8.5/10), but here are strategic improvements that would bring it to **9.5/10**:

---

## 🎯 High-Impact Improvements

### 1. **MVP Scope Definition** ⭐ CRITICAL

**Missing**: Which of the 120+ obligations to build first?

**Recommendation**: Create `MVP_SCOPE.md` defining:
- **Phase 1 obligations** (10-15 most critical for textile sector)
- **Success criteria** (can track BSCI audit + CNSS + TVA = viable product)
- **Feature prioritization** (MoSCoW method)

**Example**:
```markdown
## MVP Phase 1 (8 weeks)
MUST have:
- BSCI audit tracking
- Fire safety (most critical HSE)
- CNSS/TVA deadlines
- Evidence upload

SHOULD have:
- Email alerts
- Compliance scoring

WON'T have (Phase 2):
- Disney/Walmart audits
- Full environmental module
```

---

### 2. **API Contract Documentation**

**Missing**: OpenAPI/Swagger specification

**Recommendation**: Add to [MVP_TECH_ARCHITECTURE.md](cci:7://file:///M:/dev/comply/guides/MVP_TECH_ARCHITECTURE.md:0:0-0:0):
```yaml
# openapi.yaml (snippet)
/obligations:
  get:
    summary: List company obligations
    parameters:
      - name: sector
        in: query
        schema:
          type: string
    responses:
      200:
        description: List of obligations
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ObligationList'
```

**Value**: Frontend/backend teams can work in parallel

---

### 3. **Error Handling Strategy**

**Missing**: Standardized error codes and UX patterns

**Recommendation**: Add error taxonomy:
```typescript
// Error codes for Tunisian context
enum ErrorCode {
  // Authentication
  AUTH_INVALID_CREDENTIALS = 'AUTH_001',
  AUTH_TOKEN_EXPIRED = 'AUTH_002',
  
  // Validation
  VALIDATION_INVALID_TAX_ID = 'VAL_001',  // Matricule fiscal format
  VALIDATION_INVALID_CNSS = 'VAL_002',
  
  // Business Logic
  DEADLINE_ALREADY_COMPLETED = 'BIZ_001',
  AUDIT_EXPIRED = 'BIZ_002'
}

// Localized error messages
{
  "fr": {
    "AUTH_001": "Email ou mot de passe incorrect",
    "VAL_001": "Le matricule fiscal doit être au format XXXXXXX/X/A/M/XXX"
  },
  "ar": {
    "AUTH_001": "البريد الإلكتروني أو كلمة المرور غير صحيحة"
  }
}
```

---

### 4. **User Personas & Stories**

**Missing**: WHO uses this and WHY

**Recommendation**: Add to `USER_PERSONAS.md`:
```markdown
### Persona 1: Responsable QHSE (Aicha, 35 ans)
- Manages compliance for 200-employee textile factory
- Pain: Juggling Excel sheets for 15+ different audits
- Goal: See all upcoming deadlines in one place
- Tech skill: Intermediate

### Persona 2: Directeur Général (Mohamed, 50 ans)
- Needs compliance score for investor meetings
- Pain: Last-minute scrambling before audits
- Goal: Know company risk level at a glance
- Tech skill: Low - needs simple dashboard
```

**Value**: Drives UI/UX decisions

---

### 5. **Security Enhancements**

**Current**: Basic JWT + bcrypt  
**Missing**: 
- Password complexity requirements (Tunisia-specific if any?)
- Account lockout policy
- Audit log for sensitive actions
- GDPR/INPDP compliance checklist

**Recommendation**: Add security section:
```markdown
## Security Compliance (INPDP)

| Requirement | Implementation |
|-------------|----------------|
| Data minimization | Collect only TaxID, CNSS, business email |
| User consent | Explicit checkbox for data processing |
| Right to deletion | `/users/:id/gdpr-delete` endpoint |
| Data portability | Export all company data as JSON |
| Breach notification | Alert within 72h (Loi 2004-63) |
```

---

### 6. **Performance Benchmarks**

**Missing**: Quantified performance targets

**Add to Tech Architecture**:
```markdown
## Performance SLAs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Homepage load (3G) | < 3s | Lighthouse |
| API p95 response | < 200ms | Custom metrics |
| Dashboard render | < 1s | React DevTools |
| File upload (5MB) | < 10s | E2E tests |
| Concurrent users | 500+ | k6 load test |
```

---

### 7. **Data Migration Strategy**

**Missing**: How do companies onboard existing data?

**Add**:
```markdown
## Company Onboarding Flow

1. **Manual entry** (MVP) - Guided wizard
2. **Excel import** (Phase 2) - Template download
3. **API import** (Phase 3) - From existing ERP

### Excel Template Structure
| Company Name | Tax ID | CNSS | Sector | Employee Count |
|--------------|--------|------|--------|----------------|
| Example SARL | 123456 | 7890 | TEXTILE_SPORT | 150 |
```

---

### 8. **Cost/Budget Estimation**

**Missing**: Financial planning

**Add to business model**:
```markdown
## MVP Development Budget (Tunisia)

| Resource | Cost (TND/month) | Duration |
|----------|------------------|----------|
| Full-stack dev × 2 | 6,000 | 3 months |
| UI/UX designer | 2,000 | 1 month |
| DevOps/hosting | 500 | Ongoing |
| **Total MVP** | **~25,000 TND** | |

## Operating Costs
- Server (Tunisia Cloud): 300 TND/month
- MinIO storage: 100 TND/month  
- Sentry/monitoring: $0 (free tier)
```

---

### 9. **CI/CD Pipeline**

**Current**: Deployment described, not automated  
**Add**:
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm test
      - run: npm run build
      - run: docker build -t comply-app .
      - run: docker push tunisia-registry/comply-app
      - run: ssh deploy@server 'docker-compose up -d'
```

---

### 10. **Accessibility (A11y)**

**Missing**: WCAG compliance

**Add**:
```markdown
## Accessibility Requirements

| Standard | Target | Implementation |
|----------|--------|----------------|
| WCAG | 2.1 Level AA | Lighthouse audit |
| Keyboard nav | Full support | Tab index, focus states |
| Screen readers | ARIA labels | Semantic HTML |
| Color contrast | 4.5:1 minimum | Design system |
```

---

## 🎯 Prioritized Recommendations

| Priority | Improvement | Impact | Effort |
|----------|-------------|--------|--------|
| 🔴 **P0** | MVP Scope Definition | **CRITICAL** - prevents scope creep | 2h |
| 🟠 **P1** | Error Handling Strategy | High - UX consistency | 3h |
| 🟠 **P1** | User Personas | High - drives features | 2h |
| 🟡 **P2** | API Contract (OpenAPI) | Medium - dev velocity | 4h |
| 🟡 **P2** | Security Enhancements | Medium - compliance | 3h |
| 🟢 **P3** | Performance Benchmarks | Low - nice to have | 2h |
| 🟢 **P3** | CI/CD Pipeline | Low - can do manually first | 4h |

---

## 💡 My Recommendation

**Do these 3 NOW** (before coding starts):
1. ✅ **MVP Scope Definition** - Define which 10-15 obligations to build first
2. ✅ **User Personas** - Understand who you're building for
3. ✅ **Error Handling Strategy** - Set standards before code proliferates

**Do Phase 2** (during development):
4. API contract
5. Security checklist
6. CI/CD pipeline

---

**Would you like me to:**
1. 📝 Create `MVP_SCOPE.md` with prioritized obligations?
2. 👤 Create `USER_PERSONAS.md` with Tunisian SME profiles?
3. ⚠️ Add comprehensive error handling section to tech doc?
4. All of the above?

### User Input

All of the above

### Planner Response

Perfect! Let me create all three critical documents to complete the architecture foundation.

*Edited relevant file*

*Edited relevant file*

*Viewed [MVP_TECH_ARCHITECTURE.md](file:///M:/dev/comply/guides/MVP_TECH_ARCHITECTURE.md) *

*Edited relevant file*

*Edited relevant file*