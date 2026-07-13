import { describe, it, expect } from 'bun:test';
import { generateHtmlDocument } from '../src/template';

const MERMAID_BODY = `### Mermaid

\`\`\`mermaid
graph TD
  A[Start] --> B[End]
\`\`\`
`;

function render(): string {
  return generateHtmlDocument(MERMAID_BODY, '/* css */', '/* mermaid js */', 'github', false, {}, undefined, false, false);
}

describe('mermaid pan/zoom template', () => {
  const html = render();

  it('inlines the panzoom library', () => {
    expect(html).toContain('createPanZoom');
    expect(html).toContain('window.panzoom');
  });

  it('injects the pan/zoom toolbar', () => {
    expect(html).toContain('mermaid-panzoom-toolbar');
    expect(html).toContain('mermaid-panzoom-btn');
  });

  it('orders toolbar buttons Zoom Out, Zoom In, Fullscreen', () => {
    const zoomOut = html.indexOf('aria-label="Zoom out"');
    const zoomIn = html.indexOf('aria-label="Zoom in"');
    const fullscreen = html.indexOf('aria-label="Fullscreen"');
    expect(zoomOut).toBeGreaterThan(-1);
    expect(zoomIn).toBeGreaterThan(-1);
    expect(fullscreen).toBeGreaterThan(-1);
    expect(zoomOut).toBeLessThan(zoomIn);
    expect(zoomIn).toBeLessThan(fullscreen);
  });

  it('makes diagrams focusable with accessibility attributes', () => {
    expect(html).toContain("aria-label', 'Mermaid diagram with pan and zoom controls'");
    expect(html).toContain("role', 'region'");
  });

  it('includes the CSS for the toolbar', () => {
    expect(html).toContain('.mermaid-panzoom-toolbar');
    expect(html).toContain('.mermaid-panzoom-btn');
  });

  it('wires keyboard navigation (arrows pan, +/- zoom, f fullscreen)', () => {
    const scriptStart = html.indexOf('// Keyboard navigation');
    const scriptEnd = html.indexOf('</script>', scriptStart);
    const script = html.slice(scriptStart, scriptEnd);
    expect(script).toContain("'ArrowLeft'");
    expect(script).toContain("'ArrowRight'");
    expect(script).toContain("'ArrowUp'");
    expect(script).toContain("'ArrowDown'");
    expect(script).toContain("'+'");
    expect(script).toContain("'-'");
    expect(script).toContain("'f'");
    expect(script).toContain("'F'");
    expect(script).toContain('pz.smoothZoom');
    expect(script).toContain('requestFullscreen');
  });

  it('stores the panzoom instance on the SVG for later access', () => {
    expect(html).toContain('diagram.__panzoom = pz');
  });
});
