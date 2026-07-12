import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import abbr from 'markdown-it-abbr';
import attrs from 'markdown-it-attrs';
import footnote from 'markdown-it-footnote';
import ins from 'markdown-it-ins';
import mark from 'markdown-it-mark';
import sub from 'markdown-it-sub';
import sup from 'markdown-it-sup';
import taskLists from 'markdown-it-task-lists';
import type { Compiler } from './index';

interface MarkdownItOptions {
  breaks?: boolean;
  html?: boolean;
  linkify?: boolean;
  typographer?: boolean;
  xhtmlOut?: boolean;
  langPrefix?: string;
  plugins?: string[];
}

const defaults: MarkdownItOptions = {
  breaks: false,
  html: false,
  linkify: true,
  typographer: false,
  xhtmlOut: false,
  langPrefix: 'language-',
  plugins: ['abbr', 'attrs', 'footnote', 'ins', 'mark', 'sub', 'sup', 'tasklists'],
};

const description: Record<string, string> = {
  breaks: 'Convert \\n in paragraphs into <br>',
  html: 'Enable HTML tags in source',
  linkify: 'Autoconvert URL-like text to links',
  typographer: 'Enable some language-neutral replacement + quotes beautification',
  xhtmlOut: 'Use / to close single tags (<br />)',
  abbr: 'Abbreviation <abbr>',
  attrs: 'Custom attributes',
  footnote: 'Footnotes',
  ins: 'Inserted text <ins>',
  mark: 'Marked text <mark>',
  sub: 'Subscript <sub>',
  sup: 'Superscript <sup>',
  tasklists: 'Task lists',
};

function slugify(s: string): string {
  return s.toLowerCase()
    .replace(/[^\w\u4e00-\u9fff]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'heading';
}

function createCompiler(options: MarkdownItOptions = {}): MarkdownIt {
  const opts = { ...defaults, ...options };
  
  const md = new MarkdownIt({
    breaks: opts.breaks,
    html: opts.html,
    linkify: opts.linkify,
    typographer: opts.typographer,
    xhtmlOut: opts.xhtmlOut,
    langPrefix: opts.langPrefix || 'language-',
  });
  
  md.use(anchor, {
    slugify,
    permalink: anchor.permalink.ariaHidden({
      symbol: '<span class="octicon octicon-link"></span>',
      class: 'anchor',
    }),
  });
  
  const plugins = opts.plugins || [];
  if (plugins.includes('abbr')) md.use(abbr);
  if (plugins.includes('attrs')) md.use(attrs);
  if (plugins.includes('footnote')) md.use(footnote);
  if (plugins.includes('ins')) md.use(ins);
  if (plugins.includes('mark')) md.use(mark);
  if (plugins.includes('sub')) md.use(sub);
  if (plugins.includes('sup')) md.use(sup);
  if (plugins.includes('tasklists')) md.use(taskLists);
  
  return md;
}

/**
 * Markdown-it plugin to render Mermaid diagrams as <div> instead of <pre><code>
 * and collect the source blocks for validation.
 */
function mermaidPlugin(md: any) {
  const mermaidBlocks: string[] = [];
  const defaultFence = md.renderer.rules.fence;

  md.renderer.rules.fence = (tokens: any, idx: number, options: any, env: any, slf: any) => {
    const token = tokens[idx];
    const info = token.info.trim();

    if (info === 'mermaid') {
      const content = token.content.trim();
      mermaidBlocks.push(content);
      const escaped = content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `<div class="mermaid">${escaped}</div>`;
    }

    return defaultFence ? defaultFence(tokens, idx, options, env, slf) : '';
  };

  (md as any)._mermaidBlocks = mermaidBlocks;
}

export const markdownItCompiler: Compiler = {
  name: 'markdown-it',
  compile: (markdown: string, options?: MarkdownItOptions) => {
    const md = createCompiler(options);
    md.use(mermaidPlugin);
    const html = md.render(markdown);
    return {
      html,
      mermaidBlocks: (md as any)._mermaidBlocks || [],
    };
  },
};

