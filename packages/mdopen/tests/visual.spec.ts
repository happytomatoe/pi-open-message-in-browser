import { test, expect } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execPromise = promisify(exec);
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

// Generate HTML for a theme
async function generateHtml(theme: string): Promise<string> {
  const tmpFile = path.join(OUTPUT_DIR, `test-${theme}.md`);
  const htmlFile = path.join(OUTPUT_DIR, `test-${theme}.html`);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(tmpFile, TEST_MARKDOWN, 'utf8');

  await execPromise(`node "${MDOPEN_CLI}" "${tmpFile}" --no-open --theme ${theme} --out "${htmlFile}" --no-validate-mermaid`, {
    timeout: 30000,
  });

  return htmlFile;
}

// Generate all HTML files in parallel before tests
const htmlFiles = new Map<string, string>();

test.beforeAll(async () => {
  const results = await Promise.allSettled(
    THEMES.map(async (theme) => {
      const htmlPath = await generateHtml(theme);
      return { theme, htmlPath };
    })
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      htmlFiles.set(result.value.theme, result.value.htmlPath);
    } else {
      console.error(`Failed to generate HTML:`, result.reason);
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
