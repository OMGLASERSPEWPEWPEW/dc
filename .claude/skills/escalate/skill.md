---
name: escalate
description: Consult GPT-5.6 Sol, Gemini 3.5 Flash, DeepSeek V4 Pro, and Claude Opus 4.8 in parallel for independent analysis. Modes: diagnosis (stubborn bugs), review (code/approach review), architecture (design decisions), freeform (any question). Use when you've struck out on a fix 3+ times.
---

# Escalate: Multi-Model Panel

Consult four frontier models in parallel for independent analysis. Not just for bugs — use it for code review, architecture decisions, or any question where diverse expert perspectives add value.

<!-- === CONFIGURATION START === -->
## Configuration

| Setting | Value |
|---------|-------|
| **Diagnostic Log Path** | `.diagnostics/console.log` |
| **Diagnose CLI Command** | `npx tsx diagnosis/diagnose.ts` |

<!-- === CONFIGURATION END === -->

## Modes

| Mode | When to use | Input JSON fields |
|------|-------------|-------------------|
| `diagnosis` | Stubborn, recurring bug (3+ failed fixes) | `bugDescription`, `fixAttempts` |
| `review` | Code review, approach validation | `bugDescription` (as context), `question` |
| `architecture` | Design decisions, tradeoff analysis | `bugDescription` (as context), `question` |
| `freeform` | Any question that benefits from multi-model perspective | `question` |

Default mode is `diagnosis` (backward-compatible).

## Phases

### Phase 1: Determine Mode

Read the conversation context to determine which mode fits:

- **User hit strike 3 on a bug?** → `diagnosis`
- **User wants a second opinion on code or an approach?** → `review`
- **User is weighing architectural options?** → `architecture`
- **Anything else (general question, strategy, analysis)?** → `freeform`

### Phase 2: Gather

Collect everything the panel needs:

1. **For diagnosis mode:**
   - Bug description (2-3 sentences from conversation history)
   - Fix attempt history (description, outcome, code diff for each)
   - Diagnostic log (check `.diagnostics/console.log`)
   - 2-5 most relevant source files

2. **For review mode:**
   - What's being reviewed (code, approach, PR)
   - The specific question or concern
   - Relevant source files

3. **For architecture mode:**
   - The design question or decision being made
   - Options being considered
   - Constraints and context
   - Relevant source files and ADRs

4. **For freeform mode:**
   - The question
   - Any relevant context, code, or files
   - What kind of answer would be most useful

### Phase 3: Construct

Write the input to `/tmp/diagnosis-input.json`:

**Diagnosis mode:**
```json
{
  "mode": "diagnosis",
  "bugDescription": "Clear summary of the bug",
  "fixAttempts": [
    { "description": "What was tried", "outcome": "What went wrong", "codeChange": "optional diff" }
  ],
  "additionalContext": "Tech stack, architecture notes"
}
```

**Review mode:**
```json
{
  "mode": "review",
  "question": "Is this approach to X sound? Specific concern about Y.",
  "bugDescription": "Context about the code being reviewed",
  "fixAttempts": [],
  "additionalContext": "Relevant constraints"
}
```

**Architecture mode:**
```json
{
  "mode": "architecture",
  "question": "Should we use approach A or B for X?",
  "bugDescription": "Context about the system and constraints",
  "fixAttempts": [],
  "additionalContext": "ADR references, scaling requirements, etc."
}
```

**Freeform mode:**
```json
{
  "mode": "freeform",
  "question": "The specific question to analyze",
  "bugDescription": "Background context",
  "fixAttempts": [],
  "additionalContext": "Any additional context"
}
```

Use the Write tool to create this file.

### Phase 4: Query

Run the diagnosis CLI (see Configuration for the command):

```bash
<diagnose-command> --input /tmp/diagnosis-input.json \
  --files "path/to/file1.ts,path/to/file2.ts" \
  --log --log-lines 100 \
  --output /tmp/diagnosis-report.json \
  --verbose
```

Adjust `--files` to include the source files identified in Phase 2.

### Phase 5: Evaluate

Read `/tmp/diagnosis-report.json`. For each model that returned a result:

**Diagnosis mode — evaluate:**
1. Root cause — What does this model think is fundamental?
2. Why previous fixes failed — Any new insights?
3. Proposed fix — Concrete and actionable?
4. Confidence level (0.0-1.0)

**Review mode — evaluate:**
1. Assessment — Overall take on the code/approach
2. Strengths identified
3. Concerns — severity, description, suggestions
4. Recommendations — actionable next steps

**Architecture mode — evaluate:**
1. Assessment — Overall architectural take
2. Tradeoffs — pros/cons of each approach
3. Recommendation — which approach and why
4. Risks identified

**Freeform mode — evaluate:**
1. Analysis — depth and quality of reasoning
2. Key points — most important insights
3. Recommendations — actionable next steps

**Across all modes, synthesize:**
- **Consensus** — Where do 2+ models agree?
- **Divergence** — Where do models disagree? Which view has strongest reasoning?
- **Novel insights** — Did any model surface something unexpected?

### Phase 6: Present

Present your synthesized analysis to the user:

```
## Panel Results

**Models consulted:** [list with success/failure status]
**Mode:** [diagnosis|review|architecture|freeform]

### Consensus
[Where 2+ models agree]

### Key Insight
[The most important new understanding from the panel]

### Divergences
[Where models disagree, and which view you find most compelling and why]

### Recommended [Fix Plan | Next Steps | Approach | Action Items]
[Your concrete, step-by-step plan informed by the panel]
1. ...
2. ...
3. ...

### Confidence & Caveats
[Overall confidence level and things to watch for]
```

## Golden Rule

**YOU evaluate the model responses. YOU determine how they guide your next plan. Do NOT present the raw model outputs to the user for evaluation.** The user should see your synthesized analysis and informed plan — not four competing walls of JSON.

## When NOT to Escalate

- The issue is straightforward and you haven't exhausted your own analysis
- It's a simple configuration or typo problem
- You already understand the root cause and just need to decide between approaches (use planning)
- The question doesn't benefit from diverse perspectives

## Requirements

- API keys must be available (env vars or `~/Development/patterns/.env`)
- At least one of: `OPENAI_API_KEY`, `GEMINI_API_KEY`, `DEEPSEEK_API_KEY`, `ANTHROPIC_API_KEY`
- The `tsx` package must be installed
- The `diagnose` CLI must exist in the project (see Configuration)
