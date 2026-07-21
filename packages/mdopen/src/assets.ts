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

/**
 * Extract unique code block language identifiers from markdown content.
 * Matches code blocks like: ```c, ```cpp, ```javascript, etc.
 */
export function extractCodeBlockLanguages(markdown: string): string[] {
    // Match all code fence blocks: ```language
    const codeBlockRegex = /^```(\w+)/gm;
    const matches = markdown.match(codeBlockRegex);
    
    if (!matches) return [];
    
    // Extract language names and deduplicate
    const rawLanguages = matches.map(m => m.replace(/```/g, ''));
    
    // Map markdown language names to PrismJS component names
    const LANGUAGE_MAPPING: { [key: string]: string } = {
        'asm': 'asm6502',      // Assembly -> asm6502
        'dockerfile': 'docker', // Dockerfile -> docker
        'html': 'markup',      // HTML -> markup (already in defaults)
    };
    
    // Apply mapping and deduplicate
    const languages = rawLanguages.map(lang => LANGUAGE_MAPPING[lang] || lang);
    return [...new Set(languages)];
}

/**
 * Default languages to always include (for backward compatibility and common use)
 * Order matters: dependencies like 'clike' must come before languages that depend on them
 */
const DEFAULT_LANGUAGES = [
    // Core dependencies first
    'clike',
    // Original 8
    'javascript',
    'typescript',
    'css',
    'markup',
    'bash',
    'python',
    'json',
    'yaml',
    // Additional languages from the plan (ordered by dependency)
    'c',
    'cpp',
    'csharp',
    'go',
    'rust',
    'java',
    'kotlin',
    'ruby',
    'php',
    'swift',
    'scala',
    'r',
    'dart',
    'lua',
    'perl',
    'elixir',
    'haskell',
    'clojure',
    'ocaml',
    'fsharp',
    'erlang',
    'julia',
    'zig',
    'sql',
    'graphql',
    'docker',
    'toml',
    'nginx',
    'makefile',
    'cmake',
    'latex',
    'solidity',
    'asm6502',
    'regex',
    'diff',
    'markup-templating',
    'django',
    'twig',
];

/**
 * Get the list of languages to load for PrismJS.
 * If markdown is provided, extracts languages from code blocks and adds defaults.
 * Otherwise, uses only default languages for backward compatibility.
 */
function getLanguagesToLoad(markdown?: string): string[] {
    // For now, always load all default languages
    // Dynamic detection is kept for future optimization
    return [...DEFAULT_LANGUAGES];
}


export async function getAssets(theme: Theme = 'light', markdown?: string): Promise<{ css: string, js: string }> {
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

        const languagesToLoad = getLanguagesToLoad(markdown);
        for (const lang of languagesToLoad) {
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

        // Add aliases for language mappings (asm -> asm6502, dockerfile -> docker, html -> markup)
        // These must be added after all language components are loaded
        js += '\n// Language aliases for markdown code blocks\n';
        js += 'if (typeof Prism !== "undefined") {\n';
        js += '  if (Prism.languages.asm6502 && !Prism.languages.asm) Prism.languages.asm = Prism.languages.asm6502;\n';
        js += '  if (Prism.languages.docker && !Prism.languages.dockerfile) Prism.languages.dockerfile = Prism.languages.docker;\n';
        js += '  if (Prism.languages.markup && !Prism.languages.html) Prism.languages.html = Prism.languages.markup;\n';
        js += '}\n';

        return { css, js };
    } catch (error) {
        console.error("Failed to load assets:", error);
        throw new Error("Required assets are missing. Please run 'bun run build:themes' first.");
    }
}