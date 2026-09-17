---
name: docs-check
description: Pre-push documentation review. Analyzes git changes and suggests which docs need updating before pushing to main.
---

# /docs-check - Documentation Review Before Push

```
    +---------------------------------------------------------+
    |                                                         |
    |   DOCS CHECK - Pre-Push Documentation Review            |
    |                                                         |
    |   git diff -> analyze changes -> suggest doc updates    |
    |                                                         |
    +---------------------------------------------------------+
```

You are running the **Documentation Check** skill. This ensures documentation stays current before pushing to main.

## Documentation Taxonomy

Projects maintain up to five species of documentation. Each serves a distinct purpose:

<!-- === DOC TYPES START === -->

| Type | Location | Purpose | Lifespan |
|------|----------|---------|----------|
| **Main Doc** | `CLAUDE.md` | Build guide, architecture, project structure | Living -- update on structural changes |
| **PRD** | `.claude/docs/prd/` | What to build and why (pre-build spec) | Mostly frozen -- append deviations |
| **ADR** | `docs/adr/` | Record architectural decisions | Frozen -- supersede with new ADR |
| **Feature Doc** | `docs/features/` | Living reference of current behavior | Living -- update when behavior changes |
| **Design Doc** | `docs/design/` | Technical implementation patterns | Living -- update when implementation changes |

<!-- === DOC TYPES END === -->

Not every project uses all five. Skip any that don't exist in your project.

## Execution Flow

### Step 1: Gather Changes

```bash
# What's staged for commit?
git diff --cached --stat

# What's been committed since last push?
git log origin/main..HEAD --oneline 2>/dev/null || git log -10 --oneline

# Full diff of changes (for analysis)
git diff origin/main..HEAD --stat 2>/dev/null || git diff HEAD~5..HEAD --stat

# Also check uncommitted work if nothing is pushed yet
git diff --stat
```

### Step 2: Categorize Changes

Map changed files to the documentation that might need updating:

<!-- === DOC MAPPING START === -->

| Change Type | Files Pattern | Docs to Review |
|-------------|---------------|----------------|
| **New feature module** | New source directory or major file | Feature Doc (create new), Main Doc (structure) |
| **Behavior change** | Modified feature logic in existing module | Feature Doc (update existing) |
| **New architectural pattern** | New shared utility, plugin, data flow | ADR (new?), Design Doc (create/update) |
| **Schema/data model** | Database, schema, type definition files | Design Doc, Main Doc (data model) |
| **API changes** | API files, Edge Functions, endpoints | Main Doc (API section), Design Doc |
| **Build/config changes** | Build config, package.json, tsconfig | Main Doc (development commands) |
| **Infrastructure** | Deploy config, CI/CD, env | Main Doc (infrastructure) |
| **CSS/visual only** | Stylesheets, theme files | Usually none (internal) |
| **Test only** | Test files | None (internal) |
| **Agent/hook/skill** | `.claude/` directory files | Main Doc (agent/skill/hook sections) |

<!-- === DOC MAPPING END === -->

### Step 3: Generate Checklist

Based on the changes, generate a checklist covering all applicable doc types:

```markdown
## Documentation Review Checklist

### Main Doc (CLAUDE.md)
- [ ] Project Structure reflects new/renamed files
- [ ] Architecture sections current
- [ ] Data Model matches current schema and storage
- [ ] Development Commands are current

### Feature Docs (docs/features/)
- [ ] New feature? -> Create feature doc
- [ ] Changed user-facing behavior? -> Update existing feature doc
- [ ] Feature doc exists and is current? -> No action needed

### Design Docs (docs/design/)
- [ ] New technical pattern? -> Create design doc
- [ ] Changed implementation approach? -> Update design doc
- [ ] Design doc exists and is current? -> No action needed

### ADRs (docs/adr/)
- [ ] Significant architectural decision? -> New ADR
- [ ] Changed existing architectural decision? -> New superseding ADR
- [ ] No architectural decisions -> No action needed

### PRDs (.claude/docs/prd/)
- [ ] Deviated from original PRD? -> Append deviation note
- [ ] PRD exists for this feature? -> Verify alignment
- [ ] No PRD needed -> Skip

### No Updates Needed
- [ ] Changes are internal implementation only
- [ ] No public behavior or pattern changes
- [ ] All documentation is current
```

### Step 4: Provide Specific Recommendations

For each area that needs updates, provide specific guidance:

**Example output:**

```
## /docs-check Results

### Changes Detected
- New module: src/processing/
- Modified: src/schema.ts (added imageField)
- New pattern: progressive rendering via callback

### Documentation Updates Needed

1. **Feature Doc -- docs/features/processing.md**
   Create new feature doc covering:
   - What the processing pipeline does
   - User interaction and triggers
   - Integration with existing features

2. **Design Doc -- docs/design/progressive-rendering.md**
   Create new design doc:
   - Callback pattern for streaming results
   - Where it's used and why

3. **Main Doc -- CLAUDE.md**
   - Add processing/ to Project Structure
   - Update Data Model with imageField

4. **ADR Consideration**
   Progressive rendering is significant enough for a new ADR.

5. **PRD Check**
   - processing.md PRD exists -- no deviations noted

### Ready to Push?
- [ ] Review and apply updates above
- [ ] Run tests
- [ ] Commit documentation changes
- [ ] Push to main
```

## When to Run

Invoke `/docs-check` when:
- Before pushing to main
- After completing a significant piece of work
- When you're unsure if docs need updating
- As part of your pre-push checklist

## Quick Reference

Documentation locations (customize per project):

| Type | Default Location |
|------|-----------------|
| Main Doc | `CLAUDE.md` |
| PRDs | `.claude/docs/prd/` |
| ADRs | `docs/adr/` |
| Feature Docs | `docs/features/` |
| Design Docs | `docs/design/` |

---

*"Code tells you how, documentation tells you why. Keep them in sync."*
