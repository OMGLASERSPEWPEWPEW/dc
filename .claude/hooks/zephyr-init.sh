#!/bin/bash
# =============================================================================
# zephyr-init — SessionStart hook
# Gathers recent session journals and injects a mandatory startup recap
# protocol so Claude reads prior session context before acting.
#
# Hook type: SessionStart
# Lifecycle: Runs once at session start
# Requires: session-journal hook (writes the journal files this reads)
# =============================================================================

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
JOURNAL_DIR="$PROJECT_DIR/.claude/journals"
BRIDGE_JOURNAL="$PROJECT_DIR/.claude/bridge-journal.md"

# Find the 3 most recently modified journal files (by mtime)
RECENT_JOURNALS=""
if [ -d "$JOURNAL_DIR" ]; then
  RECENT_JOURNALS=$(find "$JOURNAL_DIR" -type f \
    -regex '.*/[0-9a-f]\{8\}-[0-9a-f]\{4\}-[0-9a-f]\{4\}-[0-9a-f]\{4\}-[0-9a-f]\{12\}\.md' \
    -exec stat -f '%m %N' {} \; 2>/dev/null \
    | sort -rn \
    | head -3 \
    | awk '{print $2}')
fi

# Build the file list for the instruction
FILE_LIST=""
if [ -n "$RECENT_JOURNALS" ]; then
  while IFS= read -r f; do
    FILE_LIST="$FILE_LIST\n- $f"
  done <<< "$RECENT_JOURNALS"
fi

# Add bridge journal if it exists
BRIDGE_NOTE=""
if [ -f "$BRIDGE_JOURNAL" ]; then
  BRIDGE_NOTE="- $BRIDGE_JOURNAL (the captain's log — highest-context source)"
fi

cat << EOF
SESSION START — ZEPHYR RECAP PROTOCOL (MANDATORY):

Before responding to ANY user message, you MUST perform the following startup sequence:

1. Read the bridge journal: ${BRIDGE_NOTE}
2. Read these recent session journals (last 100 lines each is fine):${FILE_LIST}
3. Run: git log --oneline -10
4. Check docs/todo/ for active TODOs

Then deliver a ~300 word ZEPHYR RECAP covering:
- What happened in recent sessions — victories, defeats, key decisions
- Current project state — what's working, what's broken or in-progress
- What's on the horizon — based on bridge journal, TODOs, and git momentum

Keep it conversational, lead with the most important thing. After the recap, address whatever the user asked.

ZEPHYR-FIRST PROTOCOL: For ALL subsequent messages after the recap, invoke Zephyr via Agent tool (subagent_type=zephyr) as your FIRST action — no exceptions. Zephyr triages: for simple asks he responds directly; for complex work he delegates to specialists.
EOF
exit 0
