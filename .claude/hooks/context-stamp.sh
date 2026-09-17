#!/bin/bash
# =============================================================================
# context-stamp — Stop hook
# Appends a timestamp and project context reminder to the conversation after
# each agent response. Helps the agent maintain situational awareness across
# long sessions.
#
# Hook type: Stop
# Lifecycle: Runs after every agent response
# =============================================================================

# === CONFIGURATION ===
PROJECT_NAME="My Project"
PROJECT_DESCRIPTION="a software project"
DATE_FORMAT="%H:%M %m/%d"
# === END CONFIGURATION ===

TIMESTAMP=$(date +"$DATE_FORMAT")

cat <<EOF
{"continue": true, "systemMessage": "CONTEXT: Completed at ${TIMESTAMP}. You are working on **${PROJECT_NAME}** -- ${PROJECT_DESCRIPTION}. Project root: $(pwd)"}
EOF
