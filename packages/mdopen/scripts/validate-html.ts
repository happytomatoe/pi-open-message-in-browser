#!/usr/bin/env bun
/**
 * Validate generated HTML at build time.
 * Runs html-validate against sample output to catch syntax errors.
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { generateHtmlDocument } from '../src/template';
import { getCompiler } from '../src/compilers';

const sampleMd = `# Test Heading

This is a test paragraph.

| Col1 | Col2 | Col3 |
|------|------|------|
| a    | b    | c    |
`;

const themes = ['github', 'github-dark'] as const;
let hasErrors = false;

for (const theme of themes) {
  const compiler = getCompiler('markdown-it');
  const { html } = compiler.compile(sampleMd);
  const css = '';
  const js = '';

  const htmlDoc = generateHtmlDocument(html, css, js, theme, false);

  const tmpFile = join(tmpdir(), `validate-${theme}-${Date.now()}.html`);
  writeFileSync(tmpFile, htmlDoc);

  try {
    execSync(`npx html-validate --config .htmlvalidate.json "${tmpFile}"`, { stdio: 'pipe', cwd: join(import.meta.dir, '..') });
    console.log(`✓ ${theme}`);
  } catch (e: any) {
    console.error(`✗ ${theme}: ${e.stderr?.toString().trim() || e.message}`);
    hasErrors = true;
  } finally {
    unlinkSync(tmpFile);
  }
}

if (hasErrors) process.exit(1);
