---
name: "system-review"
description: "Analyze implementation against plan for process improvements. Use for meta-level analysis of how well implementation followed the plan, identifying divergence patterns and suggesting process improvements."
---

# System Review

Perform a meta-level analysis of how well the implementation followed the plan and identify process improvements.

## Purpose

**System review is NOT code review.** You're not looking for bugs in the code - you're looking for bugs in the process.

**Your job:**

- Analyze plan adherence and divergence patterns
- Identify which divergences were justified vs problematic
- Surface process improvements that prevent future issues
- Suggest updates to Layer 1 assets (CLAUDE.md, plan templates, commands)

**Philosophy:**

- Good divergence reveals plan limitations → improve planning
- Bad divergence reveals unclear requirements → improve communication
- Repeated issues reveal missing automation → create commands

## Context & Inputs

You will analyze four key artifacts:

**Plan Command:**
Read this to understand the planning process and what instructions guide plan creation.
.claude/commands/plan-feature.md

**Generated Plan:**
Read this to understand what the agent was SUPPOSED to do.
Plan file: $ARGUMENTS

**Execute Command:**
Read this to understand the execution process and what instructions guide implementation.
.claude/commands/execute.md

**Execution Report:**
Read this to understand what the agent ACTUALLY did and why.

## Analysis Workflow

### Step 1: Understand the Planned Approach

Read the generated plan and extract:

- What features were planned?
- What architecture was specified?
- What validation steps were defined?
- What patterns were referenced?

### Step 2: Understand the Actual Implementation

Read the execution report and extract:

- What was implemented?
- What diverged from the plan?
- What challenges were encountered?
- What was skipped and why?

### Step 3: Classify Each Divergence

For each divergence identified in the execution report, classify as:

**Good Divergence ✅** (Justified):

- Plan assumed something that didn't exist in the codebase
- Better pattern discovered during implementation
- Performance optimization needed
- Security issue discovered that required different approach

**Bad Divergence ❌** (Problematic):

- Ignored explicit constraints in plan
- Created new architecture instead of following existing patterns
- Took shortcuts that introduce tech debt
- Misunderstood requirements

### Step 4: Trace Root Causes

For each problematic divergence, identify the root cause:

- Was the plan unclear, where, why?
- Was context missing, where, why?
- Was validation missing, where, why?
- Was manual step repeated, where, why?

### Step 5: Generate Process Improvements

Based on patterns across divergences, suggest:

- **CLAUDE.md updates:** Universal patterns or anti-patterns to document
- **Plan command updates:** Instructions that need clarification or missing steps
- **New commands:** Manual processes that should be automated
- **Validation additions:** Checks that would catch issues earlier
