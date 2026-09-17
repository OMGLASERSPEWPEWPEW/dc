---
name: search-knowledge
description: Search across all ~/Development projects + knowledge bases for patterns, prior solutions, or implementations when solving a problem. Scans code, git history, docs, ADRs, and memory files. Use when you're stuck, when you suspect a similar problem has been solved elsewhere, or when you want prior art before designing a new solution.
---

# Search Knowledge — Cross-Project Solution Discovery

```
    +----------------------------------------------------+
    |                                                    |
    |   searching: ~/Development/** + memory + ADRs     |
    |                                                    |
    |     query  ->  grep  ->  git log  ->  synthesize  |
    |                                                    |
    +----------------------------------------------------+
```

You are executing a **cross-project knowledge search**. When the current project can't solve a problem alone, look for prior art: another project may have already faced it, and the solution (or the failed attempts) may be logged in code, commits, docs, or agent memory.

## When to invoke

- Stuck on a bug after 2+ failed fixes (consider `/escalate` first for external AI diagnosis)
- Designing a feature and want to see how another project implemented something similar
- User asks "haven't we done this before?" or "how does another project do it?"
- Before introducing a new abstraction, to check if an existing pattern applies

## Search scope

Scan these in order — most specific first:

1. **Current project** — `CLAUDE.md`, `docs/`, `.claude/memory/`, `.claude/docs/`, ADRs
2. **Sibling projects** — `~/Development/*/` and `~/development/*/`
3. **Shared patterns** — `~/Development/patterns/` if it exists
4. **Git history** — `git log --all --grep=<keyword>` in each project
5. **Agent memory** — `.claude/projects/*/memory/MEMORY.md` files across projects

## Execution

### Phase 1: Clarify the query

Before searching, restate the question in one sentence:
- What problem am I trying to solve?
- What specific terms, symbols, or file patterns would a prior solution contain?

Don't skip this. Unfocused searches return noise.

### Phase 2: Scan

Use the `Grep` tool (not raw `grep` — better performance) across each scope. Prioritize:

- **Names**: function names, class names, error codes, config keys
- **Phrases**: distinctive log messages, error text, comment patterns
- **File patterns**: `*Controller.ts`, `*slice.ts`, `migration_*.sql`

Complement with:
```bash
# Across all projects
for d in ~/Development/*/ ~/development/*/; do
  (cd "$d" 2>/dev/null && git log --all --oneline --grep='<keyword>' | head -5 | sed "s|^|$(basename $d): |")
done
```

### Phase 3: Read candidates

For each hit, read **only the relevant region** (±30 lines around the match). Do NOT read full files unless the match is promising enough to warrant a deep dive.

### Phase 4: Synthesize

Report findings as:

```
## Search: <query>

### Direct hits
- **project/path/to/file.ts:NN** — <one-sentence description>
- **project/commit-hash** — <commit subject + why it's relevant>

### Indirect leads
- **project/docs/adr-NNN.md** — <the pattern they chose and why>

### No prior art found
(If true, state this explicitly so the user knows a novel approach is warranted.)

### Recommended next step
<One concrete action based on what was found>
```

## Rules

1. **Don't guess — cite**. Every claim must point to a file path + line number or commit hash.
2. **Read before recommending**. Don't rely on grep match alone.
3. **Respect privacy**. Never read or return `.env`, secrets, credentials, API keys, or private session logs.
4. **Time-box**. If nothing useful appears after 5 minutes of searching, report "no prior art found" rather than forcing a weak match.
5. **Prefer recent work**. If two projects both solved a problem, show the newest working solution.

## Complementary skills

- `/mind-meld` — append cross-project insights to named agents' memory
- `/escalate` — when no prior art exists, consult external AI models

---

*"The answer is usually written down somewhere. Read before you write."*
