# Upgrade mdopen Visual Tests

## Current State

The current visual regression testing in `packages/mdopen/scripts/visual-test.ts` is a basic implementation that:
- Uses a single hardcoded markdown string for all tests.
- Employs a naive pixel-by-pixel comparison with a fixed threshold.
- Relies on a hardcoded path to the Brave browser (`/usr/bin/brave-browser`).
- Lacks visual diff output (only reports percentage difference).
- Generates HTML files sequentially.
- Does not explicitly list `puppeteer-core` in `package.json`.

## Goals

Improve the reliability, coverage, and developer experience of visual tests.

### Key Objectives
1. **Robust Comparison**: Replace naive diffing with `pixelmatch` to reduce false positives and improve accuracy.
2. **Visual Debugging**: Generate diff images highlighting the exact differences when a test fails.
3. **Increased Coverage**: Transition from a single test string to a library of sample markdown files covering various components (tables, mermaid, lists, etc.).
4. **Better Portability**: Remove hardcoded browser paths; support environment variable configuration or use `puppeteer` bundled browsers.
5. **Improved Performance**: Parallelize the HTML generation phase.
6. **Proper Dependency Management**: Ensure all testing dependencies are correctly listed in `package.json`.

## Proposed Changes

### 1. Infrastructure & Dependencies
- Add `puppeteer`, `pixelmatch`, and their types to `packages/mdopen/devDependencies`.
- Implement a flexible browser path resolution:
  - Check for `PUPPETEER_EXECUTABLE_PATH` environment variable.
  - Fallback to a configurable flag.
  - Default to `puppeteer.launch()`'s default behavior if possible.

### 2. Test Case Expansion
- Create a new directory: `packages/mdopen/tests/visual-samples/`.
- Populate it with `.md` files representing different test scenarios:
  - `basic.md`: Simple headings and paragraphs.
  - `formatting.md`: Bold, italic, strikethrough, etc.
  - `lists.md`: Ordered, unordered, and nested lists.
  - `tables.md`: Complex tables.
  - `code.md`: Syntax highlighting for multiple languages.
  - `mermaid.md`: Various Mermaid diagram types.
  - `edge-cases.md`: Long lines, deeply nested elements, etc.

### 3. Script Refactoring (`visual-test.ts`)
- **Input**: Iterate over all files in `visual-samples/` instead of using one constant.
- **Generation**: Use `Promise.all` with `exec` to generate HTML files in parallel.
- **Comparison**:
  - Use `pixelmatch` to compare the current screenshot with the baseline.
  - If the difference exceeds the threshold, generate a diff image using `pngjs`.
- **Output**:
  - Log the path to the diff image for every failed test.
  - Maintain a clear summary of passed/failed themes and samples.

### 4. File Organization
- Baseline snapshots: `packages/mdopen/__snapshots__/{theme}/{sample}.png`.
- Test output: `/tmp/mdopen-visual-test/{theme}/{sample}.png` and `{sample}-diff.png`.

## Implementation Plan

### Phase 1: Setup
- [ ] Install `puppeteer`, `pixelmatch`, `pngjs`, and corresponding `@types`.
- [ ] Create `packages/mdopen/tests/visual-samples/` and add initial test files.

### Phase 2: Core Logic Upgrade
- [ ] Refactor `visual-test.ts` to support multiple sample files.
- [ ] Implement parallel HTML generation.
- [ ] Integrate `pixelmatch` for image comparison.
- [ ] Implement diff image generation.
- [ ] Update browser launch logic for better portability.

### Phase 3: Refinement & Verification
- [ ] Update `package.json` scripts to ensure they work with the new structure.
- [ ] Run tests and update baselines.
- [ ] Intentionally modify a theme's CSS to verify that tests fail and diff images are generated.
- [ ] Verify performance improvements in HTML generation.

## Success Criteria
- [ ] `bun run test` runs without errors.
- [ ] All sample files in `visual-samples/` are processed for all themes.
- [ ] Failed tests produce a `.png` diff image showing exactly what changed.
- [ ] No hardcoded paths to browsers that prevent running on other machines.
- [ ] `puppeteer` and `pixelmatch` are correctly listed in `package.json`.
