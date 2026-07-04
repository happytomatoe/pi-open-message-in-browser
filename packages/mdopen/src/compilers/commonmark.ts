import * as commonmark from 'commonmark';
import type { Compiler } from './index';

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
    const reader = new commonmark.Parser();
    const writer = new commonmark.HtmlRenderer(opts);
    return writer.render(reader.parse(markdown));
  },
};

export { defaults, description };
