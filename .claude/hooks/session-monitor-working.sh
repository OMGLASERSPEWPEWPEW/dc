#!/bin/bash
# =============================================================================
# session-monitor (working) — writes "working" to ~/.claude/sessions/<pid>.status
# Fires from UserPromptSubmit + PreToolUse. Paired with the SwiftBar plugin
# claude-sessions.2s.sh to show live session status in the macOS menu bar.
#
# Finds Claude Code's PID by walking up from $PPID until we hit one with a
# matching ~/.claude/sessions/<pid>.json — survives any intermediate shells.
# =============================================================================

# Drain stdin so Claude doesn't block on the hook's pipe
cat >/dev/null 2>&1 || true

pid=$PPID
for _ in 1 2 3 4 5 6; do
  if [ -f "$HOME/.claude/sessions/$pid.json" ]; then
    echo "working" > "$HOME/.claude/sessions/$pid.status" 2>/dev/null
    break
  fi
  pid=$(ps -o ppid= -p "$pid" 2>/dev/null | tr -d ' ')
  [ -z "$pid" ] || [ "$pid" = "1" ] && break
done

echo '{"continue": true}'
