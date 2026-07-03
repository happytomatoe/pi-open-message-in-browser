import { marked } from 'marked';

const renderer = new marked.Renderer();

renderer.code = function(code: string, infostring: string | undefined, escaped: boolean) {
    const lang = infostring?.split(' ')[0];
    if (lang === 'mermaid') {
        return `<div class="mermaid">${code}</div>`;
    }
    // Default code block rendering
    return `<pre><code class="language-${lang || 'text'}">${code}</code></pre>`;
};

marked.setOptions({ renderer });

export function convertMarkdownToHtml(markdown: string): string {
    return marked.parse(markdown) as string;
}
