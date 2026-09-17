---
name: promote-hook
description: Promote a hook or skill from the current project to ~/Development/patterns/ and install it across all projects in ~/Development/. Use when you've built or improved a workflow tool and want every project to have it.
---

# Promote Hook — Cross-Project Workflow Installer

```
    +==============================================================+
    |                                                              |
    |     * ============================================== *      |
    |     |  P R O M O T E   H O O K                       |      |
    |     * ============================================== *      |
    |                                                              |
    |   "Ship a workflow to every project in one move"             |
    |                                                              |
    |      detect -> copy to patterns -> install all -> report     |
    |                                                              |
    +==============================================================+
```

You are executing the **Promote Hook** skill — a tool that takes a hook or skill from the current project, copies it to the central patterns library, and installs it across every project in `~/Development/`.

## When to use

- You just wrote or improved a hook in `.claude/hooks/` and want all projects to get it.
- You just wrote or improved a skill in `.claude/skills/` and want all projects to get it.
- The `promote-hook-detector` Stop hook suggested you run this after detecting a modified file.

## Arguments

**With an argument:** `/promote-hook conversation-logger` promotes the named hook or skill.

**Without arguments:** Auto-detect all hooks and skills modified during this session (same detection logic as the Stop hook — files with `mtime` after session start). If multiple are found, list them and ask which to promote. If only one, proceed with it.

## Execution Flow

### Phase 1: Identify what to promote

1. If a name was provided, look for:
   - `.claude/hooks/<name>.sh` (hook)
   - `.claude/skills/<name>/SKILL.md` (skill)
   If neither exists, error out.

2. If no name was provided, scan `.claude/hooks/*.sh` and `.claude/skills/*/SKILL.md` for files modified since session start (read `/tmp/claude-promote-<session_id>.json` for the `start` timestamp, or use 1 hour ago as fallback). If multiple found, ask the user which to promote. If zero found, say "nothing to promote."

### Phase 2: Copy to patterns

**For hooks:**
1. Read the source: `.claude/hooks/<name>.sh`
2. Create or update: `~/Development/patterns/claudehooks/<name>/hook.sh`
3. Ensure executable: `chmod +x`
4. Check if the hook is already in `~/Development/patterns/claudehooks/install.sh`'s HOOKS array. If not, tell the user to add a line — but don't modify install.sh automatically (it has a specific format).

**For skills:**
1. Read the source: `.claude/skills/<name>/SKILL.md`
2. Create or update: `~/Development/patterns/claudeskills/<name>/SKILL.md`

### Phase 3: Install across all projects

Loop over every directory in `~/Development/*/`:

**For hooks:**
1. `mkdir -p <project>/.claude/hooks`
2. Copy `hook.sh` → `.claude/hooks/<name>.sh`
3. `chmod +x`
4. Patch `.claude/settings.json`:
   - Read the hook script's header comment for `# Hook type: Stop|SessionStart|PreToolUse`
   - Find or parse the lifecycle event from the header
   - Add the hook command to the appropriate lifecycle group if not already present
   - Default to `Stop` if no lifecycle comment is found

**For skills:**
1. `mkdir -p <project>/.claude/skills/<name>`
2. Copy `SKILL.md`

Track counts: installed, updated (content differed), already current (identical), skipped (project has no `.claude/`).

### Phase 4: Report

```
Promote Complete
================

Source: .claude/hooks/my-hook.sh
Copied to: ~/Development/patterns/claudehooks/my-hook/hook.sh

Installed across projects:
  New:      8
  Updated:  3
  Current: 13
  Total:   24/24

All projects now have my-hook.
```

## Rules

1. **Never delete** existing hooks or skills in other projects — only add or update.
2. **Overwrite without asking** when promoting (the user already said "promote" — that's the consent). This differs from `/install-hooks` which asks before overwriting.
3. **Create `.claude/` structure** in projects that don't have it yet (`mkdir -p`).
4. **Settings.json format**: Match the existing indentation. Create the file if it doesn't exist.
5. **No duplicate registrations** in settings.json — check before adding.
6. **Report every project** so the user can see the full picture.

---

*"Write it once, ship it everywhere."*
