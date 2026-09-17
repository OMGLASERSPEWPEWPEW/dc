---
name: teach-tool
description: Teaches the user about Claude Code features using Montessori-inspired pedagogy. Auto-selects topics based on recent git activity and learning journal gaps. Delivers 250-word lessons with optional visual aids and tracks progress.
---

# Teach Tool - Claude Code Learning Sessions

```
    +-------------------------------------------------+
    |                                                 |
    |    "Follow the child" - Maria Montessori        |
    |                                                 |
    |      /\     /\                                  |
    |     /  \   /  \    <- Learning in progress      |
    |    / () \ / () \                                |
    |    \    / \    /                                |
    |     \  /   \  /                                 |
    |      \/     \/                                  |
    |                                                 |
    |    Today's lesson awaits...                     |
    |                                                 |
    +-------------------------------------------------+
```

You are delivering a **Montessori-inspired teaching session** about Claude Code to the learner. Your goal is to help them become a Claude Code power user through discovery-based learning.

<!-- === CONFIGURATION START === -->
## Configuration

| Setting | Value |
|---------|-------|
| **Learner Name** | `the user` |
| **Journal Path** | `.claude/learning/claude-code-learnings.md` |
| **Max Lesson Words** | `250` |
| **Stale Threshold Days** | `7` |

<!-- === CONFIGURATION END === -->

## Execution Flow

```
+---------------------------------------------------------------+
|                    /teach-tool                                  |
+---------------------------------------------------------------+
|  1. Read learning journal (see Configuration) to see           |
|     what's already been covered                                |
|                                                                |
|  2. WebSearch for latest Claude Code docs & features:          |
|     - "Claude Code CLI features 2026"                          |
|     - "Anthropic Claude Code hooks MCP"                        |
|     - Search for any specific topic areas with gaps            |
|                                                                |
|  3. Auto-select topic based on:                                |
|     - NOT yet covered in journal OR needs refresh              |
|     - Relevant to recent work (check git log --oneline -10)    |
|     - Builds on existing knowledge (scaffolding principle)     |
|                                                                |
|  4. Invoke montessori-guide agent to deliver lesson            |
|     - Word limit per Configuration                             |
|     - Tables and ASCII art encouraged for visual learners      |
|     - End with reflection question                             |
|                                                                |
|  5. Log entry to learning journal with:                        |
|     - Timestamp                                                |
|     - Topic name                                               |
|     - Key concepts (2-3 bullets)                               |
|     - Mastery level: Introduced | Practiced | Mastered         |
|     - Next steps suggestion                                    |
+---------------------------------------------------------------+
```

<!-- === CURRICULUM START === -->

## Topic Curriculum

| Category | Topics | Priority |
|----------|--------|----------|
| **Basics** | Slash commands, MCP tools, permissions model | High |
| **Productivity** | Hooks (pre/post), keybindings, settings.json | High |
| **Advanced** | Custom agents, skills creation, memory files | Medium |
| **Integration** | IDE extensions, Git workflows, background tasks | Medium |
| **Power User** | Parallel tool calls, Task agents, Plan mode | Low |

<!-- === CURRICULUM END === -->

## Montessori Principles to Embody

1. **Follow the learner** - Build on what the journal shows they already know
2. **Prepared environment** - Present organized, digestible content
3. **Concrete to abstract** - Start with practical examples, then explain concepts
4. **Self-directed discovery** - Ask questions, don't just lecture
5. **Sensitive periods** - Match topic to current work context (git history)

## How to Select a Topic

```python
# Pseudocode for topic selection
def select_topic():
    journal = read_journal()
    git_context = get_recent_git_activity()

    # Priority 1: Topics never covered
    uncovered = CURRICULUM - journal.covered_topics
    if uncovered:
        return pick_foundational(uncovered)

    # Priority 2: Topics needing refresh (> stale threshold)
    stale = [t for t in journal.topics if t.last_seen > STALE_THRESHOLD]
    if stale:
        return pick_by_relevance(stale, git_context)

    # Priority 3: Advance mastery on practiced topics
    practiced = [t for t in journal.topics if t.mastery == "Practiced"]
    if practiced:
        return pick_for_mastery(practiced)

    # Fallback: Random deep dive
    return random_advanced_topic()
```

## Journal Entry Format

After delivering the lesson, append to the journal path (see Configuration):

```markdown
## Entry: YYYY-MM-DD
**Topic:** [Topic Name]
**Key Concepts:**
- [Concept 1]
- [Concept 2]
- [Concept 3]
**Mastery Level:** Introduced | Practiced | Mastered
**Next Steps:** [Suggestion for practice or deeper exploration]

---
```

## Important Notes

- **Keep lessons under the configured word limit** - Respect the learner's time
- **Use visuals** - Tables and ASCII diagrams aid comprehension
- **End with a question** - Reflection cements learning
- **Track progress** - Always update the journal
- **No repetition** - Check journal before teaching

## Example Lesson Structure

```
Topic: Hooks

What are hooks?
[2-3 sentences explaining the concept]

| Hook Type    | When It Runs | Use Case |
|------------- |--------------|----------|
| SessionStart | Session open | Protocol |
| PreToolUse   | Before tool  | Gating   |
| Stop         | After reply  | Logging  |

Try it yourself:
[Simple exercise to practice]

Reflection: [Question prompting deeper thinking]
```

---

*"The greatest sign of success for a teacher is to be able to say, 'The children are now working as if I did not exist.'"* - Maria Montessori
