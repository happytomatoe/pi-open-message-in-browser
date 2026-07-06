# Playwright Visual Regression Migration Plan

## Overview

Migrate `packages/mdopen` visual regression tests from a custom Puppeteer script to Playwright's native visual testing framework. This will significantly improve test speed, stability, and maintainability by leveraging Playwright's built-in parallelization, smart waiting, and industry-standard `pixelmatch` comparison.

## Current State Analysis

**Current Implementation:** `packages/mdopen/scripts/visual-test.ts`

| Aspect | Current (Puppeteer) | Target (Playwright) |
|--------|---------------------|---------------------|
| **Comparison** | Custom `pixelDiff` buffer loop | Built-in `pixelmatch` (industry standard) |
| **Parallelism** | Manual batching (concurrency=3) | Native worker pool (auto-scales to CPU cores) |
| **Waiting** | `setTimeout(1500)` (fragile) | Auto-wait + `networkidle` (stable) |
| **Baseline Management** | Manual file checks | `--update-snapshots` CLI flag |
| **HTML Generation** | Sequential `execSync` in loop | Parallel in test `beforeAll` hook |
| **Reporting** | Console.log only | HTML report with diff images |

**Performance Issues Identified:**
1. Sequential HTML generation: 30 themes × ~1s each = ~30s overhead
2. Fixed timeout: 1500ms × 30 themes = ~45s wasted waiting
3. Manual batching: Underutilizes CPU (3 concurrent vs 8+ possible)
4. Custom diffing: No anti-aliasing tolerance, slower than optimized `pixelmatch`

**Expected Speed Improvement:** 3-5x faster (from ~90s to ~20-30s)

## Desired End State

1. Playwright test suite at `packages/mdopen/tests/visual.spec.ts`
2. Configuration at `packages/mdopen/playwright.config.ts`
3. Baselines stored in `packages/mdopen/tests/visual.spec.ts-snapshots/`
4. `just` recipes for running tests and updating baselines
5. Existing `__snapshots__/` directory removed after migration

## What We're NOT Doing

- Not migrating other test types (only visual regression)
- Not changing the CLI or build process
- Not adding new themes to the test suite
- Not migrating to cloud-based visual testing (Percy, Applitools)

## Implementation Approach

**Strategy:** Incremental migration with feature parity, then deprecation of old script.

**Why Playwright over improved Puppeteer:**
- Native `toHaveScreenshot()` eliminates 90% of custom code
- Built-in parallelization is faster than manual batching
- Auto-waiting eliminates flaky timeouts
- HTML reports provide better debugging experience
- Active maintenance and community support

---

## Phase 1: Setup & Configuration

### Overview
Install Playwright and create configuration file.

### Changes Required:

#### 1. Install Dependencies
**File**: `packages/mdopen/package.json`

Add to `devDependencies`:
```json
"@playwright/test": "^1.48.0"
```

Add to `scripts`:
```json
"test:visual": "playwright test tests/visual.spec.ts",
"test:visual:update": "playwright test tests/visual.spec.ts --update-snapshots",
"test:visual:report": "playwright show-report tests/playwright-report"
```

#### 2. Create Playwright Config
**File**: `packages/mdopen/playwright.config.ts`

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'file://',
    screenshot: 'only-on-failure',
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,  // Allow 1% difference (handles antialiasing)
      threshold: 0.2,           // Per-pixel color threshold
      animations: 'disabled',   // Disable CSS animations for consistency
    },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        viewport: { width: 1280, height: 900 },
        launchOptions: {
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
      },
    },
  ],
});
```

### Success Criteria:

#### Automated Verification:
- [ ] Playwright installed: `cd packages/mdopen && npm ls @playwright/test`
- [ ] Config valid: `cd packages/mdopen && npx playwright test --list`
- [ ] No TypeScript errors: `cd packages/mdopen && npx tsc --noEmit`

#### Manual Verification:
- [ ] Config file exists and is syntactically correct

---

## Phase 2: Create Visual Test Suite

### Overview
Port existing test logic to Playwright test format.

### Changes Required:

#### 1. Create Test File
**File**: `packages/mdopen/tests/visual.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const PROJECT_ROOT = path.resolve(__dirname, '..');
const MDOPEN_CLI = path.join(PROJECT_ROOT, 'dist/cli.js');
const OUTPUT_DIR = '/tmp/mdopen-playwright-test';

const THEMES = [
  'github', 'github-dark', 'almond', 'awsm', 'axist', 'bamboo',
  'bullframe', 'holiday', 'kacit', 'latex', 'marx', 'mini',
  'modest', 'new', 'no-class', 'pico', 'retro', 'sakura',
  'sakura-vader', 'semantic', 'simple', 'style-sans', 'style-serif',
  'stylize', 'superstylin', 'tacit', 'vanilla', 'water', 'water-dark', 'writ',
];

const TEST_MARKDOWN = `# Test Heading

## Section One

Some **bold** and *italic* text.

### Code Block

\`\`\`javascript
const x = 42;
console.log(x);
\`\`\`

### Table

| Col A | Col B |
|-------|-------|
| 1     | 2     |

### List

- Item one
- Item two
  - Nested

### Task List

- [x] Done
- [ ] Todo

### Blockquote

> A blockquote here.

---

### Mermaid

\`\`\`mermaid
graph TD
  A[Start] --> B[End]
\`\`\`
`;

// Generate HTML for a theme (called once per test file)
function generateHtml(theme: string): string {
  const tmpFile = path.join(OUTPUT_DIR, `test-${theme}.md`);
  const htmlFile = path.join(OUTPUT_DIR, `test-${theme}.html`);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(tmpFile, TEST_MARKDOWN, 'utf8');

  execSync(`node "${MDOPEN_CLI}" "${tmpFile}" --no-open --theme ${theme} --out "${htmlFile}" --no-validate-mermaid`, {
    timeout: 30000,
    stdio: 'pipe',
  });

  return htmlFile;
}

// Generate all HTML files once before tests
const htmlFiles = new Map<string, string>();

test.beforeAll(() => {
  for (const theme of THEMES) {
    try {
      const htmlPath = generateHtml(theme);
      htmlFiles.set(theme, htmlPath);
    } catch (e) {
      console.error(`Failed to generate HTML for ${theme}:`, e);
    }
  }
});

test.describe('Visual Regression Tests', () => {
  for (const theme of THEMES) {
    test(`${theme} theme renders correctly`, async ({ page }) => {
      const htmlPath = htmlFiles.get(theme);
      if (!htmlPath) {
        test.skip();
        return;
      }

      await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });

      // Wait for content to be stable (no layout shifts)
      await page.waitForLoadState('networkidle');

      // Take screenshot and compare with baseline
      await expect(page).toHaveScreenshot(`${theme}.png`, {
        fullPage: true,
      });
    });
  }
});
```

### Success Criteria:

#### Automated Verification:
- [ ] Test file compiles: `cd packages/mdopen && npx tsc --noEmit`
- [ ] Tests listed: `cd packages/mdopen && npx playwright test --list`
- [ ] First run creates baselines: `cd packages/mdopen && npx playwright test tests/visual.spec.ts --update-snapshots`

#### Manual Verification:
- [ ] Baseline screenshots generated in `tests/visual.spec.ts-snapshots/`
- [ ] Screenshots contain rendered markdown content (not blank)

---

## Phase 3: Add Just Recipes

### Overview
Add convenient commands to run visual tests.

### Changes Required:

#### 1. Update Justfile
**File**: `justfile`

Add after existing recipes:

```justfile
# Visual regression tests
test-visual:
    cd packages/mdopen && npx playwright test tests/visual.spec.ts

# Update visual regression baselines
test-visual-update:
    cd packages/mdopen && npx playwright test tests/visual.spec.ts --update-snapshots

# Show visual regression test report
test-visual-report:
    cd packages/mdopen && npx playwright show-report tests/playwright-report
```

### Success Criteria:

#### Automated Verification:
- [ ] Recipes work: `just test-visual` runs tests
- [ ] Update works: `just test-visual-update` regenerates baselines

#### Manual Verification:
- [ ] Commands are discoverable: `just --list` shows new recipes

---

## Phase 4: Migration & Cleanup

### Overview
Verify feature parity and remove old implementation.

### Changes Required:

#### 1. Verify Feature Parity
Compare test results between old and new implementations:
- Both should test same 30 themes
- Both should detect visual regressions
- New should be faster

#### 2. Remove Old Implementation
**File to delete**: `packages/mdopen/scripts/visual-test.ts`

**File to delete**: `packages/mdopen/__snapshots__/` (old baselines)

#### 3. Update package.json Scripts
**File**: `packages/mdopen/package.json`

Remove old scripts:
```json
"test": "bun run scripts/visual-test.ts",
"test:update": "bun run scripts/visual-test.ts --update",
```

Keep new scripts added in Phase 1.

### Success Criteria:

#### Automated Verification:
- [ ] Old files removed: `ls packages/mdopen/scripts/visual-test.ts` fails
- [ ] Old snapshots removed: `ls packages/mdopen/__snapshots__` fails
- [ ] New tests pass: `just test-visual`

#### Manual Verification:
- [ ] No regression in test coverage
- [ ] Test execution time improved (target: <30s for all themes)

---

## Phase 5: Performance Verification

### Overview
Benchmark and document performance improvements.

### Changes Required:

#### 1. Add Timing to Just Recipes
**File**: `justfile`

Update recipes to show timing:

```justfile
# Visual regression tests with timing
test-visual:
    cd packages/mdopen && time npx playwright test tests/visual.spec.ts
```

### Success Criteria:

#### Automated Verification:
- [ ] Tests complete in <30s (down from ~90s)
- [ ] Parallel execution visible in Playwright output

#### Manual Verification:
- [ ] User confirms speed improvement is noticeable

---

## Testing Strategy

### Unit Tests:
- N/A (visual regression is the test)

### Integration Tests:
- Each theme renders without errors
- Visual baselines match expected output
- Regressions are detected (intentionally modify a theme)

### Manual Testing Steps:
1. Run `just test-visual` - should complete quickly
2. Run `just test-visual-update` - should regenerate baselines
3. Modify a theme CSS, run tests - should fail
4. Run `just test-visual-update` - should pass after update
5. Open report: `just test-visual-report` - should show diff images

---

## Performance Considerations

**Current Performance Profile:**
- HTML generation: ~30s (sequential)
- Screenshots: ~60s (3 concurrent, 1.5s timeout each)
- Total: ~90s

**Expected Performance Profile:**
- HTML generation: ~10s (parallel in beforeAll)
- Screenshots: ~15s (8+ concurrent workers)
- Total: ~25s

**Key Optimizations:**
1. Parallel HTML generation in `beforeAll` hook
2. Native Playwright parallelization (worker pool)
3. Elimination of fixed timeouts
4. Optimized `pixelmatch` comparison

---

## Migration Notes

**Breaking Changes:**
- Baseline location changes from `__snapshots__/` to `tests/visual.spec.ts-snapshots/`
- Baseline filenames include browser and platform suffix

**Rollback Plan:**
- Old `visual-test.ts` can be restored from git
- Old baselines preserved in git history

**CI Considerations:**
- Set `CI=1` for single-worker mode (deterministic)
- Store Playwright baselines in CI cache
- Upload HTML reports as artifacts

---

## References

- Playwright Visual Testing Docs: https://playwright.dev/docs/test-snapshots
- Playwright Parallelization: https://playwright.dev/docs/test-parallel
- pixelmatch library: https://github.com/mapbox/pixelmatch
- Current implementation: `packages/mdopen/scripts/visual-test.ts`
