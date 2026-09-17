#!/bin/bash
# =============================================================================
# promote-hook-detector — Stop hook
# Detects when .claude/hooks/ or .claude/skills/ files were modified during the
# current session and asks the user whether to promote them to the central
# patterns library + all projects in ~/Development/.
#
# Hook type: Stop
# Lifecycle: Runs after every agent response
# Requires: python3
# =============================================================================

hook_data=$(cat)

python3 - "$hook_data" << 'PYTHON'
import json, sys, os, glob, time

hook_data_raw = sys.argv[1] if len(sys.argv) > 1 else "{}"
try:
    hook = json.loads(hook_data_raw)
    session_id = hook.get("session_id", "unknown")
except Exception:
    session_id = "unknown"

project_dir = os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())

# Track session start time so we only flag files modified *during* this session.
# The SessionStart hook or first Stop invocation seeds the timestamp.
state_file = f"/tmp/claude-promote-{session_id}.json"
now = time.time()

if not os.path.exists(state_file):
    # First invocation this session — record the start time, don't flag anything.
    with open(state_file, "w") as f:
        json.dump({"start": now, "prompted": []}, f)
    print('{"continue": true}')
    sys.exit(0)

try:
    with open(state_file, "r") as f:
        state = json.load(f)
except Exception:
    state = {"start": now, "prompted": []}

session_start = state.get("start", now)
already_prompted = set(state.get("prompted", []))

# Scan .claude/hooks/ and .claude/skills/ for files modified after session start.
changed = []

hooks_dir = os.path.join(project_dir, ".claude", "hooks")
if os.path.isdir(hooks_dir):
    for f in glob.glob(os.path.join(hooks_dir, "*.sh")):
        if os.path.getmtime(f) > session_start and f not in already_prompted:
            changed.append(("hook", os.path.basename(f), f))

skills_dir = os.path.join(project_dir, ".claude", "skills")
if os.path.isdir(skills_dir):
    for skill_dir in glob.glob(os.path.join(skills_dir, "*")):
        if not os.path.isdir(skill_dir):
            continue
        skill_file = os.path.join(skill_dir, "SKILL.md")
        if os.path.exists(skill_file) and os.path.getmtime(skill_file) > session_start:
            if skill_file not in already_prompted:
                changed.append(("skill", os.path.basename(skill_dir), skill_file))

if not changed:
    print('{"continue": true}')
    sys.exit(0)

# Build a message listing what changed and suggesting /promote-hook
names = []
for kind, name, path in changed:
    names.append(f"- {kind}: **{name}**")
    already_prompted.add(path)

# Persist so we don't ask again this session for the same files
state["prompted"] = list(already_prompted)
with open(state_file, "w") as f:
    json.dump(state, f)

listing = "\n".join(names)
msg = (
    f"The following hooks/skills were modified this session:\n{listing}\n\n"
    f"To promote to all projects, run: `/promote-hook`\n"
    f"This copies to ~/Development/patterns/ and installs across all 24 projects."
)

result = {"continue": True, "systemMessage": msg}
print(json.dumps(result))
PYTHON
