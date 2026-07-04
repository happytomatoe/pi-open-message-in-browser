import * as yaml from 'js-yaml';
import * as toml from 'toml';
import type { Theme } from './types';
import { type CompilerName, type CompilerOptions, getDefaultCompiler, getCompiler } from './compilers';

/** Extracts YAML or TOML frontmatter from markdown. */
function parseFrontmatter(markdown: string): { metadata: any, content: string } {
    const regex = /^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*([\r\n]+|$)/;
    const match = markdown.match(regex);
    if (!match) {
        return { metadata: {}, content: markdown };
    }
    
    const frontmatter = match[1];
    let metadata: any = {};
    
    try {
        const yamlData = yaml.load(frontmatter);
        if (yamlData && typeof yamlData === 'object' && !Array.isArray(yamlData)) {
            metadata = yamlData;
        } else {
            throw new Error('Not a YAML object');
        }
    } catch (e) {
        try {
            const tomlData = toml.parse(frontmatter);
            if (tomlData && typeof tomlData === 'object' && !Array.isArray(tomlData)) {
                metadata = tomlData;
            } else {
                throw new Error('Not a TOML object');
            }
        } catch (e2) {
            console.warn("Failed to parse frontmatter as YAML or TOML");
        }
    }
    
    return { metadata, content: markdown.slice(match[0].length) };
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
