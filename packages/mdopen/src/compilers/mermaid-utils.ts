export function extractMermaidBlocks(markdown: string): string[] {
  const blocks: string[] = [];
  const regex = /^ {0,3}([`~]{3,})mermaid\s*[\r\n]+([\s\S]*?)\1\s*$/gm;
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    blocks.push(match[2].trim());
  }
  return blocks;
}

export function wrapMermaidDivs(html: string): string {
  return html.replace(/<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/gs, 
    '<div class="mermaid">$1</div>');
}
