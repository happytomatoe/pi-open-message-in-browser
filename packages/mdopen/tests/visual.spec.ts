import { test, expect } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execPromise = promisify(exec);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const MDOPEN_BIN = path.join(PROJECT_ROOT, 'bin', 'mdopen');
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

// Generate HTML for a theme
async function generateHtml(theme: string): Promise<string> {
  const tmpFile = path.join(OUTPUT_DIR, `test-${theme}.md`);
  const htmlFile = path.join(OUTPUT_DIR, `test-${theme}.html`);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(tmpFile, TEST_MARKDOWN, 'utf8');

  const startTime = Date.now();
  const { stdout } = await execPromise(`MDOPEN_TIMING=1 "${MDOPEN_BIN}" "${tmpFile}" --no-open --theme ${theme} --out "${htmlFile}" --no-validate-mermaid`, {
    timeout: 30000,
  });
  const elapsed = Date.now() - startTime;

  if (process.env.VISUAL_TEST_TIMING === '1') {
    console.log(`\n[HTML Generation: ${theme}]`);
    console.log(stdout);
  }

  return htmlFile;
}

// Generate all HTML files in parallel before tests
const htmlFiles = new Map<string, string>();

test.beforeAll(async () => {
  const results = await Promise.allSettled(
    THEMES.map(async (theme) => {
      const startTime = Date.now();
      const htmlPath = await generateHtml(theme);
      const elapsed = Date.now() - startTime;

      if (process.env.VISUAL_TEST_TIMING === '1') {
        console.log(`[HTML Generation] ${theme.padEnd(20)} ${elapsed}ms`);
      }

      return { theme, htmlPath };
    })
  );

  for (const result of results) {
    if (result.status === 'rejected') {
      throw new Error(`Critical setup failure during HTML generation: ${result.reason}`);
    }
    htmlFiles.set(result.value.theme, result.value.htmlPath);
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

      const themeStartTime = Date.now();

      const navigationStart = Date.now();
      await page.goto(`file://${htmlPath}`, { waitUntil: 'domcontentloaded' });
      const navigationTime = Date.now() - navigationStart;

      // Wait for all Mermaid SVGs to be rendered and visible
      const mermaidCount = await page.locator('.mermaid').count();
      await page.waitForFunction(
        (expected) => document.querySelectorAll('.mermaid svg').length >= expected,
        mermaidCount,
        { timeout: 10000 }
      );
      const loadStateTime = Date.now() - navigationStart - navigationTime;

      const screenshotStart = Date.now();
      await expect(page).toHaveScreenshot(`${theme}.png`, {
        fullPage: true,
      });
      const screenshotTime = Date.now() - screenshotStart;

      const themeTime = Date.now() - themeStartTime;

      if (process.env.VISUAL_TEST_TIMING === '1') {
        console.log(`\n[Theme: ${theme}]`);
        console.log(`  HTML Generation: ${htmlFiles.get(theme)?.length || 0} chars`);
        console.log(`  Navigation:       ${navigationTime}ms`);
        console.log(`  Load State:       ${loadStateTime}ms`);
        console.log(`  Screenshot:       ${screenshotTime}ms`);
        console.log(`  TOTAL:            ${themeTime}ms`);
      }
    });
  }
});
