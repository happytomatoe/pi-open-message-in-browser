import * as yaml from 'js-yaml';
import * as toml from 'toml';
import type { Theme } from './types';
import { type CompilerName, type CompilerOptions, getDefaultCompiler, getCompiler } from './compilers';

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

export async function convertMarkdownToHtml(
    markdown: string,
    theme: Theme = 'light',
    compiler?: CompilerName,
    compilerOptions?: CompilerOptions
): Promise<{ html: string, metadata: any }> {
    const { metadata, content } = parseFrontmatter(markdown);
    const compilerName = compiler || getDefaultCompiler();
    const compilerImpl = getCompiler(compilerName);
    
    // Get compiler-specific options
    const options = compilerOptions?.[compilerName];
    
    // Compile markdown to HTML
    let html = compilerImpl.compile(content, options);
    
    // Post-process: add mermaid divs for code blocks with mermaid language
    html = html.replace(/<pre><code class="language-mermaid">(.*?)<\/code><\/pre>/gs, 
        '<div class="mermaid">$1</div>');
    
    return { html, metadata };
}
