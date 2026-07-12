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

// Removed getDiagramType as mermaid.parse detects it automatically

import { parse } from 'mermaid-parser-bundle';

export async function validateMermaid(markdown: string): Promise<MermaidValidationResult> {
  const blocks = extractMermaidBlocks(markdown);
  if (blocks.length === 0) {
    return { total: 0, passed: 0, failed: 0, errors: [] };
  }

  const errors: { index: number; source: string; error: string }[] = [];
  let passed = 0;

  for (let i = 0; i < blocks.length; i++) {
    const source = blocks[i];
    try {
      await parse(source);
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
