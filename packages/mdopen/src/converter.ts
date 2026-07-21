import * as yaml from 'js-yaml';
import * as toml from 'toml';
import type { Theme } from './types';
import { type CompilerName, type CompilerOptions, getDefaultCompiler, getCompiler } from './compilers';
import { getHighlighter, extractLanguagesFromMarkdown, loadLanguages } from './highlighter';
import type { BundledLanguage } from 'shiki';

/** Extracts YAML or TOML frontmatter from markdown. */
function parseFrontmatter(markdown: string): { metadata: any, content: string } {
    // Check for TOML frontmatter (+++ delimiters)
    const tomlRegex = /^\+{3}\s*[\r\n]+([\s\S]*?)[\r\n]+\+{3}\s*([\r\n]+|$)/;
    const tomlMatch = markdown.match(tomlRegex);
    if (tomlMatch) {
        try {
            const tomlData = toml.parse(tomlMatch[1]);
            if (tomlData && typeof tomlData === 'object' && !Array.isArray(tomlData)) {
                return { metadata: tomlData, content: markdown.slice(tomlMatch[0].length) };
            }
        } catch (e) {
            // Not valid TOML - still strip it to prevent rendering
            return { metadata: {}, content: markdown.slice(tomlMatch[0].length) };
        }
    }

    // Check for YAML frontmatter (--- delimiters)
    const yamlRegex = /^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*([\r\n]+|$)/;
    const yamlMatch = markdown.match(yamlRegex);
    if (yamlMatch) {
        try {
            const yamlData = yaml.load(yamlMatch[1]);
            if (yamlData && typeof yamlData === 'object' && !Array.isArray(yamlData)) {
                return { metadata: yamlData, content: markdown.slice(yamlMatch[0].length) };
            }
        } catch (e) {
            // Not valid YAML - still strip it to prevent rendering
            return { metadata: {}, content: markdown.slice(yamlMatch[0].length) };
        }
    }

    return { metadata: {}, content: markdown };
}

/**
 * Post-process HTML to highlight code blocks using Shiki.
 * Replaces <pre><code class="language-xxx"> blocks with Shiki-highlighted versions.
 */
async function highlightCodeBlocks(html: string, markdown: string): Promise<string> {
  // Extract languages from the original markdown to pre-load them
  const languages = extractLanguagesFromMarkdown(markdown);
  
  // Get the highlighter and load needed languages
  const highlighter = await getHighlighter();
  await loadLanguages(highlighter, Array.from(languages));
  
  // Replace code blocks with Shiki-highlighted versions
  // Match <pre><code class="language-xxx">content</code></pre>
  const codeBlockRegex = /<pre><code class="language-([^"]+)">([\s\S]*?)<\/code><\/pre>/g;
  
  let result = html;
  let match;
  const seen: Set<string> = new Set();
  
  while ((match = codeBlockRegex.exec(html)) !== null) {
    const lang = match[1];
    const code = match[2];
    
    // Skip if we've already processed this exact block
    const key = `${lang}:${code.substring(0, 50)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    
    try {
      // Load language if not already loaded
      await highlighter.loadLanguage(lang as BundledLanguage).catch(() => {});
      
      // Highlight with Shiki
      const highlighted = highlighter.codeToHtml(code, {
        lang: (lang || 'text') as BundledLanguage,
        themes: { light: 'github-light', dark: 'github-dark' },
        defaultColor: false,
      });
      
      // Replace the code block with highlighted version
      // Shiki returns a <pre> element with classes, so we need to wrap it properly
      const replacement = `<pre class="shiki language-${lang}">${highlighted}</pre>`;
      result = result.replace(match[0], replacement);
    } catch {
      // If highlighting fails, keep the original
      continue;
    }
  }
  
  return result;
}

export async function convertMarkdownToHtml(
    markdown: string,
    theme: Theme = 'light',
    compiler?: CompilerName,
    compilerOptions?: CompilerOptions
): Promise<{ html: string, metadata: any, mermaidBlocks: string[] }> {
    const { metadata, content } = parseFrontmatter(markdown);
    const compilerName = compiler || getDefaultCompiler();
    const compilerImpl = getCompiler(compilerName);
    
    // Get compiler-specific options
    const options = compilerOptions?.[compilerName];
    
    // Compile markdown to HTML
    const { html, mermaidBlocks } = compilerImpl.compile(content, options);
    
    // Post-process: highlight code blocks with Shiki
    const highlightedHtml = await highlightCodeBlocks(html, content);
    
    return { html: highlightedHtml, metadata, mermaidBlocks };
}
