# Visual Regression Test Performance Analysis

## Current Runtime

### visual.spec.ts (30 themes)
- **Total time**: ~21 seconds
- **Parallel workers**: 4
- **Per test**: ~0.7 seconds
- **Pattern**: Generate HTML for all themes → Take screenshots

### mermaid-visual-test.ts (27 diagrams, 1 theme)
- **Total time**: ~4 seconds
- **Pattern**: Launch browser → Generate HTML → Wait 2s → Screenshot → Compare

## Bottlenecks Identified

### 1. Browser Launch Overhead (High Impact)
**Location**: `mermaid-visual-test.ts` lines 89-93

```typescript
const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--disable-setuid-sandbox'],
});
```

**Impact**: Browser launch takes 1-2 seconds per run
**Optimization**: Reuse browser instance across runs

### 2. Fixed Wait Time (Medium Impact)
**Location**: `mermaid-visual-test.ts` line 107

```typescript
await page.waitForTimeout(2000);
```

**Impact**: 2-second delay even when Mermaid renders instantly
**Optimization**: Wait for specific Mermaid elements or use `waitForSelector`

### 3. Image Comparison Overhead (Low Impact)
**Location**: `mermaid-visual-test.ts` lines 117-136

**Impact**: Manual PNG buffer comparison is slow for large images
**Optimization**: Use Playwright's built-in `toHaveScreenshot` which is faster

### 4. Network Idle Wait (Medium Impact)
**Location**: `visual.spec.ts` line 43

```typescript
await page.waitForLoadState('networkidle');
```

**Impact**: Can add 1-3 seconds per test for slow themes
**Optimization**: Use `domcontentloaded` or wait for specific elements

### 5. Viewport Size (Low Impact)
**Location**: Both test files use 1280x900

**Impact**: Larger viewport = larger images = slower comparison
**Optimization**: Use smaller viewport (e.g., 1024x768) if diagrams fit

## Recommended Optimizations

### High Priority

1. **Reuse Browser Instance**
   ```typescript
   let browser: Browser;
   beforeAll(async () => {
     browser = await chromium.launch({ ... });
   });
   afterAll(async () => {
     await browser.close();
   });
   ```

2. **Remove Fixed Wait Time**
   ```typescript
   // Instead of:
   await page.waitForTimeout(2000);

   // Use:
   await page.waitForSelector('svg.mermaid', { state: 'visible' });
   ```

3. **Use Playwright's Built-in Screenshot Comparison**
   ```typescript
   await expect(page).toHaveScreenshot('mermaid-all.png', {
     maxDiffPixels: 100,
     threshold: 0.5,
   });
   ```

### Medium Priority

4. **Reduce Viewport Size**
   ```typescript
   await page.setViewportSize({ width: 1024, height: 768 });
   ```

5. **Replace networkidle with domcontentloaded**
   ```typescript
   await page.goto(`file://${htmlFile}`, { waitUntil: 'domcontentloaded' });
   ```

6. **Parallelize Mermaid Tests**
   Currently tests one diagram at a time. Could test multiple diagrams in parallel.

### Low Priority

7. **Cache Generated HTML**
   If themes don't change often, cache HTML files and skip regeneration.

8. **Use Smaller Image Threshold**
   Adjust the pixel comparison threshold based on actual needs.

## Expected Improvements

| Optimization | Current | Optimized | Improvement |
|--------------|---------|-----------|-------------|
| Browser launch | 2s | 2s (reused) | 0s (same) |
| Fixed wait | 2s | 0.3s | 70% faster |
| Screenshot compare | 0.5s | 0.2s | 60% faster |
| **Total** | **~4s** | **~2.5s** | **~37% faster** |

## Implementation Priority

1. **Quick wins** (30 minutes):
   - Remove fixed wait time
   - Reduce viewport size
   - Replace networkidle with domcontentloaded

2. **Medium effort** (1-2 hours):
   - Reuse browser instance
   - Use Playwright's built-in comparison
   - Parallelize mermaid tests

3. **Future consideration**:
   - Cache HTML generation
   - CI/CD optimization (run tests in parallel across machines)
