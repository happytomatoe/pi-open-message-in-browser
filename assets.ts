import * as fs from 'fs';
import * as path from 'path';

const GITHUB_CSS_PATH = path.join(__dirname, 'node_modules', 'github-markdown-css', 'github-markdown.css');
const MERMAID_JS_PATH = path.join(__dirname, 'node_modules', 'mermaid', 'dist', 'mermaid.min.js');

export async function getAssets(): Promise<{ css: string, js: string }> {
    try {
        const css = fs.readFileSync(GITHUB_CSS_PATH, 'utf8');
        const js = fs.readFileSync(MERMAID_JS_PATH, 'utf8');
        return { css, js };
    } catch (error) {
        console.error("Failed to load assets from node_modules:", error);
        throw new Error("Required assets (GitHub CSS or Mermaid JS) are missing. Please run 'npm install'.");
    }
}
