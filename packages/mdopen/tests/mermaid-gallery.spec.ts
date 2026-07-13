import { test, expect } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execPromise = promisify(exec);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const MDOPEN_BIN = path.join(PROJECT_ROOT, 'bin', 'mdopen');
const OUTPUT_DIR = '/tmp/mdopen-gallery-test';

const THEMES = [
  'github', 'github-dark', 'retro', 'sakura', 'vanilla'
];

const GALLERY_MD = path.join(PROJECT_ROOT, 'tests/mermaid-gallery.md');

const htmlFiles = new Map<string, string>();

test.beforeAll(async () => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const results = await Promise.allSettled(
    THEMES.map(async (theme) => {
      const htmlFile = path.join(OUTPUT_DIR, `gallery-${theme}.html`);
      await execPromise(`"${MDOPEN_BIN}" "${GALLERY_MD}" --no-open --theme ${theme} --out "${htmlFile}" --no-validate-mermaid`, {
        timeout: 30000,
      });
      return { theme, htmlFile };
    })
  );

  for (const result of results) {
    if (result.status === 'rejected') {
      throw new Error(`Critical setup failure during HTML generation: ${result.reason}`);
    }
    htmlFiles.set(result.value.theme, result.value.htmlFile);
  }
});

test.afterAll(() => {
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }
});

test.describe('Mermaid Gallery Tests', () => {
  for (const theme of THEMES) {
    test(`${theme} gallery renders correctly`, async ({ page }) => {
      const htmlPath = htmlFiles.get(theme);
      if (!htmlPath) {
        test.skip();
        return;
      }

      await page.goto(`file://${htmlPath}`, { waitUntil: 'domcontentloaded' });

      const mermaidCount = await page.locator('.mermaid').count();
      await page.waitForFunction(
        (expected) => document.querySelectorAll('.mermaid svg').length >= expected,
        mermaidCount,
        { timeout: 15000 }
      );

      await expect(page).toHaveScreenshot(`gallery-${theme}.png`, {
        fullPage: true,
      });
    });
  }
});
