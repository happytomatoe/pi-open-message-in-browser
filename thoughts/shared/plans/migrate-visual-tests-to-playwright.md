# Migrate Visual Regression Tests to Playwright Implementation Plan

## Overview

Migrate the visual regression testing infrastructure from a manual Puppeteer + `pixelmatch` implementation to the Playwright Test Runner. This will replace the flaky, manual pixel-comparison logic with Playwright's built-in `toHaveScreenshot()` functionality, which provides superior handling of anti-aliasing, font rendering, and baseline management.

## Current State Analysis

The current implementation in `packages/mdopen/scripts/visual-test.ts` and `packages/mdopen/scripts/mermaid-visual-test.ts` uses:
- **Runtime**: Puppeteer-core.
- **Comparison**: `pngjs` for decoding and `pixelmatch` for raw byte comparison.
- **Flakiness**: High. Minor dimension changes (1-2px) and sub-pixel rendering differences between runs cause false positives.
- **Baseline Management**: Manual file writing to `__snapshots__`.

## Desired End State

A stable, maintainable visual regression suite using `@playwright/test` that:
1. Uses `expect(page).toHaveScreenshot()` for all comparisons.
2. Correctly handles anti-aliasing and font rendering.
3. Maintains the current support for 30 themes and 27 Mermaid diagram types.
4. Provides a seamless way to update baselines via the CLI.
5. Integrates into the existing `bun run test` workflow.

### Key Discoveries:
- Playwright's `toHaveScreenshot()` is the industry standard for visual tests and is used by the Mermaid.js project itself.
- Moving to the Playwright Test Runner allows for better parallelization and built-in reporter support.
- The existing Brave binary can still be used as the `executablePath` in Playwright.

## What We're NOT Doing

- Implementing a cloud-based visual testing service (e.g., Chromatic or Percy).
- Changing the actual rendering logic of `mdopen`.
- Adding new themes or new Mermaid diagram types.

## Implementation Approach

We will move away from standalone scripts and implement the tests as Playwright specs. This allows us to use the `@playwright/test` assertions. To maintain backward compatibility with the current CLI, we will provide a small Bun wrapper script.

---

## Phase 1: Environment & Configuration

### Overview
Setup Playwright and configure it to use the project's specific browser and snapshot directory.

### Changes Required:

#### 1. Dependencies
**File**: `packages/mdopen/package.json`
**Changes**: 
- Add `@playwright/test` to `devDependencies`.
- Remove `puppeteer-core`, `pngjs`, and `pixelmatch` once migration is complete.

#### 2. Playwright Config
**File**: `packages/mdopen/playwright.config.ts` (New File)
**Changes**: Create a configuration file that:
- Sets the browser to `chromium`.
- Configures `use.executablePath` to `/var/home/l/bin/brave`.
- Sets `snapshotDir` to point to `__snapshots__`.
- Configures `expect.toHaveScreenshot` threshold and anti-aliasing settings.

### Success Criteria:

#### Automated Verification:
- [ ] `bun install` completes without errors.
- [ ] Playwright config is valid and can be loaded by the test runner.

#### Manual Verification:
- [ ] Verify that the Brave browser launches correctly via a simple Playwright smoke test.

---

## Phase 2: Test Migration

### Overview
Convert the logic from standalone scripts into Playwright test specs.

### Changes Required:

#### 1. Main Visual Test Spec
**File**: `packages/mdopen/tests/visual.spec.ts` (New File)
**Changes**:
- Implement a parameterized test using `THEMES` array.
- Use `execSync` to call the `mdopen` CLI and generate HTML files in `/tmp`.
- Use `await expect(page).toHaveScreenshot(\`\${theme}.png\`)`.

#### 2. Mermaid Comprehensive Test Spec
**File**: `packages/mdopen/tests/mermaid.spec.ts` (New File)
**Changes**:
- Implement the comprehensive Mermaid diagram test suite.
- Use `await expect(page).toHaveScreenshot('mermaid-all-github.png')`.

### Success Criteria:

#### Automated Verification:
- [ ] `npx playwright test` runs without syntax errors.
- [ ] HTML files are generated correctly for each theme in `/tmp`.

#### Manual Verification:
- [ ] Check that screenshots are actually being captured in the `__screenshots__` folder.

---

## Phase 3: Baseline Generation & Stability

### Overview
Generate fresh, Playwright-native baselines and verify they are stable.

### Changes Required:

#### 1. Baseline Update
**Action**: Run `npx playwright test --update-snapshots`.
**Verification**: Ensure all 30 theme snapshots and the comprehensive Mermaid snapshot are created.

#### 2. Stability Check
**Action**: Run `npx playwright test` (without update) twice in a row.
**Verification**: Ensure 0 failures on the second run, confirming that anti-aliasing and font rendering are handled correctly.

### Success Criteria:

#### Automated Verification:
- [ ] `npx playwright test` returns 0 failures.

#### Manual Verification:
- [ ] Review a few baseline images to ensure they look correct and are not corrupted.

---

## Phase 4: Integration & Cleanup

### Overview
Integrate the new test suite into the existing project workflow and remove obsolete code.

### Changes Required:

#### 1. Bun Wrapper Script
**File**: `packages/mdopen/scripts/visual-test.ts` (Modified)
**Changes**: Rewrite this script to be a simple wrapper that calls `npx playwright test` with the appropriate flags (e.g., `--update-snapshots` if `--update` is passed).

#### 2. Dependency Cleanup
**File**: `packages/mdopen/package.json`
**Changes**: Remove `puppeteer-core`, `pngjs`, and `pixelmatch`.

#### 3. File Cleanup
**Action**: Delete `packages/mdopen/scripts/mermaid-visual-test.ts`.

### Success Criteria:

#### Automated Verification:
- [ ] `bun run scripts/visual-test.ts` correctly triggers Playwright tests.
- [ ] `bun run scripts/visual-test.ts --update` correctly updates snapshots.
- [ ] `bun run scripts/visual-test.ts --theme <theme>` correctly filters tests.

#### Manual Verification:
- [ ] Verify that the project is clean and no obsolete Puppeteer code remains.

---

## Testing Strategy

### Unit Tests:
- N/A (This is a visual regression suite).

### Integration Tests:
- Run the full suite across all 30 themes.
- Verify that the Brave browser integration works across different OS environments (if applicable).

### Manual Testing Steps:
1. Run `bun run scripts/visual-test.ts --update`.
2. Run `bun run scripts/visual-test.ts` and verify 0 failures.
3. Intentionally modify a theme CSS file and verify that the test fails.
4. Update baselines and verify it passes again.

## Performance Considerations
- Playwright's parallelization is more efficient than the current manual batching.
- Using the Brave binary is slightly slower than a managed Playwright browser but ensures consistency with the user's environment.

## Migration Notes
- The old `__snapshots__` (Puppeteer PNGs) will be incompatible with Playwright's comparison engine and must be replaced.
- Ensure `/tmp/mdopen-visual-test` has appropriate permissions.

## References
- Playwright Visual Comparison: https://playwright.dev/docs/test-snapshots
- Mermaid.js Visual Testing Patterns (derived from research).
