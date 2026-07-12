
import { validateMermaid } from './src/mermaid-validator';
import { convertMarkdownToHtml } from './src/converter';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const content = fs.readFileSync(path.resolve(__dirname, '../../test/all-markdown-elements.md'), 'utf8');
  const { mermaidBlocks } = await convertMarkdownToHtml(content);
  const result = await validateMermaid(mermaidBlocks);
  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
