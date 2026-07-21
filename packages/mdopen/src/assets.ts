import * as fs from 'fs';
import * as path from 'path';
import type { Theme } from './types';

const THEMES_DIR = path.resolve(__dirname, '../themes');

function getThemeCssPaths(theme: Theme): string[] {
    // Map legacy theme names
    if (theme === 'light') return [path.join(THEMES_DIR, 'github.css')];
    if (theme === 'dark') return [path.join(THEMES_DIR, 'github-dark.css')];
    if (theme === 'auto') return [path.join(THEMES_DIR, 'github.css')];

    const customPath = path.join(THEMES_DIR, `${theme}.css`);
    if (fs.existsSync(customPath)) {
        return [customPath];
    }

    return [path.join(THEMES_DIR, 'github.css')];
}

/**
 * Get Shiki CSS for theme switching using CSS variables.
 * Shiki emits inline styles with --shiki-light and --shiki-dark variables.
 */
function getShikiCss(): string {
    return `
/* Shiki CSS variables theme support */
@media (prefers-color-scheme: dark) {
  .shiki, .shiki span { color: var(--shiki-dark) !important; }
}
@media (prefers-color-scheme: light) {
  .shiki, .shiki span { color: var(--shiki-light) !important; }
}

/* Ensure code blocks have proper whitespace */
code[class*=language-], pre[class*=language-], pre.shiki, pre.shiki code {
  white-space: pre;
}
`;
}

export async function getAssets(theme: Theme = 'light', markdown?: string): Promise<{ css: string, js: string }> {
    try {
        const cssPaths = getThemeCssPaths(theme);
        const mermaidJsPath = require.resolve('mermaid/dist/mermaid.min.js');

        // CSS: theme(s) + Shiki CSS variables support
        let css = cssPaths.map(p => fs.readFileSync(p, 'utf8')).join('\n');
        css += '\n' + getShikiCss();

        // JS: Only mermaid and panzoom (no Prism.js needed - highlighting is server-side)
        let js = '';

        // Mermaid
        js += fs.readFileSync(mermaidJsPath, 'utf8');

        // Panzoom
        const panzoomJsPath = require.resolve('panzoom/dist/panzoom.min.js');
        js += '\n' + fs.readFileSync(panzoomJsPath, 'utf8');

        return { css, js };
    } catch (error) {
        console.error("Failed to load assets:", error);
        throw new Error("Required assets are missing. Please run 'bun run build:themes' first.");
    }
}
