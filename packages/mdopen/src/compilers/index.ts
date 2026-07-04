export type CompilerName = 'markdown-it' | 'marked' | 'commonmark' | 'remarkable';

export type CompilerOptions = {
  [key in CompilerName]?: any;
};

export interface Compiler {
  name: CompilerName;
  compile(markdown: string, options?: any): string;
}

import { markdownItCompiler } from './markdown-it';
import { markedCompiler } from './marked';
import { commonmarkCompiler } from './commonmark';
import { remarkableCompiler } from './remarkable';

const COMPILERS: Record<string, Compiler> = {
  'markdown-it': markdownItCompiler,
  'marked': markedCompiler,
  'commonmark': commonmarkCompiler,
  'remarkable': remarkableCompiler,
};

let defaultCompiler: CompilerName = 'markdown-it';

export function setDefaultCompiler(name: CompilerName): void {
  defaultCompiler = name;
}

export function getDefaultCompiler(): CompilerName {
  return defaultCompiler;
}

export function getCompiler(name: CompilerName): Compiler {
  return COMPILERS[name] || COMPILERS['markdown-it'];
}
