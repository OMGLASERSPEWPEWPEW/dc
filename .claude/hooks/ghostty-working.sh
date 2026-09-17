#!/bin/bash
# =============================================================================
# ghostty-status (pre-tool-use) — PreToolUse hook
# Updates Ghostty title to "ProjectName - ToolName" and sets a "working"
# background tint. Project-agnostic — derives name from cwd.
#
# Hook type: PreToolUse (no matcher — fires on all tools)
# Terminal: Ghostty (uses OSC escape sequences)
# =============================================================================

# === CONFIGURATION ===
WORKING_BG="#0d1220"   # dark blue-slate tint while working
# === END CONFIGURATION ===

PROJECT_NAME=$(basename "$(pwd)")

# Read hook input to get the tool name
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('tool_name',''))" 2>/dev/null)

if [ -n "$TOOL_NAME" ]; then
  printf '\033]2;⚡ %s - %s\007' "$PROJECT_NAME" "$TOOL_NAME" > /dev/tty 2>/dev/null
else
  printf '\033]2;⚡ %s - working…\007' "$PROJECT_NAME" > /dev/tty 2>/dev/null
fi

# Set working background
printf '\033]11;%s\007' "$WORKING_BG" > /dev/tty 2>/dev/null

# Always allow the tool to proceed
echo '{"decision":"approve"}'
