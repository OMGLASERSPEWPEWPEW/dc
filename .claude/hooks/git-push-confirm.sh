#!/bin/bash
# =============================================================================
# git-push-confirm — PreToolUse (Bash) hook
# Intercepts git push commands and instructs Claude to request user
# confirmation before proceeding.
#
# Hook type: PreToolUse (Bash)
# Lifecycle: Runs before every Bash tool invocation
# =============================================================================

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | grep -o '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/"command"[[:space:]]*:[[:space:]]*"//' | sed 's/"$//')

if echo "$COMMAND" | grep -q "git push"; then
  echo '{"decision":"allow","reason":"git push detected — confirm with user before pushing"}'
else
  echo '{"decision":"allow"}'
fi
