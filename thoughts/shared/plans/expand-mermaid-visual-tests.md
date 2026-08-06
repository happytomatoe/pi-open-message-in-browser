# Expand Mermaid Visual Regression Tests Implementation Plan

## Overview

This plan aims to ensure that all 27 supported Mermaid diagram types render correctly across all supported themes in `mdopen`. To avoid the instability of extremely long pages and to provide granular failure reports, each diagram type will be tested on its own page for every theme.

## Current State Analysis

- **Diagram Definitions**: `packages/mdopen/src/mermaid-validator.ts` lists 27 supported diagram types.
- **Test Examples**: `packages/mdopen/scripts/mermaid-visual-test.ts` contains valid minimal examples for these types.
- **Theme Infrastructure**: `packages/mdopen/tests/visual.spec.ts` already implements a loop over all supported themes.
- **Existing Gap**: No integrated Playwright tests exist that verify the full set of Mermaid diagrams across all themes.

## Desired End State

A comprehensive suite of visual regression tests that:
1. Iterates through every supported theme.
2. Iterates through every supported Mermaid diagram type.
3. Generates a unique HTML page for each diagram/theme combination.
4. Captures and verifies a screenshot for each.

### Key Discoveries:
- Testing all diagrams on a single page results in a page height of ~8000px, which is prone to minor rendering shifts (e.g., 1-2px difference in total height) that cause test failures.
- Moving to a "1 diagram per page" approach isolates failures and increases test stability.

## What We're NOT Doing

- Fixing rendering bugs within Mermaid.js itself.
- Adding new Mermaid diagram types not already supported by the validator.
- Testing different viewport sizes (will stick to a standard desktop viewport).

## Implementation Approach

We will create a new Playwright test file `packages/mdopen/tests/mermaid-visual.spec.ts`. This test will use a data-driven approach, looping through themes and a map of Mermaid examples. For each pair, it will use the `mdopen` CLI to generate a temporary HTML file, then use Playwright to verify the screenshot.

## Phase 1: Test Setup & Data Definition

### Overview
Define the test data and the basic structure of the Playwright test file.

### Changes Required:

#### 1. Create `packages/mdopen/tests/mermaid-visual.spec.ts`
**Changes**: 
- Import necessary Playwright and Node.js modules.
- Define `THEMES` array (matching `visual.spec.ts`).
- Define `MERMAID_EXAMPLES` object where keys are diagram types and values are minimal valid Mermaid code.
- Set up a temporary directory for HTML generation.

```typescript
const MERMAID_EXAMPLES: Record<string, string> = {
  architecture: 'architecture-beta\\n    group g1(cloud)\\n    service s1(database) in g1',
  block: 'block-beta\\n    columns 1\\n    block:a\\n      A\\n    end',
  // ... all 27 types
};
```

### Success Criteria:

#### Automated Verification:
- [ ] File created and compiles without TS errors.

---

## Phase 2: Test Matrix Implementation

### Overview
Implement the nested loop to generate and verify screenshots for all combinations.

### Changes Required:

#### 1. Implementation of the test loop in `packages/mdopen/tests/mermaid-visual.spec.ts`
**Changes**:
- Use `test.describe` for "Mermaid Comprehensive Tests".
- Use a nested loop: `for (const theme of THEMES)` $\rightarrow$ `for (const [type, code] of Object.entries(MERMAID_EXAMPLES))`.
- Inside the loop:
  1. Create a temporary `.md` file containing only the specific mermaid block.
  2. Call `mdopen` CLI to generate an `.html` file using the current theme.
  3. Use `page.goto` to open the HTML.
  4. Use `page.waitForSelector('.mermaid svg')` to ensure rendering is complete.
  5. Use `expect(page).toHaveScreenshot(\`mermaid-\${type}-\${theme}.png\`)`.

### Success Criteria:

#### Automated Verification:
- [ ] Running the test (even if it fails due to missing baselines) executes the correct number of tests ($30 \text{ themes} \times 27 \text{ types} = 810 \text{ tests}$).

---

## Phase 3: Baseline Generation & Stability Tuning

### Overview
Establish the ground-truth screenshots and ensure they are stable.

### Changes Required:

#### 1. Generate Baselines
**Changes**: 
- Run `bun x playwright test packages/mdopen/tests/mermaid-visual.spec.ts --update-snapshots`.
- Verify that snapshots are created in the `mermaid-visual.spec.ts-snapshots` directory.

#### 2. Stability Tuning
**Changes**:
- If any tests are flaky, adjust `waitForTimeout` or implement a more robust `waitForFunction` to ensure Mermaid has finished all animations and layout shifts before the screenshot is taken.
- Set a reasonable `maxDiffPixelRatio` (e.g., 0.01) to ignore sub-pixel anti-aliasing differences.

### Success Criteria:

#### Automated Verification:
- [ ] `bun x playwright test packages/mdopen/tests/mermaid-visual.spec.ts` passes with 0 failures.

#### Manual Verification:
- [ ] Randomly inspect 5-10 snapshots to confirm they contain the expected diagram and are not blank or broken.

## Testing Strategy

### Automated Tests:
- The primary verification is the Playwright visual regression suite.
- Each diagram/theme combination has its own snapshot.

### Manual Testing Steps:
1. Open the generated `.png` snapshots in a viewer.
2. Compare the output of a "dark" theme vs "light" theme for a complex diagram (like `sankey` or `gitGraph`) to ensure colors are legible.

## Performance Considerations

- Generating 810 HTML files and taking 810 screenshots can be slow. 
- Playwright workers will be used to parallelize the process.
- Temporary files will be cleaned up or stored in `/tmp` to avoid polluting the workspace.

## References

- `packages/mdopen/src/mermaid-validator.ts` for the list of supported types.
- `packages/mdopen/scripts/mermaid-visual-test.ts` for the example diagrams.
- `packages/mdopen/tests/visual.spec.ts` for the theme list and baseline pattern.
