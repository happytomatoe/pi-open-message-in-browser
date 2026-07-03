import * as fs from 'node:fs';
import { createRequire } from 'node:module';
import type { Theme } from './settings';

const require = createRequire(import.meta.url);

function cssFileForTheme(theme: Theme): string {
    switch (theme) {
        case 'dark':
            return 'github-markdown-css/github-markdown-dark.css';
        case 'light':
            return 'github-markdown-css/github-markdown-light.css';
        case 'auto':
        default:
            // Follows the OS/browser prefers-color-scheme media query.
            return 'github-markdown-css/github-markdown.css';
    }
}

export async function getAssets(theme: Theme = 'light'): Promise<{ css: string, js: string }> {
    try {
        const cssPath = require.resolve(cssFileForTheme(theme));
        const jsPath = require.resolve('mermaid/dist/mermaid.min.js');

        const css = fs.readFileSync(cssPath, 'utf8');
        const js = fs.readFileSync(jsPath, 'utf8');
        return { css, js };
    } catch (error) {
        console.error("Failed to load assets:", error);
        throw new Error("Required assets (GitHub CSS or Mermaid JS) are missing. Please ensure dependencies are installed.");
    }
}
