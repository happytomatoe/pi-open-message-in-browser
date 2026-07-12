import { marked } from 'marked';
import type { Compiler } from './index';
import { extractMermaidBlocks } from './mermaid-utils';

interface MarkedCompilerOptions {
  breaks?: boolean;
  gfm?: boolean;
  pedantic?: boolean;
}

const defaults: MarkedCompilerOptions = {
  breaks: false,
  gfm: true,
  pedantic: false,
};

const description: Record<string, string> = {
  breaks: 'Enable GFM line breaks',
  gfm: 'Enable GFM (GitHub Flavored Markdown)',
  pedantic: 'Don\'t fix any of the original markdown bugs or poor behavior',
};

export const markedCompiler: Compiler = {
  name: 'marked',
  compile: (markdown: string, options?: MarkedCompilerOptions) => {
    const opts = { ...defaults, ...options };

    const slugify = (s: string): string => {
      return s.toLowerCase()
        .replace(/[^\w\u4e00-\u9fff]+/g, '-')
        .replace(/^-+|-+$/g, '')
        || 'heading';
    };

    const headingIds = new Map<string, number>();
    const getUniqueSlug = (raw: string): string => {
      const slug = slugify(raw);
      const count = headingIds.get(slug) || 0;
      headingIds.set(slug, count + 1);
      return count === 0 ? slug : `${slug}-${count}`;
    };

    const renderer = new marked.Renderer();
    renderer.heading = function(text: string, level: number, raw: string) {
      const id = getUniqueSlug(raw);
      return `<h${level} id="${id}"><a class="anchor" name="${id}" href="#${id}"><span class="octicon octicon-link"></span></a>${text}</h${level}>`;
    };
    renderer.code = function(code, language, indented) {
      if (language === 'mermaid') {
        return `<div class="mermaid">${code}</div>`;
      }
      return `<pre><code class="${language ? 'language-' + language : ''}">${code}</code></pre>`;
    };

    // Use per-call options to avoid mutating global state
    const html = marked.parse(markdown, {
      renderer,
      breaks: opts.breaks,
      gfm: opts.gfm,
      pedantic: opts.pedantic,
    }) as string;

    const mermaidBlocks = extractMermaidBlocks(markdown);

    return { html, mermaidBlocks };
  },
};

