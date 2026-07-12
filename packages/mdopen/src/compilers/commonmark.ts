import * as commonmark from 'commonmark';
import type { Compiler } from './index';
import { extractMermaidBlocks, wrapMermaidDivs } from './mermaid-utils';

interface CommonmarkOptions {
  safe?: boolean;
  smart?: boolean;
}

const defaults: CommonmarkOptions = {
  safe: false,
  smart: false,
};

const description: Record<string, string> = {
  safe: 'Raw HTML will not be rendered',
  smart: 'Straight quotes will be made curly, -- will be changed to an en dash, --- will be changed to an em dash',
};

export const commonmarkCompiler: Compiler = {
  name: 'commonmark',
  compile: (markdown: string, options?: CommonmarkOptions) => {
    const opts = { ...defaults, ...options };
    const reader = new commonmark.Parser({ smart: opts.smart });
    const writer = new commonmark.HtmlRenderer({ safe: opts.safe });
    const html = writer.render(reader.parse(markdown));
    const mermaidBlocks = extractMermaidBlocks(markdown);
    return { 
      html: wrapMermaidDivs(html), 
      mermaidBlocks 
    };
  },
};

export { defaults, description };
