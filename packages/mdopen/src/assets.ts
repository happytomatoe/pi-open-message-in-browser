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

export async function getAssets(theme: Theme = 'light', markdown?: string): Promise<{ css: string, js: string }> {
    try {
        const cssPaths = getThemeCssPaths(theme);
        const mermaidJsPath = require.resolve('mermaid/dist/mermaid.min.js');

        // CSS: theme(s)
        let css = cssPaths.map(p => fs.readFileSync(p, 'utf8')).join('\n');

        // JS: Mermaid + Prism + Panzoom
        let js = '';

        // Mermaid
        js += fs.readFileSync(mermaidJsPath, 'utf8');

        // Prism
        const prismJsPath = require.resolve('prismjs/prism.js');
        js += '\n' + fs.readFileSync(prismJsPath, 'utf8');

        // Panzoom
        const panzoomJsPath = require.resolve('panzoom/dist/panzoom.min.js');
        js += '\n' + fs.readFileSync(panzoomJsPath, 'utf8');

        return { css, js };
    } catch (error) {
        console.error("Failed to load assets:", error);
        throw new Error("Required assets are missing. Please run 'bun run build:themes' first.");
    }
}
