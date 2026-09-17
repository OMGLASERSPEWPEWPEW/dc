#!/bin/bash
# =============================================================================
# session-monitor (waiting) — writes "waiting" to ~/.claude/sessions/<pid>.status
# Fires from Stop + Notification. Paired with the SwiftBar plugin
# claude-sessions.2s.sh to show live session status in the macOS menu bar.
# =============================================================================

cat >/dev/null 2>&1 || true

pid=$PPID
for _ in 1 2 3 4 5 6; do
  if [ -f "$HOME/.claude/sessions/$pid.json" ]; then
    echo "waiting" > "$HOME/.claude/sessions/$pid.status" 2>/dev/null
    break
  fi
  pid=$(ps -o ppid= -p "$pid" 2>/dev/null | tr -d ' ')
  [ -z "$pid" ] || [ "$pid" = "1" ] && break
done

echo '{"continue": true}'
