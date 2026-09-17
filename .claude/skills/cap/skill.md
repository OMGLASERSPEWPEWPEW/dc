---
name: c&p
description: >
  Commit and push. Analyzes all staged and unstaged changes, groups them
  into logical atomic commits using the Nib commit convention
  (type(scope): summary), presents the plan for confirmation, executes
  the commits, and pushes to remote. Integrates with git-push-gate.sh.
---

# /c&p — Commit and Push

Group changes into logical commits with machine-readable messages, then push.

## Commit Convention

### Message format

```
type(scope): imperative summary (72 chars max)

Why: one or two sentences explaining reasoning, not the diff
Files: key-file-1.ts, key-file-2.ts, key-file-3.ts

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Rules:**
- Summary: imperative mood ("Add", "Fix", "Extract" — not "Added", "Fixing"), 72 chars max
- `Why:` trailer: required for all types except `chore` and `docs`
- `Files:` trailer: required, list the 2-5 most significant files touched
- `Co-Authored-By:` footer: always present
- Multi-scope: if genuinely equal, list both: `feat(palette,shared): extract helper`

### Exempt types

`Evolve:` and `Promote:` are ritual commit types produced by `/evolution` and `/promote`. They use their own format. **Never rewrite, absorb, or duplicate these.** If detected in today's git log, exclude their files from grouping.

### Change types

| Type | When to use | Example |
|------|------------|---------|
| `feat` | New user-facing capability | `feat(palette): add per-pane model selection` |
| `fix` | Corrects a bug | `fix(agendas): prevent stale cache on day rollover` |
| `refactor` | Restructuring without behavior change | `refactor(palette): extract pane registry` |
| `perf` | Measurable performance improvement | `perf(filter): skip unchanged sentences on re-scan` |
| `style` | CSS/visual changes only | `style(ui): tighten palette carousel spacing` |
| `test` | Adding or fixing tests | `test(agendas): cover diffAgainstCache edge cases` |
| `docs` | Documentation only | `docs(claude-md): add agendas cache section` |
| `chore` | Agents, hooks, skills, config, deps | `chore(infra): add Thyra journal evolution entry` |

### Module scopes

| Scope | Files it covers |
|-------|----------------|
| `editor` | `main.ts`, `schema.ts`, `editor-utils.ts`, `day-rollover.ts`, `keyboard.ts`, `shortcuts.ts` |
| `palette` | `palette/*` |
| `filter` | `filter/*` |
| `corrections` | `corrections/*` |
| `scene-arc` | `scene-arc/*` |
| `scene` | `scene/*` |
| `agendas` | `agendas/*` |
| `grammar` | `grammar/*` |
| `storage` | `storage.ts`, `remote.ts`, `supabase.ts` |
| `sync` | `sync.ts`, Vite sync middleware |
| `auth` | `auth.ts`, `auth-ui.ts` |
| `export` | `export.ts`, `docx-serializer.ts`, `pdf-serializer.ts` |
| `stitch` | `stitch.ts` |
| `ui` | `editor.css`, `theme.ts`, `toolbar.ts`, `focus.ts`, `find-replace.ts`, `quick-open.ts`, `diff-view.ts`, `browser.ts` |
| `shared` | `shared/*` |
| `gateway` | `gateway.ts`, `supabase/functions/*` |
| `infra` | `.claude/agents/*`, `.claude/hooks/*`, `.claude/skills/*`, `CLAUDE.md` |
| `build` | `vite.config.ts`, `tsconfig.json`, `package.json`, `package-lock.json` |

### Agent grep patterns this enables

```bash
git log --grep="(palette)" --oneline       # all palette changes
git log --grep="^fix" --oneline            # all bug fixes
git log --grep="Files:.*storage.ts"        # all storage.ts touches
git log --grep="^perf" --oneline           # all performance work
git log --grep="(infra)" --oneline         # all agent/hook/skill changes
git log --grep="^feat" --oneline           # all new features
git log --grep="^refactor" --oneline       # all refactors
```

---

## Execution Flow

### Phase 1: SNAPSHOT

Gather the full picture of what changed:

```bash
# All changes (staged, unstaged, untracked)
git status --short

# Unstaged changes
git diff --stat

# Staged changes
git diff --cached --stat

# Detect ritual commits already made this session
git log --since="midnight" --oneline --all | grep -E "^[a-f0-9]+ (Evolve:|Promote:)"

# What's already pushed
git log origin/main..HEAD --oneline 2>/dev/null
```

### Phase 1.5: VERSION CHECK

Before grouping commits, check if a version bump is needed:

```bash
# Check if any code files changed (staged + unstaged + untracked)
CODE_CHANGED=$(git status --short | grep -E '^\s*[MADRCU?]+\s+(src/|supabase/functions/|supabase/migrations/)' | head -1)
```

If `CODE_CHANGED` is non-empty:

1. Read current version from `package.json`
2. Read the first entry in `src/data/changelog.ts` — check if its `version` matches `package.json` and its `date` is today
3. **Check if this version is already deployed:** run `git log origin/main --oneline -1 -- package.json` and compare. If the remote already has a commit with this version (i.e., the version in `package.json` matches what's on `origin/main`), then code changes since that push need a new bump — even if `package.json` and `changelog.ts` agree locally.
4. If ANY check fails (version mismatch, stale date, OR version already pushed to remote):
   - **Auto-determine bump type:**
     - New files created in `src/` or `supabase/functions/` → **minor** bump (0.X.0 → 0.X+1.0)
     - Only modifications to existing files → **patch** bump (0.x.Y → 0.x.Y+1)
   - **Prompt the author:** "Code changes detected but version not bumped (already deployed as X.Y.Z). Bump to 0.X.Y? [yes / skip]"
   - If yes: bump `package.json`, prepend changelog entry to `src/data/changelog.ts`, include as the FIRST commit in the proposal (`chore(build): bump version to X.Y.Z`)
   - If skip: proceed without bump (author's choice, but warn)

If `CODE_CHANGED` is empty (docs/infra only), skip this phase.

---

### Phase 2: ANALYZE

Apply the grouping rules (in priority order) to partition changed files into commits:

**Rule 1 — Exempt rituals:** Check if `Evolve:` or `Promote:` commits exist in today's log. Exclude their journal files from grouping.

**Rule 2 — Infra is always separate:** Files matching `.claude/agents/**`, `.claude/hooks/**`, `.claude/skills/**`, `CLAUDE.md` → one `chore(infra)` commit. Exception: if already committed as part of a ritual.

**Rule 3 — Docs are always separate:** Files matching `docs/**` or root `*.md` (except `CLAUDE.md`) → `docs(scope)` commit.

**Rule 4 — Tests travel with source:** `foo.test.ts` belongs in the same commit as `foo.ts`, inheriting its scope.

**Rule 5 — CSS accompanies its feature:** If `editor.css` changed alongside a feature, and the CSS is clearly for that feature, include it in the feature's commit. Standalone visual tweaks → separate `style(ui)` commit.

**Rule 6 — Group by module scope:** Map remaining files to scopes using the table above. Same scope + same purpose = one commit.

**Rule 7 — Flag mixed concerns:** If a single file contains both a bug fix and a new feature, flag it as "mixed concern" and ask the author whether to: (a) commit together with dominant type, (b) stage partial changes manually then re-run, or (c) skip for now.

**Rule 8 — Unrelated fixes are separate:** Two fixes in different modules → two commits.

**Rule 9 — Build config is separate:** `vite.config.ts`, `package.json` etc. that aren't tied to a feature → `chore(build)`.

For each group:
- Infer the change type (feat/fix/refactor/etc.) from the nature of the changes
- Draft the commit message using the convention format
- Read the actual diff for each group to write an accurate `Why:` line

### Phase 3: PROPOSE

Display the proposed grouping for author confirmation:

```
Proposed commits (3):

1. feat(editor): persist scroll and cursor position across refresh

   Why: Screen lock, page refresh, and Vite dev reload all reset scroll
        to top, breaking flow state for ADHD-friendly UX.
   Files: src/main.ts

2. chore(infra): add /c&p commit-and-push skill

   Files: .claude/skills/cap/SKILL.md, .claude/docs/prd/cap-skill.md

3. test(agendas): cover duplicate block scenario in diffAgainstCache

   Why: Edge case where identical paragraphs get mismatched classifications.
   Files: agendas/index.test.ts

Proceed? [yes / edit N / skip N / abort]
```

**Options:**
- `yes` — execute all commits in order, then push
- `edit N` — revise commit N's message or file grouping
- `skip N` — exclude commit N (leaves files unstaged)
- `abort` — do nothing, leave working tree untouched

### Phase 4: EXECUTE COMMITS

For each confirmed group, in order:

```bash
# Stage only the files in this group
git add -- file1.ts file2.ts ...

# Commit with structured message (use HEREDOC for formatting)
git commit -m "$(cat <<'EOF'
type(scope): summary

Why: reasoning
Files: file1.ts, file2.ts

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

# Verify
git log -1 --oneline
```

If any commit fails (pre-commit hook, etc.), **stop immediately**, report the error, and leave remaining groups unstaged for the author to resolve.

### Phase 5: PUSH

```bash
# Push to remote
git push
```

The `git-push-gate.sh` hook will fire and emit its confirmation message. **Surface this message verbatim to the author** and wait for their explicit confirmation before proceeding.

After push succeeds, confirm:
```bash
git log origin/main..HEAD --oneline
# Should be empty (all commits pushed)
```

---

## Pre-commit Reminder

Before proposing commits, check if any `src/*.ts` files changed. If so, display:

> Consider running `/docs-check` first — it will tell you if CLAUDE.md needs updating.

This is a reminder, not a gate. The author can proceed without running `/docs-check`.

---

## Untracked Files

For each untracked file in `git status`:
- If it matches a known scope → include in the proposal with a note "(new file)"
- If it looks like it shouldn't be committed (`.env`, `credentials`, `.nib/docs/*`, `node_modules/`) → warn and exclude
- Ask the author to confirm before staging any new file

---

## Examples

### Session with 3 concerns

Changes: `palette/views/root-view.ts`, `palette/pane-registry.ts`, `filter/ai.ts` (palette feature), `agendas/plugin.ts` (bug fix), `.claude/agents/Thyra/journal.md` (evolution)

Proposed:
1. `feat(palette): add per-pane model selection dropdown`
2. `fix(agendas): prevent stale decorations after content replacement`
3. `chore(infra): update Thyra journal with threshold defense insights`

### Session with only infra changes

Changes: `.claude/agents/frontend-developer/journal.md`, `.claude/hooks/cost-report.sh`

Proposed:
1. `chore(infra): evolve frontend-developer journal and update cost hook`

### Session after /evolution already ran

`Evolve: 2026-03-22 collective agent growth` already committed. Remaining changes: `src/main.ts` (feature).

Proposed:
1. `feat(editor): persist scroll position across refresh`

(Evolution journal files excluded — already committed by `/evolution`.)
