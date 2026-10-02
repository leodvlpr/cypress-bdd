# Step 7 — Claude Code as Automated PR Reviewer

## Objective

Two automated review moments, both via `anthropics/claude-code-action@v1`:

1. On every PR opened/updated against main — a real code review grounded in
   this repo's documented conventions.
2. On every PR merged into main — a short wrap-up comment confirming the merge
   didn't introduce drift from those conventions.

## Build

Create `.github/workflows/pr-review.yml`:

\`\`\`yaml
name: Claude Code PR Review

on:
pull_request:
branches: [main]
types: [opened, synchronize, reopened, closed]

jobs:
review:
if: github.event.action != 'closed'
runs-on: ubuntu-latest
permissions:
contents: read
pull-requests: write
steps: - uses: actions/checkout@v4
with:
fetch-depth: 0 - name: Claude Code — review this PR
uses: anthropics/claude-code-action@v1
with:
anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
prompt: |
Review the changes in this pull request against this repository's
documented architecture conventions in docs/testing-architecture.md,
specifically: - Component-based architecture, NOT Page Object Model: flag any new
file that mirrors a full page/screen rather than a reusable UI
piece. - All element lookups must go through the centralized
