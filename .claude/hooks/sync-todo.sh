#!/bin/bash
# =============================================================================
# sync-todo — PostToolUse (Write/Edit) hook
# When a docs/todo/*.md file is written or edited, parses the frontmatter
# and upserts to a Supabase table via RPC.
#
# Hook type: PostToolUse (matcher: Write, Edit)
# Lifecycle: Runs after Write or Edit tool invocations
# Requires: python3, Supabase project with upsert_captain_todo RPC
#
# Configuration: Set SUPABASE_URL and SUPABASE_ANON_KEY env vars, or
# create a .env file in the project root with VITE_SUPABASE_URL and
# VITE_SUPABASE_ANON_KEY.
# =============================================================================

INPUT=$(cat)

# Extract the file path from the tool input
FILE_PATH=$(echo "$INPUT" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    p = d.get('tool_input', {}).get('file_path', '')
    print(p)
except:
    print('')
" 2>/dev/null)

# Only proceed if it's a TODO file
if [[ ! "$FILE_PATH" == *docs/todo/*.md ]]; then
  exit 0
fi

# Check the file exists
if [[ ! -f "$FILE_PATH" ]]; then
  exit 0
fi

# Parse the frontmatter and upsert via Supabase RPC
python3 - "$FILE_PATH" << 'PYTHON'
import sys, re, json, os
try:
    from urllib.request import Request, urlopen
except ImportError:
    sys.exit(0)

filepath = sys.argv[1]
filename = os.path.basename(filepath)
content = open(filepath).read()

# Parse title
title_m = re.search(r'^#\s+(.+)', content, re.M)
title = title_m.group(1).strip() if title_m else filename.replace('.md', '')

def field(name):
    m = re.search(r'\*\*' + name + r'\*\*\s*:\s*(.+)', content, re.I)
    return m.group(1).strip() if m else ''

status = field('Status') or 'working'
priority = field('Priority') or 'medium'
effort = field('Effort') or 'medium'
stage = field('Stage') or 'conception'
date = field('Date') or ''

# Summary: first real paragraph after the --- separator
lines = content.split('\n')
summary = ''
past_hr = False
for line in lines:
    if line.strip() == '---':
        if not past_hr:
            past_hr = True
            continue
    if past_hr and line.strip() and not line.startswith('#') and not line.startswith('**'):
        summary = line.strip()[:240]
        break

# Body: content paragraphs after title/meta, up to 500 chars
body_lines = []
body_started = False
for line in lines:
    t = line.strip()
    if t.startswith('# '):
        body_started = True
        continue
    if not body_started:
        continue
    if t == '---':
        break
    if not t or t.startswith('**') or t.startswith('#'):
        continue
    body_lines.append(t)
body = ' '.join(body_lines)[:500]

# Files touched: backtick-quoted paths
files_touched = []
seen_files = set()
for m in re.finditer(r'`([a-zA-Z][^`]*/[^`]*\.(tsx|ts|js|css|md|sh|json|toml))`', content):
    fp = m.group(1)
    if fp not in seen_files:
        seen_files.add(fp)
        files_touched.append(fp)
files_touched = files_touched[:20]

# Related commits
import subprocess
stem = filename.replace('.md', '')
related_commits = []
seen_hashes = set()

def absorb_git_log(args):
    try:
        out = subprocess.check_output(args, stderr=subprocess.DEVNULL, timeout=5).decode().strip()
        for line in out.split('\n'):
            if not line:
                continue
            h = line[:7]
            if h not in seen_hashes:
                seen_hashes.add(h)
                related_commits.append({'hash': h, 'summary': line[8:].strip()})
    except Exception:
        pass

absorb_git_log(['git', 'log', '--oneline', '--no-decorate', '--grep=' + stem, '-n', '8'])
for fp in files_touched[:5]:
    absorb_git_log(['git', 'log', '--oneline', '--no-decorate', '-n', '5', '--', fp])
related_commits = related_commits[:10]

# Load Supabase config from env vars or .env file
url = os.environ.get('SUPABASE_URL', '')
key = os.environ.get('SUPABASE_ANON_KEY', '')

if not url or not key:
    # Try .env files in project root
    project_dir = os.environ.get('CLAUDE_PROJECT_DIR', os.getcwd())
    for env_name in ['.env', '.env.local']:
        env_path = os.path.join(project_dir, env_name)
        if os.path.exists(env_path):
            for l in open(env_path):
                if l.startswith('VITE_SUPABASE_URL=') and not url:
                    url = l.split('=', 1)[1].strip()
                elif l.startswith('VITE_SUPABASE_ANON_KEY=') and not key:
                    key = l.split('=', 1)[1].strip()

if not url or not key:
    sys.exit(0)

payload = json.dumps({
    'p_filename': filename,
    'p_title': title,
    'p_status': status,
    'p_priority': priority,
    'p_effort': effort,
    'p_stage': stage,
    'p_date': date,
    'p_summary': summary,
    'p_body': body,
    'p_files_touched': files_touched,
    'p_related_commits': related_commits,
}).encode()

req = Request(
    f'{url}/rest/v1/rpc/upsert_captain_todo',
    data=payload,
    headers={
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': f'Bearer {key}',
    },
    method='POST',
)

try:
    urlopen(req, timeout=5)
except Exception:
    pass
PYTHON
