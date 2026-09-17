---
name: iterate
description: Takes a batch of bugs, features, and changes — explores each, documents findings, builds executable graphs with AI loops, implements with tests, commits deliverables, and maintains a full paper trail with token cost tracking.
---

# Iterate — Batch Issue Resolution

You are executing the **iterate workflow**. The user has pasted a list of items — bugs, missing features, changes, tweaks — discovered while using the product. This skill structures all of them into executable graphs, implements each with tests, commits deliverables as they're ready, and maintains a complete paper trail.

This is the product iteration counterpart to `/new-feature` (single features) and `/new-app` (new projects).

<!-- === CONFIGURATION START === -->
## Configuration

| Setting | Value |
|---------|-------|
| **Iterate Directory** | `docs/iterate/` |
| **Test Command** | `npm run test` |
| **Build Command** | `npm run build` |
| **E2E Command** | `npx playwright test` |
| **Main Documentation File** | `CLAUDE.md` |

<!-- === CONFIGURATION END === -->

## Input

The user pastes a list of items. Each item can be:
- **Bug** — something broken or not working as expected
- **Feature** — something missing that should exist
- **Change** — something that works but needs to be different
- **Data issue** — scraper, schema, or pipeline gap

Items may be terse, conversational, or mixed with context. Parse them into discrete actionable items.

---

## Waterfall Process

Execute these phases IN ORDER. Do not skip phases.

```
+----------------------------------------------------------------------+
|                    ITERATE WATERFALL                                   |
+----------------------------------------------------------------------+
|                                                                       |
|  Phase 1: TRIAGE                                                     |
|  +-> Parse list into discrete items                                  |
|  +-> Categorize: bug | feature | change | data-issue                 |
|  +-> Identify dependencies, assign phases + priority                 |
|  +-> Output: docs/iterate/README.md index                            |
|                          |                                            |
|  Phase 2: EXPLORE (parallel agents)                                  |
|  +-> Per item: investigate root cause or current state               |
|  +-> Find existing code/patterns to reuse                            |
|                          |                                            |
|  Phase 3: DOCUMENT + GRAPH                                           |
|  +-> Per item: create docs/iterate/{slug}.md                         |
|  +-> Diagnosis, executable graph, AI loop specs                      |
|  +-> Empty cost + conversation log sections                          |
|                          |                                            |
|  Phase 4: EXECUTE                                                    |
|  +-> Work through graphs by phase/dependency order                   |
|  +-> Per node: implement -> test -> verify                           |
|  +-> Record token costs per node                                     |
|  +-> Log all AI work + user messages to conversation log             |
|  +-> COMMIT GATE: when item is complete + working, commit & push     |
|                          |                                            |
|  Phase 5: UPDATE                                                     |
|  +-> Mark completed items in README.md                               |
|  +-> Roll up token costs (per item + total)                          |
|  +-> Final conversation log entries                                  |
|                                                                       |
+----------------------------------------------------------------------+
```

---

## Phase 1: TRIAGE

Parse the user's pasted list into discrete items. For each:

1. **Extract** the core ask — strip conversational filler, keep the actionable request
2. **Categorize** as bug, feature, change, or data-issue
3. **Assign priority** P1 (blocking) through P4 (nice-to-have)
4. **Identify dependencies** — data fixes before UI fixes, schema before features, etc.
5. **Group into phases** by dependency order — items in the same phase can run in parallel

**Output**: Create `docs/iterate/README.md` using the index template below.

Present the triage table to the user for approval before proceeding.

---

## Phase 2: EXPLORE

Launch **up to 3 Explore agents in parallel** to investigate items. Group related items per agent.

Each agent should:
- Read the relevant source files
- Grep for related patterns, functions, and components
- Identify root cause (bugs) or current state (features/changes)
- Note existing code that can be reused
- Report findings concisely

**Output**: Findings per item, ready to populate diagnosis sections.

---

## Phase 3: DOCUMENT + GRAPH

For each item, create `docs/iterate/{item-slug}.md` using the per-item template below.

Each doc contains:
- **User's original request** — verbatim quote from their list
- **Diagnosis** — root cause or gap analysis from Phase 2
- **Executable graph** — nodes with AI loop specs:
  - `explore` → `implement` → `test` → `verify`
  - Each node has: loop pattern, expected output, success criteria
- **Empty cost tracking** — populated during Phase 4
- **Empty conversation log** — populated during Phase 4

---

## Phase 4: EXECUTE

Work through the graphs in phase/dependency order.

### Per Node Execution

1. **Implement** — make the code changes
2. **Test** — write unit tests + Playwright e2e tests for the change
3. **Verify** — `npm run build` passes, dev server works, visual check if UI
4. **Record costs** — log input/output tokens and estimated cost to the item doc
5. **Log conversation** — append tool calls, reasoning, user messages to the log table

### Commit Gate

When an item is **complete and working** (not per-node, per-deliverable):

1. Stage the relevant files
2. Commit with descriptive message referencing the item
3. Push to remote
4. Record commit hash in the item doc
5. Version bump if appropriate (`npm version patch --no-git-tag-version`)

**Do NOT commit intermediate work.** Only commit when the user would see a working result: "bug X is fixed" or "feature Y is live."

### Conversation Log Rules

Log **both sides** of the conversation during execution:

| Actor | What to Log |
|-------|-------------|
| `user` | Every message the user sends while working on this item |
| `ai` | Tool calls made, files read/written, reasoning for decisions, test results |

Timestamps use ISO 8601. Keep detail concise but complete enough to reconstruct what happened.

---

## Phase 5: UPDATE

After all items (or a session's worth) are complete:

1. Update `docs/iterate/README.md` — mark items complete, update phase status
2. Roll up token costs — per item totals + grand total
3. Add final conversation log entries with summary
4. Report to user: what shipped, what's left, total cost

---

## Templates

### Per-Item Doc (`docs/iterate/{slug}.md`)

```markdown
# {Title}

**Category:** bug | feature | change | data-issue
**Status:** pending | exploring | in-progress | complete
**Phase:** {N}
**Priority:** {P1-P4}

## User's Original Request
> {verbatim quote from the user's list}

## Diagnosis
{Root cause or current state analysis from exploration}

## Graph

### Node 1: explore
- **Loop:** discover → assess
- **Evaluator command:** {diagnostic command or "manual — exploration only"}
- **Output:** diagnosis section above
- **Tokens:** {input} in / {output} out / ${cost}

### Node 2: test (write FIRST — before implementation)
- **Loop:** translate success criteria into FAILING tests → run → confirm red
- **Evaluator command:** {test runner command — must fail at this stage}
- **Tests:** COMMIT failing tests before Node 3. Tests are FROZEN during implementation.
- **Tokens:** {input} in / {output} out / ${cost}

### Node 3: implement
- **Loop:** plan → code → build-check
- **Evaluator command:** {build + test runner — must now pass}
- **Files:** {list of files modified}
- **Constraint:** MUST NOT modify any test committed in Node 2. If a test is wrong, STOP and surface to author.
- **Tokens:** {input} in / {output} out / ${cost}

### Node 4: verify
- **Loop:** run evaluator → fresh-context verification via Argus subagent → append attempts record
- **Evaluator command:** {build command + test command}
- **Fresh verify:** Spawn Argus with ONLY the node spec, diff, and evaluator — no implementation context.
- **Attempts:** append to `docs/graphs/attempts.jsonl`
- **Tokens:** {input} in / {output} out / ${cost}

**Evaluator rules:** The evaluator must be an executable command (exit code = pass/fail). "Deploy and observe" is not an evaluator. Data-shaped behavior gets fixtures. Nodes touching auth/RLS/Edge Functions must include `/security-review` in Verify.

## Commit
- **Hash:** {sha}
- **Message:** {commit message}
- **Version:** {if version bumped}

## Conversation Log
| Time | Actor | Action | Detail |
|------|-------|--------|--------|
| | user | request | {original prompt} |
| | ai | explore | {tool calls, findings} |
| | user | clarify | {any feedback or redirection} |
| | ai | implement | {files changed, reasoning} |
| | user | feedback | {reactions, corrections, approvals} |
| | ai | test | {test results} |
| | ai | commit | {hash, message} |

## Token Cost Summary
| Node | Input | Output | Est. Cost |
|------|-------|--------|-----------|
| explore | | | |
| implement | | | |
| test | | | |
| verify | | | |
| **Total** | | | |
```

### README Index (`docs/iterate/README.md`)

```markdown
# Iterate — Issue Tracker

**Created:** {date}
**Total Items:** {N}
**Completed:** {N}
**Total Token Cost:** ${sum}

## Phases

### Phase 1: {name} — {status}
| Item | Category | Status | Cost |
|------|----------|--------|------|
| [{title}]({slug}.md) | bug | pending | — |

### Phase 2: {name} — {status}
| Item | Category | Status | Cost |
|------|----------|--------|------|
| [{title}]({slug}.md) | feature | pending | — |
```

---

## Re-run Behavior

When `/iterate` is invoked again in the same project:

1. Read existing `docs/iterate/README.md` to see what's done vs. pending
2. If the user pastes NEW items, append them to the index with new phase assignments
3. If no new items, resume execution from the first incomplete item
4. Completed items are never re-executed unless the user explicitly asks

---

## Notes

- **Playwright**: if not installed, add it as a dev dependency before Phase 4: `npm init playwright@latest`
- **Token tracking**: use the project's `logUsage` pattern if available; otherwise estimate from model pricing
- **Parallel execution**: items in the same phase with no file overlap can run via parallel subagents
- **Large items**: if an item is really a feature (multi-day effort), suggest the user run `/new-feature` for it instead
