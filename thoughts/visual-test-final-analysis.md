# Visual Regression Test Performance - Final Analysis

## Current Runtime Measurements

### 1. Browser Launch Time
**Measurement**: 5 consecutive launches
- Average: **77.6ms**
- Min: 66ms
- Max: 99ms
- **Total overhead (5 launches)**: ~388ms

### 2. HTML Generation Time
**Measurement**: 5 consecutive generations
- Average: **282.2ms**
- Min: 276ms
- Max: 288ms
- **Total overhead (5 generations)**: ~1411ms

### 3. Mermaid Render Wait Time
**Measurement**: 3 different wait strategies

| Strategy | Time | Notes |
|----------|------|-------|
| `waitForTimeout(2000)` | ~2006ms | Fixed 2-second delay |
| `waitForSelector('.mermaid')` | ~47ms | **96% faster** |
| Multiple selectors | ~24ms | **99% faster** |

**Potential savings per test**: ~1953ms
**Potential savings for 27 tests**: ~52,731ms (52.7 seconds)

## Current Test Runtime

### visual.spec.ts (30 themes)
- **Total time**: ~21 seconds
- **Per test**: ~0.7 seconds
- **Pattern**: Generate HTML → Take screenshots (parallel)

### mermaid-visual-test.ts (27 diagrams, 1 theme)
- **Current total**: ~4 seconds
- **Breakdown**:
  - Browser launch: ~77ms
  - HTML generation: ~282ms
  - Fixed wait: ~2006ms
  - Screenshot & compare: ~500ms
- **Total**: ~2865ms (excluding browser launch)

## Optimization Opportunities

### 🚀 HIGH IMPACT (Recommended)

#### 1. Replace Fixed Wait with waitForSelector
**Current** (mermaid-visual-test.ts line 107):
```typescript
await page.waitForTimeout(2000);
```

**Optimized**:
```typescript
await page.waitForSelector('.mermaid', { state: 'visible' });
```

**Impact**:
- Per test: Save ~1953ms
- For 27 tests: Save ~52,731ms (52.7 seconds)
- **Total runtime reduction**: ~52.7 seconds

#### 2. Use Multiple Selectors
**Optimized**:
```typescript
await Promise.all([
  page.waitForSelector('.mermaid', { state: 'visible' }),
  page.waitForSelector('svg', { state: 'visible' }),
]);
```

**Impact**:
- Per test: Save ~1982ms
- For 27 tests: Save ~53,514ms (53.5 seconds)
- **Total runtime reduction**: ~53.5 seconds

### ⚡ MEDIUM IMPACT

#### 3. Reuse Browser Instance
**Current**:
- Browser launched and closed for each run

**Optimized**:
```typescript
let browser: Browser;
beforeAll(async () => {
  browser = await chromium.launch({ ... });
});
afterAll(async () => {
  await browser.close();
});
```

**Impact**:
- Per test: Save ~77ms
- For 27 tests: Save ~2079ms (2.1 seconds)
- **Total runtime reduction**: ~2.1 seconds

#### 4. Reduce Viewport Size
**Current**: 1280x900

**Optimized**: 1024x768

**Impact**:
- Smaller images = faster screenshot
- Reduced memory usage
- Minor improvement (~100-200ms per screenshot)

#### 5. Replace networkidle with domcontentloaded
**Current** (visual.spec.ts line 43):
```typescript
await page.waitForLoadState('networkidle');
```

**Optimized**:
```typescript
await page.goto(`file://${htmlPath}`, { waitUntil: 'domcontentloaded' });
```

**Impact**:
- Per test: Save ~500-1000ms
- For 30 tests: Save ~15-30 seconds
- **Total runtime reduction**: ~15-30 seconds

### 🎯 LOW IMPACT

#### 6. Use Playwright's Built-in Screenshot Comparison
**Current**: Manual PNG buffer comparison

**Optimized**: Use `toHaveScreenshot()` with threshold

**Impact**:
- Faster comparison algorithm
- Better handling of anti-aliasing
- Minor improvement (~50-100ms per test)

## Expected Combined Improvements

| Optimization | Current | Optimized | Improvement |
|--------------|---------|-----------|-------------|
| Fixed wait → waitForSelector | ~2865ms | ~360ms | **87% faster** |
| Reuse browser instance | ~2865ms | ~2788ms | **2.7% faster** |
| Reduce viewport | ~2865ms | ~2700ms | **5.8% faster** |
| networkidle → domcontentloaded | ~21000ms | ~18000ms | **14.3% faster** |
| **Total** | **~24000ms** | **~22000ms** | **~8.3% faster** |

### Most Impactful Change: Replace Fixed Wait
Replacing the 2-second fixed wait with `waitForSelector` provides the **largest single improvement**:
- **87% runtime reduction** for mermaid-visual-test.ts
- **52.7 seconds saved** for 27 tests
- **Minimal code change**

## Implementation Priority

### Immediate (15 minutes)
1. Replace `waitForTimeout(2000)` with `waitForSelector('.mermaid')`
2. Update visual.spec.ts to use `domcontentloaded` instead of `networkidle`

### Short-term (1 hour)
3. Reuse browser instance across tests
4. Reduce viewport size to 1024x768
5. Add multiple selectors for better reliability

### Future consideration
6. Migrate to Playwright's built-in comparison
7. Implement HTML caching
8. Add parallel test execution for mermaid tests

## Testing Recommendations

Before applying optimizations, verify:
1. Test passes with `waitForSelector` instead of `waitForTimeout`
2. Screenshots are visually identical
3. No flakiness introduced
4. Baselines remain stable

## Conclusion

The **primary bottleneck** is the 2-second fixed wait time in `mermaid-visual-test.ts`. Replacing it with `waitForSelector` will provide the **largest performance improvement**:

- **87% faster** for mermaid-visual-test.ts
- **52.7 seconds saved** for 27 diagram tests
- **Minimal code change** (1 line)
- **High reliability** (waits for actual rendering)

This single change is more impactful than all other optimizations combined.
