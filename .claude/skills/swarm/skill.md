---
name: swarm
description: "Parallel multi-task dispatch. Decomposes a prompt into independent subtasks, maps each to the best agent, fans out up to 5 agents in parallel (worktree-isolated for code changes), and synthesizes results into a unified report. The fast path for multi-concern prompts."
---

# Swarm — Parallel Multi-Task Dispatch

```
    +==============================================================+
    |                                                              |
    |     * ============================================== *      |
    |     |  S W A R M   P R O T O C O L                   |      |
    |     * ============================================== *      |
    |                                                              |
    |   "Many hands, one vision"                                   |
    |                                                              |
    |     prompt -> decompose -> fan-out -> aggregate -> act       |
    |                                                              |
    +==============================================================+
```

You are executing the **Swarm Protocol** — a parallel fan-out that decomposes a multi-concern prompt into independent subtasks, dispatches the right specialist agent for each, and synthesizes their results into a unified report.

**Swarm vs Iterate**: Swarm is the fast path. No per-item documentation, no graphs, no cost tracking. Decompose, dispatch, aggregate, done. Use `/iterate` when you need a paper trail.

<!-- === CONFIGURATION START === -->
## Configuration

| Setting | Value |
|---------|-------|
| **Max Parallel Agents** | `5` |
| **Inline Threshold** | `2` |
| **Max Total Tasks** | `10` |
| **Worktree for Code Changes** | `true` |

<!-- === CONFIGURATION END === -->

<!-- === AGENT MAPPING START === -->
## Agent Mapping

Match each subtask to the best agent type by scanning for these signals in the task description:

| Task Signal | Agent Type | Division |
|------------|------------|----------|
| Bug, error, stack trace, "fix", "broken", "not working" | `debugger` | Quality |
| React component, UI, CSS, "frontend", "page", "layout" | `frontend-developer` | Engineering |
| API, database, edge function, "backend", "query", "RLS" | `Frontinus-backend-architect` | Engineering |
| Architecture, folder structure, "refactor pattern", module design | `Sashiko-code-architect` | Engineering |
| Test, coverage, spec, "add tests" | `test-engineer` | Quality |
| Security, auth, vulnerability, OWASP, "audit" | `security-engineer` | Quality |
| Performance, bundle size, Core Web Vitals, "slow" | `performance-engineer` | Quality |
| Code review, quality check, "review this" | `Argus-code-reviewer` | Quality |
| Docs, README, changelog, "document" | `technical-writer` | Operations |
| Mobile, responsive, touch targets, "small screen" | `Dorsaidh-mobile-ux-optimizer` | Design |
| Accessibility, WCAG, keyboard nav, screen reader | `accessibility-specialist` | Design |
| DevOps, deploy, CI/CD, hosting, env vars | `devops-engineer` | Engineering |
| Brand, copy, tone, messaging | `Theia-branding` | Growth |
| Analytics, metrics, tracking, A/B test | `analytics-engineer` | Intelligence |
| Exploration, investigation, "find", "where is" | `Explore` | — |
| Ambiguous or multi-domain | `general-purpose` | — |

**Fallback**: If no signal matches, use `general-purpose`.

<!-- === AGENT MAPPING END === -->

---

## Execution Flow

```
+----------------------------------------------------------------------+
|                       SWARM PROTOCOL                                  |
+----------------------------------------------------------------------+
|                                                                       |
|  Phase 1: DECOMPOSE                                                  |
|  +-> Parse prompt into discrete subtasks                             |
|  +-> Classify: code-change | investigation | review | documentation  |
|  +-> Extract file targets per subtask                                |
|                          |                                            |
|  Phase 2: ANALYZE INDEPENDENCE                                       |
|  +-> Compute file sets, check pairwise overlap                       |
|  +-> Detect semantic dependencies (producer/consumer)                |
|  +-> Build dependency graph: fan-out vs chain                        |
|  +-> If all tasks chain -> inline execution (skip fan-out)           |
|                          |                                            |
|  Phase 3: MAP AGENTS                                                 |
|  +-> Match subtask -> agent type (from mapping table)                |
|  +-> Determine isolation: worktree (code) vs none (read-only)        |
|  +-> Build self-contained prompt per agent                           |
|                          |                                            |
|  Phase 4: DISPATCH                                                   |
|  +-> If tasks <= inline threshold -> execute inline                  |
|  +-> Otherwise -> launch Agent tool with run_in_background: true     |
|  +-> Max 5 per batch; if >5 batch sequentially                      |
|  +-> If >10 total tasks -> warn, suggest /iterate                    |
|                          |                                            |
|  Phase 5: AGGREGATE                                                  |
|  +-> Collect all agent results                                       |
|  +-> Detect conflicts (unexpected file overlap)                      |
|  +-> Synthesize into unified report                                  |
|                          |                                            |
|  Phase 6: ACT                                                        |
|  +-> Code changes: present diffs, merge worktrees if clean           |
|  +-> Investigations: present findings                                |
|  +-> Optionally commit via /cap                                      |
|                                                                       |
+----------------------------------------------------------------------+
```

---

## Phase 1: DECOMPOSE

Parse the user's prompt into discrete subtasks. For each subtask, extract:

1. **Title** — short name (3-6 words)
2. **Description** — what needs to happen (1-2 sentences)
3. **Classification** — one of:
   - `code-change` — modifies source files
   - `investigation` — reads code, diagnoses issues, reports findings
   - `review` — evaluates existing code for quality/security/performance
   - `documentation` — writes or updates docs
4. **File targets** — likely files this subtask will touch (grep/read to identify)

**Decomposition rules:**
- Each subtask must be a single, atomic concern
- If a task has sub-parts that are themselves independent, split further
- If a task is vague, narrow it to the most likely concrete action
- Preserve the user's intent — don't add tasks they didn't ask for

**Present the decomposition** as a brief table before proceeding:

```
| # | Task | Type | Agent | Files |
|---|------|------|-------|-------|
| 1 | Fix auth test failure | code-change | debugger | src/lib/auth.test.ts |
| 2 | Add map loading states | code-change | frontend-developer | src/pages/Map.tsx |
| 3 | Security review of AI gateway | review | security-engineer | supabase/functions/ai-gateway/ |
```

---

## Phase 2: ANALYZE INDEPENDENCE

For each pair of subtasks, check:

### File Overlap Check
Compute the set of files each subtask will likely modify or read heavily. If `files(A) ∩ files(B)` is non-empty for code-change tasks, they are **dependent**.

### Semantic Dependency Check
Look for producer/consumer patterns:
- "Create X" + "Use X" → dependent (producer before consumer)
- "Add migration" + "Write function that queries new table" → dependent
- "Update type" + "Update component using that type" → dependent

### Build Dependency Graph
- **Independent tasks** → fan-out group (can run in parallel)
- **Dependent tasks** → sequential chain (run in order)
- **Mixed** → fan out the independent set, then chain the dependent set after

### Inline Fallback
If the total number of independent tasks is ≤ the inline threshold (default: 2), skip fan-out entirely. Execute all tasks inline in the main context — the overhead of subagent dispatch isn't worth it.

If ALL tasks form a single dependency chain, execute them sequentially inline.

---

## Phase 3: MAP AGENTS

For each subtask in the fan-out group:

1. **Select agent type** from the Agent Mapping table by scanning the task description for signal keywords
2. **Determine isolation level**:
   - `code-change` tasks → use `isolation: "worktree"` on the Agent tool call
   - `investigation`, `review`, `documentation` tasks → no isolation needed
3. **Build the self-contained prompt** using the template below

### Subagent Prompt Template

Each agent receives a fully self-contained briefing. Agents have no access to the conversation history — everything they need must be in the prompt.

```
You are a {agent_type} working on a specific task within a parallel swarm.

## Your Task
{task_title}: {task_description}

## Classification
{code-change | investigation | review | documentation}

## Key Files
{list of file paths relevant to this task}

## Project Context
- Stack: React 19 + TypeScript + Vite + Tailwind CSS
- Backend: Supabase Edge Functions (Deno)
- DB: Supabase Postgres with RLS
- Working directory: {cwd}

## Guardrails
- Do NOT spawn sub-agents (no Agent tool or TaskCreate calls)
- Do NOT modify files outside your assigned scope: {file_list}
- If you discover the task requires changes beyond your scope, report it — don't do it
- Do NOT commit changes — the orchestrator handles commits

## Expected Output
When you finish, provide a structured summary:

### Status
{complete | partial | blocked | failed}

### What I Did
{bullet list of actions taken}

### Files Changed
{list of files modified with brief description of each change}

### Findings
{any discoveries, root causes, recommendations}

### Needs Attention
{anything that requires follow-up, conflicts, or scope expansion}
```

---

## Phase 4: DISPATCH

### Inline Path (tasks ≤ inline threshold)
Execute each task sequentially in the main context. Use the appropriate agent type via the Agent tool (foreground, not background) or handle directly.

### Fan-Out Path (tasks > inline threshold)

1. **Pre-flight**: Verify all file targets exist (catch bad paths before dispatching)
2. **Launch**: Send a single message with multiple Agent tool calls, each with `run_in_background: true`:
   - Code-change tasks: include `isolation: "worktree"` in the Agent call
   - Read-only tasks: no isolation parameter
   - Set the `subagent_type` to the mapped agent type
   - Set `description` to the task title
3. **Batch limit**: If more than 5 tasks, dispatch the first 5, wait for completion, then dispatch the next batch
4. **Overflow**: If more than 10 total tasks, warn the user and suggest `/iterate` for the full batch. Still proceed with the first 10 if the user confirms.

### While Agents Work
After dispatching background agents, tell the user what was launched:

```
Swarm dispatched — {N} agents working in parallel:
1. {agent_type}: {task_title}
2. {agent_type}: {task_title}
...

I'll synthesize results as they come in.
```

Do NOT sleep or poll. Background agents notify automatically when complete.

---

## Phase 5: AGGREGATE

As agents complete, collect their structured summaries. Once all agents have reported (or timed out):

### Conflict Detection
Check if any two agents modified the same file despite the independence analysis. If so:
- Flag the conflict explicitly
- Do NOT auto-merge conflicting changes
- Present both versions for user review

### Synthesis
Combine all agent summaries into a unified report. **YOU synthesize — never dump raw agent outputs.**

### Report Template

```markdown
## Swarm Report

**Tasks:** {N} dispatched | {N} complete | {N} failed
**Agents:** {list of agent types used}

---

### 1. {Task Title} — {status_emoji} {status}
**Agent:** {agent_type}
**Summary:** {2-3 sentence synthesis of what the agent did/found}
**Files changed:** {list, or "none (investigation only)"}

### 2. {Task Title} — {status_emoji} {status}
...

---

### Conflicts
{Any file overlap or merge issues, or "None detected"}

### Cross-Cutting Findings
{Patterns or issues that span multiple tasks — things no single agent would see}

### Recommended Next Steps
{Synthesized follow-up actions from all agents}
```

Status emojis: complete, partial, blocked, failed, timed out.

---

## Phase 6: ACT

Based on the aggregated results:

### For Code Changes
- **No conflicts**: Present a summary of all changes. Ask if the user wants to commit (or auto-commit if in autonomous mode).
- **Conflicts detected**: Present the conflicting changes side by side. Let the user decide which to keep or how to merge.
- **Worktree branches**: If worktrees were used, the changes are on separate branches. Merge them sequentially into the current branch.

### For Investigations / Reviews
- Present findings in the report. No further action unless the user requests it.

### For Documentation
- Present the docs changes. Commit if in autonomous mode.

### Cross-Cutting Actions
If agents surfaced issues that span tasks (e.g., "the auth module needs a type update that both the test fix and the security review flagged"), call that out explicitly and suggest a follow-up action.

---

## When NOT to Swarm

| Condition | Do Instead |
|-----------|------------|
| Only 1 task in the prompt | Execute inline — no dispatch overhead |
| Only 2 trivial tasks | Execute inline sequentially |
| All tasks form a dependency chain | Execute sequentially — parallelism adds nothing |
| Tasks share heavy state (same files, same module) | Execute sequentially to avoid conflicts |
| More than 10 tasks with documentation needs | Use `/iterate` for full paper trail |
| Tasks require multi-turn user interaction | Handle in main context — agents can't ask follow-ups |

---

## Anti-Patterns

### No Uncontrolled Spawning
Hard cap of 5 agents per batch, 10 total. Agents are explicitly forbidden from spawning sub-agents.

### No Shared Mutable State
Parallel agents must not modify the same files. The independence analysis in Phase 2 prevents this. If it slips through, Phase 5 catches it.

### No Raw Output Dumps
The orchestrator (you) always synthesizes agent outputs. The user sees a cohesive report, not four walls of unstructured text.

### No Hallucinated Consensus
When synthesizing, if agents disagree, surface the disagreement explicitly. Don't smooth over contradictions.

### No Swarming for Sequential Work
If the dependency graph is a chain, just do the work in order. Swarming a chain wastes tokens on dispatch/aggregation overhead.

---

## Relationship to Other Skills

| Skill | Relationship |
|-------|-------------|
| `/iterate` | Swarm is the fast path. Iterate is the documented waterfall with graphs, cost tracking, and paper trail. |
| `/escalate` | Escalate queries external AI models for diverse opinions. Swarm dispatches internal specialist agents for parallel execution. |
| `/standup` | Standup decides WHAT to do. Swarm does multiple things simultaneously. |
| `/evolution` | Evolution is agent self-improvement. Swarm is task execution. |
| `/implementation` | Implementation works through a pre-built graph. Swarm builds its own ad-hoc decomposition. |
