---
name: retro
description: Review the current conversation for errors, wasted effort, and trial-and-error loops, then extract patterns and write them into runbooks and memory to prevent repetition in future sessions.
---

# Retro — Session Retrospective

```
    +==============================================================+
    |                                                              |
    |     * ============================================== *      |
    |     |  R E T R O S P E C T I V E                     |      |
    |     * ============================================== *      |
    |                                                              |
    |   "Mistakes are tuition — but only if you write the receipt" |
    |                                                              |
    |     scan -> classify -> extract -> persist -> summarize      |
    |                                                              |
    +==============================================================+
```

You are executing a **Session Retrospective** — a structured review of the current conversation to find errors, wasted effort, and trial-and-error loops, then codify the lessons learned so they never repeat.

## The Retro Philosophy

Every failed tool call, wrong assumption, and repeated retry is a tax on the user's time and token budget. A retro transforms that waste into durable knowledge — runbooks, memory entries, and project docs that make the next session smarter.

**Core Principle**: If you made the same mistake twice, write it down so you never make it a third time.

<!-- === CONFIGURATION START === -->
## Configuration

| Setting | Value |
|---------|-------|
| **Retry Threshold** | `2` (only flag errors that caused 2+ attempts) |
| **Runbook Directory** | `.claude/runbooks/` |
| **Memory File** | Auto-memory `MEMORY.md` (project-scoped) |
| **Project Docs** | `CLAUDE.md` |
| **Transcript Source** | Current conversation context |

<!-- === CONFIGURATION END === -->

## Execution Flow

```
+-----------------------------------------------------------------------+
|                    RETRO PROTOCOL                                       |
+-----------------------------------------------------------------------+
|                                                                        |
|  Phase 1: SCAN                                                         |
|  +-> Read conversation for failures, retries, wrong assumptions        |
|                        |                                               |
|  Phase 2: CLASSIFY                                                     |
|  +-> Group errors by category                                          |
|                        |                                               |
|  Phase 3: EXTRACT                                                      |
|  +-> Write a "rule" for each error class                               |
|                        |                                               |
|  Phase 4: PERSIST                                                      |
|  +-> Write rules to runbooks, memory, and/or CLAUDE.md                 |
|                        |                                               |
|  Phase 5: SUMMARIZE                                                    |
|  +-> Cost report: errors found, tokens wasted, rules written           |
|                                                                        |
+-----------------------------------------------------------------------+
```

## Phase 1: Scan

Read the full conversation history and identify every instance of:

1. **Tool call failures** — Bash commands that returned errors, file reads that 404'd, API calls that failed
2. **Retries** — The same action attempted 2+ times with variations (different flags, paths, queries)
3. **Wrong assumptions** — Assertions about APIs, schemas, column names, or CLI syntax that turned out to be wrong
4. **Permission errors** — Wrong role, missing privileges, auth failures
5. **Stale knowledge** — Using information from an earlier session that was no longer correct
6. **Brute force sequences** — Long chains of guess-and-check instead of reading docs or checking schema first

For each instance, note:
- **What was attempted** (the action)
- **What went wrong** (the error)
- **How it was eventually resolved** (the fix)
- **How many attempts it took** (the cost)

Only flag instances that hit the retry threshold (see Configuration).

## Phase 2: Classify

Group the errors from Phase 1 into categories:

| Category | Description | Example |
|----------|-------------|---------|
| **Permissions** | Wrong role, missing privileges, auth model misunderstandings | `SET ROLE postgres` needed for vault access |
| **Schema/API** | Wrong column names, nonexistent functions, incorrect API signatures | `net._http_response` has no `url` column |
| **CLI** | Wrong CLI flags, nonexistent subcommands, version-specific behavior | `supabase db execute` doesn't exist |
| **Config** | Missing env vars, wrong config paths, stale credentials | Ephemeral psql passwords expired mid-session |
| **Wrong Tool** | Using the wrong tool for the job, or missing a better tool | Using `grep` instead of reading schema directly |
| **Stale State** | Relying on cached/memorized info that changed | Column renamed in a migration but memory not updated |

If an error doesn't fit these categories, create a new one.

## Phase 3: Extract

For each error category that has 1+ entries, write a **rule** — a concise, actionable pattern:

```
### Rule: [Short title]

**Wrong**: [What was done incorrectly]
**Right**: [The correct approach]
**Why**: [One sentence explaining the root cause]
```

Rules should be:
- **Specific** — not "be careful with psql" but "always SET ROLE postgres before querying vault/cron/net schemas"
- **Actionable** — a future session should be able to follow the rule mechanically
- **Minimal** — one rule per error pattern, not one rule per error instance

## Phase 4: Persist

Write each rule to the appropriate location. **Read the target file first** before writing to avoid duplicates or conflicts.

### Decision Tree

```
Is this rule about a specific operational procedure (psql, deployment, Vault, cron)?
  YES → Append to .claude/runbooks/<topic>.md (create if new topic)
  NO  ↓

Is this rule about a tool, API, or library's behavior?
  YES → Add to MEMORY.md under the relevant section
  NO  ↓

Is this rule a universal project convention that every session should follow?
  YES → Propose addition to CLAUDE.md (present to user, do NOT auto-write)
  NO  → Add to MEMORY.md as a general pattern
```

### Persist Rules

1. **Runbooks**: Append new sections or update existing ones. Match the format of the existing runbook (see `.claude/runbooks/supabase-production.md` for reference). Include SQL/bash examples where applicable.

2. **MEMORY.md**: Add concise bullet points under existing sections or create a new section. Keep MEMORY.md under 200 lines total — consolidate if approaching the limit.

3. **CLAUDE.md**: Do NOT auto-edit. Instead, present proposed additions to the user with the exact text and location. The user decides whether to add them.

### Deduplication

Before writing any rule:
- Read the target file
- Check if the rule (or a close variant) already exists
- If it does, update/strengthen the existing entry rather than adding a duplicate
- If the existing entry is wrong, correct it

## Phase 5: Summarize

Present a retro report to the user:

```
## Session Retrospective

### Errors Found
| # | Category | Description | Attempts | Resolution |
|---|----------|-------------|----------|------------|
| 1 | Permissions | Queried vault without SET ROLE | 3 | Added SET ROLE postgres |
| 2 | Schema | Used nonexistent `url` column on net._http_response | 2 | Removed url filter |
| ... | ... | ... | ... | ... |

### Rules Written
| Rule | Destination | Action |
|------|-------------|--------|
| Always SET ROLE postgres for vault/cron/net | `.claude/runbooks/supabase-production.md` | Updated |
| net._http_response has no url column | `MEMORY.md` | Added |
| ... | ... | ... |

### Proposed CLAUDE.md Changes
[List any proposed changes, or "None"]

### Waste Estimate
- **Total errors flagged**: N
- **Total retry attempts**: M
- **Estimated wasted tool calls**: X
- **Categories**: [top 2-3 categories]

### Clean Session Checklist
[If applicable, a 3-5 item checklist for starting the next similar session cleanly]
```

## When to Run /retro

- After a debugging session with lots of trial-and-error
- After learning a new system's quirks the hard way (Vault, pg_cron, pg_net, etc.)
- After any session where you think "I should remember this for next time"
- Before `/evolution` — retro captures operational knowledge, evolution captures strategic growth

## Relationship to Other Skills

| Skill | Relationship |
|-------|-------------|
| `/evolution` | Retro captures operational mistakes. Evolution captures strategic growth. Run retro first, then evolution. |
| `/escalate` | If retro reveals a recurring bug that survived 3+ fix attempts, escalate it. |
| `/docs-check` | If retro reveals documentation gaps in CLAUDE.md or README, invoke docs-check. |

---

**Remember**: The goal is not to catalog every typo. It's to find the **patterns** — the systematic misunderstandings that burn tokens and time — and make them impossible to repeat.

*"A mistake repeated is a lesson refused."*
