#!/bin/bash
# =============================================================================
# journal-check — SessionStart hook
# Surfaces recent memory/journal entries at session start so cross-session
# context is front-of-mind.
#
# Hook type: SessionStart
# Lifecycle: Runs once at session start
# =============================================================================

# === CONFIGURATION ===
# Auto-detect the Claude memory directory for this project
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
SAFE_PATH=$(echo "$PROJECT_DIR" | sed 's|/|-|g')
MEMORY_DIR="$HOME/.claude/projects/$SAFE_PATH/memory"
DAYS_BACK=7
# === END CONFIGURATION ===

JOURNAL_FILES=$(find "$MEMORY_DIR" -name "journal_*.md" -mtime -${DAYS_BACK} 2>/dev/null | sort -r)

if [ -z "$JOURNAL_FILES" ]; then
  echo '{"continue": true}'
  exit 0
fi

# Build a short summary of recent journal filenames
SUMMARIES=""
for f in $JOURNAL_FILES; do
  BASENAME=$(basename "$f")
  DESC=$(grep "^description:" "$f" 2>/dev/null | sed 's/^description: //')
  SUMMARIES="$SUMMARIES\n- $BASENAME: $DESC"
done

cat << EOF
{
  "continue": true,
  "systemMessage": "JOURNAL CHECK: Recent engineering journal entries exist in memory (last ${DAYS_BACK} days). Before starting work, skim these for cross-session context:${SUMMARIES}\nRead the full entries from memory if the current task touches these areas."
}
EOF
exit 0
