---
name: new-feature
description: Documentation groundwork for new features. Produces PRD, architecture, QA doc, and ADR so thorough that any LLM can implement without shortcuts.
---

# New Feature Documentation Workflow

You are executing the **new feature documentation workflow**. This skill produces complete, implementation-ready documentation — NOT code. The output is a package of specs so detailed and unambiguous that a separate agent (or human) can implement the feature correctly without needing to ask questions, take shortcuts, or invent requirements.

**This skill does NOT implement features.** It does NOT write application code, tests, or stubs. It produces documentation that makes implementation mechanical.

<!-- === CONFIGURATION START === -->
## Configuration

| Setting | Value |
|---------|-------|
| **PRD Directory** | `.claude/docs/prd/` |
| **ADR Directory** | `docs/adr/` |
| **Graph Directory** | `docs/graphs/` |
| **Roadmap Directory** | `docs/roadmap/` |
| **Main Documentation File** | `CLAUDE.md` |

<!-- === CONFIGURATION END === -->

---

## Size Gate

Before starting, assess the feature's size. This determines how much process to apply.

| Size | Signal | Process |
|------|--------|---------|
| **Trivial** | Config change, copy fix, single-file tweak | Skip this skill entirely. Just do it. |
| **Small** | < 1 day, touches 2-5 files, no new data models | Use **Shortcuts** (combine phases, mini-PRD) |
| **Medium** | 1-3 days, new component/endpoint, minor schema change | Full process, standard detail |
| **Large** | 1+ week, new system, multiple new tables/services | Full process, maximum detail, multi-session |

If the user's request is Trivial, say so and ask if they still want full documentation. Don't produce a 2000-word PRD for a 30-minute fix.

---

## Waterfall Process

Execute these phases IN ORDER. Do not skip phases. Every phase produces a document, not code.

```
+----------------------------------------------------------------------+
|                    NEW FEATURE DOCUMENTATION                          |
+----------------------------------------------------------------------+
|                                                                       |
|  Phase 1: STRATEGY                                                   |
|  +-> Analyze request, check roadmap fit, update roadmap doc          |
|                          |                                            |
|  Phase 2: REQUIREMENTS                                               |
|  +-> Create comprehensive PRD with specs, acceptance criteria        |
|                          |                                            |
|  Phase 3: UX RESEARCH (if user-facing)                               |
|  +-> UX and mobile optimization input                                |
|                          |                                            |
|  Phase 4: ARCHITECTURE + ADR                                         |
|  +-> Explore existing code, then design with exact specifics         |
|                          |                                            |
|  Phase 5: QA DOC                                                     |
|  +-> Write docs/qa/<feature>.md checklist for verification           |
|                          |                                            |
|  Phase 6: DOCUMENTATION                                              |
|  +-> Update main docs, roadmap status, feature inventory             |
|                          |                                            |
|  Phase 7: HANDOFF REVIEW                                             |
|  +-> Verify the doc package is complete and implementation-ready     |
|                                                                       |
+----------------------------------------------------------------------+
```

<!-- === PHASE AGENTS START === -->

### Phase-to-Agent Mapping

| Phase | Agent(s) | Fallback (if agent unavailable) |
|-------|----------|--------------------------------|
| 1. Strategy | `orchestrator` | Perform in main context |
| 2. Requirements | `prd-specialist` | Perform in main context |
| 3. UX Research | `ui-designer`, `mobile-ux-optimizer` | Perform in main context |
| 4. Architecture + ADR | `code-architect` | Perform in main context |
| 5. QA Doc | (main context) | — |
| 6. Documentation | (main context) | — |
| 7. Handoff Review | (main context) | — |

If an agent is listed but doesn't exist in the project's `.claude/agents/` directory, perform that phase yourself in main context. The phases matter more than who executes them.

<!-- === PHASE AGENTS END === -->

---

## Phase 1: Strategic Analysis

1. **Validate roadmap fit**: Does this feature align with current phase goals?
2. **Check dependencies**: What must exist before this feature?
3. **Assess priority**: Score the feature on reach, impact, confidence, effort
4. **Identify stakeholders**: Who cares about this feature?
5. **Define success metrics**: How will we know it worked?
6. **Update roadmap**: Read `docs/roadmap/roadmap.md` (create if missing), add or update the feature's entry

**Roadmap entry format** (append to `docs/roadmap/roadmap.md`):

```markdown
### <Feature Name>
- **Status:** Planned | In Progress | Shipped
- **Target:** <date or milestone>
- **Priority:** P0 | P1 | P2
- **Dependencies:** <list or "None">
- **Summary:** <1-2 sentence description>
```

**Output**: Go/no-go decision with strategic context + updated roadmap

---

## Phase 2: Product Requirements

Create a PRD with these sections:

1. **Executive Summary**: Problem, solution, impact
2. **User Stories**: As a [user], I want [goal], so that [benefit]
3. **Functional Requirements**: Numbered, testable, implementation-ready (see quality bar below)
4. **Non-Functional Requirements**: Performance, security, accessibility
5. **Technical Considerations**: Data model, API changes, integrations
6. **UI/UX Specifications**: Wireframes, flows, states
7. **Success Metrics**: Measurable outcomes
8. **Rollout Plan**: Phased deployment strategy
9. **Risks & Mitigations**: What could go wrong

### Functional Requirements Quality Bar

Every FR must be specific enough that an implementing agent can write code from it without asking questions. Test each requirement against these criteria:

| Criterion | Fail | Pass |
|-----------|------|------|
| **Trigger** | "Users can edit translations" | "When a recipient long-presses a received message that has `translated_content`, the context menu shows 'Edit translation'" |
| **Behavior** | "Show an indicator" | "After submission, the message's timestamp line shows '(translation edited)' in italic at 60% opacity, visible to both sender and recipient" |
| **Error state** | "Handle errors" | "If the `edit-translation` API returns an error, revert the optimistic update and show the error in the action error banner for 5 seconds" |
| **Data** | "Save the edit" | "Update `messages.translated_content` to the new text and set `messages.translation_edited_at` to `NOW()`" |
| **Scope boundary** | (missing) | "No time window — translation edits are allowed on messages of any age. No undo — edits are immediate." |

If you can read a requirement and still have a question about what to build, it's not specific enough.

**Output**: Complete PRD document saved to the PRD directory

---

## Phase 3: UX Research (if user-facing)

For features with UI, document:

- **User mental models**: What existing behavior does this extend? What will users expect based on other apps?
- **Touch targets**: All interactive elements ≥ 44px
- **Progressive disclosure**: What's shown vs. hidden by default?
- **Mobile-first layout**: How does this work on 375px width?
- **Accessibility**: Screen reader labels, keyboard nav, focus management
- **Error/empty states**: What does the user see when there's no data, or when something fails?

**Output**: UX recommendations integrated into PRD

---

## Phase 4: Architecture Design + ADR

### 4.1 Prior Art Search (MANDATORY)

Before designing anything new, search the existing codebase:

1. **Similar features**: Does something like this already exist? Can it be extended?
2. **Patterns**: How do existing features in this area work? (hooks, components, API structure)
3. **Utilities**: What existing helpers, shared code, or libraries can be reused?
4. **Conventions**: File naming, folder structure, import style, error handling patterns

Document what you found. The architecture MUST build on existing patterns, not invent new ones. If you're proposing a new pattern, justify why existing patterns don't work.

### 4.2 Architecture Document

For each of these, provide EXACT specifics — not vague descriptions:

| Section | Bad (vague) | Good (implementable) |
|---------|-------------|---------------------|
| **File paths** | "Add an edge function" | "Create `supabase/functions/edit-translation/index.ts`" |
| **Function signatures** | "Add an editTranslation function" | "`editTranslation(messageId: string, content: string): Promise<string \| null>`" |
| **API contracts** | "Accept the message ID and new content" | "POST body: `{ messageId: string, content: string, language?: string }` — Response 200: `{ ok: true }` — Response 403: `{ error: 'You can only edit translations for messages you received' }`" |
| **Data models** | "Add a timestamp column" | "`ALTER TABLE messages ADD COLUMN translation_edited_at timestamptz;`" |
| **Component hierarchy** | "Add a button to the menu" | "In `MessageActions.tsx`, add after the Read Aloud button: `canEditTranslation = !isMine && !!message.translated_content && !isDeleted`" |
| **Reuse** | (not mentioned) | "Follow the pattern in `useMessageActions.ts:193-212` (editMessage) — same optimistic update + API call structure" |

### 4.3 Write ADR

For any non-trivial architectural decision, create `docs/adr/NNNN-<slug>.md`:

```markdown
# ADR NNNN: <Decision Title>

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Superseded by [NNNN]
**Feature:** <feature name or PRD reference>

## Context
<What is the problem or situation that requires a decision?>

## Decision
<What is the chosen approach?>

## Alternatives Considered
- **<Option A>:** <tradeoff summary>
- **<Option B>:** <tradeoff summary>

## Consequences
- **Positive:** <benefits>
- **Negative:** <costs, risks, tech debt>
- **Neutral:** <side effects>
```

Skip the ADR only when the feature introduces no architectural decisions (pure UI copy changes, config tweaks). When in doubt, write one — a short ADR is better than none.

**Output**: Architecture document (in PRD or standalone) + ADR(s) in `docs/adr/`

### 4.4 Graph Engineering Document (MANDATORY)

Create `docs/graphs/<feature-slug>.md` as a standalone graph-engineering spec in the standard format. This file is automatically discovered by Lighthouse for live visualization during implementation.

The graph MUST follow this structure:

```markdown
# Graph Engineering: <Feature Name>

**Version:** 0.1.0
**Generated:** <date>
**Nodes:** <count> | **Phases:** <count> | **Loop specs:** <count>

---

## Section 1: Task Graph Topology

### Nodes
<GROUP_NAME>: node-a, node-b, node-c

### Edges
node-a → node-b → node-c

---

## Section 2: Node Specifications

#### Node: <node-id>
- **Type**: feature | config | scaffold | pattern-install
- **Agent**: frontend-developer | backend-architect | (main context)
- **Depends on**: <node-id> or (none)
- **Inputs**: <what this node reads>
- **Outputs**: <exact file paths this node creates/modifies>
- **Loop pattern**: one-shot | plan-execute-verify
- **Success criteria**: <observable outcome>
- **Estimated effort**: Trivial | Small | Medium | Large

---

## Section 3: Loop Specifications

### Loop: <node-id>
- **Trigger**: <when this loop starts>
- **Inner cycle**:
  1. Plan: <what to plan>
  2. Execute: <what to build>
  3. Verify: <how to check>
- **Evaluator**: <pass/fail criteria>
- **Retry**: <on failure strategy, max cycles>
- **Stop condition**: <when to stop looping>

---

## Section 5: Build Phases

### Phase 0: <name>
- [ ] node-a
- [ ] node-b → node-c
```

**Rules:**
- Every FR in the PRD maps to at least one graph node
- Every node with non-trivial logic gets a loop spec (plan-execute-verify)
- Node `outputs` must list exact file paths — these are used by Lighthouse's correlator to track progress
- The graph file is STANDALONE — it must be parseable by the graph-engineering parser without the PRD

**Output**: `docs/graphs/<feature-slug>.md`

---

## Phase 5: QA Doc

Write the feature's QA checklist to `docs/qa/<feature-slug>.md`.

### Format

```markdown
# QA: <Feature Name>

**Date:** YYYY-MM-DD
**Scope:** `src/path/to/feature`
**Entry:** /path/where/testing/starts
**Todo:** docs/todo/<feature-slug>.md

## <Behavior Group>
- [ ] <Observable user-facing behavior>
- [ ] <Another observable behavior>

## Regression Risks
- **Medium:** <what could break and where to look>
```

### Writing rules

1. **Derive items from PRD acceptance criteria** — one checkbox per observable behavior
2. **Write what a tester would SEE**, not implementation details
   - Good: "Long-pressing a received translated message shows 'Edit translation' in the context menu"
   - Bad: "canEditTranslation is true when !isMine && !!translated_content"
3. **Include preconditions** — if an item needs setup, say so: "Given a 1:1 chat between users with different languages, when User B long-presses a message from User A..."
4. **Mark human-only items** with `<!-- qa:human <reason> -->` (mobile gestures, audio, visual polish)
5. **Every FR in the PRD maps to at least one QA checkbox** — if an FR has no corresponding QA item, either the FR is untestable (rewrite it) or the QA doc is incomplete

**Output**: `docs/qa/<feature-slug>.md`

---

## Phase 6: Documentation

Update relevant project documentation:

| Document | When to Update |
|----------|----------------|
| Main documentation file | Architecture, patterns, or key files changed |
| Feature inventory | New feature added |
| ADR (`docs/adr/`) | Update status to "Accepted" if still "Proposed" |
| PRD | Note any deviations discovered during architecture |
| Roadmap (`docs/roadmap/roadmap.md`) | Update feature status to "In Progress" |

**Output**: Updated docs + roadmap status

---

## Phase 7: Handoff Review

Verify the documentation package is complete and implementation-ready. An implementing agent should be able to build the feature using ONLY these docs + the codebase — no questions, no ambiguity.

### Completeness Checklist

- [ ] **PRD** has numbered functional requirements that pass the quality bar (trigger, behavior, error state, data, scope boundary)
- [ ] **Architecture doc** specifies exact file paths for every new file
- [ ] **Architecture doc** specifies exact function signatures with types for every new function
- [ ] **Architecture doc** specifies exact API request/response schemas (not just "accepts a message ID")
- [ ] **Architecture doc** specifies exact DB changes as SQL statements
- [ ] **Architecture doc** references existing code to reuse (with file paths and line numbers) — the implementing agent should extend, not reinvent
- [ ] **Graph engineering doc** exists at `docs/graphs/<feature-slug>.md` with nodes, edges, loop specs, and build phases
- [ ] **Graph engineering doc** node outputs list exact file paths (for Lighthouse correlator)
- [ ] **Graph engineering doc** every non-trivial node has a loop spec
- [ ] **ADR** records why the chosen approach was picked over alternatives (if applicable)
- [ ] **QA doc** has one checkbox per observable behavior — an implementing agent can use this as a done-list
- [ ] **Every error state** is specified (what fails, what the user sees, how the system recovers)
- [ ] **Edge cases** are called out explicitly (empty states, offline, concurrent edits, permissions, first-time user)
- [ ] **Migration/deploy steps** are documented if backend changes are involved
- [ ] **No stubs or TODOs** — every section is filled in, not deferred

### Anti-Shortcut Verification

For each check below, mentally simulate a lazy implementing agent trying to cut corners. If the documentation allows it, go back and close the gap.

| Shortcut attempt | How docs prevent it | Verification |
|------------------|--------------------|----|
| Skip error handling | PRD specifies every error state and what the user sees | Read each FR — does it say what happens on failure? |
| Omit edge cases | QA doc has explicit checkboxes for empty/offline/concurrent states | Count QA items vs. edge cases listed in architecture |
| Invent its own API shape | Architecture has exact request/response JSON with all fields typed | Could you write the fetch call from the doc alone? |
| Skip tests | QA doc defines what to verify; architecture specifies test file paths | Does the architecture say where tests go? |
| Cut scope | PRD lists all FRs; QA doc has one checkbox per FR | Count FRs vs. QA checkboxes — do they match? |
| Ignore existing patterns | Architecture section 4.1 names specific files and line ranges to follow | Does the doc say "follow the pattern in X" with a path? |
| Add unnecessary abstraction | Architecture specifies the minimal change — "modify X, add Y" not "create a framework for Z" | Is the scope bounded to what's needed? |

If ANY column says "no" — the documentation is incomplete. Go back and fill the gap before declaring the package ready.

**Output**: Confirmed-complete documentation package ready for handoff

---

## Checkpoints

Before proceeding to the next phase, confirm:

- [ ] **Phase 1 → 2**: Feature approved, roadmap updated
- [ ] **Phase 2 → 3**: PRD created, all FRs pass quality bar
- [ ] **Phase 3 → 4**: UX recommendations documented (if applicable)
- [ ] **Phase 4 → 5**: Architecture defined with exact specifics, prior art documented, ADR written (if applicable), graph engineering doc created at `docs/graphs/`
- [ ] **Phase 5 → 6**: QA doc created, every FR has a corresponding checkbox
- [ ] **Phase 6 → 7**: Main docs updated, roadmap status set to "In Progress"
- [ ] **Phase 7 → Done**: Handoff review passed — all verification checks green

---

## Shortcuts

For **small** features (< 1 day effort), combine phases:
- Phases 1+2: Quick strategic check, mini-PRD inline, roadmap entry
- Phases 3+4: Skip UX if no UI; skip ADR if no architectural decisions
- Phase 5: never skipped for user-facing changes — even 3 QA items is a valid doc
- Phases 6+7: Combine docs update and handoff review

For **large** features (> 1 week effort):
- Each phase may require multiple sessions
- Use task tracking to monitor progress across phases
- Consider splitting into sub-features, each with its own mini-PRD

---

## What This Skill Does NOT Do

This skill produces documentation only. It does NOT:

- Write application code, components, hooks, or functions
- Write test files or test stubs
- Run build or test commands
- Make commits or deploy
- Create placeholder/skeleton files
- Decide to skip documentation because "it's simple enough"

Implementation and testing happen in a separate session (or by a separate agent) using the documentation package as its spec. The value of this skill is that the documentation is so complete that the implementing agent has no room to cut corners.

---

**Remember**: The best implementation spec is one where the implementing agent's job is mechanical — no judgment calls, no ambiguity, no temptation to skip.
