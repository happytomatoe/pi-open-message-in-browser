#!/bin/bash
# Screenshot comparison test for mdopen
# Uses Puppeteer for reliable JS execution (TOC, Mermaid, Prism)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"
MDOPEN="$PROJECT_DIR/packages/mdopen/dist/cli.js"
OUTPUT_DIR="/tmp/mdopen-screenshots"

mkdir -p "$OUTPUT_DIR"

FILE="${1:-all-markdown-elements.md}"
FILE_BASENAME=$(basename "$FILE" .md)
WIDTH="${2:-1280}"
HEIGHT="${3:-2000}"

echo "=== Screenshot Test ==="
echo "File: $FILE"
echo "Size: ${WIDTH}x${HEIGHT}"
echo ""

# 1. Generate HTML variants with mdopen
echo "1. Generating HTML variants..."
for VARIATION in "" "--theme github-dark" "--toc" "--math"; do
    LABEL="default"
    if [ -n "$VARIATION" ]; then
        LABEL=$(echo "$VARIATION" | sed 's/--theme //' | sed 's/--//g')
    fi
    HTML_FILE="$OUTPUT_DIR/${FILE_BASENAME}-mdopen-${LABEL}.html"
    node "$MDOPEN" "$FILE" --no-open $VARIATION --out "$HTML_FILE" 2>&1
    echo "   Generated: ${LABEL}"
done

# 2. Take screenshots with Puppeteer (waits for JS: TOC, Mermaid, Prism)
echo ""
echo "2. Taking screenshots with Puppeteer..."
cd /tmp && bun run -e "
import puppeteer from 'puppeteer-core';
import { readdirSync } from 'fs';

const OUTPUT_DIR = '/tmp/mdopen-screenshots';
const htmlFiles = readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.html') && f.includes('-mdopen-') && !f.endsWith('-mdopen.html'));

const browser = await puppeteer.launch({
  headless: true,
  executablePath: '/usr/bin/brave-browser',
  args: ['--no-sandbox', '--disable-gpu', '--disable-setuid-sandbox'],
});

for (const file of htmlFiles) {
  const name = file.replace('.html', '');
  const page = await browser.newPage();
  await page.setViewport({ width: $WIDTH, height: $HEIGHT });
  await page.goto('file://' + OUTPUT_DIR + '/' + file, { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: OUTPUT_DIR + '/' + name + '.png', fullPage: true });
  console.log('   Screenshot: ' + name + '.png');
  await page.close();
}

await browser.close();
" 2>&1

echo ""
echo "=== Results ==="
ls -la "$OUTPUT_DIR"/*-mdopen-*.png 2>/dev/null || echo "No PNG files generated"

echo ""
echo "=== Verify ==="
echo "  - TOC sidebar: check toc variant for left sidebar with heading links"
echo "  - Dark theme: check github-dark variant for proper dark colors"
echo "  - Code highlighting: check for Prism.js syntax coloring"
echo "  - Mermaid diagrams: check for flowchart/sequence/class diagrams"
echo "  - Task lists: check for checkbox rendering"
echo "  - MathJax: check math variant (requires CDN, may not render headless)"
