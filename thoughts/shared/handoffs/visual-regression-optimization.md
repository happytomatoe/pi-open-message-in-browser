---
date: 2026-07-07T15:00:00Z
researcher: pi
git_commit: 0e001ee99daaecada74e5844a527e989d249e3bb
branch: feat/migrate-visual-tests-to-playwright
repository: pi-open-message-in-browser
topic: "Visual Regression Test Optimization"
tags: [playwright, visual-regression, performance, bun-binary]
status: complete
last_updated: 2026-07-07
last_updated_by: pi
type: implementation_strategy
---

# Handoff: Visual Regression Optimization & Stabilization

## Task(s)
- Expand visual regression tests to include all Mermaid diagram types: **Completed**.
- Optimize test runtime to reduce overall execution time: **Completed (Phase 1 & 2)**.
- Resolve stability issues (flaky rendering, report paths, Git bloat): **Completed**.
- Implement HTML caching for generation: **Planned/Discussed**.

## Critical References
- `packages/mdopen/tests/visual.spec.ts`: Main visual test suite.
- `packages/mdopen/bin/mdopen`: Compiled high-performance CLI binary.
- `justfile`: Orchestration for building and testing.
- `packages/mdopen/playwright.config.ts`: Configuration for parallel execution and reporting.

## Recent changes
- `packages/mdopen/bin/mdopen`: Created a compiled binary using `bun build --compile` to eliminate Node.js startup overhead.
- `packages/mdopen/tests/visual.spec.ts`: 
    - Updated to use the compiled binary.
    - Added timing logs for profiling.
    - Changed `networkidle` to `domcontentloaded` + `page.waitForSelector('.mermaid svg')` to fix rendering flakiness.
    - Added critical error throwing in `beforeAll` to prevent silent setup failures.
- `packages/mdopen/package.json`: Added `build:bin` and `postinstall` scripts; updated report paths.
- `justfile`: Added `build-bin` and integrated it into `test-visual`.
- `packages/mdopen/playwright.config.ts`: Set `fullyParallel: false` to prevent redundant HTML generation and race conditions in `beforeAll`.
- `.gitignore`: Added `playwright-report/` and `test-results/`.

## Learnings
- **Node.js Startup Overhead**: Profiling with `bun --cpu-prof-md` revealed that ~1.9s of every CLI call was spent on runtime boot and module loading (`require`).
- **Bun Binary**: Compiling the CLI to a single binary reduced the startup cost from ~1.9s to ~400ms.
- **Playwright Parallelism**: `fullyParallel: true` causes `beforeAll` to run once per worker. In this suite, that led to redundant CLI calls (120 instead of 30) and file system collisions.
- **Rendering Sync**: `networkidle` is insufficient for inlined Mermaid JS; explicit waiting for the SVG element is required for stable screenshots.

## Artifacts
- `thoughts/visual-test-optimization-analysis.md`: Initial performance analysis.
- `thoughts/visual-test-final-analysis.md`: Final performance breakdown and findings.
- `packages/mdopen/bin/mdopen`: The optimized binary.

## Action Items & Next Steps
- [ ] **Implement HTML Caching**: Create a caching mechanism (e.g., in `packages/mdopen/tests/visual-cache/`) to skip HTML generation for themes that haven't changed. This is the final high-impact optimization.
- [ ] **Verify across OS**: Confirm that the compiled binary and screenshots are stable across different environments (Linux vs macOS) to avoid baseline drift.

## Other Notes
- The suite currently uses 4 workers. While the machine has 8 CPUs, increasing workers to 8 caused OOM/system instability due to Chromium's memory footprint. Keep at 4 unless caching is implemented first.
