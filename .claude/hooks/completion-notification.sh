#!/bin/bash
# =============================================================================
# completion-notification — Stop hook
# Plays a random system sound and shows a macOS notification when Claude
# finishes a task, so you can context-switch away and be called back.
#
# Hook type: Stop
# Lifecycle: Runs after every agent response
# Platform: macOS only (requires afplay and osascript)
# =============================================================================

# === CONFIGURATION ===
SOUNDS=(
  "Basso" "Blow" "Bottle" "Frog" "Funk" "Glass" "Hero"
  "Morse" "Ping" "Pop" "Purr" "Sosumi" "Submarine" "Tink"
)
NOTIFICATION_TITLE="Claude Code"
# === END CONFIGURATION ===

PICK="${SOUNDS[$((RANDOM % ${#SOUNDS[@]}))]}"

afplay "/System/Library/Sounds/${PICK}.aiff" &

osascript -e "display notification \"${PICK} chime - Claude needs your attention\" with title \"${NOTIFICATION_TITLE}\" sound name \"${PICK}\""

echo '{"continue": true}'
