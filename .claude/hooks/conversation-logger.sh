#!/bin/bash
# =============================================================================
# conversation-logger — Stop hook
# Parses the Claude transcript and logs conversation excerpts to a structured
# memory directory. Entries are written to both a daily chronological log and
# topic-specific "heap" files based on keyword matching.
#
# Hook type: Stop
# Lifecycle: Runs after every agent response
# Requires: python3
# =============================================================================

hook_data=$(cat)

python3 - "$hook_data" << 'PYTHON'
import json, sys, os, re
from datetime import datetime

# === CONFIGURATION ===
# Directory for logs, relative to project root
LOG_DIR = ".claude/memory"

# Maximum number of recent snippets to include in a daily log entry
MAX_SNIPPETS = 20

# Maximum character length per snippet before truncation
MAX_SNIPPET_LENGTH = 500

# Topic categories and their keyword patterns (regex, case-insensitive).
# Matching snippets are appended to <heaps>/<TopicName>.md for long-term
# thematic memory. Customize these for your project domain.
CONCEPTS = {
    "Architecture": r"module|import|export|build|typescript|webpack|vite",
    "Testing": r"test|spec|assert|mock|fixture|coverage",
    "Database": r"database|sql|query|migration|schema|index",
    "API": r"api|endpoint|route|request|response|middleware",
    "Auth": r"auth|login|session|token|oauth|permission",
    "UI": r"component|render|style|layout|responsive|animation",
    "DevOps": r"deploy|ci|cd|docker|container|pipeline",
    "Docs": r"readme|documentation|comment|changelog|guide",
}
# === END CONFIGURATION ===

hook_data_raw = sys.argv[1] if len(sys.argv) > 1 else "{}"
try:
    hook = json.loads(hook_data_raw)
    transcript_path = hook.get("transcript_path", "")
    session_id = hook.get("session_id", "unknown")
except Exception:
    transcript_path = ""
    session_id = "unknown"

if not transcript_path or not os.path.exists(transcript_path):
    print('{"continue": true}')
    sys.exit(0)

# Determine the project root directory
project_dir = os.environ.get("CLAUDE_PROJECT_DIR", "")
if not project_dir:
    # Fall back: walk up from the transcript path to find the project root
    project_dir = os.path.dirname(
        os.path.dirname(os.path.dirname(os.path.dirname(transcript_path)))
    )

log_base = os.path.join(project_dir, LOG_DIR)
heap_dir = os.path.join(log_base, "heaps")
daily_dir = os.path.join(log_base, "daily")

os.makedirs(heap_dir, exist_ok=True)
os.makedirs(daily_dir, exist_ok=True)

now = datetime.now()
timestamp = now.strftime("%Y-%m-%d_%H-%M-%S")
date_str = now.strftime("%Y-%m-%d")

# Track how far we have already read so we only process new lines
state_file = f"/tmp/claude-logger-{session_id}.json"
last_line = 0
try:
    if os.path.exists(state_file):
        with open(state_file, "r") as f:
            state = json.load(f)
            last_line = state.get("last_line", 0)
except Exception:
    pass

snippets = []
current_line = 0

try:
    with open(transcript_path, "r") as f:
        for line in f:
            current_line += 1
            if current_line <= last_line:
                continue
            try:
                entry = json.loads(line.strip())
                msg = entry.get("message", {})
                if not isinstance(msg, dict):
                    continue
                role = msg.get("role", "")
                if role not in ("user", "assistant"):
                    continue
                content = msg.get("content", "")
                if isinstance(content, list):
                    text_parts = []
                    for block in content:
                        if isinstance(block, dict):
                            if block.get("type") == "text":
                                text_parts.append(block.get("text", ""))
                            elif block.get("type") == "tool_use":
                                text_parts.append(
                                    f"[tool: {block.get('name', '?')}]"
                                )
                        elif isinstance(block, str):
                            text_parts.append(block)
                    content = " ".join(text_parts)
                if content and len(content.strip()) > 0:
                    if len(content) > MAX_SNIPPET_LENGTH:
                        content = content[:MAX_SNIPPET_LENGTH] + "..."
                    snippets.append(f"**{role}**: {content.strip()}")
            except Exception:
                continue
except Exception:
    print('{"continue": true}')
    sys.exit(0)

# Persist read-position so the next invocation starts where we left off
try:
    with open(state_file, "w") as f:
        json.dump({"last_line": current_line}, f)
except Exception:
    pass

if not snippets:
    print('{"continue": true}')
    sys.exit(0)

# --- Daily log ---
transcript = "\n\n".join(snippets[-MAX_SNIPPETS:])

daily_log = os.path.join(daily_dir, f"{date_str}.md")
try:
    with open(daily_log, "a") as f:
        f.write(f"---\n")
        f.write(f"## Session {session_id[:8]} -- {timestamp}\n\n")
        f.write(transcript)
        f.write(f"\n\n")
except Exception:
    pass

# --- Topic heaps ---
for concept_name, pattern in CONCEPTS.items():
    if re.search(pattern, transcript, re.IGNORECASE):
        heap_file = os.path.join(heap_dir, f"{concept_name}.md")
        try:
            summary = "\n\n".join(snippets[-10:])
            if len(summary) > 2000:
                summary = summary[:2000] + "..."
            with open(heap_file, "a") as f:
                f.write(f"## {timestamp} (session {session_id[:8]})\n\n")
                f.write(summary)
                f.write(f"\n\n---\n\n")
        except Exception:
            pass

print('{"continue": true}')
PYTHON
