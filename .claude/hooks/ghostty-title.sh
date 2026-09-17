#!/bin/bash
# =============================================================================
# ghostty-status (session-start) — SessionStart hook
# Sets initial Ghostty terminal title to "ProjectName - starting session"
# and applies working background tint. Project-agnostic — derives name from cwd.
#
# Hook type: SessionStart
# Terminal: Ghostty (uses OSC escape sequences)
# =============================================================================

PROJECT_NAME=$(basename "$(pwd)")

# Set title
printf '\033]2;⚡ %s - starting session\007' "$PROJECT_NAME" > /dev/tty 2>/dev/null

# Set working background tint (dark blue-slate)
printf '\033]11;#0d1220\007' > /dev/tty 2>/dev/null

cat <<EOF
{"continue": true}
EOF
