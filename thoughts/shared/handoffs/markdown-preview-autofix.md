---
date: 2026-07-05T12:00:00Z
researcher: pi-coding-assistant
git_commit: 88788409e6026649d999ef1f0d0a8c344f21fbba
branch: feat/markdown-preview
repository: pi-open-message-in-browser
topic: "Markdown Preview Autofix"
tags: [autofix, mdopen, themes, mermaid, visual-tests]
status: complete
last_updated: 2026-07-05
last_updated_by: pi-coding-assistant
type: implementation_strategy
---

# Handoff: Markdown Preview Autofix Progress

## Task(s)
- **PR Review Autofix**: Processing unresolved feedback from CodeRabbit and cubic for PR #2.
  - **Fixed**:
    - `--theme auto` CSS collision (now defaults to light theme)
    - Visual test PNG comparison (integrated `pngjs` and `pixelmatch`)
    - Frontmatter leak on parse failure (now strips blocks regardless of parse success)
    - Browser spawn error handling (added `error` listener in `browser.ts`)
    - Compiler registry typing (tightened to `Record<CompilerName, Compiler>`)
    - Theme build failure visibility (now exits with error if themes are missing)
  - **Skipped/Resolved as-is**:
    - Mermaid validation crash (decided to let it crash on env failure)
    - Visual test suite issues (leaks, shell injection, concurrency)
    - Hardcoded Brave path in `screenshot-test.sh`
    - Low priority nitpicks and duplicate logic
  - **Remaining/Planned**:
    - Published CLI shebang (Bun -> Node)
    - Root `package.json` license and dependency cleanup
    - Mermaid validator casing and success messages
    - Mermaid validator coverage (missing common types)

## Critical References
- `packages/mdopen/src/assets.ts` - Theme and asset loading logic.
- `packages/mdopen/src/converter.ts` - Markdown to HTML conversion and frontmatter parsing.
- `packages/mdopen/scripts/visual-test.ts` - Visual regression test suite.

## Recent changes
- `packages/mdopen/src/assets.ts`: Updated `getThemeCssPaths` to only return `github.css` for `auto` theme.
- `packages/mdopen/scripts/visual-test.ts`: Added `pngjs` and `pixelmatch` to `pixelDiff` for raw pixel comparison.
- `packages/mdopen/src/converter.ts`: Modified `parseFrontmatter` to strip delimiters even on catch.
- `packages/mdopen/src/browser.ts`: Added `child.on('error', ...)` to `writeAndOpenHtml`.
- `packages/mdopen/src/compilers/index.ts`: Changed `COMPILERS` type and `getCompiler` to throw on missing keys.
- `packages/mdopen/scripts/build-themes.ts`: Added `hadErrors` tracking to `buildThemes` to ensure non-zero exit on missing assets.

## Learnings
- **Visual Regression**: Comparing PNG buffers directly is invalid due to compression; requires decoding to RGBA.
- **Autofix Strategy**: Some "critical" issues (like CLI crashing on missing validator dependencies) are acceptable if they indicate a broken environment.

## Artifacts
- `packages/mdopen/src/assets.ts`
- `packages/mdopen/src/converter.ts`
- `packages/mdopen/src/browser.ts`
- `packages/mdopen/src/compilers/index.ts`
- `packages/mdopen/scripts/build-themes.ts`
- `packages/mdopen/scripts/visual-test.ts`

## Action Items & Next Steps
1. Fix the CLI shebang in `packages/mdopen/bin/mdopen.js` (Bun -> Node).
2. Restore "license": "MIT" in root `package.json`.
3. Clean up root `package.json` dependencies (`js-yaml`, `mdopen`).
4. Address Mermaid validator casing and missing supported types in `packages/mdopen/src/mermaid-validator.ts`.
5. Restore success message for Mermaid validation in `packages/mdopen/src/cli.ts`.

## Other Notes
- Visual tests are currently unstable/timing out in some environments; continue to use `--theme` filter for targeted testing.
