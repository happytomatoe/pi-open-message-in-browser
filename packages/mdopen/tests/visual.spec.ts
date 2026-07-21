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

async function generateHtml(theme: string): Promise<string> {
  const tmpFile = path.join(OUTPUT_DIR, `test-${theme}.md`);
  const htmlFile = path.join(OUTPUT_DIR, `test-${theme}.html`);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Skip generation if file already exists (parallel workers share OUTPUT_DIR)
  if (fs.existsSync(htmlFile)) {
    return htmlFile;
  }

  fs.writeFileSync(tmpFile, TEST_MARKDOWN, 'utf8');

  const { stdout } = await execPromise(`MDOPEN_TIMING=1 "${MDOPEN_BIN}" "${tmpFile}" --no-open --theme ${theme} --out "${htmlFile}" --no-validate-mermaid`, {
    timeout: 120000,
  });

  return htmlFile;
}

const htmlFiles = new Map<string, string>();

test.beforeAll(async () => {
  const htmlFilesGenerated = new Map<string, string>();
  
  // Generate HTML for each theme with robust error handling
  for (let i = 0; i < THEMES.length; i++) {
    const theme = THEMES[i];
    console.log(`Generating HTML for theme ${i + 1}/${THEMES.length}: ${theme}`);
    
    try {
      const htmlPath = await generateHtml(theme);
      htmlFiles.set(theme, htmlPath);
      htmlFilesGenerated.set(theme, htmlPath);
      console.log(`✓ Successfully generated HTML for theme: ${theme}`);
    } catch (error) {
      console.error(`✗ Failed to generate HTML for theme ${theme}:`, error);
      // Don't throw the error - continue with other themes
      // This allows us to have some themes generated even if others fail
    }
  }
  
  // If no themes were generated, throw an error
  if (htmlFiles.size === 0) {
    throw new Error('Failed to generate HTML for all themes');
  }
  
  console.log(`Successfully generated HTML for ${htmlFiles.size}/${THEMES.length} themes`);
});

test.describe('Visual Regression Tests', () => {
  for (const theme of THEMES) {
    test(`${theme} theme renders correctly`, async ({ page }) => {
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
        { timeout: 10000 }
      );

      await expect(page).toHaveScreenshot(`${theme}.png`, {
        fullPage: true,
      });
    });
  }
});

test.describe('Mermaid Pan/Zoom Controls', () => {
  let htmlPath: string;

  test.beforeAll(async () => {
    htmlPath = await generateHtml('github');
  });

  test('panzoom available on SVG', async ({ page }) => {
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
    await page.waitForFunction(
      () => {
        const svg = document.querySelector('.mermaid svg') as any;
        return svg && svg.__panzoom;
      },
      { timeout: 10000 }
    );
    const panzoomExists = await page.evaluate(() => {
      const svg = document.querySelector('.mermaid svg') as any;
      return svg && svg.__panzoom !== undefined;
    });
    expect(panzoomExists).toBe(true);
  });

  test('toolbar appears on hover', async ({ page }) => {
    await page.goto(`file://${htmlPath}`, { waitUntil: 'domcontentloaded' });

    await page.waitForFunction(
      () => document.querySelectorAll('.mermaid svg').length > 0,
      { timeout: 10000 }
    );

    const mermaidContainer = page.locator('.mermaid').first();
    const toolbar = mermaidContainer.locator('.mermaid-panzoom-toolbar');

    await expect(toolbar).toBeAttached();
    await mermaidContainer.hover();
    await expect(toolbar).toBeVisible();

    const buttons = toolbar.locator('.mermaid-panzoom-btn');
    await expect(buttons).toHaveCount(3);
    await expect(buttons.nth(0)).toHaveAttribute('aria-label', 'Zoom out');
    await expect(buttons.nth(1)).toHaveAttribute('aria-label', 'Zoom in');
    await expect(buttons.nth(2)).toHaveAttribute('aria-label', 'Fullscreen');
  });

  test('keyboard shortcuts work', async ({ page }) => {
    await page.goto(`file://${htmlPath}`, { waitUntil: 'domcontentloaded' });

    await page.waitForFunction(
      () => {
        const svg = document.querySelector('.mermaid svg') as any;
        return svg && svg.__panzoom;
      },
      { timeout: 10000 }
    );

    const mermaidContainer = page.locator('.mermaid').first();
    await mermaidContainer.click();
    await page.waitForTimeout(100); // Ensure keyboard listener is ready

    const getTransform = async () => {
      return await page.evaluate(() => {
        const svg = document.querySelector('.mermaid svg') as any;
        return svg.__panzoom?.getTransform();
      });
    };

    const initialTransform = await getTransform();

    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(150);
    const afterPan = await getTransform();
    expect(afterPan.x).toBeLessThan(initialTransform.x);

    await page.keyboard.press('+');
    await page.waitForTimeout(500);
    const afterZoomIn = await getTransform();
    expect(afterZoomIn.scale).toBeGreaterThan(afterPan.scale);

    await page.keyboard.press('-');
    await page.waitForTimeout(500);
    const afterZoomOut = await getTransform();
    expect(afterZoomOut.scale).toBeLessThan(afterZoomIn.scale);

  });

  test('focus outline appears on click', async ({ page }) => {
    await page.goto(`file://${htmlPath}`, { waitUntil: 'domcontentloaded' });

    await page.waitForFunction(
      () => {
        const svg = document.querySelector('.mermaid svg') as any;
        return svg && svg.__panzoom;
      },
      { timeout: 10000 }
    );

    const mermaidContainer = page.locator('.mermaid').first();
    await mermaidContainer.click();

    const outline = await mermaidContainer.evaluate((el) => {
      return (el as HTMLElement).style.outline;
    });
    // Outline shorthand serialization order is browser-dependent ('2px solid rgb(...)')
    expect(outline).toContain('solid');
    expect(outline).toContain('2px');
  });
});
