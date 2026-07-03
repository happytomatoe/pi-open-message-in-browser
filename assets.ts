import * as fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export async function getAssets(): Promise<{ css: string, js: string }> {
    try {
        const cssPath = require.resolve('github-markdown-css/github-markdown.css');
        const jsPath = require.resolve('mermaid/dist/mermaid.min.js');
        
        const css = fs.readFileSync(cssPath, 'utf8');
        const js = fs.readFileSync(jsPath, 'utf8');
        return { css, js };
    } catch (error) {
        console.error("Failed to load assets:", error);
        throw new Error("Required assets (GitHub CSS or Mermaid JS) are missing. Please ensure dependencies are installed.");
    }
}
