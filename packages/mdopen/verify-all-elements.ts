
import { validateMermaid } from './src/mermaid-validator';
import { convertMarkdownToHtml } from './src/converter';
import * as fs from 'fs';

async function main() {
  const file = 'test/all-markdown-elements.md';
  const content = fs.readFileSync(file, 'utf8');
  const { mermaidBlocks } = await convertMarkdownToHtml(content);
  const result = await validateMermaid(mermaidBlocks);
  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
