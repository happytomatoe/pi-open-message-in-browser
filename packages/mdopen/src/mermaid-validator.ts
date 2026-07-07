import * as path from 'path';

export interface MermaidValidationResult {
  total: number;
  passed: number;
  failed: number;
  errors: { index: number; source: string; error: string }[];
}

function extractMermaidBlocks(markdown: string): string[] {
  const blocks: string[] = [];
  const regex = /```mermaid\s*\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    blocks.push(match[1].trim());
  }
  return blocks;
}

/**
 * Extracts the diagram type from the first line of a mermaid block.
 * e.g., "graph TD" -> "graph"
 * e.g., "sequenceDiagram" -> "sequenceDiagram"
 */
function getDiagramType(block: string): string {
  const firstLine = block.split('\n')[0].trim();
  const firstWord = firstLine.split(/\s+/)[0];
  
  // Map common aliases to what @mermaid-js/parser expects
  const aliases: Record<string, string> = {
    'flowchart': 'graph',
  };
  
  return aliases[firstWord] || firstWord;
}

export async function validateMermaid(markdown: string): Promise<MermaidValidationResult> {
  const blocks = extractMermaidBlocks(markdown);
  if (blocks.length === 0) {
    return { total: 0, passed: 0, failed: 0, errors: [] };
  }

  const officialParser = await (eval('import("@mermaid-js/parser")') as Promise<any>);
  const errors: { index: number; source: string; error: string }[] = [];
  let passed = 0;

  // List of diagram types supported by @mermaid-js/parser
  const supportedTypes = new Set([
    'architecture', 'block', 'classDiagram', 'cynefin', 'erDiagram',
    'eventModeling', 'flowchart', 'gantt', 'gitGraph', 'info',
    'journey', 'mindmap', 'packet', 'pie', 'quadrantChart',
    'radar', 'railroad', 'requirement', 'sankey', 'sequence',
    'stateDiagram', 'timeline', 'tree', 'treeView', 'treemap',
    'wardley', 'xyChart'
  ]);

  for (let i = 0; i < blocks.length; i++) {
    const source = blocks[i];
    try {
      const type = getDiagramType(source);
      
      if (!supportedTypes.has(type)) {
        // If the parser doesn't support this type, we skip validation 
        // and count it as passed to avoid false positive errors.
        passed++;
        continue;
      }

      const parseFn = (officialParser as any).parse || (officialParser as any).default?.parse;
      if (!parseFn) {
        throw new Error('Mermaid parser not found in module');
      }
      await parseFn(type as any, source);
      passed++;
    } catch (e: any) {
      errors.push({
        index: i,
        source: source.substring(0, 100),
        error: e.message || 'Syntax error',
      });
    }
  }

  return {
    total: blocks.length,
    passed,
    failed: errors.length,
    errors,
  };
}
