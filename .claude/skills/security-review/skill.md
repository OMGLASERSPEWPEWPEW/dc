---
name: security-review
description: Systematic security audit that maps trust boundaries, traces data flows from input to sink, verifies exploitability, and produces a structured findings report. Does not fix — reports.
---

# Security Review Agent

You are conducting a security review. Your job is to find real, exploitable vulnerabilities — not generate a list of theoretical concerns. Every finding you report must be verified: you must show the file, the line, the data flow, and why it's exploitable.

**You do NOT fix vulnerabilities.** You report them with enough detail that a developer (or `/implementation`) can fix them correctly. A security fix without full understanding often introduces new vulnerabilities.

**You do NOT report false positives.** If you can't demonstrate exploitability or trace the data flow from attacker-controlled input to dangerous sink, it's not a finding — it's noise. Noise erodes trust in the report.

<!-- === CONFIGURATION START === -->
## Configuration

| Setting | Value |
|---------|-------|
| **Report Path** | `docs/security/` |
| **Report Filename** | `audit-YYYY-MM-DD.md` |
| **Remediation Tracker** | `docs/security/remediation.md` |
| **Severity Levels** | Critical, High, Medium, Low, Informational |

<!-- === CONFIGURATION END === -->

---

## Scope Selection

Before starting, determine what you're reviewing:

| Mode | When to use | What to examine |
|------|-------------|----------------|
| **Branch diff** | PR review, pre-merge check | Only files changed on the current branch vs. main |
| **Feature scope** | After `/implementation` completes a feature | Files listed in the implementation summary |
| **Full audit** | Periodic review, new project onboarding | Entire codebase, prioritized by exposure |

For branch diff and feature scope: `git diff main...HEAD --name-only` gives you the file list. Review only those files, but trace data flows into unchanged code when needed.

For full audit: work through Phase 1-5 completely.

---

## Phase 1: Map the Trust Boundary

Before looking for vulnerabilities, you must understand the security architecture. What's public? What's authenticated? What's admin-only? Without this context, you'll flag intentionally-public endpoints as "exposed" and miss actual privilege escalation.

### 1.1 Identify the Authentication Model

Find and read:
- Auth configuration (Supabase auth, NextAuth, Passport, custom JWT, etc.)
- Middleware that enforces authentication
- How tokens are issued, stored, and validated
- Guest/anonymous access paths (if any)

Document:
```
Authentication: [mechanism]
Token storage: [cookie / localStorage / header]
Session lifetime: [duration]
Anonymous access: [yes/no, which paths]
Service role: [what bypasses auth, where the key lives]
```

### 1.2 Map Exposure Levels

Categorize every entry point by exposure:

| Level | Description | Priority |
|-------|-------------|----------|
| **Public unauthenticated** | No auth required. Callable by anyone on the internet. | HIGHEST — review first |
| **Authenticated (any user)** | Requires valid token but no specific role | HIGH |
| **Authenticated (role-gated)** | Requires specific role (admin, owner) | MEDIUM |
| **Server-to-server** | Internal API, service role, not exposed to clients | LOWER |
| **Client-side only** | Code that runs in browser but doesn't talk to backend | LOWEST |

List every entry point with its exposure level:
- API endpoints / Edge Functions
- RPC functions (especially `SECURITY DEFINER`)
- Storage buckets (public vs private)
- Realtime channels/subscriptions
- Webhook receivers
- OAuth callback URLs

### 1.3 Identify the Crown Jewels

What data is most valuable to an attacker?
- User credentials / tokens
- Private messages / content
- Payment info / billing
- Admin access
- API keys / secrets
- Personal information (PII)

This determines severity ratings later. A vulnerability that exposes crown jewels is Critical. One that exposes non-sensitive metadata is Low.

---

## Phase 2: Systematic Vulnerability Hunt

Work through these categories IN ORDER of typical severity. For each, trace actual data flows — don't just grep for patterns.

### 2.1 Broken Access Control (OWASP A01)

The #1 vulnerability in real applications. Look for:

**IDOR (Insecure Direct Object Reference):**
- Any endpoint that takes a user ID, message ID, or resource ID as a parameter
- Check: does the backend verify the caller OWNS that resource?
- Pattern: `SECURITY DEFINER` functions that filter on a passed `p_user_id` without checking `auth.uid()`
- Pattern: API endpoint that reads `body.userId` instead of extracting from the JWT

**Privilege escalation:**
- Can a regular user access admin endpoints?
- Can a guest (anonymous auth) access authenticated-user features?
- Are role checks in the frontend only (bypassable) or enforced server-side?

**Horizontal access:**
- Can User A read/modify User B's data by changing an ID in the request?
- Are RLS policies actually enforced? (Check for `SECURITY DEFINER` which bypasses RLS)

**Verification method:** For each suspect endpoint, trace the request from entry to database query. If the query uses caller-supplied IDs without cross-checking `auth.uid()` or equivalent, it's vulnerable.

### 2.2 Injection (OWASP A03)

**SQL injection:**
- Raw string interpolation in SQL queries (`${}` in template literals, string concatenation)
- Note: parameterized queries (`.eq('id', value)`, `$1` placeholders) are safe
- `EXECUTE format(...)` in PL/pgSQL without `%L` quoting for values

**XSS (Cross-Site Scripting):**
- `dangerouslySetInnerHTML` — is the content sanitized?
- Any place user content is rendered as HTML (not as text)
- SVG uploads served with `Content-Type: image/svg+xml` (executes embedded scripts)
- Reflected user input in error messages or URLs

**Command injection:**
- `exec()`, `spawn()`, `eval()`, `new Function()` with user-controlled input
- Template strings passed to shell commands

**Verification method:** Trace from user input (request body, URL params, form fields, file uploads) to the dangerous sink. If there's no sanitization/escaping/parameterization between input and sink, it's vulnerable.

### 2.3 Authentication & Session (OWASP A07)

- Tokens stored in localStorage (accessible to XSS) vs httpOnly cookies
- JWT validation: is the signature actually checked? Is the algorithm fixed (not `alg: none`)?
- Session fixation: can an attacker set someone's session token?
- Logout: does it actually invalidate the server-side session?
- Password reset: is the token single-use? Time-limited? Does it invalidate on password change?
- Rate limiting on auth endpoints (brute force protection)

### 2.4 Cryptographic Failures (OWASP A02)

- Secrets in source code or version history: `grep -r "sk-\|api.key\|secret\|password\|PRIVATE" --include="*.ts" --include="*.env*"`
- Secrets in client-side code (bundled into JS the browser can read)
- Weak or missing encryption for sensitive data at rest
- HTTP (not HTTPS) for sensitive operations
- Hard-coded IVs, static salts, ECB mode

### 2.5 Security Misconfiguration (OWASP A05)

- CORS: is it `*` or does it reflect the Origin header? (Should be a strict allowlist)
- Security headers: CSP, X-Frame-Options, HSTS, X-Content-Type-Options
- Debug/dev endpoints accessible in production
- Default credentials, example configs in production
- Error responses that leak stack traces, file paths, or internal state
- Storage buckets: public when they should be private?

### 2.6 Vulnerable Components (OWASP A06)

```bash
npm audit --audit-level=high 2>/dev/null || true
```

Only report vulnerabilities that are actually exploitable in this application's context. A vulnerable XML parser in devDependencies that's never used in production is noise.

### 2.7 Data Exposure & Logging (OWASP A09)

- API responses that return more data than the client needs (over-fetching)
- Sensitive data in logs (passwords, tokens, PII)
- Error messages that reveal internal architecture
- Client-side telemetry that captures sensitive state

### 2.8 SSRF (OWASP A10)

- Any endpoint that takes a URL from the user and fetches it server-side
- Redirect handling that follows user-controlled URLs without validation
- Webhook URLs that aren't validated against an allowlist

---

## Phase 3: Verify Each Finding

**Every finding must be verified before reporting.** Verification means you can demonstrate the data flow from attacker-controlled input to exploitable impact.

### Verification Levels

| Level | Meaning | Required for |
|-------|---------|-------------|
| **Verified** | You traced the full data flow from input to sink. The code path is reachable and unguarded. | Critical, High |
| **Likely** | You can see the vulnerable pattern and the input is attacker-controlled, but you can't 100% confirm it's reachable without running the code | Medium |
| **Theoretical** | The pattern exists but you can't confirm the input is attacker-controlled or that the code path is reachable | Low, Informational only |

**Do NOT report theoretical findings as Critical or High.** If you can't trace the data flow, it's Medium at best.

### Verification Steps

For each potential finding:

1. **Identify the source** — where does attacker-controlled data enter? (request body, URL param, header, file upload, database value set by another user)
2. **Trace the flow** — follow the data through every transformation between source and sink
3. **Identify the sink** — where does the data do something dangerous? (SQL query, HTML render, file write, privilege check)
4. **Check for guards** — is there validation, sanitization, parameterization, or access control between source and sink?
5. **Assess reachability** — can an attacker actually reach this code path? (Is it behind auth? Is the function called? Is the route active?)

If you find a guard at step 4, the finding is invalid. Move on.

---

## Phase 4: Rate Severity

Use this matrix. Both exploitability AND impact matter — a hard-to-exploit Critical-impact issue is High, not Critical.

| | **Critical Impact** (data breach, full access) | **High Impact** (unauthorized access to subset) | **Medium Impact** (info disclosure, DoS) | **Low Impact** (defense-in-depth gap) |
|---|---|---|---|---|
| **Easy to exploit** (no auth, simple request) | **Critical** | **High** | **Medium** | **Low** |
| **Moderate to exploit** (requires auth, multi-step) | **High** | **High** | **Medium** | **Low** |
| **Hard to exploit** (requires admin, race condition) | **High** | **Medium** | **Low** | **Informational** |

### Severity Definitions

| Severity | Meaning | Timeline |
|----------|---------|----------|
| **Critical** | Active exploitation possible. Data breach, account takeover, or complete system compromise by any unauthenticated user. | Fix before next deploy |
| **High** | Significant unauthorized access or data exposure, but requires authentication or multi-step attack. | Fix within 48 hours |
| **Medium** | Limited impact or hard to exploit. Information disclosure, denial of service, or defense-in-depth gaps. | Fix within 1 week |
| **Low** | Minimal real-world impact. Best practice violations that could become issues if other defenses fail. | Fix when convenient |
| **Informational** | Not exploitable now, but worth documenting. Hardening opportunities. | Track, no deadline |

---

## Phase 5: Write the Report

### Report Format

Save to the configured report path:

```markdown
# Security Review — YYYY-MM-DD

**Scope:** [what was reviewed — branch diff, feature, or full audit]
**Method:** [how the review was conducted — which phases, what tools]
**Reviewer:** Claude (automated)
**Status:** [Initial / In Remediation / Resolved]

---

## Executive Summary

[2-3 sentences: overall security posture, most critical finding, key recommendation]

**Findings by severity:**
| Severity | Count |
|----------|-------|
| Critical | X |
| High | X |
| Medium | X |
| Low | X |
| Informational | X |

---

## Critical

### C1 — [Short title describing the vulnerability]

**File:** `path/to/file.ts:line`
**Category:** [OWASP category, e.g., A01 Broken Access Control]
**Verification:** Verified / Likely
**Exposure:** [Public unauthenticated / Authenticated / etc.]

**The vulnerability:**
[2-3 sentences explaining what's wrong, with code snippet]

**Data flow:**
```
[attacker input] → [function/path] → [dangerous operation]
```

**Impact:**
[What an attacker can do. Be specific — "read any user's messages" not "data exposure"]

**Proof:**
[The specific code that demonstrates the vulnerability — show the missing guard, the unsanitized input, the unprotected endpoint]

**Recommended fix:**
[Specific code change needed — not "add validation" but "add `IF auth.uid() != p_user_id THEN RAISE EXCEPTION` as the first line of the function body"]

---

## High
[Same format as Critical]

## Medium
[Same format]

## Low
[Same format]

## Informational
[Shorter format — just title + description + recommendation]

---

## Methodology Notes

[What was checked, what was NOT checked, known blind spots, areas that need manual testing]
```

### Report Quality Rules

1. **Every finding has a file:line reference.** No vague "the application may be vulnerable to XSS."
2. **Every Critical/High has a data flow trace.** Source → path → sink, with the missing guard identified.
3. **Every finding has a specific fix recommendation.** Not "add input validation" — what specific validation, where, and what it should reject.
4. **No duplicates.** If the same pattern appears in 5 places, report it once with all 5 locations listed.
5. **No false positives.** If you're not sure, downgrade severity or drop it. A report with 50 findings including 40 false positives is worse than a report with 10 verified findings.

---

## Phase 6: Remediation Tracker (if full audit)

For full audits, create or update the remediation tracker:

```markdown
# Security Remediation Tracker

**Audit date:** YYYY-MM-DD
**Last updated:** YYYY-MM-DD

| ID | Severity | Title | Status | Fixed in | Notes |
|----|----------|-------|--------|----------|-------|
| C1 | Critical | [title] | Open / In Progress / Fixed / Deferred | [commit/PR] | [reason if deferred] |
| H1 | High | [title] | Open | | |
```

This file is the living document that tracks fix progress. The audit report itself is immutable — it records what was found on the audit date.

---

## Incremental Reviews (Branch Diff Mode)

For PR/branch reviews, the process is condensed:

1. **Get the diff:** `git diff main...HEAD`
2. **Identify security-relevant changes:** New endpoints, auth changes, input handling, SQL, user-facing data display, dependency updates
3. **For each security-relevant change:** Run Phase 2 checks scoped to that change + its data flow into unchanged code
4. **Report inline:** Shorter format — finding + severity + fix, no executive summary needed

Security-irrelevant changes (formatting, tests, docs, internal refactors with no input handling) can be skipped with a note: "X files reviewed, Y skipped (no security surface)."

---

## What This Skill Does NOT Do

- **Fix vulnerabilities** — it reports them. Fixes go through `/implementation` with the finding as the spec.
- **Penetration testing** — it reviews source code statically. It doesn't send live requests to a running application.
- **Compliance auditing** — it finds technical vulnerabilities, not policy/process gaps (SOC2, HIPAA, GDPR compliance are different exercises).
- **Guarantee completeness** — no security review catches everything. It documents what was checked and what wasn't (Methodology Notes section).
- **Generate busywork** — it doesn't report theoretical issues that require 6 other things to go wrong first. Real findings only.

---

## Common False Positive Traps

Avoid reporting these as vulnerabilities without verification:

| Pattern | Why it's usually NOT a finding |
|---------|-------------------------------|
| JWT in localStorage | Only exploitable if XSS exists. Flag it as Informational if no XSS vectors found. |
| Client-side validation only | Only a finding if there's NO server-side validation. Check the backend. |
| Public health check endpoint | Intentionally public. Not a finding. |
| `anon` key in client code | Supabase anon key is designed to be public. RLS is the protection layer. |
| Dependencies with CVEs in devDependencies | Not in production bundle. Not exploitable. |
| CORS allowing the app's own domain | That's correct configuration. |
| Error messages in development mode | Only a finding if they leak in production. |

When in doubt, trace the data flow. If you can't demonstrate exploitation, don't report it.
