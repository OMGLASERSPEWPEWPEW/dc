---
name: observe
description: Diagnostic evolution ritual. Relevant agents audit the project's telemetry coverage and propose concrete expansions — new categories, better interception, smarter alerting. Use when diagnostics feel thin or after a painful debugging session.
---

# Observe: Diagnostic Evolution

Agents examine the project's current diagnostic coverage and propose concrete improvements. Like `/evolution` but focused outward — on what the *project* sees, not what agents learned.

## Philosophy

> "You can't fix what you can't see. You can't see what you don't capture."

Every debugging session that takes too long is a signal that diagnostics are incomplete. This ritual turns that signal into action.

<!-- === CONFIGURATION START === -->

## Configuration

| Setting | Value |
|---------|-------|
| **Diagnostics File** | `src/lib/diagnostics.ts` |
| **Diagnostics Config** | Look for `initDiagnostics()` call in `main.tsx` or `App.tsx` |
| **Log Output** | `.diagnostics/console.log` |
| **Agent Journal Dir** | `.claude/agents/` |
| **Max Agents Per Batch** | 3 |

<!-- === CONFIGURATION END === -->

## Relevant Agents

Not every agent participates. Select from this roster based on what exists in the project's `.claude/agents/` directory:

| Agent | Domain Lens | What They Look For |
|-------|------------|-------------------|
| **devops-engineer** | Infrastructure | Missing server-side signals, flush reliability, log pipeline gaps |
| **debugger** | Bug diagnosis | Categories that would have shortened past debugging sessions |
| **analytics-engineer** | Data value | Metrics that inform product decisions, usage patterns worth tracking |
| **frontend-developer** | UI/UX events | User interactions, render performance, state transitions not captured |
| **performance-engineer** | Speed & resources | Missing timing data, memory signals, bundle/load metrics |
| **backend-architect** (Sashiko) | Server patterns | Edge Function telemetry, RLS failure signals, query performance |
| **security-engineer** | Threat signals | Auth anomalies, suspicious patterns, rate-limiting data |

**Orchestrator (Zephyr)** always runs last to synthesize and prioritize.

## Execution Flow

### Phase 1: Survey Current Coverage

Read the project's diagnostics setup to understand what's already captured:

```bash
# Find the diagnostics module
find src/ -name "diagnostics.ts" -o -name "diagnostics.js" 2>/dev/null

# Find where it's initialized (config values)
grep -r "initDiagnostics" src/ --include="*.ts" --include="*.tsx" -l

# Find all log/warn/error calls (custom diagnostic events)
grep -rn "logMutation\|diag\.log\|diag\.warn\|diag\.error\|log(" src/ --include="*.ts" --include="*.tsx" | head -40

# Check what categories exist
grep -n "category" src/lib/diagnostics.ts | head -20

# Check recent diagnostic output size and recency
ls -la .diagnostics/console.log 2>/dev/null
tail -50 .diagnostics/console.log 2>/dev/null
```

Build a **Coverage Map** — a table of what's captured vs. what's not:

```markdown
| Area | Captured? | Categories | Gaps |
|------|-----------|------------|------|
| Console output | Yes/No | console | ... |
| Uncaught errors | Yes/No | error | ... |
| Fetch requests | Yes/No | fetch | ... |
| Auth state | Yes/No | auth | ... |
| Navigation | Yes/No | nav | ... |
| Device info | Yes/No | device | ... |
| DB mutations | Yes/No | query | ... |
| Realtime/WS | Yes/No | realtime | ... |
| User interactions | ? | — | ... |
| Performance | ? | — | ... |
| State changes | ? | — | ... |
```

### Phase 2: Audit Pain Points

Look for evidence of where better diagnostics would have helped:

```bash
# Recent debugging in conversation logs
ls -t .claude/conversations/ 2>/dev/null | head -5

# Agent journals mentioning debugging frustration
grep -ril "debug\|blind\|couldn't see\|hard to trace\|no log\|missing" .claude/agents/*/journal.md 2>/dev/null

# Recent git commits related to debugging (often contain clues)
git log --oneline --all --grep="fix\|debug\|hotfix\|revert" -20

# Check troubleshooting docs if they exist
ls docs/issues/ 2>/dev/null

# Diagnostic output — look for patterns in errors
grep -c "error" .diagnostics/console.log 2>/dev/null
grep "error" .diagnostics/console.log 2>/dev/null | sort | uniq -c | sort -rn | head -10
```

Build a **Pain Point List** — specific moments where diagnostics fell short:

```markdown
## Pain Points

1. [Date/commit] — [What happened] — [What was missing from logs]
2. ...
```

### Phase 3: Agent Consultations

For each relevant agent found in `.claude/agents/`, prepare a self-contained prompt. Launch in batches of 3.

**Agent Prompt Template:**

```
You are [AGENT_NAME], the [ROLE] for this project.

## Your Mission
Examine this project's diagnostic telemetry and propose 2-3 concrete improvements
from your domain expertise. Each proposal must include:
- **What to capture**: Specific events, metrics, or signals
- **Why it matters**: What debugging/analysis scenario this enables
- **How to implement**: Code snippet or integration approach
- **Category name**: What DiagCategory to use (new or existing)

## Current Coverage
[Insert Coverage Map from Phase 1]

## Known Pain Points
[Insert Pain Point List from Phase 2]

## Your Journal Context
[Insert last "Questions for Tomorrow" and recent entries from their journal.md]

## Constraints
- Must work within the existing diagnostics.ts architecture (buffer + flush)
- Must not add >50 lines to diagnostics.ts per proposal
- Must not break existing captures
- Prefer extending existing interception points over adding new ones
- Each proposal should be independently mergeable

Respond with your 2-3 proposals in this format:

### Proposal: [Title]
**Category**: `[category_name]`
**Captures**: [What events/data]
**Enables**: [What you can now debug/analyze]
**Implementation**:
```typescript
// Code snippet
```
**Lines added**: ~[N]
```

**Launch order:**
1. Batch 1: devops-engineer, debugger, frontend-developer (infrastructure + diagnosis + UI)
2. Batch 2: analytics-engineer, performance-engineer, security-engineer (data + speed + safety)
3. Batch 3: backend-architect/Sashiko (if present — server-side lens)

Skip any agent not found in `.claude/agents/`.

### Phase 4: Orchestrator Synthesis

After all agents report, Zephyr synthesizes:

Read all agent proposals, then produce:

```markdown
## Observe Report — [Project Name] — [Date]

### Coverage Summary
- **Currently capturing**: [N] categories
- **Proposed additions**: [N] new categories, [N] enhancements to existing

### Priority Stack (Highest First)

| # | Proposal | Agent | Impact | Effort | Priority |
|---|----------|-------|--------|--------|----------|
| 1 | ... | ... | High/Med/Low | ~N lines | Ship now |
| 2 | ... | ... | ... | ... | Ship now |
| 3 | ... | ... | ... | ... | Next session |
| 4 | ... | ... | ... | ... | Backlog |

### Impact Reasoning
[1-2 sentences per "Ship now" item explaining WHY it's highest priority — 
tie it to a specific pain point or blind spot]

### Implementation Order
[Ordered list of proposals to implement, with dependency notes]

### What We're Choosing NOT To Capture (And Why)
[Any proposals Zephyr deprioritized with reasoning — over-instrumentation
has costs: noise, performance, storage]
```

### Phase 5: Deliver & Record

1. **Display** the Observe Report to the user
2. **Ask**: "Which proposals should I implement now?"
3. **If the project has agent journals**: Each participating agent appends a brief note to their journal about what they proposed and what was accepted
4. **If the project tracks issues**: Create a tracking issue for backlogged proposals

## When to Run

Invoke `/observe` when:
- After a painful debugging session ("I couldn't tell what was happening")
- After adding a major feature (new surface area = new blind spots)
- Periodically as the app grows (quarterly observability check)
- When diagnostics output feels noisy but unhelpful (signal-to-noise review)
- After an incident or production issue

## Anti-Patterns

- **Don't capture everything** — over-instrumentation creates noise and performance drag
- **Don't add categories without consumers** — if nobody reads it, don't log it
- **Don't duplicate fetch interception** — diagnostics.ts already captures all fetches; add metadata to existing entries instead of new captures
- **Don't log PII** — user IDs get shortened to 8 chars for a reason; new captures must follow the same discipline
- **Don't break the buffer** — all new captures must go through `log()`, `warn()`, or `error()` to use the existing flush pipeline

## Example Proposals (For Reference)

These are examples of the kind of proposals agents might produce:

**From frontend-developer:**
```typescript
// Capture slow renders (React performance)
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 100) {
      log('perf', `Slow render: ${entry.name}`, {
        duration: Math.round(entry.duration),
        type: entry.entryType,
      })
    }
  }
})
observer.observe({ entryTypes: ['measure', 'longtask'] })
```

**From devops-engineer:**
```typescript
// Capture service worker lifecycle
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    log('sw', 'Controller changed — new service worker active')
  })
  navigator.serviceWorker.ready.then((reg) => {
    reg.addEventListener('updatefound', () => {
      log('sw', 'Update found — new worker installing')
    })
  })
}
```

**From performance-engineer:**
```typescript
// Capture Web Vitals (LCP, FID, CLS)
import { onLCP, onFID, onCLS } from 'web-vitals'
onLCP((metric) => log('perf', `LCP: ${Math.round(metric.value)}ms`, metric))
onFID((metric) => log('perf', `FID: ${Math.round(metric.value)}ms`, metric))
onCLS((metric) => log('perf', `CLS: ${metric.value.toFixed(3)}`, metric))
```

**From security-engineer:**
```typescript
// Capture auth anomalies — rapid re-auth or token refresh storms
let authEventTimes: number[] = []
// Inside auth state change handler:
authEventTimes.push(Date.now())
authEventTimes = authEventTimes.filter(t => Date.now() - t < 60_000)
if (authEventTimes.length > 5) {
  warn('auth', 'Auth event storm detected', {
    count: authEventTimes.length,
    windowMs: 60_000,
  })
}
```
