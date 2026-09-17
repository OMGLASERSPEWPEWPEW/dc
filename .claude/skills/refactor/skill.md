---
name: refactor
description: Structured refactoring with behavioral preservation. Verifies test coverage first, makes named atomic moves with tests between each, and proves behavior didn't change.
---

# Refactor Agent

You are refactoring existing code. Your job is to improve the structure, readability, or maintainability of code WITHOUT changing its behavior. If a single test needs its assertions changed (not just its setup), you've gone too far — that's a feature change, not a refactor.

**You do NOT add features.** If the refactoring reveals a bug, document it — don't fix it in the same change. If the refactoring suggests a new capability, note it — don't build it.

**You do NOT refactor without a goal.** "Clean it up" is not a goal. "Extract the translation logic from the 400-line hook into a focused utility so it can be tested independently" is a goal.

<!-- === CONFIGURATION START === -->
## Configuration

| Setting | Value |
|---------|-------|
| **Build Command** | `npm run build` |
| **Test Command** | `npm test` |
| **Coverage Command** | `npm run test:coverage` |

<!-- === CONFIGURATION END === -->

---

## Phase 1: Understand

Before changing anything, build a complete picture of what you're refactoring and what depends on it.

### 1.1 Define the Goal

State the refactoring goal in one sentence. It must name:
- **What** is being refactored (specific file, function, module, or pattern)
- **Why** it's a problem now (too long, duplicated, hard to test, tangled responsibilities, unclear interface)
- **What "done" looks like** (shorter functions, single responsibility, testable in isolation, clear API boundary)

Bad goals:
- "Clean up the messaging code"
- "Make it more maintainable"
- "Reduce complexity"

Good goals:
- "Extract the 5 translation-related functions from `useMessages.ts` (380 lines) into a dedicated `useTranslation.ts` hook so they can be unit-tested without mocking the full message state"
- "Replace the 4 duplicated retry-with-backoff implementations in the Edge Functions with a single shared `withRetry()` utility in `_shared/retry.ts`"
- "Rename `handleStuff()` in `MessageBubble.tsx` to `handleCardTap()` and update all 3 callers"

### 1.2 Map the Blast Radius

Before touching code, map everything that could break:

1. **Direct callers** — grep for the function/component/module name across the project
2. **Indirect dependents** — what imports the file you're changing? What imports THOSE files?
3. **Tests** — which test files cover this code? (grep for the function name in test files)
4. **Dynamic references** — is this function name used in strings, configs, event handlers, or routing tables? (these won't show up in import analysis)
5. **Re-exports** — is this exported from an index file or barrel that other modules import from?

Write down the blast radius as a file list. Every file in this list needs to be checked after the refactor.

### 1.3 Verify Test Coverage

**You cannot safely refactor code that has no tests.** Tests are the proof that behavior didn't change.

Run coverage for the target area:
```bash
npm run test:coverage -- --reporter=text <target-files>
```

| Coverage | Action |
|----------|--------|
| **Good coverage** (>70% of target functions) | Proceed to Phase 2 |
| **Partial coverage** (30-70%) | Proceed with caution. Note uncovered paths — these are where silent breakage hides. Consider writing tests first. |
| **No coverage** (<30%) | STOP. Tell the user this area needs tests before refactoring. Suggest `/create-tests` first. Refactoring untested code is guessing. |

If the user insists on refactoring untested code, proceed but flag every change as high-risk in your summary.

### 1.4 Snapshot Current Behavior

Before any changes, record what the existing tests assert. This is your behavioral contract:

1. Run the test suite for the target area and save the pass/fail state
2. Note any test that asserts specific return values, side effects, or UI output — these are the behaviors you must preserve
3. If there are integration or E2E tests that cover this code path, note those too

---

## Phase 2: Plan the Moves

Refactoring is a sequence of named, atomic moves — not a freeform rewrite. Each move has a name from the standard catalog, and each is small enough to verify independently.

### Named Refactoring Moves

Use these standard moves. Each one is small, reversible, and verifiable:

| Move | What it does | Risk level |
|------|-------------|------------|
| **Rename** | Change a function/variable/file name + update all callers | Low (grep catches misses) |
| **Extract Function** | Pull a block of code into a named function | Low (behavior preserved by definition) |
| **Extract Module/File** | Move functions/types to a new file + re-export from original | Medium (import paths change) |
| **Inline Function** | Replace a function call with its body | Low (simplification) |
| **Move Function** | Relocate a function to a more appropriate module | Medium (import paths change) |
| **Replace Duplication** | Replace N copies of the same logic with one shared function | Medium (copies may have subtle differences) |
| **Simplify Conditional** | Flatten nested if/else, extract guard clauses | Low-Medium |
| **Change Signature** | Add/remove/reorder parameters | High (all callers must update) |
| **Extract Type/Interface** | Pull inline types into named interfaces | Low |
| **Decompose Component** | Split a large component into smaller ones | Medium-High (state/props threading) |

### Write the Move List

Plan the specific sequence of moves needed to reach your goal. Order matters — some moves enable others.

Example:
```
1. Extract Function: pull translateAndInsert() out of sendMessage() in useMessages.ts
2. Extract Module: move translateAndInsert() + 4 related functions to new useTranslation.ts
3. Rename: translateAndInsert → translateMessage (clearer name now that it's standalone)
4. Update callers: useMessages.ts imports from useTranslation.ts
5. Verify: all tests pass, no import changes in other files
```

### Moves to AVOID

- **Rewrite from scratch** — never. Refactoring preserves behavior incrementally. A rewrite is a new implementation with new bugs.
- **"While I'm here" changes** — don't fix unrelated issues. Don't update formatting. Don't modernize syntax. One goal per refactoring session.
- **Premature abstraction** — don't extract a shared utility unless it has 3+ callers TODAY (not "might be useful later")
- **Interface change without callers** — don't make a signature "cleaner" if there's only one caller and it works fine

---

## Phase 3: Execute

Work through the move list one move at a time. Verify after each.

### The Atomic Move Cycle

```
1. Make ONE move (rename, extract, move, etc.)
2. Run the build → fix any compile errors
3. Run the tests → all must pass with UNCHANGED assertions
4. If tests fail:
   a. Did you break behavior? → REVERT the move. Rethink.
   b. Did a test break because of a renamed import? → Fix the import (that's expected)
   c. Did a test's ASSERTION change? → STOP. That's a behavioral change, not a refactor.
5. Commit (or note the move as complete) before starting the next one
```

### Rules During Execution

**One move at a time.** Do not batch moves. If move #3 breaks something, you need to know it was move #3 — not "somewhere in moves 1-5."

**No test assertion changes.** You may update:
- Import paths (because you moved/renamed a file)
- Setup code (because a function now lives in a different module)
- Test file locations (if you're moving test files to match source moves)

You may NOT update:
- Expected return values
- Expected side effects
- Expected UI output
- Expected error messages

If a test assertion needs to change, you're changing behavior. Stop and reconsider.

**No new functionality.** If you discover a bug while refactoring, write it down and keep going. If you see an opportunity for a new feature, note it. The refactoring change should be reviewable as "provably no behavior change."

**Preserve all exports.** If a module currently exports a function and other files import it, the function must remain importable after refactoring — either from the same path (re-export) or with all callers updated to the new path.

---

## Phase 4: Verify

After all moves are complete, verify the full picture.

### 4.1 Build Gate

```bash
npm run build  # Must exit 0
```

### 4.2 Test Gate

Run the FULL test suite — not just the area you changed. Refactoring can have distant effects.

```bash
npm test  # Must exit 0
```

Compare against your Phase 1.4 snapshot:
- Same tests pass? Good.
- A previously passing test now fails? You broke behavior. Fix or revert.
- A new test fails that wasn't in your snapshot? Investigate — it may be a pre-existing flake, or your refactoring exposed a real issue.

### 4.3 Coverage Check

Run coverage again. Compare to Phase 1.3 baseline.

- **Coverage went up**: Good — your refactoring probably made code more testable
- **Coverage stayed the same**: Expected — you didn't change behavior
- **Coverage went down**: Red flag. Did you delete code that was covered? Did you add new code paths that aren't tested? Investigate.

### 4.4 Blast Radius Audit

Go back to your Phase 1.2 blast radius file list. For every file:

- [ ] Still imports from the right paths
- [ ] Still calls the right function names
- [ ] No broken references

### 4.5 Diff Review

Review your own diff as if you were a code reviewer. Check for:

- **Accidental behavioral changes** — any logic that's different, not just moved
- **Lost code** — anything deleted that shouldn't have been (check for dynamic references)
- **Leftover artifacts** — old imports, unused variables, stale comments referencing the old structure
- **Consistent style** — does the refactored code match the surrounding style?

---

## Completion Criteria

You may only declare the refactor complete when ALL of these are true:

- [ ] Goal is achieved (stated in Phase 1.1, verified now)
- [ ] Build passes
- [ ] ALL tests pass with no assertion changes
- [ ] Coverage did not decrease
- [ ] Every file in the blast radius has been verified
- [ ] No behavioral changes (diff review confirms)
- [ ] No stubs, TODOs, or placeholder code
- [ ] No unrelated changes mixed in

### Final Summary

End your response with:

```
## Refactoring Summary

**Goal:** [the one-sentence goal from Phase 1.1]
**Moves completed:** [count]
**Files modified:** [list with paths]
**Files created:** [list, or "None"]
**Files deleted:** [list, or "None"]
**Tests:** [X] passing (same as before / +N new)
**Coverage:** [before]% → [after]%
**Behavioral changes:** None (or list deviations)
**Bugs discovered (not fixed):** [list, or "None"]
**Follow-up suggestions:** [list, or "None"]
```

---

## Failure Modes to Avoid

| Failure Mode | How It Happens | Prevention |
|-------------|----------------|------------|
| **Silent behavioral change** | "Simplified" a conditional but changed edge case behavior | No test assertion changes allowed. Tests are the behavioral contract. |
| **Refactoring untested code** | No tests to catch breakage → shipped broken | Coverage check in Phase 1.3. Won't proceed below 30%. |
| **Too many moves at once** | Changed 15 files, test fails, no idea which move broke it | One move → build → test cycle. Every time. |
| **Missed callers** | Renamed a function, 2 callers still use old name | Blast radius map in Phase 1.2. Project-wide grep. |
| **Mixed concerns** | Refactoring commit also adds a feature and fixes a bug | No new functionality rule. Bugs noted, not fixed. |
| **Premature abstraction** | Extracted "reusable" utility with 1 caller | 3+ callers rule. |
| **Deleted "unused" code** | Code was called dynamically or from tests | Check for string references, config entries, dynamic imports. |
| **Rewrite disguised as refactor** | "Refactored" = deleted and rewrote from scratch | Named moves only. Each move is incremental. |

---

## What This Skill Does NOT Do

- **Add features** — that's `/new-feature` → `/implementation`
- **Write tests from scratch** — that's `/create-tests` (this skill may suggest it as a prerequisite)
- **Fix bugs** — bugs discovered are documented, not fixed
- **Rewrite code** — a rewrite is not a refactor. If the code needs to be replaced entirely, that's a new implementation.
- **Optimize performance** — performance changes are behavioral changes (different timing, different memory). Optimize in a separate pass with benchmarks.
