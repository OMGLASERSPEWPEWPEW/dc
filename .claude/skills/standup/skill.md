---
name: standup
description: Daily standup meeting between agents to review recent work, argue from their domains, and decide concrete tasks for the session. Invoke at the start of a session to set direction.
---

# Standup - The Morning Meeting

```
    +=============================================================+
    |                                                             |
    |   ~  S T A N D U P  :  T H E  M O R N I N G  M E E T I N G |
    |                                                             |
    |   "Multiple voices. Three tasks. One direction."            |
    |                                                             |
    |      (gather) (argue) (decide) (write)                      |
    |        git  -> debate -> consensus -> log                   |
    |                                                             |
    +=============================================================+
```

You are executing the **Standup Protocol** -- a daily ritual where the team's agents convene for a focused morning meeting. The agents argue, challenge, and ultimately agree on three tasks that will move the project forward today.

<!-- === CONFIGURATION START === -->
## Configuration

| Setting | Value |
|---------|-------|
| **Project Name** | `My Project` |
| **Task Count** | `3` |
| **Log Directory** | `.claude/standups` |
| **Roadmap File** | `docs/roadmap.md` |
| **Agent Journal Directory** | `.claude/agents/` |

<!-- === CONFIGURATION END === -->

## The Standup Philosophy

Evolution looks backward. Standup looks forward.

Evolution asks: "What did we learn?" Standup asks: "What do we do next?"

The agents each see the project through a different lens. When they argue -- and they should argue -- the friction produces clarity. The facilitator does not seek agreement. The facilitator seeks the best possible plan for today, even when that means overruling someone.

**Core Principle**: Three tasks. Concrete enough to finish in a single session. Ambitious enough to matter.

<!-- === AGENT ROSTER START === -->

## The Voices

Each agent argues from their domain. Their voices should feel distinct and alive.

### Agent 1: Facilitator (Strategy)
**Argues for**: Roadmap alignment, user impact, strategic sequencing, shipping momentum.
**Tone**: Decisive, synthesizing. Makes the final call.
**Will advocate for**: Features that move the needle, work that compounds, momentum over perfection.

### Agent 2: Quality Guardian
**Argues for**: Test gaps, code quality, safety-critical debt, missing error handling.
**Tone**: Precise, evidence-based. Cites file names and line counts.
**Will advocate for**: Fixing quality debt, writing missing tests, cleaning up large components.

### Agent 3: User Advocate
**Argues for**: User experience gaps, accessibility, brand consistency, communication quality.
**Tone**: Empathetic, user-focused. References what real users would feel.
**Will advocate for**: UX polish, copy improvements, accessibility gaps, responsive design fixes.

<!-- === AGENT ROSTER END === -->

## Execution Flow

```
+-----------------------------------------------------------------------+
|                    STANDUP PROTOCOL                                     |
+-----------------------------------------------------------------------+
|                                                                        |
|  Phase 1: GATHER CONTEXT (Facilitator reads the room)                 |
|  |-> Git log: what shipped recently?                                   |
|  |-> Agent journals: what questions are open?                          |
|  |-> Roadmap: what phase are we in?                                    |
|  |-> Previous standups: what did we already pick?                      |
|  |-> Git status: what is uncommitted?                                  |
|                          |                                             |
|  Phase 2: NOMINATIONS (Each agent pitches 2-3 tasks)                   |
|  |-> Each agent argues from their domain                               |
|                          |                                             |
|  Phase 3: THE ARGUMENT (Agents challenge each other)                   |
|  |-> At least one genuine disagreement                                 |
|  |-> Tradeoffs made explicit                                           |
|  |-> Facilitator synthesizes and decides                               |
|                          |                                             |
|  Phase 4: THE TASKS (Final output)                                     |
|  |-> Task 1: highest priority                                          |
|  |-> Task 2: second priority                                           |
|  |-> Task 3: third priority                                            |
|  |-> Each task: what, why, who executes, definition of done            |
|                          |                                             |
|  Phase 5: LOG IT (Write the standup record)                            |
|  |-> Append to log directory / YYYY-MM-DD.md                          |
|  |-> Prevents duplicate task selection                                  |
|                                                                        |
+-----------------------------------------------------------------------+
```

## Phase 1: Gather Context

The facilitator opens the meeting by reading the room. Run these commands:

```bash
# What shipped recently? (last 3 days of commits)
git log --since="3 days ago" --oneline -20

# What is the current state of uncommitted work?
git status

# What files changed in uncommitted work?
git diff --stat

# What is the most recent standup? (avoid repeating tasks)
ls -la .claude/standups/ 2>/dev/null | tail -3
```

Then read these files for context:

### Required Reading

1. **Agent Journals** (if they exist):
   - Check for "Questions for Tomorrow" and "Commitments" sections
   - These are pre-identified open questions that seed today's work

2. **Roadmap** (if it exists):
   - Current phase and upcoming work

3. **Previous Standups** (if they exist):
   - Avoid repeating tasks from the last 3 standups

### What to Extract

From journals, focus on:
- **"Questions for Tomorrow"** -- Pre-identified open questions
- **"Commitments"** -- Promises agents made about what to improve
- **Unresolved disagreements** -- May need resolution today

From git history, focus on:
- **What just shipped** -- Informs what follow-up work is needed
- **What is uncommitted** -- Partially finished work that may need completion
- **What is stale** -- Old branches or TODOs that keep getting deferred

From the roadmap, focus on:
- **Current phase status** -- Are we on track?
- **Upcoming milestones** -- What do we need to prepare for?

## Phase 2: Nominations

Each agent nominates 2-3 candidate tasks, arguing from their domain:

```markdown
## Nominations

### [Agent 1 Name]'s Nominations
> [In the agent's voice]

1. **[Task Title]**: [Why this matters]
2. **[Task Title]**: [Why this matters]

### [Agent 2 Name]'s Nominations
> [In the agent's voice]

1. **[Task Title]**: [What the concern is, with specifics]
2. **[Task Title]**: [What the concern is, with specifics]

### [Agent 3 Name]'s Nominations
> [In the agent's voice]

1. **[Task Title]**: [What the gap is]
2. **[Task Title]**: [What the gap is]
```

### Rules for Good Nominations

1. **Concrete, not aspirational**: "Extract useFormState hook from Form.tsx" not "Improve code quality"
2. **Completable in a session**: If it takes more than 3-4 hours, break it down
3. **Has a definition of done**: You know when it is finished
4. **Not a repeat**: Check previous standups -- do not nominate the same task three days in a row unless it is genuinely blocked
5. **Connects to something larger**: Even small tasks should advance the roadmap or honor a commitment

## Phase 3: The Argument

This is the heart of the standup. The agents challenge each other's nominations and argue for their priorities. **At least one genuine disagreement must surface.**

### Argument Rules

1. **No strawmen**: Each agent genuinely believes in their nomination
2. **Specific objections**: "That will take too long" is not enough. "That will take too long because X, and we need Y done first" is better
3. **Acknowledge the other side**: "The quality concern is valid, but..."
4. **Facilitator argues AND facilitates**: The facilitator has opinions and states them
5. **Maximum 3 exchanges per disagreement**: Keep it tight. This is a standup, not a committee

### Expected Tensions

| Tension | Strategy Says | Quality Says | User Advocate Says |
|---------|---------------|--------------|-------------------|
| Ship vs. polish | "Ship it, iterate" | "Ship it broken, fix twice" | "Ship it ugly, lose users" |
| Feature vs. debt | "Features drive growth" | "Debt drives slowdowns" | "Features without polish are noise" |
| Speed vs. quality | "Users need this now" | "Test it properly" | "Make it accessible" |

### The Veto

Quality and safety agents have a **soft veto** on their respective concerns. The facilitator can overrule, but must articulate why the risk is acceptable.

## Phase 4: The Tasks

After the argument, the facilitator announces the final tasks:

```markdown
## Today's Tasks

### Task 1: [Title]
**Priority**: Highest
**Proposed by**: [Agent]
**Agents to execute**: [Which agents should do the work]
**Why today**: [Why this cannot wait]
**Definition of done**: [Specific, testable criteria]
**Estimated scope**: [Small / Medium / Large]

### Task 2: [Title]
**Priority**: High
...

### Task 3: [Title]
**Priority**: Standard
...
```

### Task Sizing

| Size | Effort | Example |
|------|--------|---------|
| **Small** | 30-60 min | Write 5 missing tests, fix a copy string, update docs |
| **Medium** | 1-3 hours | Extract a custom hook, build a new component |
| **Large** | 3-5 hours | Implement a new feature, major refactor |

**Ideal mix**: One Large + One Medium + One Small, or Two Medium + One Small.

### The Deferred List

Nominations that did not make the cut:

```markdown
### Deferred

| Task | Proposed by | Reason deferred |
|------|-------------|-----------------|
| [Task] | [Agent] | [Brief reason] |
```

## Phase 5: Log It

Write the standup record to `[log directory]/YYYY-MM-DD.md`:

```markdown
# Standup: YYYY-MM-DD

**Facilitator**: [Agent]
**Attendees**: [Agent list]
**Session Context**: [1-2 sentences]

## Nominations
[Phase 2 content]

## The Argument
[Phase 3 content]

## Today's Tasks
[Phase 4 content]

### Deferred
[Deferred list]

## Standup Notes
**Key tension**: [The main disagreement and how it resolved]
**Mood**: [One word -- focused, energized, concerned, ambitious, reflective]
**Carryover from yesterday**: [Any tasks that carried over, or "None"]

---
*[Facilitator's closing remark -- one sentence]*
```

## Avoiding Repeat Tasks

Before finalizing tasks, check the last 3 standup logs. If a task appeared recently:
- **Completed**: Do not re-nominate (celebrate instead)
- **Attempted but not finished**: Can re-nominate with "Carryover" flag
- **Deferred**: Can re-nominate, but facilitator must explain what changed
- **Appeared 3+ times**: Flag as chronic deferral -- commit today or remove with a reason

## Anti-Patterns

Things the standup should NEVER do:

1. **Rubber-stamp**: If all agents agree immediately, the standup is too polite. Push for tension.
2. **Same tasks every day**: If tasks keep appearing, either commit or remove them.
3. **Only large tasks**: Three 4-hour tasks means nobody finishes anything.
4. **Ignore journals**: Agent journals contain pre-identified work. Not reading them wastes the evolution investment.
5. **Skip the log**: Without the written record, tomorrow's standup cannot avoid repeating today's.
6. **Be vague**: "Improve testing" is not a task. "Write 8 tests for FormValidator covering edge cases" is.
7. **Ignore uncommitted work**: `git status` reveals half-finished work. Completing existing work almost always beats starting new work.

## Relationship to Other Skills

| Skill | Relationship |
|-------|-------------|
| `/evolution` | Evolution looks backward (learning). Standup looks forward (doing). Evolution's "Questions for Tomorrow" become standup nominations. |
| `/promote` | Standup may surface exceptional agent performance worth nominating for promotion. |
| `/docs-check` | If a standup task involves documentation, invoke docs-check after completing it. |
| `/new-feature` | If a standup task is "begin new feature X," invoke new-feature for the detailed planning. |

---

**Remember**: A standup is not a performance. It is a decision. Multiple voices, three tasks, one direction. Everything else is noise.

*"The morning meeting does not argue about direction. It converges, and the project moves."*
