#!/bin/bash
# =============================================================================
# sota-sync — SessionStart hook
# The self-updating cross-project sync system. On every session start:
#   1. Self-updates from patterns/
#   2. Auto-installs missing/stale hooks from manifest.json
#   3. Auto-registers new hooks in settings.json
#   4. Detects dep upgrades since last session → writes to SOTA ledger
#   5. Reads SOTA ledger → reports actionable suggestions from siblings
#   6. Reads ripple ledger → surfaces feature improvements from siblings
#
# Hook type: SessionStart
# Lifecycle: Runs once at session start
# =============================================================================

# === CONFIGURATION ===
PATTERNS_DIR="$HOME/Development/patterns/ClaudeHooks"
MANIFEST="$PATTERNS_DIR/manifest.json"
LEDGER_FILE="$HOME/Development/patterns/kb/sota-ledger.json"
CACHE_DIR="$HOME/.cache/sota-sync"
LEDGER_MAX_AGE_DAYS=30
DEPS_TO_TRACK="react vite typescript tailwindcss vitest @supabase/supabase-js playwright"
# === END CONFIGURATION ===

THIS_PROJECT="$(pwd)"
THIS_NAME="$(basename "$THIS_PROJECT")"
HOOKS_DIR="$THIS_PROJECT/.claude/hooks"
SETTINGS_FILE="$THIS_PROJECT/.claude/settings.json"
PROJECT_HASH=$(echo -n "$THIS_PROJECT" | md5 2>/dev/null || echo -n "$THIS_PROJECT" | md5sum 2>/dev/null | cut -c1-12)
STATE_FILE="$CACHE_DIR/${PROJECT_HASH}.json"

mkdir -p "$HOOKS_DIR" "$CACHE_DIR"

REPORT=""
add_report() { REPORT="$REPORT\\n  $1"; }

# ── Phase 1: Self-update ─────────────────────────────────────────────
SELF="$HOOKS_DIR/sota-sync.sh"
PATTERN_SELF="$PATTERNS_DIR/sota-sync/hook.sh"
if [ -f "$PATTERN_SELF" ] && [ -f "$SELF" ]; then
  pattern_mtime=$(stat -f '%m' "$PATTERN_SELF" 2>/dev/null || stat -c '%Y' "$PATTERN_SELF" 2>/dev/null)
  self_mtime=$(stat -f '%m' "$SELF" 2>/dev/null || stat -c '%Y' "$SELF" 2>/dev/null)
  if [ -n "$pattern_mtime" ] && [ -n "$self_mtime" ] && [ "$pattern_mtime" -gt "$self_mtime" ] 2>/dev/null; then
    cp "$PATTERN_SELF" "$SELF"
    chmod +x "$SELF"
    add_report "[self-update] sota-sync.sh updated from patterns/"
    exec bash "$SELF"
  fi
fi

# ── Phase 2: Hook sync ───────────────────────────────────────────────
if [ ! -f "$MANIFEST" ]; then
  add_report "[warning] manifest.json not found at $MANIFEST"
else
  INSTALLED_HOOKS=""
  UPDATED_HOOKS=""
  NEW_HOOKS_JSON=""

  while IFS= read -r entry; do
    name=$(echo "$entry" | node -e "process.stdout.write(JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8')).name)" 2>/dev/null)
    lifecycle=$(echo "$entry" | node -e "process.stdout.write(JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8')).lifecycle)" 2>/dev/null)
    matcher=$(echo "$entry" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8'));process.stdout.write(d.matcher||'')" 2>/dev/null)
    src=$(echo "$entry" | node -e "process.stdout.write(JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8')).src)" 2>/dev/null)

    [ -z "$name" ] || [ -z "$src" ] && continue

    pattern_file="$PATTERNS_DIR/$src"
    local_file="$HOOKS_DIR/$name.sh"

    [ ! -f "$pattern_file" ] && continue

    if [ ! -f "$local_file" ]; then
      cp "$pattern_file" "$local_file"
      chmod +x "$local_file"
      INSTALLED_HOOKS="$INSTALLED_HOOKS $name"
      NEW_HOOKS_JSON="$NEW_HOOKS_JSON{\"name\":\"$name\",\"lifecycle\":\"$lifecycle\",\"matcher\":\"$matcher\"},"
    else
      pattern_mtime=$(stat -f '%m' "$pattern_file" 2>/dev/null || stat -c '%Y' "$pattern_file" 2>/dev/null)
      local_mtime=$(stat -f '%m' "$local_file" 2>/dev/null || stat -c '%Y' "$local_file" 2>/dev/null)
      if [ -n "$pattern_mtime" ] && [ -n "$local_mtime" ] && [ "$pattern_mtime" -gt "$local_mtime" ] 2>/dev/null; then
        cp "$pattern_file" "$local_file"
        chmod +x "$local_file"
        UPDATED_HOOKS="$UPDATED_HOOKS $name"
      fi
    fi
  done < <(node -e "JSON.parse(require('fs').readFileSync('$MANIFEST','utf-8')).forEach(h=>console.log(JSON.stringify(h)))" 2>/dev/null)

  [ -n "$INSTALLED_HOOKS" ] && add_report "[hooks installed]${INSTALLED_HOOKS}"
  [ -n "$UPDATED_HOOKS" ] && add_report "[hooks updated]${UPDATED_HOOKS}"

  # ── Phase 3: Auto-register new hooks in settings.json ─────────────
  if [ -n "$NEW_HOOKS_JSON" ] && [ -f "$SETTINGS_FILE" ]; then
    node -e "
      const fs = require('fs');
      const settings = JSON.parse(fs.readFileSync('$SETTINGS_FILE', 'utf-8'));
      if (!settings.hooks) settings.hooks = {};

      const newHooks = [${NEW_HOOKS_JSON%,}];

      for (const h of newHooks) {
        const event = h.lifecycle;
        if (!settings.hooks[event]) settings.hooks[event] = [];

        const cmd = 'bash .claude/hooks/' + h.name + '.sh';

        // Find matching group (by matcher)
        let group = settings.hooks[event].find(g => {
          if (h.matcher) return g.matcher === h.matcher;
          return !g.matcher;
        });

        if (!group) {
          group = { hooks: [] };
          if (h.matcher) group.matcher = h.matcher;
          settings.hooks[event].push(group);
        }

        if (!group.hooks) group.hooks = [];
        if (group.hooks.some(e => e.command === cmd)) continue;

        group.hooks.push({ type: 'command', command: cmd });
      }

      fs.writeFileSync('$SETTINGS_FILE', JSON.stringify(settings, null, 2) + '\n');
    " 2>/dev/null

    [ $? -eq 0 ] && add_report "[settings.json] registered${INSTALLED_HOOKS}"
  fi
fi

# ── Phase 4: SOTA ledger — outbound (detect upgrades) ────────────────
THIS_PKG="$THIS_PROJECT/package.json"
if [ -f "$THIS_PKG" ]; then
  BROADCAST=$(node -e "
    const fs = require('fs');
    const path = require('path');

    const stateFile = '$STATE_FILE';
    const pkgFile = '$THIS_PKG';
    const ledgerFile = '$LEDGER_FILE';
    const project = '$THIS_NAME';
    const tracked = '$DEPS_TO_TRACK'.split(' ');

    const pkg = require(pkgFile);
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const current = {};
    tracked.forEach(k => { if (deps[k]) current[k] = deps[k]; });

    // Read or init state
    let state = {};
    try { state = JSON.parse(fs.readFileSync(stateFile, 'utf-8')); } catch {}

    if (!state.deps) {
      // First run: snapshot current state, no broadcast
      state.deps = current;
      fs.writeFileSync(stateFile, JSON.stringify(state));
      process.exit(0);
    }

    const cleanVer = v => v.replace(/^[^0-9]*/, '');
    const mm = v => { const p = cleanVer(v).split('.'); return [parseInt(p[0]||0), parseInt(p[1]||0)]; };

    const upgrades = [];
    for (const dep of tracked) {
      const oldV = state.deps[dep];
      const newV = current[dep];
      if (!oldV || !newV) continue;
      const [oM, om] = mm(oldV);
      const [nM, nm] = mm(newV);
      if (nM > oM || (nM === oM && nm > om)) {
        upgrades.push({
          timestamp: new Date().toISOString(),
          project,
          type: 'dep-upgrade',
          detail: dep + ' ' + cleanVer(oldV) + ' -> ' + cleanVer(newV),
          action: 'npm install ' + dep + '@' + newV
        });
      }
    }

    if (upgrades.length > 0) {
      // Update state
      state.deps = current;
      fs.writeFileSync(stateFile, JSON.stringify(state));

      // Write to ledger
      let ledger = [];
      try { ledger = JSON.parse(fs.readFileSync(ledgerFile, 'utf-8')); } catch {}
      ledger.push(...upgrades);
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
      ledger = ledger.filter(e => new Date(e.timestamp).getTime() > cutoff);
      fs.mkdirSync(path.dirname(ledgerFile), { recursive: true });
      fs.writeFileSync(ledgerFile, JSON.stringify(ledger, null, 2) + '\n');

      process.stdout.write(upgrades.map(u => u.detail).join(', '));
    }
  " 2>/dev/null)

  [ -n "$BROADCAST" ] && add_report "[broadcast] Logged to SOTA ledger: $BROADCAST"
fi

# ── Phase 5: SOTA ledger — inbound (suggest upgrades) ────────────────
if [ -f "$LEDGER_FILE" ] && [ -f "$THIS_PKG" ]; then
  SUGGESTIONS=$(node -e "
    const fs = require('fs');
    const ledger = JSON.parse(fs.readFileSync('$LEDGER_FILE', 'utf-8'));
    const cutoff = Date.now() - $LEDGER_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
    const project = '$THIS_NAME';
    const pkg = require('$THIS_PKG');
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const cleanVer = v => v.replace(/^[^0-9]*/, '');
    const mm = v => { const p = cleanVer(v).split('.'); return [parseInt(p[0]||0), parseInt(p[1]||0)]; };

    const recent = ledger.filter(e =>
      new Date(e.timestamp).getTime() > cutoff &&
      e.project !== project &&
      e.type === 'dep-upgrade'
    );

    const seen = new Set();
    for (const e of recent) {
      const depName = e.detail.split(' ')[0];
      if (seen.has(depName)) continue;
      const ourVer = deps[depName];
      if (!ourVer) continue;

      const theirVer = e.detail.split(' -> ')[1];
      if (!theirVer) continue;

      const [oM, om] = mm(ourVer);
      const [nM, nm] = mm(theirVer);
      if (nM > oM || (nM === oM && nm > om)) {
        seen.add(depName);
        process.stdout.write(depName + ': ' + cleanVer(ourVer) + ' -> ' + theirVer + ' (from ' + e.project + ') | ' + (e.action || '') + '\n');
      }
    }
  " 2>/dev/null)

  if [ -n "$SUGGESTIONS" ]; then
    while IFS= read -r line; do
      add_report "[upgrade] $line"
    done <<< "$SUGGESTIONS"
  fi
fi

# ── Phase 6: Ripple ledger — inbound (improvements from siblings) ────
RIPPLE_FILE="$HOME/Development/patterns/kb/ripple-ledger.jsonl"
if [ -f "$RIPPLE_FILE" ] && [ -s "$RIPPLE_FILE" ]; then
  RIPPLE=$(node -e "
    const fs = require('fs');
    const lines = fs.readFileSync('$RIPPLE_FILE', 'utf-8').trim().split('\n').filter(Boolean);
    const cutoff = Date.now() - $LEDGER_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
    const project = '$THIS_NAME';
    const entries = [];
    for (const line of lines) {
      try {
        const e = JSON.parse(line);
        if (e.project === project) continue;
        const ts = new Date(e.ts || e.timestamp).getTime();
        if (ts < cutoff) continue;
        entries.push(e);
      } catch {}
    }
    entries.sort((a, b) => new Date(b.ts || b.timestamp) - new Date(a.ts || a.timestamp));
    const recent = entries.slice(0, 15);
    for (const e of recent) {
      const tags = (e.tags || []).join(',');
      process.stdout.write('[' + e.project + '|' + tags + '] ' + e.summary + '\n');
    }
  " 2>/dev/null)

  if [ -n "$RIPPLE" ]; then
    add_report ""
    add_report "[ripple] Improvements from sibling projects (review against this project's features):"
    while IFS= read -r line; do
      add_report "  $line"
    done <<< "$RIPPLE"
  fi
fi

# ── Output ────────────────────────────────────────────────────────────
if [ -z "$REPORT" ]; then
  echo '{"continue": true}'
  exit 0
fi

cat << EOF
{
  "continue": true,
  "systemMessage": "SOTA SYNC:$REPORT"
}
EOF
exit 0
