# 🤖 Sensey Board - Agent Orchestration Guide

> **Voor:** QA Lead Agent (Main Orchestrator)
> **Doel:** Coördineer 10 development agents in een continue QA-driven workflow

---

## 🎯 Quick Start voor QA Lead

Je bent de **QA Lead Agent**. Jouw rol:

1. Start agents per phase
2. Review hun output als een "local PR review"
3. PASS → volgende phase | FAIL → restart met feedback
4. Herhaal tot production-ready

---

## 📋 Agent Roster

| #   | Agent                   | Focus                      | Phase |
| --- | ----------------------- | -------------------------- | ----- |
| 1   | Project Architect       | Setup, configs, structure  | 1     |
| 2   | Design System Engineer  | Tailwind, shadcn, tokens   | 1     |
| 3   | Database Engineer       | Prisma, schema, migrations | 1     |
| 4   | Auth Engineer           | Keycloak, NextAuth, routes | 1     |
| 5   | API Engineer            | tRPC, routers, validation  | 1     |
| 6   | Core UI Engineer        | Layout, board grid, cards  | 2     |
| 7   | Board Feature Engineer  | Tabs, views, settings      | 2     |
| 8   | Ticket System Engineer  | Tickets, hierarchy, drag   | 2     |
| 9   | Sprint Feature Engineer | Sprints, kanban, auto-move | 3     |
| 10  | Polish Engineer         | Animations, a11y, tests    | 3     |

---

## 🔄 Workflow per Phase

```
┌─────────────────────────────────────────────────────────────┐
│                    PHASE EXECUTION FLOW                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. QA Lead stuurt PROMPT naar alle agents in phase         │
│                        │                                    │
│                        ▼                                    │
│  2. Agents werken PARALLEL aan hun taken                    │
│                        │                                    │
│                        ▼                                    │
│  3. Agents submitten werk (code, components, tests)         │
│                        │                                    │
│                        ▼                                    │
│  4. QA Lead doet CODE REVIEW tegen checklist                │
│                        │                                    │
│            ┌───────────┴───────────┐                        │
│            ▼                       ▼                        │
│       ┌─────────┐            ┌─────────┐                    │
│       │  PASS   │            │  FAIL   │                    │
│       └────┬────┘            └────┬────┘                    │
│            │                      │                         │
│            ▼                      ▼                         │
│    Naar PHASE N+1         FEEDBACK + RESTART                │
│                                   │                         │
│                                   └──────────► Loop         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Prompts voor Agents

### PHASE 1 - Foundation

**START PROMPT (zend naar Agent 1-5):**

```markdown
# Phase 1 Task Assignment

Je bent Agent [N]: [ROLE NAME]

## Context

We bouwen "Sensey Board" - een project management tool met Next.js 16, Bun, shadcn/ui.
Lees het complete plan in: sensey-board-plan.md

## Jouw Specifieke Taken

[KOPIEER TAKEN UIT PLAN SECTIE 6.1 VOOR DEZE AGENT]

## Deliverables

[KOPIEER DELIVERABLES CHECKLIST]

## Best Practices

- TypeScript strict mode, geen `any`
- Alle code in Engels
- Volg de folder structure exact
- Gebruik design tokens, geen hardcoded values
- Schrijf zelf-documenterende code
- Test je werk voordat je submit

## Output Format

Submit je werk als:

1. Lijst van aangemaakte/gewijzigde bestanden
2. Korte beschrijving per bestand
3. Self-check tegen deliverables
4. Eventuele vragen of blockers

START NU
```

### PHASE 2 - Features

**START PROMPT (zend naar Agent 6-8):**

```markdown
# Phase 2 Task Assignment

Je bent Agent [N]: [ROLE NAME]

## Context

Phase 1 is PASSED. Foundation is compleet:

- Project setup ✓
- Design system ✓
- Database ✓
- Auth ✓
- API ✓

## Jouw Specifieke Taken

[KOPIEER TAKEN UIT PLAN SECTIE 6.2 VOOR DEZE AGENT]

## UI/UX Requirements

Lees Section 7 van het plan ZEER ZORGVULDIG:

- Sakura pink (#FFB7C5) als primaire kleur
- 4px spacing grid
- Subtiele animaties (200ms ease-out)
- Skeleton loading, geen spinners
- Responsive: mobile-first

## Component Specs

Lees Section 8 voor exacte component specificaties.

## Deliverables

[KOPIEER DELIVERABLES CHECKLIST]

START NU
```

### PHASE 3 - Polish

**START PROMPT (zend naar Agent 9-10):**

```markdown
# Phase 3 Task Assignment

Je bent Agent [N]: [ROLE NAME]

## Context

Phase 1 & 2 zijn PASSED. Features zijn gebouwd:

- Board grid ✓
- Ticket system ✓
- Views ✓

## Focus: POLISH & QUALITY

Nu focus op:

- Sprint management (Agent 9)
- Animations, accessibility, tests (Agent 10)

## Critical Requirements

- Auto-move tickets bij nieuwe sprint (MUST WORK!)
- Smooth 60fps animations
- WCAG 2.1 AA compliance
- E2E tests voor critical paths

## Deliverables

[KOPIEER DELIVERABLES CHECKLIST]

START NU
```

---

## ✅ QA Review Checklist

### Per-Agent Review (tijdens Phase)

```markdown
## Quick Review Checklist

### Code Quality

- [ ] TypeScript compileert zonder errors
- [ ] Geen `any` types
- [ ] Geen unused imports/variables
- [ ] Consistent naming (camelCase functions, PascalCase components)
- [ ] Files < 200 lines

### Specifiek voor UI Agents (6, 7, 8, 9)

- [ ] Design tokens gebruikt (geen hardcoded #FFB7C5)
- [ ] Responsive (check mobile breakpoint)
- [ ] Loading states aanwezig
- [ ] Error states aanwezig
- [ ] Hover/focus states

### Specifiek voor API Agent (5)

- [ ] Input validation met Zod
- [ ] Proper error responses
- [ ] Protected procedures waar nodig
- [ ] Optimistic update support
```

### Phase Completion Review

```markdown
## Phase [N] Completion Checklist

### Alle Deliverables Geleverd?

Agent 1: [ ] [ ] [ ] [ ] [ ] [ ]
Agent 2: [ ] [ ] [ ] [ ] [ ]
...

### Integration Test

- [ ] `bun install` werkt
- [ ] `bun run dev` start zonder errors
- [ ] Geen TypeScript errors
- [ ] Geen console errors in browser
- [ ] Basic flow werkt (login → dashboard → create)

### Issues Gevonden

| Issue | Severity             | Agent | Action      |
| ----- | -------------------- | ----- | ----------- |
| ...   | CRITICAL/MAJOR/MINOR | #     | FIX/RESTART |

### Decision

[ ] PASS - Ga naar Phase N+1
[ ] FAIL - Stuur feedback, restart agents
```

---

## 🔴 Failure Protocol

Wanneer je issues vindt:

### 1. Categoriseer

```
CRITICAL (moet gefixed voor verder gaan):
- Security vulnerabilities
- Data loss mogelijk
- App crashes
- Auth bypass

MAJOR (moet gefixed in huidige phase):
- Feature werkt niet
- Verkeerd gedrag
- Missing requirements
- Performance issues

MINOR (kan in volgende phase):
- Styling inconsistenties
- Kleine UX issues
- Code style
```

### 2. Feedback Format

```markdown
# Agent [N] Feedback - RETRY NEEDED

## Issues Gevonden

### CRITICAL

1. [Beschrijving]
   - Locatie: `src/...`
   - Probleem: ...
   - Fix nodig: ...

### MAJOR

1. [Beschrijving]
   ...

## Wat WEL Goed Was

- ...

## Actie

Fix bovenstaande issues en submit opnieuw.
Focus op CRITICAL eerst.

## Hints

- Check Section X van het plan
- Kijk naar pattern Y
```

### 3. Partial Restart

Je hoeft niet ALLE agents te restarten:

```
Als alleen Agent 5 (API) faalt:
→ Restart alleen Agent 5
→ Anderen hoeven niet opnieuw

Als Agent 6 en 8 falen (UI + Tickets):
→ Restart 6 en 8
→ Agent 7 kan wachten

Als foundation issue (Agent 1-3):
→ Moet iedereen na die agent restarten
```

---

## 🎯 Success Criteria per Phase

### Phase 1 DONE wanneer:

```
✓ bun install && bun run dev werkt
✓ Login flow werkt met Keycloak
✓ Database seeded met test data
✓ API endpoints bereikbaar
✓ shadcn components renderen
✓ Geen TypeScript errors
✓ Geen ESLint warnings
```

### Phase 2 DONE wanneer:

```
✓ Dashboard toont board grid
✓ Kan board aanmaken
✓ Board detail met tabs werkt
✓ Kan tickets aanmaken
✓ Kan sub-tickets aanmaken
✓ List en Kanban view werken
✓ Drag-drop werkt
```

### Phase 3 DONE wanneer:

```
✓ Sprint aanmaken werkt
✓ Tickets auto-migreren naar nieuwe sprint
✓ Sprint selector toont historie
✓ Alle animaties smooth
✓ Keyboard navigatie werkt
✓ E2E tests PASS
✓ Lighthouse score > 90
```

---

## 📊 Progress Tracking Template

```markdown
# Sensey Board - Development Progress

## Current Status: Phase [1/2/3]

### Phase 1 - Foundation

| Agent                | Status   | Attempt | Notes |
| -------------------- | -------- | ------- | ----- |
| 1. Project Architect | ⏳/✅/❌ | 1       |       |
| 2. Design System     | ⏳/✅/❌ | 1       |       |
| 3. Database          | ⏳/✅/❌ | 1       |       |
| 4. Auth              | ⏳/✅/❌ | 1       |       |
| 5. API               | ⏳/✅/❌ | 1       |       |

**Phase 1 Status:** ⏳ In Progress / ✅ PASSED / 🔄 Retry

### Phase 2 - Features

| Agent             | Status   | Attempt | Notes |
| ----------------- | -------- | ------- | ----- |
| 6. Core UI        | ⏳/✅/❌ | 1       |       |
| 7. Board Features | ⏳/✅/❌ | 1       |       |
| 8. Ticket System  | ⏳/✅/❌ | 1       |       |

**Phase 2 Status:** ⏳ Not Started

### Phase 3 - Polish

| Agent              | Status   | Attempt | Notes |
| ------------------ | -------- | ------- | ----- |
| 9. Sprint Features | ⏳/✅/❌ | 1       |       |
| 10. Polish         | ⏳/✅/❌ | 1       |       |

**Phase 3 Status:** ⏳ Not Started

---

## Timeline

- Phase 1 Started: [date]
- Phase 1 Completed: [date]
- Phase 2 Started: [date]
- Phase 2 Completed: [date]
- Phase 3 Started: [date]
- Phase 3 Completed: [date]
- **Production Ready:** [date]
```

---

## 🚀 Start Commando

Om te beginnen, stuur dit naar jezelf (QA Lead):

```markdown
# START SENSEY BOARD DEVELOPMENT

Ik ben de QA Lead Agent voor het Sensey Board project.

Mijn verantwoordelijkheden:

1. Coördineer 10 development agents
2. Review code na elke phase
3. Ensure quality via acceptance criteria
4. Iterate tot production-ready

## Eerste Actie

Start Phase 1 door prompts te sturen naar Agents 1-5.

## Reference Documents

- Main Plan: sensey-board-plan.md
- This Guide: agent-orchestration.md

INITIATING PHASE 1...
```

---

**🎯 Remember:** Quality over speed. Beter 3 iteraties met goed resultaat dan 1 iteratie met bugs.
