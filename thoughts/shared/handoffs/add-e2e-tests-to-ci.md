---
date: 2026-07-21T10:00:00+02:00
git_commit: d454f96
branch: feat/mermaid-pan-zoom-controls
repository: pi-open-message-in-browser
topic: "Add E2E Playwright Tests to CI"
tags: [ci, playwright, visual-regression, fedora, e2e-tests]
---

# Handoff: Add E2E Playwright Tests to GitHub Actions CI

## Task(s)
1. **Create CI workflow for e2e tests** — DONE but blocked by a Playwright/Fedora issue
2. **Fix mermaid-gallery.spec.ts race condition** — DONE (switched from `Promise.allSettled` to sequential loop)
3. **Get all tests passing in CI on Fedora** — BLOCKED (see Learnings)

## Critical References
- `.github/workflows/e2e-tests.yml` — the CI workflow (3 parallel jobs: unit-tests, visual-regression, mermaid-gallery)
- `packages/mdopen/playwright.config.ts` — Playwright config (Chromium only, 1280×900 viewport, `workers: 1` in CI)
- `packages/mdopen/tests/mermaid-gallery.spec.ts` — race condition fix applied

## Recent changes
- `.github/workflows/e2e-tests.yml` — NEW: 3 parallel jobs running in `fedora:latest` container with Chromium deps installed via `dnf`
- `packages/mdopen/tests/mermaid-gallery.spec.ts:20-30` — changed `beforeAll` from parallel `Promise.allSettled` to sequential `for` loop (was causing flaky sakura test)
- `packages/mdopen/tests/tsconfig.json` — NEW: tsconfig for test files with `skipLibCheck: true` (uncommitted in commit `d454f96`, not yet pushed — push blocked by pre-push hook)

## Learnings

### Unit tests work fine in CI
`bun test tests/*.test.ts` passes in the Fedora container (1m2s including setup). These use `bun:test`, not Playwright.

### Playwright TypeScript compilation fails in CI with "AggregateError: 3 errors building"
Both `visual.spec.ts` and `mermaid-gallery.spec.ts` fail in the Fedora CI container with:
```
AggregateError: 3 errors building ".../tests/mermaid-gallery.spec.ts"
Error: No tests found.
```
This is Playwright's internal TypeScript/esbuild transform failing to compile the `.spec.ts` files. **Crucially, these same tests pass locally on Fedora.** The error does NOT show the actual 3 TypeScript errors — just the count.

**What works:** `bunx playwright test tests/mermaid-gallery.spec.ts --list` locally lists all 5 tests. `bun run test:visual` locally runs all 34 tests.

**What fails:** Same commands in the Fedora CI container fail at the "building" step before any tests run.

### Potential root cause hypotheses (unverified)
1. **Playwright's TypeScript transform behaves differently in CI's `sh` shell** — CI uses `shell: sh -e {0}` while local uses `bash`. The `bunx` PATH or environment might differ.
2. **Node.js version mismatch** — CI runner has Node 24 (with deprecation warnings for actions using Node 20). Playwright 1.61.1 may have issues with Node 24.
3. **Missing type declarations in CI** — `@playwright/test` types might not resolve correctly in the container environment. The `tests/tsconfig.json` fix hasn't been tested in CI yet (commit exists locally but wasn't pushed due to pre-push hook failure).

### Snapshot differences are expected between environments
Visual regression snapshots captured on one distro will differ slightly from another (font metrics, subpixel rendering). The current snapshots were likely generated on Ubuntu. Running on Fedora causes 1-10px height differences in some themes. This is a separate issue from the CI failure.

### Fedora CI requires manual Chromium dependency installation
Playwright's `--with-deps` flag only works on Ubuntu/Debian (calls `apt-get`). On Fedora, dependencies must be installed via `dnf` before `bunx playwright install chromium` (without `--with-deps`). The workflow already does this.

## Artifacts
- `.github/workflows/e2e-tests.yml` — CI workflow (committed)
- `packages/mdopen/tests/mermaid-gallery.spec.ts` — race condition fix (committed)
- `packages/mdopen/tests/tsconfig.json` — TypeScript fix attempt (committed locally, NOT pushed)
- `packages/mdopen/playwright.config.ts` — existing config (unchanged)

## Action Items & Next Steps

1. **Push the tsconfig fix** — commit `d454f96` is 1 ahead of origin but couldn't push because pre-push hook ran tests (3 visual regression snapshots differ locally). Options:
   - `git push --no-verify` to skip the hook and test in CI
   - Or fix the hook issue first

2. **Diagnose the "3 errors building" Playwright error in CI** — Most promising approach:
   - Add `DEBUG=pw:*` environment variable to the CI workflow to get verbose Playwright output
   - Try running `bunx playwright test --list` as a separate CI step to see if the error occurs at list-time or run-time
   - Check if Playwright version matters — try pinning `@playwright/test` to a specific version in the workflow

3. **If Playwright in Fedora CI is a dead end** — consider falling back to `ubuntu-latest` container and accepting that visual regression snapshots need to be Ubuntu-based (or increasing `maxDiffPixelRatio` tolerance)

4. **Snapshot management** — Once CI tests pass, decide whether to:
   - Regenerate snapshots on Fedora and commit them (CI will match local)
   - Or keep Ubuntu snapshots and increase tolerance for cross-distro differences

## Other Notes
- The CI workflow runs 3 parallel jobs. The longest bottleneck is the Playwright browser download (~30s) + test execution (~25s local). With Fedora deps install, total is ~1m per job.
- Local test times: unit 0.2s, visual regression 25s, mermaid gallery 26s (with 4 workers for visual, 1 for gallery)
- The `bun run test:visual` script in `packages/mdopen/package.json:20` calls `bun run build:bin && playwright test tests/visual.spec.ts` — this builds the binary AND runs tests, which is redundant in CI since we already have a separate build step
- Pre-push hook runs `bun run test:visual` which takes ~25s and blocks pushes when snapshots differ
