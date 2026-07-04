#!/usr/bin/env bun
/**
 * Visual regression tests for mdopen (parallel).
 *
 * Usage:
 *   bun run scripts/visual-test.ts                     # run all tests
 *   bun run scripts/visual-test.ts --update             # update baselines
 *   bun run scripts/visual-test.ts --theme github       # test single theme
 *   bun run scripts/visual-test.ts --concurrency 8      # parallel pages
 */

import puppeteer from 'puppeteer-core';
import * as fs from 'fs';
import * as path from 'path';
import { execSync, exec } from 'child_process';

const PROJECT_ROOT = path.resolve(__dirname, '..');
const MDOPEN_CLI = path.join(PROJECT_ROOT, 'dist/cli.js');
const BASELINE_DIR = path.join(PROJECT_ROOT, '__snapshots__');
const OUTPUT_DIR = '/tmp/mdopen-visual-test';
const BRAVE_PATH = '/usr/bin/brave-browser';

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

interface TestResult {
  theme: string;
  baseline: boolean;
  passed: boolean;
  diffPixels?: number;
  diffPercent?: number;
  screenshotPath: string;
  baselinePath?: string;
  error?: string;
}

function pixelDiff(img1: Buffer, img2: Buffer): { diffPixels: number; diffPercent: number } {
  const len = Math.min(img1.length, img2.length);
  let diffPixels = 0;
  for (let i = 0; i < len; i += 4) {
    const rDiff = Math.abs(img1[i] - img2[i]);
    const gDiff = Math.abs(img1[i + 1] - img2[i + 1]);
    const bDiff = Math.abs(img1[i + 2] - img2[i + 2]);
    if (rDiff > 10 || gDiff > 10 || bDiff > 10) {
      diffPixels++;
    }
  }
  const totalPixels = len / 4;
  return {
    diffPixels,
    diffPercent: (diffPixels / totalPixels) * 100,
  };
}

function generateAllHtml(themes: string[]): Map<string, string> {
  const htmlMap = new Map<string, string>();
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Generate all HTML files in one pass
  const tmpFile = path.join(OUTPUT_DIR, 'test-all.md');
  fs.writeFileSync(tmpFile, TEST_MARKDOWN, 'utf8');

  for (const theme of themes) {
    const htmlFile = path.join(OUTPUT_DIR, `test-${theme}.html`);
    try {
      execSync(`node "${MDOPEN_CLI}" "${tmpFile}" --no-open --theme ${theme} --out "${htmlFile}" --no-validate-mermaid`, {
        timeout: 30000,
        stdio: 'pipe',
      });
      htmlMap.set(theme, htmlFile);
    } catch (e) {
      console.error(`  ✗ ${theme} — HTML generation failed`);
    }
  }
  return htmlMap;
}

async function runTests(updateBaselines: boolean, filterTheme?: string, concurrency: number = 6) {
  const themes = filterTheme ? [filterTheme] : THEMES;
  const results: TestResult[] = [];

  fs.mkdirSync(BASELINE_DIR, { recursive: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(`\n  Visual Regression Tests`);
  console.log(`  ${themes.length} theme(s), concurrency=${concurrency}\n`);

  // Phase 1: Generate all HTML (sequential, fast)
  const htmlMap = generateAllHtml(themes);

  // Phase 2: Screenshot in parallel
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: BRAVE_PATH,
    args: ['--no-sandbox', '--disable-gpu', '--disable-setuid-sandbox'],
  });

  const screenshotTheme = async (theme: string): Promise<TestResult> => {
    const baselinePath = path.join(BASELINE_DIR, `${theme}.png`);
    const screenshotPath = path.join(OUTPUT_DIR, `${theme}.png`);
    const htmlPath = htmlMap.get(theme);

    if (!htmlPath) {
      return { theme, baseline: false, passed: false, screenshotPath, error: 'HTML not generated' };
    }

    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 900 });
      await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 15000 });
      await new Promise(r => setTimeout(r, 1500));
      const screenshot = await page.screenshot({ fullPage: true }) as Buffer;
      await page.close();

      if (updateBaselines || !fs.existsSync(baselinePath)) {
        fs.writeFileSync(baselinePath, screenshot);
        return { theme, baseline: true, passed: true, screenshotPath, baselinePath };
      }

      const baseline = fs.readFileSync(baselinePath);
      const { diffPixels, diffPercent } = pixelDiff(screenshot, baseline);
      const passed = diffPercent < 0.5;
      return { theme, baseline: false, passed, diffPixels, diffPercent, screenshotPath, baselinePath };
    } catch (err) {
      return { theme, baseline: false, passed: false, screenshotPath, error: (err as Error).message };
    }
  };

  // Process in batches
  for (let i = 0; i < themes.length; i += concurrency) {
    const batch = themes.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(screenshotTheme));
    for (const r of batchResults) {
      results.push(r);
      if (updateBaselines) {
        console.log(`  ✓ ${r.theme} — baseline updated`);
      } else if (r.passed) {
        console.log(`  ✓ ${r.theme} — OK (${r.diffPercent?.toFixed(3)}% diff)`);
      } else {
        console.log(`  ✗ ${r.theme} — ${r.error || `${r.diffPercent?.toFixed(3)}% diff`}`);
      }
    }
  }

  await browser.close();

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`\n  Results: ${passed} passed, ${failed} failed, ${results.length} total\n`);

  if (failed > 0) {
    console.log('  Failed:');
    results.filter(r => !r.passed).forEach(r => console.log(`    - ${r.theme}: ${r.error || `${r.diffPercent?.toFixed(3)}% diff`}`));
    console.log('');
  }

  process.exit(failed > 0 ? 1 : 0);
}

const args = process.argv.slice(2);
const updateBaselines = args.includes('--update');
const themeIdx = args.indexOf('--theme');
const filterTheme = themeIdx !== -1 ? args[themeIdx + 1] : undefined;
const concIdx = args.indexOf('--concurrency');
const concurrency = concIdx !== -1 ? parseInt(args[concIdx + 1]) || 3 : 3;

runTests(updateBaselines, filterTheme, concurrency);
