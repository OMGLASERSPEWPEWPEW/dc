#!/bin/bash
# =============================================================================
# ghostty-status (stop) — Stop hook
# Reads the conversation title from the transcript and sets the Ghostty tab
# title to "ProjectName - ConversationTitle". Falls back to first user message
# if no custom-title entry exists yet.
#
# Claude Code sets its own terminal title AFTER hooks complete, so this hook
# spawns a background process that re-sets the title after a brief delay to
# ensure the project name prefix is always visible.
#
# Hook type: Stop
# Terminal: Ghostty (uses OSC escape sequences)
# Requires: python3
# =============================================================================

# === CONFIGURATION ===
DONE_BG="#0d1a14"      # dark green-slate tint when done/waiting
OVERRIDE_DELAY=1       # seconds to wait before overriding Claude Code's title
# === END CONFIGURATION ===

INPUT=$(cat)
TITLE_FILE=$(mktemp /tmp/ghostty-title.XXXXXX)

python3 - "$INPUT" "$TITLE_FILE" << 'PYTHON'
import json, sys, os

hook_raw = sys.argv[1] if len(sys.argv) > 1 else "{}"
title_file = sys.argv[2] if len(sys.argv) > 2 else ""

try:
    hook = json.loads(hook_raw)
    transcript_path = hook.get("transcript_path", "")
except Exception:
    transcript_path = ""

project_name = os.path.basename(os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd()))

# Try to get the conversation title from the transcript
title_suffix = ""
if transcript_path and os.path.exists(transcript_path):
    try:
        first_user_msg = ""
        with open(transcript_path, "r") as f:
            for line in f:
                try:
                    entry = json.loads(line.strip())
                    entry_type = entry.get("type", "")
                    # Best: use the custom-title Claude Code generates
                    if entry_type == "custom-title":
                        title_suffix = entry.get("customTitle", "")
                    # Fallback: grab first user message
                    if not first_user_msg and entry_type == "user":
                        msg = entry.get("message", {})
                        content = msg.get("content", "") if isinstance(msg, dict) else ""
                        if isinstance(content, str) and content.strip():
                            first_user_msg = content.strip()[:60]
                except Exception:
                    continue
        if not title_suffix:
            title_suffix = first_user_msg or "ready"
    except Exception:
        title_suffix = "ready"
else:
    title_suffix = "ready"

# Clean up the title
title_suffix = title_suffix.replace("\n", " ").strip()
if len(title_suffix) > 60:
    title_suffix = title_suffix[:57] + "..."

full_title = f"{project_name} - {title_suffix}"

# Write title to temp file so the shell can spawn a delayed override
if title_file:
    try:
        with open(title_file, "w") as f:
            f.write(full_title)
    except Exception:
        pass

# Set title immediately via /dev/tty
try:
    with open("/dev/tty", "w") as tty:
        tty.write(f"\033]2;\u2713 {full_title}\007")
except Exception:
    import sys as _s
    _s.stderr.write(f"\033]2;\u2713 {full_title}\007")
    _s.stderr.flush()

PYTHON

# Set done background
printf '\033]11;%s\007' "$DONE_BG" > /dev/tty 2>/dev/null

# Claude Code sets its own title AFTER Stop hooks complete, overwriting ours.
# Spawn a background process that waits, then re-sets the title with the
# project name prefix so it's always visible.
if [ -f "$TITLE_FILE" ] && [ -s "$TITLE_FILE" ]; then
  FULL_TITLE=$(cat "$TITLE_FILE")
  rm -f "$TITLE_FILE"
  if [ -n "$FULL_TITLE" ]; then
    (
      sleep "$OVERRIDE_DELAY"
      printf '\033]2;\342\234\223 %s\007' "$FULL_TITLE" > /dev/tty 2>/dev/null
    ) &
    disown 2>/dev/null
  fi
else
  rm -f "$TITLE_FILE" 2>/dev/null
fi

echo '{"continue": true}'
