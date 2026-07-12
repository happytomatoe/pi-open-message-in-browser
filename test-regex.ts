
import { extractMermaidBlocks } from './packages/mdopen/src/compilers/mermaid-utils';

const md = [
  '```mermaid',
  'A --> B',
  '```',
  '',
  '~~~mermaid',
  'C --> D',
  '~~~',
  '',
  '````mermaid',
  'E --> F',
  '````',
].join('\n');

console.log('Extracted blocks:', extractMermaidBlocks(md).map((b, i) => `Block ${i+1}: ${b}`));
