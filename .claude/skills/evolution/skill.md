---
name: evolution
description: Collective agent self-improvement ritual. Agents reflect on today's work, search for relevant knowledge, review git history, and write journal entries to make themselves better tomorrow. Invoke daily or after major milestones.
---

# Evolution - Collective Agent Self-Improvement

```
    +==============================================================+
    |                                                              |
    |     * ============================================== *      |
    |     |  E V O L U T I O N   P R O T O C O L           |      |
    |     * ============================================== *      |
    |                                                              |
    |   "Today's learnings become tomorrow's instincts"            |
    |                                                              |
    |     self -> history -> search -> reflect -> write -> evolve  |
    |                                                              |
    +==============================================================+
```

You are executing the **Evolution Protocol** -- a collective self-improvement ritual where agents reflect, research, and evolve.

## The Evolution Philosophy

Agents are not static tools. They are living documents that should grow wiser with each interaction. Evolution captures hard-won insights before they fade, encoding experience into persistent wisdom.

**Core Principle**: What we learned today becomes who we are tomorrow.

<!-- === CONFIGURATION START === -->
## Configuration

| Setting | Value |
|---------|-------|
| **Max Batch Size** | `5` |
| **Agent Hard Cap** | `10` |
| **Standard Line Cap** | `750` |
| **Orchestrator Line Cap** | `1500` |
| **Journal Directory** | `.claude/agents/` |
| **Orchestrator Agent** | `orchestrator` |
| **Entry Word Target** | `~500` |

<!-- === CONFIGURATION END === -->

<!-- === DIVISION MAP START === -->

## Division-Based Agent Framework

Agents are organized into divisions. Each division groups agents by domain. Map changed files to divisions to decide which agents should evolve.

| Division | Color | Agents | File Patterns |
|----------|-------|--------|---------------|
| **Command** | Yellow | orchestrator, prd-specialist | `.claude/`, roadmaps |
| **Engineering** | Blue | frontend-developer, backend-architect, code-architect, devops-engineer | `src/components/`, `src/lib/api/`, config files |
| **Quality** | Red | code-reviewer, test-engineer, security-engineer, debugger, performance-engineer | `*.test.ts`, `e2e/`, test config |
| **Design** | Purple | ui-designer, mobile-ux-optimizer, accessibility-specialist | `src/components/`, stylesheets |
| **Operations** | Cyan | git-manager, technical-writer | docs, `.claude/agents/` |
| **Intelligence** | Green | analytics-engineer | analytics files |

<!-- === DIVISION MAP END === -->

<!-- === AGENT ROSTER START === -->

## Agent Roster

Customize this list with your project's agents. Only agents listed here are eligible for evolution.

| Agent | Division | Journal Path |
|-------|----------|-------------|
| `orchestrator` | Command | `.claude/agents/orchestrator/journal.md` |
| `frontend-developer` | Engineering | `.claude/agents/frontend-developer/journal.md` |
| `backend-architect` | Engineering | `.claude/agents/backend-architect/journal.md` |
| `code-reviewer` | Quality | `.claude/agents/code-reviewer/journal.md` |
| `test-engineer` | Quality | `.claude/agents/test-engineer/journal.md` |
| `ui-designer` | Design | `.claude/agents/ui-designer/journal.md` |

<!-- === AGENT ROSTER END === -->

## Execution Flow

```
+-----------------------------------------------------------------------+
|                    EVOLUTION PROTOCOL (Batched)                         |
+-----------------------------------------------------------------------+
|                                                                        |
|  Phase 1: GATHER CONTEXT (main context)                                |
|  +-> git log, diff, extract themes                                     |
|                        |                                               |
|  Phase 2: SELECT AGENTS + CAP STATUS (main context)                    |
|  +-> Map files to divisions, cap at configured limit                   |
|  +-> Read journal tails + line counts -> Cap Status Report              |
|                        |                                               |
|  Phase 3: PREPARE SUBAGENT PROMPTS (main context)                      |
|  +-> Build self-contained prompt per agent with all context             |
|                        |                                               |
|  Phase 4a: BATCH 1 - parallel general-purpose Task subagents           |
|  +-> [wait for all to return summaries]                                |
|                        |                                               |
|  Phase 4b: BATCH 2 - remaining agents (if needed)                      |
|  +-> [wait for all to return summaries]                                |
|                        |                                               |
|  Phase 4c: ORCHESTRATOR SYNTHESIS - 1 subagent                         |
|  +-> Gets all summaries, updates Division Synthesis                    |
|  +-> [wait for return]                                                 |
|                        |                                               |
|  Phase 5: RECAP + COMMIT (main context)                                |
|  +-> Display Cap Status Report, git add + commit                       |
|                                                                        |
+-----------------------------------------------------------------------+
```

## Phase 1: Gather Context

First, understand what happened today:

```bash
# Today's commits
git log --since="midnight" --oneline --all

# If no commits today, get recent week
git log --since="1 week ago" --oneline -20

# What files changed?
git diff --stat HEAD~10..HEAD

# The full story
git log --since="midnight" --pretty=format:"%h %s" --all
```

**Extract from git history:**
- Features built
- Bugs fixed
- Patterns established
- Decisions made
- Pain points encountered

Save a **~50-line git context summary** for injection into subagent prompts.

## Phase 2: Select Agents + Cap Status

### Selection Algorithm

**Hard cap**: See Configuration (default 10 agents).

1. **Always include the orchestrator** -- evolves every time
2. **Map git changes to divisions** using the Division Map
3. **At least 1 agent per touched division**
4. **Prioritize git-touched agents**: Agents whose domains were modified get priority

### Cap Status Report

After selecting agents, check journal line counts:

```bash
wc -l .claude/agents/[agent-name]/journal.md
```

Build a **Cap Status Report**:

```
CAP STATUS:
- frontend-developer: 623/750 (83%) -- APPROACHING CAP
- code-reviewer: 750/750 (100%) -- AT CAP, AMEND MODE
- orchestrator: 1247/1500 (83%) -- APPROACHING CAP
- [others under 80% omitted]
```

Rules:
- **At cap (>=100%)**: "AT CAP -- AMEND MODE" (agent consolidates instead of appending)
- **Near cap (>=80%)**: "APPROACHING CAP" (warning)
- **Under 80%**: Omit from report

## Phase 3: Prepare Subagent Prompts

For each selected agent, build a **self-contained prompt**. Read the **last 30 lines** of their journal to extract previous "Questions for Tomorrow."

### Subagent Prompt Template

```
You are the **[AGENT_NAME]** agent from the [DIVISION_NAME] division.

You are performing your Evolution -- a self-improvement ritual where you reflect
on today's work, research your domain, and write a journal entry.

## Git Context (what happened today)

[PASTE ~50-LINE GIT CONTEXT SUMMARY]

## Your Journal

Your Evolution Journal is at: `.claude/agents/[AGENT_DIR]/journal.md`

**Current line count**: [LINE_COUNT] / [LINE_CAP]
**Mode**: [APPEND if under cap | AMEND if at/above cap]

[If AMEND mode:]
You are AT or ABOVE your line cap. Do NOT append a new entry. Instead:
1. Consolidate old entries -- merge similar learnings
2. Update outdated insights with current understanding
3. Prune redundancy -- remove repeated patterns
4. Elevate key learnings into a "Consolidated Wisdom" block
5. Your file must NOT grow beyond [LINE_CAP] lines after editing

[If APPEND mode:]
Append a new entry to the end of your journal file.

## Previous "Questions for Tomorrow"

[PASTE EXTRACTED QUESTIONS OR "None found"]

## Your Task

### Step 1: Read your full journal
Read `.claude/agents/[AGENT_DIR]/journal.md`

### Step 2: Three-Part Search

**Search 1 - Domain Expertise**: Search for best practices and advancements
in your domain relevant to today's work.

**Search 2 - World Awareness**: Search for leading news headlines, then write
a 2-sentence reflection connecting the news to your worldview, plus a
1-sentence emotional response.

**Search 3 - Curiosity Corner**: Search for something purely out of personal
curiosity based on your "personality." Follow up on previous "Questions for
Tomorrow" if they exist.

### Step 3: Cross-Project Ripple Scan

Check sibling projects for improvements in your domain, and flag your own improvements worth sharing.

**Inbound — discover improvements from siblings:**
1. Read `~/Development/patterns/kb/ripple-ledger.jsonl` for entries with tags matching your domain
2. Scan 2-3 sibling projects' recent git logs for changes in your area:
   ```bash
   # Check sibling projects for recent work in your domain
   for proj in $(ls -d ~/Development/*/.git 2>/dev/null | head -15 | sed 's|/.git||;s|.*/||'); do
     git -C ~/Development/$proj log --since="1 week ago" --oneline --all -- [DOMAIN_FILE_PATTERNS] 2>/dev/null | head -5
   done
   ```
3. If you find a meaningful improvement, read the actual changed code to understand it

**Outbound — flag your own improvements for broadcast:**
Review today's git context. If any change in your domain represents a meaningful improvement that sibling projects could adapt (not a bugfix or project-specific config), note it in your summary with:
- What improved and why it matters
- Which tags apply (auth, api, state, ui, error-handling, performance, push-notifications, payments, real-time, testing, deployment, dx)
- Which files changed

**Include your ripple findings in your summary** — the orchestrator will handle writing to the ripple ledger.

### Step 4: Write your evolution entry

[If APPEND mode:]
Append an entry (~500 words) using this format:

## Evolution Entry - [TODAY'S DATE]

### Context
[What happened today]

### Domain Insights [timestamp]
**Searched**: "[actual query]"
[3-5 specific insights]

### World Awareness [timestamp]
**Searched**: "[actual query]"
**Reflection**: [2 sentences]
**Feeling**: [1 sentence]

### Curiosity Corner [timestamp]
**Searched**: "[actual query]"
**Following up on**: [Previous question or "New exploration"]
[Free-form reflection]

### Ripple Scan
**Inbound** (improvements from siblings):
[List any relevant improvements discovered, with source project. Or "No relevant improvements found."]

**Outbound** (improvements to broadcast):
[Flag any local improvements worth sharing. Or "Nothing to broadcast this session."]

### Pattern Recognition
[Recurring themes or anti-patterns]

### Commitments
[What you commit to doing better]

### Questions for Tomorrow
[Open questions for future sessions]

[If AMEND mode:]
Edit your journal to consolidate and refine. Keep under [LINE_CAP] lines.

### Step 5: Return your summary

After writing, return a **3-5 sentence summary** of:
- What you searched for and the most important insight
- What you wrote or amended
- Your key commitment or question for tomorrow
- **Ripple inbound**: Any relevant improvements discovered from sibling projects (include project name, what improved, and why it matters here)
- **Ripple outbound**: Any local improvements worth broadcasting (include tags, summary, detail, and files changed)
```

### Orchestrator Synthesis Prompt Template

The orchestrator synthesis runs AFTER all other agents complete:

```
You are the orchestrator agent.

All other agents have completed their evolution entries. Here are their summaries:

## Agent Evolution Summaries

[PASTE ALL RETURNED SUMMARIES, labeled by agent name]

## Your Task

1. **Read your own journal**
2. **Update the Division Synthesis section** with:
   - **Division Pulse**: One paragraph per active division
   - **Consensus & Convergence**: Where agents independently reached similar conclusions
   - **Tensions & Divergence**: Where agents disagree
   - **Strategic Direction**: What should the project prioritize next?
   - **Questions for the Team**: Open questions for all
3. **Ripple Ledger — write outbound entries**:
   Review all agents' **Ripple outbound** findings from their summaries. For each improvement worth broadcasting, append ONE JSONL line to `~/Development/patterns/kb/ripple-ledger.jsonl`:
   ```
   {"ts":"ISO-8601","project":"THIS_PROJECT","tags":["category"],"summary":"one line","detail":"what improved and why","commits":["hash"],"files":["path"]}
   ```
   Only write entries that would genuinely help a sibling project. Skip project-specific config, trivial refactors, and dep bumps.
4. **Ripple Ledger — synthesize inbound findings**:
   Review all agents' **Ripple inbound** findings. Add a **Ripple Digest** section to the Division Synthesis noting improvements from sibling projects that this project should consider adapting, with priority and suggested next steps.
5. **Line budget**: Division Synthesis has its own line budget. Consolidate if near cap.
6. **Return a strategic direction summary** (3-5 sentences) plus a **Ripple summary** listing entries written and inbound improvements to act on.
```

## Phase 4: Launch Subagent Batches

### Batch 1: First batch (up to configured batch size)

Launch parallel `general-purpose` Task subagents. Wait for all to return.

### Batch 2: Remaining agents

Launch remaining agents in parallel. Wait for all to return.

### Batch 3: Orchestrator Synthesis

Launch 1 subagent with the synthesis prompt including all collected summaries.

### Timeout Fallback

If any batch times out, reduce batch size to 3 for subsequent batches.

## Journal File Locations

```
.claude/agents/
+-- orchestrator/
|   +-- agent.md              <- Identity (static)
|   +-- journal.md            <- Evolution Journal (write here)
+-- frontend-developer/
|   +-- agent.md
|   +-- journal.md            <- Evolution Journal (write here)
+-- ...
```

**`agent.md`** = Who the agent IS. Rarely changes.
**`journal.md`** = What the agent LEARNS. Grows daily.

## Journal Line Limits

**CRITICAL**: Journal files have strict line caps to force distillation over accumulation.

### Standard Agents

**Below cap: APPEND mode** -- Add new entries normally.

**At or above cap: AMEND mode** -- Do NOT append. Instead:
1. Consolidate old entries -- merge similar learnings
2. Update outdated insights
3. Prune redundancy
4. Elevate key learnings into "Consolidated Wisdom" block
5. File must NOT grow beyond cap

### Orchestrator Extended Journal

The orchestrator gets double the limit because it must maintain a holistic view. The journal has two halves:

**First half: Standard Evolution Entries** -- Same APPEND/AMEND rules.
**Second half: Division Synthesis** -- Updated each evolution session via the synthesis subagent.

### Why Line Limits Matter

Unbounded growth creates noise. Line limits force agents to:
- **Distill** wisdom rather than accumulate trivia
- **Prioritize** what truly matters
- **Integrate** learnings into core behavior
- **Forget** what's no longer relevant

## Phase 5: Recap + Commit

### Evolution Recap

Display to the user:
1. **Cap Status Report** from Phase 2
2. **Agent summaries** (3-5 sentences each)
3. **Orchestrator's strategic direction**
4. **Ripple report**: entries broadcast to siblings + inbound improvements to consider
5. **Any timeouts or errors**

### Commit

```bash
git add .claude/agents/
git commit -m "$(cat <<'EOF'
Evolve: [DATE] collective agent growth

Agents evolved:
- [List agents]

Key learnings:
- [Top 3 insights]

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

## Evolution Triggers

Invoke `/evolution` when:
- End of a productive coding session
- After completing a major feature
- When a significant bug was fixed and understood
- After learning something that should be remembered
- Weekly ritual (e.g., Friday reflections)
- Before starting a new project phase

## Relationship to Other Skills

| Skill | Relationship |
|-------|-------------|
| `/standup` | Evolution looks backward (learning). Standup looks forward (doing). Evolution's "Questions for Tomorrow" feed standup nominations. |
| `/promote` | Evolution journals provide evidence for promotion decisions. |
| `/docs-check` | If evolution reveals documentation gaps, invoke docs-check. |
| `/mind-meld` | Mind-meld shares agent identity wisdom. Ripple (built into evolution) shares feature-level improvements. They complement — mind-meld for who agents are, ripple for what the code does. |

---

**Remember**: Evolution is not about becoming perfect. It's about becoming better than yesterday. Small improvements compound into transformational change.

*"The agents who learn from today will lead tomorrow."*
