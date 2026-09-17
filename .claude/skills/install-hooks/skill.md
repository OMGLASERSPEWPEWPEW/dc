---
name: install-hooks
description: Checks ~/Development/patterns/ClaudeHooks/ for hooks not yet installed in the current project and installs them. Shows diffs for updated hooks and asks before overwriting.
---

# Install Hooks - ClaudeHooks Installer for Claude Code

```
    +==============================================================+
    |                                                              |
    |     * ============================================== *      |
    |     |  H O O K   I N S T A L L E R                   |      |
    |     * ============================================== *      |
    |                                                              |
    |   "Keep your hooks fresh across all projects"                |
    |                                                              |
    |         discover -> diff -> install -> patch -> report       |
    |                                                              |
    +==============================================================+
```

You are executing the **Hook Installer** - a tool that syncs hooks from the central ClaudeHooks pattern library into the current project.

## Source Directory

```
~/Development/patterns/ClaudeHooks/
```

This directory contains hook templates organized as subdirectories, each with a `hook.sh` file. The `install.sh` script in that directory defines the hook metadata (lifecycle event, matcher, description).

## Execution Flow

### Phase 1: Discovery

1. **List available hooks** in the source directory:
   ```bash
   ls ~/Development/patterns/ClaudeHooks/
   ```
   Each subdirectory (except `install.sh` and `README.md`) is a hook.

2. **Read the install.sh** to understand hook metadata:
   ```bash
   # Read ~/Development/patterns/ClaudeHooks/install.sh
   # Parse the HOOKS array to get: folder_name|lifecycle|matcher|description
   ```

3. **List currently installed hooks** in this project:
   ```bash
   ls .claude/hooks/
   ```

4. **Read current settings.json** to understand registered hooks:
   ```bash
   # Read .claude/settings.json
   ```

### Phase 2: Diff

For each hook in the source directory:

1. **Map source to target**: `~/Development/patterns/ClaudeHooks/{name}/hook.sh` -> `.claude/hooks/{name}.sh`

2. **Classify each hook**:
   - **New**: Source exists but target doesn't -> will install
   - **Updated**: Both exist but content differs -> show diff, ask user
   - **Current**: Both exist and content matches -> skip
   - **Local-only**: Target exists but no source -> skip (custom hook)

3. **Display the classification** to the user:
   ```
   Hook Status
   ===========

   NEW (will install):
     - context-stamp (Stop) - Timestamp + project context
     - context-window (Stop) - Context window usage gauge

   UPDATED (source differs from local):
     - cost-tracker (Stop) - Token cost calculator

   CURRENT (up to date):
     - git-push-confirm (PreToolUse/Bash)
     - conversation-logger (Stop)

   LOCAL-ONLY (not in source):
     - stuck-detector (Stop)
   ```

### Phase 3: Install New Hooks

For each **new** hook:

1. **Read the source** `hook.sh`
2. **Write it** to `.claude/hooks/{name}.sh`
3. **Make it executable**: ensure the file has proper permissions

### Phase 4: Handle Updates

For each **updated** hook:

1. **Show the diff** between local and source versions
2. **Ask the user** whether to overwrite:
   - "Overwrite" -> replace local with source
   - "Skip" -> keep local version
   - "View full" -> show both complete files before deciding

### Phase 5: Patch settings.json

For each newly installed or updated hook:

1. **Parse the hook metadata** from install.sh (lifecycle event, matcher)
2. **Read `.claude/settings.json`**
3. **Check if the hook command is already registered**
4. If not registered:
   - Find or create the appropriate lifecycle event group
   - Add `{ "type": "command", "command": "bash .claude/hooks/{name}.sh" }` to the hooks array
   - Match the group's `matcher` field if applicable (e.g., `"Bash"` for PreToolUse hooks)
5. **Write the updated settings.json** back

### Phase 6: Report

```
Installation Complete
=====================

Installed: [count]
  - hook-name-1 (lifecycle)
  - hook-name-2 (lifecycle)

Updated: [count]
  - hook-name-3 (lifecycle)

Skipped: [count]
Already current: [count]

Settings patched: .claude/settings.json
```

## Hook Metadata Reference

From `install.sh`, the hook definitions follow this format:
```
folder_name|lifecycle|matcher|description
```

Where:
- **lifecycle**: `SessionStart`, `PreToolUse`, or `Stop`
- **matcher**: Tool name for PreToolUse hooks (e.g., `Bash`), empty for others
- **description**: Human-readable purpose

## Rules

1. **Never delete** existing hooks — only add or update
2. **Always ask** before overwriting an existing hook with a different version
3. **Preserve local-only hooks** — hooks that exist locally but not in the source are custom and should be left alone
4. **Settings.json format**: Match the existing indentation and structure
5. **No duplicate registrations** — check before adding to settings.json
6. **Executable permissions** — ensure all installed hooks are executable

---

*"Fresh hooks, fresh sessions."*
