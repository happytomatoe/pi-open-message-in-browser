import { marked } from 'marked';
import { createHighlighter, bundledLanguages, type Highlighter } from 'shiki';
import type { Theme } from './types';

// Shiki themes to load. `auto` falls back to the light theme (same as the
// previous highlight.js-based behaviour, which had no OS-follow variant).
const SHIKI_THEME: Record<Theme, string> = {
    light: 'github-light',
    dark: 'github-dark',
    auto: 'github-light',
};

let highlighterPromise: Promise<Highlighter> | undefined;
const loadedLangs = new Set<string>(['plaintext']);

function getHighlighter(): Promise<Highlighter> {
    if (!highlighterPromise) {
        highlighterPromise = createHighlighter({
            themes: Object.values(SHIKI_THEME),
            langs: ['plaintext'],
        });
    }
    return highlighterPromise;
}

/** Collects the set of fenced-code-block languages used in the markdown, so we
 * only ask Shiki to load grammars that are actually needed (and recognised). */
function collectLanguages(markdown: string): string[] {
    const langs = new Set<string>();
    const fenceRe = /^```([^\s`]+)/gm;
    let match: RegExpExecArray | null;
    while ((match = fenceRe.exec(markdown))) {
        const lang = match[1].toLowerCase();
        if (lang !== 'mermaid' && lang in bundledLanguages) {
            langs.add(lang);
        }
    }
    return [...langs];
}

export async function convertMarkdownToHtml(markdown: string, theme: Theme = 'light'): Promise<string> {
    const highlighter = await getHighlighter();

    const wantedLangs = collectLanguages(markdown).filter(lang => !loadedLangs.has(lang));
    if (wantedLangs.length > 0) {
        await highlighter.loadLanguage(...(wantedLangs as never[]));
        wantedLangs.forEach(lang => loadedLangs.add(lang));
    }

    const shikiTheme = SHIKI_THEME[theme];
    const renderer = new marked.Renderer();

    renderer.code = function(code: string, infostring: string | undefined, _escaped: boolean) {
        const lang = infostring?.split(' ')[0]?.toLowerCase();
        if (lang === 'mermaid') {
            return `<div class="mermaid">${code}</div>`;
        }

        const language = lang && bundledLanguages[lang as keyof typeof bundledLanguages] ? lang : 'plaintext';
        return highlighter.codeToHtml(code, { lang: language, theme: shikiTheme });
    };

    marked.setOptions({ renderer });
    return marked.parse(markdown) as string;
}
