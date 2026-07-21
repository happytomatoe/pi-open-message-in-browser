import { createHighlighter, type Highlighter, type BundledLanguage } from 'shiki';

let highlighterPromise: Promise<Highlighter> | null = null;

/**
 * Get or create the Shiki highlighter singleton.
 * Creates a highlighter with github-light and github-dark themes.
 */
export function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-light', 'github-dark'],
      langs: [], // Start empty, load on demand
    });
  }
  return highlighterPromise;
}

/**
 * Load required languages into the highlighter.
 * Swallows errors for unknown languages.
 */
export async function loadLanguages(highlighter: Highlighter, languages: string[]): Promise<void> {
  await Promise.all(
    languages.map((lang) => highlighter.loadLanguage(lang as BundledLanguage).catch(() => {}))
  );
}

/**
 * Extract unique language identifiers from fenced code blocks in markdown.
 * Returns the set of languages needed for highlighting.
 */
export function extractLanguagesFromMarkdown(markdown: string): Set<string> {
  const codeBlockRegex = /^```(\w+)/gm;
  const matches = markdown.match(codeBlockRegex);
  
  if (!matches) return new Set();
  
  const rawLanguages = matches.map((m) => m.replace(/```/g, ''));
  
  // Map markdown language names to Shiki language names
  const LANGUAGE_MAPPING: Record<string, string> = {
    'asm': 'asm6502',
    'dockerfile': 'docker',
    'html': 'html',
    'xml': 'xml',
    'svg': 'xml',
    'sh': 'bash',
    'shell': 'bash',
    'js': 'javascript',
    'ts': 'typescript',
    'md': 'markdown',
    'py': 'python',
    'rb': 'ruby',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'go': 'go',
    'rs': 'rust',
    'java': 'java',
    'kt': 'kotlin',
    'php': 'php',
    'swift': 'swift',
    'scala': 'scala',
    'r': 'r',
    'dart': 'dart',
    'lua': 'lua',
    'perl': 'perl',
    'elixir': 'elixir',
    'haskell': 'haskell',
    'clojure': 'clojure',
    'ocaml': 'ocaml',
    'fsharp': 'fsharp',
    'erlang': 'erlang',
    'julia': 'julia',
    'zig': 'zig',
    'sql': 'sql',
    'graphql': 'graphql',
    'docker': 'docker',
    'toml': 'toml',
    'nginx': 'nginx',
    'makefile': 'makefile',
    'cmake': 'cmake',
    'latex': 'latex',
    'tex': 'latex',
    'solidity': 'solidity',
    'asm6502': 'asm6502',
    'regex': 'regex',
    'diff': 'diff',
    'yaml': 'yaml',
    'json': 'json',
    'markdown': 'markdown',
  };
  
  const languages = new Set<string>();
  for (const lang of rawLanguages) {
    const lowerLang = lang.toLowerCase();
    const mapped = LANGUAGE_MAPPING[lowerLang] || lowerLang;
    languages.add(mapped);
  }
  
  return languages;
}


