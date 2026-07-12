export function extractMermaidBlocks(markdown: string): string[] {
  const blocks: string[] = [];
  const regex = /^([`~]{3,})mermaid\s*[\r\n]+([\s\S]*?)\1\s*$/gm;
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    blocks.push(match[2].trim());
  }
  return blocks;
}
