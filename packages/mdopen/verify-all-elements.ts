
import { validateMermaid } from './src/mermaid-validator';
import * as fs from 'fs';

async function main() {
  const file = 'test/all-markdown-elements.md';
  const content = fs.readFileSync(file, 'utf8');
  const result = await validateMermaid(content);
  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
