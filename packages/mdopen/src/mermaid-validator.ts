import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export interface MermaidValidationResult {
  total: number;
  passed: number;
  failed: number;
  errors: { index: number; source: string; error: string }[];
}

function extractMermaidBlocks(markdown: string): string[] {
  const blocks: string[] = [];
  const regex = /```mermaid\s*\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    blocks.push(match[1].trim());
  }
  return blocks;
}

function buildValidationHtml(blocks: string[]): string {
  const mermaidDivs = blocks.map((src, i) =>
    `<div class="mermaid" data-index="${i}">${src}</div>`
  ).join('\n');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
  <style>body { font-family: monospace; padding: 20px; }</style>
</head>
<body>
  <div id="diagrams">${mermaidDivs}</div>
  <script>
    mermaid.initialize({ startOnLoad: true, theme: 'default' });
  </script>
</body>
</html>`;
}

export async function validateMermaid(markdown: string): Promise<MermaidValidationResult> {
  const blocks = extractMermaidBlocks(markdown);
  if (blocks.length === 0) {
    return { total: 0, passed: 0, failed: 0, errors: [] };
  }

  const html = buildValidationHtml(blocks);
  const tmpFile = path.join(os.tmpdir(), `mdopen-mermaid-validate-${Date.now()}.html`);
  fs.writeFileSync(tmpFile, html, 'utf8');

  try {
    const puppeteer = await import('puppeteer-core');
    const browser = await puppeteer.default.launch({
      headless: true,
      executablePath: '/usr/bin/brave-browser',
      args: ['--no-sandbox', '--disable-gpu', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: 600 });
    await page.goto(`file://${tmpFile}`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));

    const results = await page.evaluate(() => {
      const divs = document.querySelectorAll('.mermaid');
      const errors: { index: number; source: string; error: string }[] = [];
      let passed = 0;

      divs.forEach((div) => {
        const idx = parseInt(div.getAttribute('data-index') || '0');
        const hasSvg = !!div.querySelector('svg');
        const hasError = !!div.querySelector('.error-icon, .error-text');

        if (hasSvg && !hasError) {
          passed++;
        } else {
          const errorEl = div.querySelector('.error-text');
          const errorText = errorEl?.textContent || 'render failed';
          const source = div.textContent?.substring(0, 100) || '';
          errors.push({ index: idx, source, error: errorText });
        }
      });

      return { passed, errors };
    });

    await browser.close();

    return {
      total: blocks.length,
      passed: results.passed,
      failed: results.errors.length,
      errors: results.errors,
    };
  } finally {
    fs.unlinkSync(tmpFile);
  }
}
