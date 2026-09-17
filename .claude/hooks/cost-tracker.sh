#!/bin/bash
# =============================================================================
# cost-tracker — Stop hook
# Parses the Claude transcript for token usage, calculates cost by category
# (input, output, cache read, cache write), and injects a summary line into
# the conversation for the agent to include in its response.
#
# Hook type: Stop
# Lifecycle: Runs after every agent response
# Requires: python3
# =============================================================================

hook_data=$(cat)

python3 - "$hook_data" << 'PYTHON'
import json, sys, os

# === CONFIGURATION ===
# Model name (for display/reference only)
MODEL_NAME = "Claude Opus 4.6"

# Pricing per million tokens — adjust for your model
PRICING = {
    "input": 15.00,
    "output": 75.00,
    "cache_write": 18.75,
    "cache_read": 1.50,
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

state_file = f"/tmp/claude-cost-{session_id}.json"
last_line = 0
try:
    if os.path.exists(state_file):
        with open(state_file, "r") as f:
            state = json.load(f)
            last_line = state.get("last_line", 0)
except Exception:
    pass

totals = {"input": 0, "output": 0, "cache_write": 0, "cache_read": 0}
current_line = 0

try:
    with open(transcript_path, "r") as f:
        for line in f:
            current_line += 1
            if current_line <= last_line:
                continue
            try:
                entry = json.loads(line.strip())
                if "message" in entry and isinstance(entry["message"], dict):
                    usage = entry["message"].get("usage", {})
                    if usage:
                        totals["input"] += usage.get("input_tokens", 0)
                        totals["output"] += usage.get("output_tokens", 0)
                        totals["cache_write"] += usage.get("cache_creation_input_tokens", 0)
                        totals["cache_read"] += usage.get("cache_read_input_tokens", 0)
            except Exception:
                continue
except Exception:
    print('{"continue": true}')
    sys.exit(0)

try:
    with open(state_file, "w") as f:
        json.dump({"last_line": current_line}, f)
except Exception:
    pass

total_tokens = sum(totals.values())
if total_tokens == 0:
    print('{"continue": true}')
    sys.exit(0)

def calc_cost(tokens, rate):
    return (tokens / 1_000_000) * rate

costs = {k: calc_cost(totals[k], PRICING[k]) for k in PRICING}
total_cost = sum(costs.values())

def fmt_tok(n):
    if n >= 1000:
        return f"{n/1000:.1f}k"
    return str(n)

def fmt_cost(c):
    if c < 0.01:
        return f"${c:.4f}"
    return f"${c:.2f}"

parts = []
if totals["input"] > 0:
    parts.append(f"In: {fmt_tok(totals['input'])} (${costs['input']:.4f})")
if totals["cache_read"] > 0:
    parts.append(f"Cache read: {fmt_tok(totals['cache_read'])} (${costs['cache_read']:.4f})")
if totals["cache_write"] > 0:
    parts.append(f"Cache write: {fmt_tok(totals['cache_write'])} (${costs['cache_write']:.4f})")
if totals["output"] > 0:
    parts.append(f"Out: {fmt_tok(totals['output'])} (${costs['output']:.4f})")

summary = " | ".join(parts)
message = f"**Tokens** ({MODEL_NAME}): {summary} | **Total: {fmt_cost(total_cost)}**"

escaped = json.dumps(f"TOKEN COST: Include this line just before your timestamp:\n{message}")
print(f'{{"continue": true, "systemMessage": {escaped}}}')
PYTHON
