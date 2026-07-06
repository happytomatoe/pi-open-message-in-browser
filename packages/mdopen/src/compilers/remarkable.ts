import { Remarkable } from 'remarkable';
import type { Compiler } from './index';

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
    return md.render(markdown);
  },
};

export { defaults, description };
