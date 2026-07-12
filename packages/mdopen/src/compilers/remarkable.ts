import { Remarkable } from 'remarkable';
import type { Compiler } from './index';
import { extractMermaidBlocks } from './mermaid-utils';

interface RemarkableOptions {
  breaks?: boolean;
  html?: boolean;
  linkify?: boolean;
  typographer?: boolean;
  xhtmlOut?: boolean;
  langPrefix?: string;
  quotes?: string;
}

const defaults: RemarkableOptions = {
  breaks: false,
  html: true,
  linkify: true,
  typographer: false,
  xhtmlOut: false,
  langPrefix: 'language-',
  quotes: '""\'\'',
};

const description: Record<string, string> = {
  breaks: 'Convert \\n in paragraphs into <br>',
  html: 'Enable HTML tags in source',
  linkify: 'Autoconvert URL-like text to links',
  typographer: 'Enable some language-neutral replacement + quotes beautification',
  xhtmlOut: 'Use / to close single tags (<br />)',
};

export const remarkableCompiler: Compiler = {
  name: 'remarkable',
  compile: (markdown: string, options?: RemarkableOptions) => {
    const opts = { ...defaults, ...options };
    const md = new Remarkable('full', opts);
    (md as any).renderer.code = function(code: string, lang: string, indented: boolean) {
      if (lang === 'mermaid') {
        return `<div class="mermaid">${code}</div>`;
      }
      return `<pre><code class="${lang ? 'language-' + lang : ''}">${code}</code></pre>`;
    };
    const html = md.render(markdown);

    const mermaidBlocks = extractMermaidBlocks(markdown);

    return { html, mermaidBlocks };
  },
};

