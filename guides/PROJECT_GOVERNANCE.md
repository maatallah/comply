# 🔒 Project Governance & AI Agent Rules
## TuniCompliance Development Protocol

> [!WARNING]
> **This document defines IMMUTABLE rules for AI agents and developers.**
> Any changes to architecture, scope, or data model REQUIRE explicit human approval.

---

## 1. Document Lock Status

### 🔴 LOCKED (No AI changes without approval)

These documents are **design-frozen** and cannot be modified by AI agents:

| Document | Status | Lock Date | Reason |
|----------|--------|-----------|--------|
| `COMPLIANCE_DOMAIN_REFERENCE.md` | 🔴 LOCKED | 2026-01-27 | Regulatory framework approved |
| `DATA_MODEL_V2.md` | 🔴 LOCKED | 2026-01-27 | Database schema finalized |
| `MVP_SCOPE.md` | 🔴 LOCKED | 2026-01-27 | Feature scope frozen |
| `USER_PERSONAS.md` | 🔴 LOCKED | 2026-01-27 | User research complete |
| `MVP_TECH_ARCHITECTURE.md` | 🔴 LOCKED | 2026-01-28 | Stack decisions finalized |

**AI Agent Rule**: 
```
IF document.status == LOCKED:
    IF user_request.includes("modify", "change", "update"):
        RESPOND: "This document is locked. Please confirm you want to override the lock."
        REQUIRE: explicit_user_confirmation = True
```

---

### 🟡 CONTROLLED (Review required)

These can be updated but require human review before merge:

| Document | Review Gate | Approver |
|----------|-------------|----------|
| Implementation code (all `.ts` files) | Pull Request | Tech Lead |
| Database migrations | Manual review | DBA/Tech Lead |
| API changes (breaking) | Architecture review | Product + Tech Lead |

---

### 🟢 OPEN (AI can modify freely)

- Task tracking (`task.md`)
- Test files (`*.test.ts`)
- Documentation updates (typos, clarifications)
- Comments and JSDoc

---

## 2. Milestone-Based Workflow

### Phase 0: Design (COMPLETE ✅)

**Gate: Architecture Review Meeting**

- [x] All architecture documents written
- [x] User personas validated
- [x] MVP scope agreed
- [x] Tech stack selected
- [x] **EXIT CRITERIA**: Stakeholder sign-off on all LOCKED documents

---

### Phase 1: Foundation (Weeks 1-2)

**Milestone: Backend skeleton + Auth working**

**Deliverables**:
1. PostgreSQL database setup
2. Fastify server running
3. Company module (CRUD)
4. Users module + JWT auth
5. Multi-tenant middleware (companyId filtering)

**Exit Criteria**:
- [ ] User can register a company
- [ ] User can login and get JWT token
- [ ] API enforces multi-tenancy (tests pass)
- [ ] Postman collection for all endpoints

**Gate: Code Review + Demo**

**AI Rules for Phase 1**:
- ✅ Can create new files in `src/modules/companies/` and `src/modules/users/`
- ✅ Can write tests
- ❌ Cannot change data model (entities must match `DATA_MODEL_V2.md`)
- ❌ Cannot add new modules beyond Company + Users

---

### Phase 2: Core Compliance Engine (Weeks 3-4)

**Milestone: Track 8 Tier 1 obligations**

**Deliverables**:
1. Obligations module
2. Controls module
3. Checks module
4. Evidence module (file upload)

**Exit Criteria**:
- [ ] Can create an obligation
- [ ] Can attach controls to obligation
- [ ] Can perform check and upload evidence
- [ ] Evidence stored in MinIO
- [ ] API has all CRUD operations

**Gate: Integration Test Suite Passes**

**AI Rules**:
- ✅ Can implement modules from `MVP_SCOPE.md` Tier 1 list
- ❌ Cannot add obligations not in Tier 1
- ❌ Cannot modify Control/Check/Evidence entity structure

---

### Phase 3: Time Intelligence (Weeks 5-6)

**Milestone: Deadline tracking + alerts work**

**Deliverables**:
1. Deadlines module
2. Alerts module
3. Email notification service
4. Background cron job for deadline calculation
5. Compliance scoring engine

**Exit Criteria**:
- [ ] Deadlines auto-calculate from obligation frequency
- [ ] Email alerts sent at 30/7/1 day warnings
- [ ] Compliance score computes correctly
- [ ] Overdue deadlines marked automatically

**Gate: End-to-end test of deadline flow**

---

### Phase 4: Frontend (Week 7)

**Milestone: Usable UI for Aicha (primary persona)**

**Deliverables**:
1. Login/register pages
2. Dashboard with compliance score
3. Obligation list + detail view
4. Evidence upload UI
5. Calendar view of deadlines
6. Alert notifications

**Exit Criteria**:
- [ ] Aicha can complete entire user journey (from persona doc)
- [ ] French UI with i18n working
- [ ] Mobile-responsive
- [ ] Works in Chrome/Firefox/Safari

**Gate: UAT with pilot customer**

---

### Phase 5: Polish + Launch (Week 8)

**Milestone: Production-ready**

**Deliverables**:
1. Production deployment
2. Performance optimization
3. Security audit
4. User documentation
5. Admin guide

**Exit Criteria**:
- [ ] All MVP features from `MVP_SCOPE.md` working
- [ ] No critical bugs
- [ ] Performance meets SLAs (< 2s page load)
- [ ] Security checklist complete
- [ ] 3 pilot customers onboarded

**Gate: Go/No-Go decision**

---

## 3. Decision Log

**All major decisions must be logged here:**

### Decision Log Format

```markdown
## [DECISION-XXX] - Title
**Date**: YYYY-MM-DD
**Decider**: Name/Role
**Status**: APPROVED | REJECTED | PENDING

**Context**: Why was this decision needed?

**Options Considered**:
1. Option A - Pros/Cons
2. Option B - Pros/Cons

**Decision**: We chose X because...

**Consequences**: This means we will/won't...

**Reversible?**: YES | NO (if no, extra caution required)
```

### Active Decisions

#### [DECISION-001] - Use Modular Monolith vs Microservices
**Date**: 2026-01-27  
**Decider**: Architecture Team  
**Status**: ✅ APPROVED

**Decision**: Start with modular monolith, extract to microservices only when pain appears.

**Rationale**: 
- Faster MVP delivery
- Easier debugging
- Lower operational complexity
- Can refactor later

**Reversible?**: YES (Phase 2+)

---

#### [DECISION-002] - 8 Obligations for MVP (Not 120)
**Date**: 2026-01-27  
**Decider**: Product Team  
**Status**: ✅ APPROVED

**Decision**: Build only Tier 1 obligations: BSCI, Fire Safety, Electrical, CNSS, TVA, Médecine, Waste, Contracts

**Rationale**: 
- Covers 70% of SME compliance risk
- Validates product hypothesis
- Faster time to market

**Reversible?**: NO (adding more later is easy, but scope creep now delays launch)

**🔒 LOCKED**: No agent can add obligations beyond Tier 1 without approval

---

## 4. AI Agent Behavioral Rules

### Rule 1: Respect the Lock 🔒

```python
# Pseudocode for AI agent behavior
def can_modify_file(file_path):
    if file_path in LOCKED_DOCUMENTS:
        if not user_explicitly_confirmed_override():
            return False, "Document is locked. Ask user: 'Override lock?'"
    return True, None
```

### Rule 2: Milestone Boundaries

```python
def can_implement_feature(feature_name, current_milestone):
    if feature_name not in current_milestone.scope:
        return False, f"Feature '{feature_name}' not in {current_milestone.name}. Confirm with user?"
    return True, None
```

**Example**:
- Current Milestone: Phase 1 (Foundation)
- User asks: "Add audit module"
- Agent response: ❌ "Audit module is Phase 2 (not in current scope). Proceed anyway?"

### Rule 3: Data Model Consistency

```python
def validate_entity_definition(entity_code, entity_name):
    canonical = load_from("DATA_MODEL_V2.md", entity_name)
    if entity_code.fields != canonical.fields:
        return False, f"Entity {entity_name} doesn't match DATA_MODEL_V2.md"
    return True, None
```

**Enforcement**: Before creating any TypeScript entity file, verify against `DATA_MODEL_V2.md`

### Rule 4: No Scope Creep

```python
# AI must check before adding features
TIER_1_OBLIGATIONS = [
    "BSCI Audit",
    "Fire Safety Inspection",
    "Electrical Installation",
    "CNSS Declaration",
    "TVA Declaration",
    "Médecine du Travail",
    "Hazardous Waste",
    "Work Contracts"
]

def can_add_obligation(obligation_name):
    if obligation_name not in TIER_1_OBLIGATIONS:
        if current_phase == "MVP":
            return False, f"{obligation_name} not in MVP scope (Tier 1 only)"
    return True, None
```

### Rule 5: Test Coverage Mandate

```python
def can_merge_code(module_path):
    coverage = get_test_coverage(module_path)
    if coverage < 70:
        return False, f"Test coverage {coverage}% < 70% threshold"
    return True, None
```

---

## 5. Change Request Protocol

### For Locked Documents

**Step 1**: User proposes change  
**Step 2**: AI creates change proposal in `proposals/PROP-XXX.md`  
**Step 3**: Human reviews proposal  
**Step 4**: If approved, AI updates + logs in `CHANGELOG.md`  
**Step 5**: Document remains locked

**Template**: `proposals/PROP-001-add-new-obligation.md`
```markdown
# Proposal: Add Disney Audit to Tier 1

## Requester
Mohamed (CEO) via user request

## Rationale
Major client requires Disney certification, blocking 2M TND contract

## Impact Analysis
- **Scope**: Adds 1 obligation to MVP (now 9 instead of 8)
- **Timeline**: +3 days development
- **Risk**: Delays MVP by 1 week if not careful

## Modified Documents
- `MVP_SCOPE.md`: Add Disney to Tier 1
- `COMPLIANCE_DOMAIN_REFERENCE.md`: Already documented

## Recommendation
✅ APPROVE - High business value, minimal risk

## Decision
[ ] APPROVED - Proceed with implementation
[ ] REJECTED - Defer to Phase 2
[ ] NEEDS MORE INFO
```

---

## 6. Version Control Strategy

### Branch Protection

```
main (production)
  ↑
  | ← Pull Request Required + Review
  |
develop (integration)
  ↑
  | ← Feature branches merge here
  |
feature/module-name
```

**Rules**:
- `main`: Deployable, tagged releases only
- `develop`: Integration branch, CI must pass
- `feature/*`: No direct commits to develop

### Commit Message Format

```
type(scope): short description

[optional body]

Refs: #issue-number
Phase: 1 | 2 | 3 | 4 | 5
```

**Types**: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

**Example**:
```
feat(companies): add company CRUD endpoints

Implement company repository, service, and routes.
Includes validation for Tunisia tax ID format.

Refs: #12
Phase: 1
```

---

## 7. Review Gates Checklist

### Before Phase Completion

- [ ] All deliverables from milestone complete
- [ ] Exit criteria met (manual verification)
- [ ] Test coverage > 70%
- [ ] No critical bugs
- [ ] Performance benchmarks met
- [ ] Security checklist passed
- [ ] Documentation updated
- [ ] Demo prepared for stakeholders

**Gate Keeper**: Tech Lead signs off

---

## 8. Emergency Protocol

**Scenario**: Critical bug found, blocker for launch

**Process**:
1. Create `HOTFIX-XXX` branch from `main`
2. Fix bug
3. Fast-track review (skip normal gates)
4. Deploy to production
5. Merge back to `develop`
6. Log in `DECISION_LOG.md`

**AI Rule**: Hotfixes can bypass locks, but must be logged

---

## 9. AI Agent Prompt Template

**When starting any coding task, AI must say**:

```
I am about to implement [FEATURE_NAME].

Let me verify:
1. Is this in the current milestone scope? ✅/❌
2. Does it require modifying locked documents? ✅/❌
3. Does the data model change? ✅/❌
4. Test coverage plan: [DESCRIPTION]

Proceeding...
```

**User can abort if verification fails.**

---

## 10. Metrics & Monitoring

### Tracked Metrics
- **Scope creep**: Features added beyond MVP scope
- **Architecture violations**: Entity mismatches with DATA_MODEL_V2.md
- **Test coverage**: Per module
- **Performance**: API response time p95
- **Bug rate**: Critical bugs per week

### Weekly Review
Every Friday, review:
- Are we on schedule?
- Any scope creep?
- Any architectural drift?
- Test coverage trends

---

## 🎯 Summary: AI Agent Commandments

1. **THOU SHALT NOT** modify locked documents without approval
2. **THOU SHALT** verify milestone scope before implementation
3. **THOU SHALT** match DATA_MODEL_V2.md exactly
4. **THOU SHALT** write tests (70%+ coverage)
5. **THOU SHALT** log all major decisions
6. **THOU SHALT** respect the 8 Tier 1 obligations limit
7. **THOU SHALT** ask before adding features
8. **THOU SHALT** validate Tunisia-specific formats
9. **THOU SHALT** update task.md after each milestone
10. **THOU SHALT** seek human approval for ambiguity

---

**Document Status**: 🔴 LOCKED  
**Version**: 1.0  
**Last Updated**: 2026-01-28  
**Next Review**: After Phase 1 completion
