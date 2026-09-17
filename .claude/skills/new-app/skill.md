---
name: new-app
description: End-to-end workflow for creating a new application from scratch. Produces domain research, PRD, architecture, and an AI graph engineering document (task graph + loop specs) so thorough that any AI agent can execute the build node-by-node.
---

# New Application Workflow

You are executing the **new application workflow**. This skill takes a product idea from zero to a working app skeleton, producing an **AI graph engineering document** as the central artifact — a formal task graph with loop specifications that Claude Code agents can execute node-by-node through subagent infrastructure.

**This skill produces documentation AND a working skeleton.** Phases 1-5 produce specs and the graph engineering doc. Phases 6-7 scaffold and wire the app. Features come later via `/new-feature` → `/implementation`.

Unlike `/new-feature` (which adds features to an existing codebase), `/new-app` creates the codebase itself. The graph engineering document (`docs/graph-engineering.md`) is the living roadmap — any future Claude Code session reads it to know exactly what to build next, with what agent, in what order, verified how.

<!-- === CONFIGURATION START === -->
## Configuration

| Setting | Value |
|---------|-------|
| **Patterns Directory** | `~/Development/patterns/` |
| **Port Registry** | `~/Development/patterns/port-registry.md` |
| **Blueprint Checklist** | `~/Development/patterns/blueprint/checklist.md` |
| **Projects Root** | `~/Development/` |
| **PRD Directory** | `.claude/docs/prd/` |
| **ADR Directory** | `docs/adr/` |
| **Graph Engineering Doc** | `docs/graph-engineering.md` |
| **Roadmap Directory** | `docs/roadmap/` |
| **Main Documentation File** | `CLAUDE.md` |

<!-- === CONFIGURATION END === -->

---

## Waterfall Process

Execute these phases IN ORDER. Do not skip phases. Phases 1-4 produce documents. Phase 5 produces the graph engineering specification. Phases 6-7 produce a working project.

```
+----------------------------------------------------------------------+
|                    NEW APPLICATION WATERFALL                           |
+----------------------------------------------------------------------+
|                                                                       |
|  Phase 1: DOMAIN RESEARCH                                            |
|  +-> Understand the problem space before any code                    |
|  +-> Gather existing domain knowledge (docs/, conversations)         |
|                          |                                            |
|  Phase 2: LANDSCAPE ANALYSIS                                        |
|  +-> What exists, what's missing, where the gap is                   |
|                          |                                            |
|  Phase 3: PRODUCT DEFINITION                                         |
|  +-> User journeys, progression model, core PRD                     |
|  +-> App identity, named agent persona (if applicable)               |
|                          |                                            |
|  Phase 4: ARCHITECTURE + PATTERN SELECTION                           |
|  +-> Which patterns from ~/Development/patterns/ to install          |
|  +-> Data models, route structure, component hierarchy               |
|  +-> ADR for key architectural decisions                             |
|                          |                                            |
|  Phase 5: GRAPH ENGINEERING                                          |
|  +-> Task graph: nodes, edges, state schema                         |
|  +-> Loop specs: trigger, cycle, evaluator, stop condition           |
|  +-> Build phases: topological sort of the graph                     |
|  +-> THE single source of truth for "what do I build next?"          |
|                          |                                            |
|  Phase 6: PROJECT SCAFFOLDING                                        |
|  +-> Run blueprint checklist: Vite, Tailwind, Supabase, port claim   |
|  +-> Install patterns in graph-defined order                         |
|  +-> Set up agents, hooks, skills                                    |
|                          |                                            |
|  Phase 7: SKELETON IMPLEMENTATION                                    |
|  +-> Core app shell: routing, layout, auth, AI gateway, PWA         |
|  +-> Placeholder pages for each major route                          |
|  +-> Build passes, dev server starts, app loads in browser           |
|                                                                       |
+----------------------------------------------------------------------+
```

<!-- === PHASE AGENTS START === -->

### Phase-to-Agent Mapping

| Phase | Agent(s) | Fallback (if agent unavailable) |
|-------|----------|--------------------------------|
| 1. Domain Research | (main context) | — |
| 2. Landscape Analysis | (main context) | — |
| 3. Product Definition | `prd-specialist`, `ui-designer`, `mobile-ux-optimizer` | Perform in main context |
| 4. Architecture | `code-architect` | Perform in main context |
| 5. Graph Engineering | (main context) | — |
| 6. Project Scaffolding | (main context) | — |
| 7. Skeleton | `frontend-developer`, `backend-architect` | Perform in main context |

Agents won't exist until Phase 6 installs harbormoon. Before that, perform all phases in main context. After Phase 6, agents are available for Phase 7.

<!-- === PHASE AGENTS END === -->

---

## Phase 1: Domain Research

Before writing a single line of code or spec, understand the problem space deeply.

### 1.1 Gather Existing Knowledge

Check for pre-existing research:

1. **Conversation transcripts** — look in `docs/` for notes, transcripts, or conversation logs
2. **Reference materials** — bookmarks, articles, competitor URLs the user has shared
3. **User's own experience** — what they already know from personal involvement

Read everything the user has already captured. Do NOT skip this.

### 1.2 Domain Deep Dive

For each domain the app touches, answer:

| Question | Why It Matters |
|----------|---------------|
| Who are the users? | Defines persona, age groups, experience levels |
| What is the core problem? | The pain point the app solves |
| What does "success" look like for a user? | Drives the progression model |
| What domain vocabulary matters? | Users expect domain-native language |
| What is the emotional arc? | From intimidation/curiosity to mastery/belonging |
| What are the local/geographic factors? | City-specific content, regional differences |
| What existing communities exist? | Potential user acquisition channels |

### 1.3 Ask the User

After reading existing materials, identify gaps and ask targeted questions:

- What is the first experience you want a new user to have?
- What does a power user look like 6 months in?
- What content already exists vs. what needs to be created?
- Is this single-city or multi-city? What is the launch city?
- What is the monetization model?
- Are there age/experience segments that get different content?

**Output**: `.claude/docs/domain-research.md`

---

## Phase 2: Landscape Analysis

### 2.1 Competitive Survey

For each competitor, document:

| Field | Content |
|-------|---------|
| Name + URL | What is it? |
| What it does well | Features worth learning from |
| What it does poorly | Gaps and pain points |
| Business model | How it makes money |
| User sentiment | App Store reviews, Reddit, social media |

### 2.2 Gap Analysis

1. **Unserved needs** — what no existing product does
2. **Poorly served needs** — what existing products do badly
3. **Positioning statement** — "Unlike [competitor], our app [differentiator] because [reason]"

### 2.3 Content Strategy

- Where does initial content come from? (curated, user-generated, AI-generated)
- What is the content update cadence?
- Is there a cold-start problem? How do you solve it?

**Output**: `.claude/docs/landscape.md`

---

## Phase 3: Product Definition

### 3.1 User Journey Mapping

Map Level 0 (first-time) through power user:

```markdown
### Level 0: First Contact
- How does the user discover the app?
- What do they see in the first 30 seconds?
- What is the first action they take?
- What reward/value do they get immediately?

### Level 1-N: Progression
- What milestones mark advancement?
- What unlocks at each level?
- How does the experience deepen?
```

### 3.2 Progression Model (if applicable)

| Level | Name | Criteria to Reach | Unlocks |
|-------|------|-------------------|---------|
| 0 | (starting) | Sign up | Core features |
| 1 | ... | ... | ... |

For each level: visual indicator, concrete criteria (quantifiable), what unlocks.

### 3.3 Core PRD

1. **App Identity**: Name, tagline, one-paragraph description
2. **Target Users**: Primary persona, secondary personas, anti-personas
3. **Core User Stories**: The 5-8 stories that define the MVP
4. **Feature Inventory (MVP)**: Numbered features with P0/P1/P2 priority
5. **Feature Inventory (Post-MVP)**: Features explicitly deferred
6. **Non-Functional Requirements**: Performance, offline, accessibility
7. **Monetization Model**: How the app makes money (or doesn't)
8. **Success Metrics**: DAU, retention, engagement
9. **Content Architecture**: Content types, structure, delivery
10. **City/Region Model** (if applicable): How geographic specificity works

### 3.4 Agent Persona (if applicable)

If the app includes a named AI character:

- **Name and backstory** — who is this character?
- **Voice and tone** — how do they speak? What vocabulary?
- **Visual design direction** — avatar style, speech bubble aesthetic
- **Knowledge boundaries** — what do they know? What do they defer on?
- **Personality traits** — 3-5 defining characteristics

### 3.5 App Aesthetic

- Color palette (primary, secondary, accent)
- Typography intent
- Tone of voice
- UI paradigm (map, chat, cards, etc.)

**Output**: `.claude/docs/prd/app-prd.md`, `.claude/docs/user-journey.md`

---

## Phase 4: Architecture + Pattern Selection

### 4.1 Pattern Audit

Read `~/Development/patterns/` and determine which patterns this app needs.

#### Core Patterns (every app)

| Pattern | Install Order |
|---------|---------------|
| `blueprint/` | 1st |
| `harbormoon/` | 2nd |
| `claudehooks/` | 3rd (core hooks auto-installed: cost-tracker, conversation-logger, context-stamp) |
| `claudeskills/` | 4th |
| `diagnostics/` | 5th |
| `ai-usage/` | 6th |

#### Code Patterns (selected per app)

| Pattern | When to Include |
|---------|----------------|
| `auth/` | App has user accounts |
| `ai-gateway/` | App uses AI features (includes usage logging via `logUsage()`) |
| `stripe/` | App has purchases or credits |
| `web-push/` | App sends push notifications |
| `project-sota/` | App uses TODO tracking |

For each pattern, confirm: needed (yes/no), install order, customization needed.

### 4.2 Architecture Design

Using the standard stack (React 19 + Vite + TypeScript + Tailwind + Supabase + Dexie + vite-plugin-pwa + Vercel), define:

- **Route structure**: every route with path and purpose
- **Data models**: every table with columns, types, RLS policy sketch
- **Component hierarchy**: component tree from App down
- **PWA configuration**: name, colors, icons, offline strategy

### 4.3 Write ADR(s)

At minimum: `docs/adr/0001-tech-stack-and-patterns.md` documenting why this stack, which patterns, what's excluded.

**Output**: `.claude/docs/prd/architecture.md`, `docs/adr/0001-*.md`

---

## Phase 5: Graph Engineering

This is the phase that makes `/new-app` different from ad-hoc project creation. The graph engineering document is a formal, executable specification — not a prose roadmap.

### 5.1 Concepts

**Graph engineering** represents the app's build plan as an executable graph:
- **Nodes** = build tasks (scaffold, install auth, build mentor chat, etc.)
- **Edges** = dependencies between tasks (auth must exist before ai-gateway)
- **Shared state** = artifacts that flow between nodes (project path, installed patterns, migration files)

**Loop engineering** defines the iterative cycle within each node:
- **Trigger** = what must be true for this node to start
- **Inner cycle** = discover → plan → execute → verify
- **Evaluator** = how to check if the node succeeded
- **Retry strategy** = what to do on failure (max attempts, re-plan approach)
- **Stop condition** = when the node is done

This maps directly onto Claude Code's infrastructure:
- Harbormoon agents → graph nodes
- Claude Code subagents → parallel node execution (fan-out)
- `/new-feature` skill → loop pattern for feature nodes
- `attempts.jsonl` convention → retry tracking

### 5.2 Build the Graph Document

Create `docs/graph-engineering.md` with four sections:

---

#### Section 1: Task Graph Topology

List every node and edge. Use a text-based graph notation:

```markdown
## Task Graph

### Nodes
scaffold, supabase-init, blueprint, harbormoon, hooks, skills,
auth-migration, auth-ui, ai-gateway-edge-fn, ai-gateway-client,
app-shell, [feature-nodes...]

### Edges (arrows = "must complete before")
scaffold → supabase-init
supabase-init → blueprint → harbormoon → hooks → skills
supabase-init → auth-migration → auth-ui
auth-ui → app-shell
auth-migration → ai-gateway-edge-fn → ai-gateway-client
app-shell → [feature-nodes]
```

Visualize the graph as an ASCII DAG showing parallel tracks.

---

#### Section 2: Node Specifications

For EVERY node, write a formal spec:

```markdown
### Node: <node-name>
- **Type**: scaffold | pattern-install | migration | feature | config
- **Agent**: <agent-name> or (main context)
- **Depends on**: <node-names>
- **Inputs**: <what this node reads — PRD sections, pattern files, prior node outputs>
- **Outputs**: <what this node produces — files, tables, configs>
- **Loop pattern**: <one-shot | plan-execute-verify>
- **Evaluator command**: <a command with a pass/fail exit code, or a test file path>
- **Success criteria**: <observable, testable conditions>
- **Estimated effort**: Trivial | Small | Medium | Large
- **Pattern(s)**: <pattern paths from ~/Development/patterns/ if applicable>
```

**Evaluator rules:**
1. The evaluator MUST be executable — a command whose exit code decides pass/fail, or a test file the runner executes. "Deploy and observe," "check in browser," and "user confirms on iPhone" are NOT evaluators.
2. Human/production observation may appear only as a **final smoke step** listed AFTER the executable evaluator has passed — it confirms, it never decides.
3. If the behavior cannot be expressed as a command (data-shaped behavior like scraper extraction), the node MUST create or extend a fixture (input file + expected output file) and the evaluator is the fixture test.
4. Nodes whose Outputs touch auth, RLS policies, or Edge Function input handling MUST include a `/security-review` step in their loop's Verify stage.

For feature nodes, also include:
- **PRD reference**: which PRD section defines this feature
- **Skill invocation**: `/new-feature` for the documentation phase, then implementation

#### Example: Diagnostics Node

Every graph document includes this diagnostics node in Phase 1:

```markdown
### Node: diagnostics
- **Type**: pattern-install
- **Agent**: (main context)
- **Depends on**: scaffold, supabase-init
- **Inputs**: `~/Development/patterns/diagnostics/` (lib, vite-plugin, migration), `src/lib/supabase.ts`, `vite.config.ts`, `src/main.tsx`
- **Outputs**: `src/lib/diagnostics.ts`, `vite-plugins/diagLogPlugin.ts`, `supabase/migrations/*_diagnostics.sql`, `.claude/rules/diagnostics.md`, updated `vite.config.ts`, updated `src/main.tsx`, updated `.gitignore`
- **Loop pattern**: plan-execute-verify
- **Success criteria**: `npm run build` passes, dev server shows `[diag] session started` in console, `.diagnostics/console.log` appears during dev, `diagnostics` table exists in Supabase with RLS, MCP can query diagnostics table (empty result, not error)
- **Estimated effort**: Small
- **Pattern(s)**: `~/Development/patterns/diagnostics/`
```

#### Example: AI Usage Node

Every graph document includes this ai-usage node in Phase 1:

```markdown
### Node: ai-usage
- **Type**: pattern-install
- **Agent**: (main context)
- **Depends on**: scaffold, supabase-init
- **Inputs**: `~/Development/patterns/ai-usage/` (migration, logUsage.ts)
- **Outputs**: `supabase/migrations/*_ai_usage.sql`, `supabase/functions/_shared/logUsage.ts`
- **Loop pattern**: plan-execute-verify
- **Success criteria**: `supabase db push` succeeds, `ai_usage` table exists with RLS, test AI call produces a row in `ai_usage`
- **Estimated effort**: Small
- **Pattern(s)**: `~/Development/patterns/ai-usage/`
```

---

#### Section 3: Loop Specifications

For each node with `plan-execute-verify` loop pattern, write:

```markdown
## Loop: <node-name>
- **Trigger**: <which nodes must be in state "complete">
- **Inner cycle**:
  1. Discover: read inputs, existing code, PRD sections
  2. Plan: design the change
  3. Test: translate this node's success criteria into FAILING tests
     (via /create-tests conventions). Run them; confirm red.
     COMMIT the failing tests before any implementation.
  4. Execute: implement. Test files are FROZEN: the implementation MUST NOT
     modify any test committed in step 3. If a test turns out to be wrong,
     STOP, surface it to the author, amend only with sign-off.
  5. Verify: run the Evaluator command. On green, run the fresh-context
     verification (below). Append an attempts record.
- **Evaluator command**: <executable command — exit code decides pass/fail>
- **Retry**: on verify failure → <read error, re-plan, re-execute> (max <N> cycles)
- **Stop condition**: all success criteria pass
```

**Fresh-context verification:** At node close, spawn ONE subagent (Argus/code-reviewer) whose prompt contains ONLY: the node spec, the diff (`git diff` of the node's files), and the Evaluator command — no implementation conversation. The subagent runs the evaluator and reads the diff cold. A node is complete only when this verifier reports pass.

**Attempts record:** Every Verify cycle appends one line to `docs/graphs/attempts.jsonl`:
`{"ts":"<ISO-8601>","graph":"<doc>","node":"<name>","cycle":<n>,"gate":"<test|typecheck|fixture|fresh-verify>","result":"pass|fail","note":"<≤120 chars>"}`
Retry budgets are enforced by counting this file, not by memory. The file is tracked in git and travels in the same commit as the node's source changes.

One-shot nodes (scaffold, config, pattern-install) don't need loop specs — they either work or they don't.

#### Example: Diagnostics Loop

Every graph document includes this loop spec:

```markdown
## Loop: diagnostics
- **Trigger**: scaffold and supabase-init complete
- **Inner cycle**:
  1. Discover: Read `~/Development/patterns/diagnostics/` — `lib/diagnostics.ts`, `vite-plugin/diagLogPlugin.ts`, `supabase/migrations/`
  2. Plan: Identify app name, Supabase client import path, vite.config.ts plugin array location, main.tsx init location
  3. Execute:
     - Copy `diagnostics.ts` to `src/lib/diagnostics.ts` (add `// @ts-nocheck` header — vendored pattern)
     - Copy `diagLogPlugin.ts` to `vite-plugins/diagLogPlugin.ts`
     - Copy migration SQL to `supabase/migrations/YYYYMMDD_diagnostics.sql`
     - Add `diagLogPlugin()` to `vite.config.ts` plugins array
     - Add `initDiagnostics()` call to `src/main.tsx` with app name and Supabase client
     - Add `.diagnostics/` to `.gitignore`
     - Copy `~/Development/patterns/diagnostics/rules/diagnostics.md` to `.claude/rules/diagnostics.md`
  4. Verify: `npm run build` passes, start dev server, confirm `[diag] session started` appears, confirm `.diagnostics/console.log` created, run `supabase db push`, confirm table exists, confirm MCP can query diagnostics table
- **Evaluator**: Build clean + dev console shows session init + local log file created + Supabase table exists with correct RLS + MCP query returns result (not error)
- **Retry**: on build failure → check TypeScript errors in diagnostics.ts (vendored file may need `// @ts-nocheck`) → fix → rebuild (max 3 cycles)
- **Stop condition**: All four verify checks pass
- **Attempt tracking**: append to `attempts.jsonl` on each cycle
```

#### Example: AI Usage Loop

Every graph document includes this loop spec:

```markdown
## Loop: ai-usage
- **Trigger**: scaffold and supabase-init complete
- **Inner cycle**:
  1. Discover: Read `~/Development/patterns/ai-usage/` — migration SQL, `logUsage.ts`
  2. Plan: Identify Supabase migration naming convention, existing `_shared/` directory structure, which edge functions need wiring
  3. Execute:
     - Copy migration SQL to `supabase/migrations/YYYYMMDD_ai_usage.sql`
     - Copy `logUsage.ts` to `supabase/functions/_shared/logUsage.ts`
     - If ai-gateway exists: add `import { logUsage }` and wire post-response hook
     - Run `supabase db push`
  4. Verify: `ai_usage` table exists in Supabase, test AI call produces a row, no deploy errors
- **Evaluator**: Table exists with correct schema + RLS, test AI call inserts a row
- **Retry**: on db push failure → check SQL syntax → fix → re-push (max 2 cycles)
- **Stop condition**: Table exists and test insert succeeds
- **Attempt tracking**: append to `attempts.jsonl` on each cycle
```

---

#### Section 4: Shared State Schema

Define the state that flows between nodes:

```markdown
## Shared State

| Key | Type | Set by | Consumed by |
|-----|------|--------|-------------|
| project_path | string | scaffold | all subsequent nodes |
| supabase_ref | string | supabase-init | migrations, edge functions |
| port | number | scaffold | app-shell, skeleton verification |
| installed_patterns | string[] | pattern-install nodes | feature nodes |
| migration_files | string[] | migration nodes | verification |
| verified_features | string[] | verify steps | progress tracking |
```

---

#### Section 5: Build Phases (Topological Sort)

Sort the graph into executable phases. Nodes within a phase have no dependencies on each other and CAN run in parallel (via Claude Code subagents).

```markdown
## Build Phases

### Phase 0: Foundation
- [ ] scaffold (npm create vite)
- [ ] supabase-init

### Phase 1: Infrastructure (parallel tracks)
Track A: blueprint → harbormoon → hooks → skills
Track B: auth-migration → ai-gateway-edge-fn
Track C: diagnostics
Track D: ai-usage

### Phase 2: Core Shell
- [ ] auth-ui
- [ ] ai-gateway-client
- [ ] app-shell
- [ ] pwa-config

### Phase 3: Feature Set 1 (can fan out)
- [ ] [feature-a] (subagent 1)
- [ ] [feature-b] (subagent 2)

### Phase N: Polish + Deploy
- [ ] web-push
- [ ] first deploy
```

Each phase is a checkpoint. All nodes in a phase must pass verification before the next phase begins.

---

### 5.3 Validate the Graph

Before declaring Phase 5 complete:

- [ ] Every node has all 8 required fields (type, agent, depends-on, inputs, outputs, loop-pattern, success-criteria, effort)
- [ ] Every edge represents a real dependency (removing it would cause a build failure)
- [ ] No circular dependencies exist
- [ ] Build phases are a valid topological sort
- [ ] Feature nodes reference their PRD sections
- [ ] Pattern nodes reference exact paths in `~/Development/patterns/`
- [ ] Loop specs have concrete evaluators (not "works correctly" — specific observable checks)
- [ ] State schema accounts for every artifact that flows between nodes

**Output**: `docs/graph-engineering.md`

---

## Phase 6: Project Scaffolding

Execute the foundation nodes from the graph. Follow `~/Development/patterns/blueprint/checklist.md` step by step.

### 6.1 Scaffold

```bash
cd ~/Development/
npm create vite@latest [project-name] -- --template react-ts
cd [project-name] && npm install
npm install -D tailwindcss @tailwindcss/vite
npm install @supabase/supabase-js react-router-dom dexie dexie-react-hooks
npm install -D vite-plugin-pwa
```

### 6.2 Claim a Port

Read `~/Development/patterns/port-registry.md`, pick next available in 5170-5299, set in `vite.config.ts`, update registry.

### 6.3 Version Stamp + Changelog

Per blueprint checklist Section 2: `__APP_VERSION__`, `__BUILD_TIME__` in vite.config.ts + global.d.ts.

Additionally, create a **clickable VersionStamp component** following the Glyffiti convention:
1. Create `src/data/changelog.ts` with a `CHANGELOG` array of `PatchNote` entries (`version`, `date`, `title`, `summary`, `details?`)
2. Create `src/components/VersionStamp.tsx` — clickable version badge that opens a changelog dropdown (latest 3 entries), with an unread indicator (star icon) when a new version is available
3. Use `VersionStamp` in the Header instead of a static version string
4. Track seen version in localStorage (`{app-name}-changelog-seen`)

### 6.4 Supabase Setup

```bash
supabase init
supabase link --project-ref <ref>
```

Create `.env.local` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

### 6.5 Install Patterns (in graph-defined order)

Execute the pattern-install nodes from the graph in topological order:

```bash
~/Development/patterns/blueprint/install.sh .
~/Development/patterns/harbormoon/install.sh .
~/Development/patterns/claudehooks/install.sh .  # Core hooks (cost-tracker, conversation-logger, context-stamp) auto-installed
~/Development/patterns/claudeskills/install.sh .
```

Then copy code patterns (auth/, ai-gateway/, etc.) as specified by the graph.

### 6.6 Install Diagnostics

Copy the diagnostics pattern into the project:

1. Copy `~/Development/patterns/diagnostics/lib/diagnostics.ts` → `src/lib/diagnostics.ts`
   - Add `// @ts-nocheck` at the top (vendored pattern — type mismatches across projects are expected)
2. Copy `~/Development/patterns/diagnostics/vite-plugin/diagLogPlugin.ts` → `vite-plugins/diagLogPlugin.ts`
3. Copy the migration SQL from `~/Development/patterns/diagnostics/supabase/migrations/` → `supabase/migrations/YYYYMMDD_diagnostics.sql`
4. Add `import { diagLogPlugin } from './vite-plugins/diagLogPlugin.js'` to `vite.config.ts`
5. Add `diagLogPlugin()` to the plugins array in `vite.config.ts`
6. In `src/main.tsx`, add:
   ```typescript
   import { initDiagnostics } from './lib/diagnostics'
   import { supabase } from './lib/supabase'

   initDiagnostics({
     app: '<app-name>',
     supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
     supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
     supabaseClient: supabase,
   })
   ```
7. Add `.diagnostics/` to `.gitignore`
8. Copy `~/Development/patterns/diagnostics/rules/diagnostics.md` → `.claude/rules/diagnostics.md`
   - This gives every future Claude session the log extraction protocol and backend log table standards

### 6.6.5 Verify MCP Log Access

Confirm the MCP configuration can read the diagnostics table:

1. Verify `.mcp.json` uses the HTTP MCP pattern:
   ```json
   "supabase": {
     "type": "http",
     "url": "https://mcp.supabase.com/mcp?project_ref=<PROJECT_REF>&read_only=true"
   }
   ```
2. Verify the `diagnostics` table has `anon SELECT` RLS (it does by default from the migration)
3. If the project has any other `*_logs` tables at this point, verify each has `anon SELECT` RLS
4. Test: use MCP to query `SELECT count(*) FROM diagnostics` — should return 0 (table is empty but accessible)

### 6.7 Install AI Usage Tracking

Copy the ai-usage pattern into the project:

1. Copy migration SQL from `~/Development/patterns/ai-usage/supabase/migrations/create_ai_usage.sql` → `supabase/migrations/YYYYMMDD_ai_usage.sql`
2. Copy `~/Development/patterns/ai-usage/supabase/functions/_shared/logUsage.ts` → `supabase/functions/_shared/logUsage.ts`
3. Run `supabase db push` to create the `ai_usage` table

If the app includes `ai-gateway/`:
4. Verify that `ai-gateway/index.ts` imports and calls `logUsage()` in the post-response hook
5. Verify that the `feature` field is extracted from the request body and passed to `logUsage()`

### 6.8 Initialize Git

```bash
git init
git add -A
git commit -m "Initial scaffold with patterns installed"
```

### 6.9 Vercel Setup

```bash
vercel link
```

Create `vercel.json` (static only, no serverless).

**Checkpoint**: `npm run dev` starts. All pattern files in place. `.claude/` directory has agents, hooks, skills, rules.

---

## Phase 7: Skeleton Implementation

Execute the core-shell nodes from the graph. Build the minimum app shell that proves every installed pattern works.

### 7.1 CLAUDE.md

Create with: project overview, stack snippet, agent orchestration section, directory layout, key files, dev commands, reference to `docs/graph-engineering.md`.

### 7.2 App Shell

| File | Purpose |
|------|---------|
| `src/App.tsx` | Router + providers |
| `src/pages/Landing.tsx` | Public landing page |
| `src/pages/AppShell.tsx` | Protected layout |
| `src/pages/Settings.tsx` | User settings |
| `src/components/Header.tsx` | Header with version badge |
| `src/components/Navigation.tsx` | Bottom nav (mobile) / sidebar (desktop) |

### 7.3 Auth Integration

Wire auth pattern: AuthProvider, login/signup pages, protected routes, logout. Test: signup → login → protected content → logout.

### 7.4 AI Gateway Integration

Deploy edge function, configure provider, wire `callModel()`. Test: prompt → response with JWT auth.

### 7.5 PWA Configuration

vite-plugin-pwa in vite.config.ts, manifest with app name/colors/icons, service worker, offline fallback.

### 7.6 Database Seed

Apply initial migrations from the graph's migration nodes. Verify RLS policies.

### 7.7 Verification Checklist

ALL must pass:

- [ ] `npm run dev` starts without errors
- [ ] `npm run build` completes without errors
- [ ] App loads in browser at claimed port
- [ ] Version badge shows in header
- [ ] Can sign up, log in, access protected routes, log out
- [ ] Can send test AI prompt and receive response
- [ ] PWA manifest served correctly
- [ ] Service worker registers
- [ ] First deploy to Vercel succeeds
- [ ] `.claude/` directory complete (agents, rules, hooks, skills)
- [ ] `CLAUDE.md` exists
- [ ] `docs/graph-engineering.md` exists
- [ ] Diagnostics: `[diag] session started` appears in browser console on page load
- [ ] Diagnostics: `.diagnostics/console.log` file created during dev
- [ ] Diagnostics: `diagnostics` table exists in Supabase with RLS policies
- [ ] Diagnostics: MCP can query `diagnostics` table (returns empty result, not an error)
- [ ] Diagnostics: `.mcp.json` uses `type: "http"` pattern (not `npx` with access token)
- [ ] Diagnostics: `.claude/rules/diagnostics.md` exists with log extraction protocol
- [ ] AI Usage: `ai_usage` table exists in Supabase with RLS policies
- [ ] AI Usage: test AI prompt generates a row in `ai_usage` (check via Supabase dashboard)
- [ ] Hooks: cost-tracker.sh installed in `.claude/hooks/` and shows token costs after responses
- [ ] Hooks: conversation-logger.sh installed in `.claude/hooks/` and writes to `.claude/memory/daily/`
- [ ] No console errors in browser DevTools

**Output**: Running application skeleton with all patterns working

---

## Checkpoints

- [ ] **Phase 1 → 2**: Domain research doc exists, user answered key questions
- [ ] **Phase 2 → 3**: Landscape analyzed, positioning clear, content strategy defined
- [ ] **Phase 3 → 4**: PRD with MVP features, user journey mapped, progression defined
- [ ] **Phase 4 → 5**: Patterns selected, architecture designed, ADR written
- [ ] **Phase 5 → 6**: Graph engineering doc complete — all nodes specified, topology valid, loop specs written
- [ ] **Phase 6 → 7**: All patterns installed, `npm run dev` works, git initialized
- [ ] **Phase 7 → Done**: Skeleton verification checklist passes, first deploy succeeds

---

## After /new-app Completes

The app exists but has no features. Read `docs/graph-engineering.md` Build Phases to determine what to build next. For each feature node:

1. `/new-feature` — produce PRD, architecture, QA doc for the feature
2. Execute the node's loop spec — discover, plan, execute, verify
3. Update the graph: mark node as complete, update shared state
4. Advance to the next phase when all nodes in the current phase pass

| Next Step | Skill | When |
|-----------|-------|------|
| Build Phase 1 features | `/new-feature` per node | Immediately after skeleton |
| Daily workflow | `/standup` | Start of each session |
| Agent growth | `/evolution` | End of each session |
| Doc check | `/docs-check` | Before each push |

---

## Shortcuts

**Small apps** (utility, single-feature, personal tool):
- Phases 1+2: Quick domain check, skip competitive analysis
- Phase 3: Mini-PRD inline, skip progression model
- Phase 5: Simplified graph — fewer nodes, one-shot loop patterns
- Phase 7: Minimal skeleton

**Large apps** (multi-feature, content-heavy, multi-region):
- Each phase may span multiple sessions
- Phase 5 graph becomes the project's living roadmap across sessions
- Consider feature branches per graph phase

---

## Anti-Patterns

1. **Skip domain research**: Building the wrong thing. Phase 1 exists because domain conversations produce insights no coding session would discover.
2. **Install patterns blindly**: Read each pattern's README. CORS origins, OAuth providers, and config values must be set per-app.
3. **Build features during scaffolding**: The skeleton is routing + auth + AI gateway + PWA. Features come later via `/new-feature`.
4. **Write a prose dependency list instead of a graph spec**: "Auth before gateway" is not a graph. A graph spec names the agent, inputs, outputs, loop pattern, and success criteria for every node.
5. **Skip loop specs**: Without verify steps and retry strategies, agents attempt once and move on. Loop specs force iteration until success criteria pass.
6. **Use Vercel serverless functions**: All server-side logic goes in Supabase Edge Functions.
7. **Put API keys in VITE_ variables**: Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` on the client.
8. **Scaffold without claiming a port**: Check `port-registry.md` first.
9. **Create log tables without anon SELECT RLS**: Every `*_logs` table needs `CREATE POLICY ... FOR SELECT TO anon USING (true)`. MCP uses the anon role. Without this policy, Claude sessions can't read operational logs and waste time debugging "MCP auth failures" that are actually RLS blocks. Include the policy in the same migration that creates the table.
10. **Use the npx MCP server pattern**: The `.mcp.json` must use `"type": "http"` with `read_only=true`. The old `npx @supabase/mcp-server-supabase` pattern requires a Personal Access Token and breaks frequently. The HTTP pattern works without OAuth.

---

**Remember**: The graph engineering document is the artifact that makes this skill powerful. A new Claude Code session reads `docs/graph-engineering.md` and knows exactly what to build, with what agent, verified how, in what order. Without it, every session re-derives the build plan from scratch.
