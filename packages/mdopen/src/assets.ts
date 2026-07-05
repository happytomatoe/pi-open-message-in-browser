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

function isDarkTheme(theme: Theme): boolean {
    if (theme === 'dark' || theme === 'github-dark') return true;
    if (theme === 'retro' || theme === 'sakura-vader' || theme === 'water-dark') return true;
    return false;
}

function prismCssForTheme(theme: Theme): string {
    return isDarkTheme(theme)
        ? path.join(THEMES_DIR, 'prism-dark.css')
        : path.join(THEMES_DIR, 'prism.css');
}

const PRISM_LANGUAGES = [
    'javascript',
    'typescript',
    'css',
    'markup',
    'bash',
    'python',
    'json',
    'yaml',
];

export async function getAssets(theme: Theme = 'light'): Promise<{ css: string, js: string }> {
    try {
        const cssPaths = getThemeCssPaths(theme);
        const prismCssPath = prismCssForTheme(theme);
        const mermaidJsPath = require.resolve('mermaid/dist/mermaid.min.js');
        const prismJsPath = require.resolve('prismjs');

        // CSS: theme(s) + prism
        let css = cssPaths.map(p => fs.readFileSync(p, 'utf8')).join('\n');
        css += '\n' + fs.readFileSync(prismCssPath, 'utf8');

        // JS: Prism core + common languages
        let js = fs.readFileSync(prismJsPath, 'utf8');

        for (const lang of PRISM_LANGUAGES) {
            try {
                const langPath = path.join(path.dirname(prismJsPath), 'components', `prism-${lang}.js`);
                if (fs.existsSync(langPath)) {
                    js += '\n' + fs.readFileSync(langPath, 'utf8');
                }
            } catch (e) {
                // Skip missing languages
            }
        }

        // Mermaid
        js += '\n' + fs.readFileSync(mermaidJsPath, 'utf8');

        // Panzoom
        const panzoomJsPath = require.resolve('panzoom/dist/panzoom.min.js');
        js += '\n' + fs.readFileSync(panzoomJsPath, 'utf8');

        return { css, js };
    } catch (error) {
        console.error("Failed to load assets:", error);
        throw new Error("Required assets are missing. Please run 'bun run build:themes' first.");
    }
}
