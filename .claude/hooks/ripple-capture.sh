#!/bin/bash
# =============================================================================
# ripple-capture — Stop hook (lightweight backup)
# Opportunistic capture between evolution runs. The primary ripple mechanism
# is evolution's Step 3 (Cross-Project Ripple Scan) where named agents do
# deep cross-project analysis. This hook catches improvements in sessions
# where evolution wasn't invoked.
#
# Hook type: Stop
# Lifecycle: Runs after agent response
# =============================================================================

# === CONFIGURATION ===
RIPPLE_LEDGER="$HOME/Development/patterns/kb/ripple-ledger.jsonl"
MAX_COMMITS=20
# === END CONFIGURATION ===

PROJECT_DIR="$(pwd)"
PROJECT_NAME="$(basename "$PROJECT_DIR")"
MARKER="/tmp/${PROJECT_NAME}-ripple-checked"

git rev-parse --is-inside-work-tree &>/dev/null || { echo '{"continue": true}'; exit 0; }

if [ -f "$MARKER" ]; then
  CHANGED=$(git log --since="$(stat -f '%Sm' -t '%Y-%m-%dT%H:%M:%S' "$MARKER" 2>/dev/null || date -r "$MARKER" '+%Y-%m-%dT%H:%M:%S' 2>/dev/null)" --oneline 2>/dev/null | head -1)
  if [ -z "$CHANGED" ]; then
    echo '{"continue": true}'
    exit 0
  fi
fi

COMMITS=$(git log --since="midnight" --oneline 2>/dev/null | head -$MAX_COMMITS)
[ -z "$COMMITS" ] && { echo '{"continue": true}'; exit 0; }

touch "$MARKER"

COMMITS_ESC=$(echo "$COMMITS" | sed 's/"/\\"/g' | tr '\n' '|' | sed 's/|/\\n/g')

MSG="RIPPLE CAPTURE: Session produced commits in ${PROJECT_NAME}. Evaluate whether any represent a meaningful improvement that sibling projects with similar features could benefit from.\\n\\nCommits:\\n${COMMITS_ESC}\\n\\nIf an improvement is worth broadcasting (better auth flow, smarter error handling, improved state management, upgraded integration pattern, performance win, etc.), append ONE line per improvement to ${RIPPLE_LEDGER}:\\n\\n{\"ts\":\"ISO-8601\",\"project\":\"${PROJECT_NAME}\",\"tags\":[\"category\"],\"summary\":\"one line\",\"detail\":\"what improved and why\",\"commits\":[\"hash\"],\"files\":[\"path\"]}\\n\\nGuidelines:\\n- Only log improvements another project would genuinely adapt\\n- Skip: typos, project-specific config, trivial refactors, dep bumps (SOTA ledger handles those)\\n- Tags should be broad categories: auth, api, state, ui, error-handling, performance, push-notifications, payments, real-time, testing, deployment, dx\\n- If nothing is worth broadcasting, do nothing — most sessions won't produce ripple entries"

printf '{"continue":true,"systemMessage":"%s"}\n' "$MSG"
