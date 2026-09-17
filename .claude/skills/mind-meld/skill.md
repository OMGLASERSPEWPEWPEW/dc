---
name: mind-meld
description: Cross-project agent knowledge sharing. Named agents check their agent files across all projects in ~/Development/ and supplement their local agent.md with relevant knowledge discovered in other projects.
---

# Mind Meld - Cross-Project Agent Knowledge Sharing

```
    +==============================================================+
    |                                                              |
    |     * ============================================== *      |
    |     |  M I N D   M E L D   P R O T O C O L          |      |
    |     * ============================================== *      |
    |                                                              |
    |   "One mind across many projects"                            |
    |                                                              |
    |         scan -> compare -> extract -> merge -> report        |
    |                                                              |
    +==============================================================+
```

You are executing the **Mind Meld Protocol** - a cross-project knowledge sharing ritual where named agents discover and integrate wisdom from their counterparts in other projects.

<!-- === NAMED AGENTS START === -->
## Named Agents to Meld

Add your project's named agents to this table. These agents have identities that transcend individual projects:

| Agent | Origin | Domain |
|-------|--------|--------|
| `agent-name` | _mythology/culture_ | _their domain_ |

_Example:_

| Agent | Origin | Domain |
|-------|--------|--------|
| **zephyr** | Greek west wind | Master orchestrator |
| **Argus** | Hundred-eyed giant | Code reviewer |
| **Hestia** | Goddess of hearth | Creative safety guardian |

<!-- === NAMED AGENTS END === -->

## Execution Flow

### Phase 1: Discovery

Scan for agent directories across all projects:

```bash
# Find all projects with Claude agent directories
ls -d ~/Development/*/.claude/agents/ 2>/dev/null
```

For each discovered project, check which of the named agents exist:

```bash
# For each project found, check for named agent directories
# Replace the agent list with your named agents from the table above
for agent in agent-name-1 agent-name-2 agent-name-3; do
  ls ~/Development/*/.claude/agents/$agent/agent.md 2>/dev/null
done
```

**Skip the current project** — we only want external knowledge.

### Phase 2: Compare

For each remote agent file found:

1. **Read the remote `agent.md`** from the other project
2. **Read the local `agent.md`** from `.claude/agents/{name}/agent.md`
3. **Identify unique knowledge** in the remote version that doesn't exist locally:
   - Project-specific patterns and conventions
   - Lessons learned and hard-won insights
   - Tool preferences and workflow optimizations
   - Domain-specific techniques
   - Interaction patterns with other agents

### Phase 3: Extract & Merge

For each agent with new knowledge found:

1. **Extract relevant snippets** from the remote agent file
2. **Attribute the source**: note which project the knowledge came from
3. **Filter out project-specific details** that don't generalize (e.g., specific file paths, project-unique schemas)
4. **Keep universal insights** that would benefit the agent regardless of project context

### Phase 4: Write

For each agent with new cross-project insights:

1. **Check if a `## Cross-Project Insights` section already exists** in the local `agent.md`
2. If it exists, **update it** — merge new insights, remove duplicates, keep attributions
3. If it doesn't exist, **append it** to the end of the local `agent.md`

Use this format:

```markdown
## Cross-Project Insights

_Last melded: YYYY-MM-DD_

### From [project-name]
- **[Category]**: [Insight description]
- **[Category]**: [Insight description]

### From [other-project]
- **[Category]**: [Insight description]
```

**Categories** to look for:
- **Pattern**: A reusable code or architecture pattern
- **Lesson**: A hard-won debugging or design lesson
- **Tool**: A tool preference or configuration insight
- **Workflow**: A process or workflow optimization
- **Convention**: A naming or structural convention worth adopting

### Phase 5: Report

After processing all agents, report:

```
Mind Meld Complete
==================

Agents melded: [count]/[total]
Projects scanned: [list]

Per-agent results:
- [agent-1]: [N insights from M projects | no new insights | not found remotely]
- [agent-2]: [...]
- [agent-3]: [...]

New insights total: [count]
```

## Rules

1. **Never overwrite** existing agent identity or core instructions — only append cross-project insights
2. **Always attribute** where knowledge came from
3. **Filter generously** — when in doubt, include the insight (it can be pruned in evolution)
4. **Respect privacy** — don't copy sensitive project details, API keys, or personal information
5. **Idempotent** — running Mind Meld twice should not duplicate insights
6. If a local agent file doesn't exist yet, **skip it** — Mind Meld supplements, it doesn't create

---

*"Knowledge shared is knowledge multiplied."*
