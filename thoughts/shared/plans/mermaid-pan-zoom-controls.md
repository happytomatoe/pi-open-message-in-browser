# Mermaid Pan/Zoom Controls Implementation Plan

## Overview
Add GitHub-style interactive pan/zoom controls and keyboard navigation for Mermaid diagrams in mdopen. This enhances the existing `panzoom` library integration with a visible toolbar (reset, zoom out, zoom in buttons) and keyboard shortcuts (arrow keys for pan, +/- for zoom, 0 for reset).

## Current State Analysis
- **File**: `packages/mdopen/src/template.ts` (lines 556-572)
- **Current implementation**: Uses `panzoom` library (anvaka/panzoom) initialized on Mermaid SVG elements
- **Current features**: 
  - Shift + mouse wheel → zoom at cursor
  - Click + drag → pan
- **Missing features**:
  - No visible zoom toolbar/buttons (GitHub-style)
  - No keyboard navigation (arrow keys for pan, +/- for zoom, 0 for reset)
  - No focus management for keyboard shortcuts

### Key Discoveries:
1. **panzoom library** (v9.4.4) already installed at monorepo level - provides `panzoom(element, options)` with methods: `moveTo()`, `moveBy()`, `zoomTo()`, `smoothZoom()`, `getTransform()`, `zoomWithWheel()`, `smoothMoveTo()`, `zoomAbs()`
2. **Mermaid diagrams** are rendered as `<svg>` inside `<div class="mermaid">` (template.ts:470-474)
3. **HTML template** generates a complete HTML document with embedded JavaScript (template.ts:67-629)
4. **Visual tests** in `packages/mdopen/scripts/visual-test.ts` test 30 themes with Mermaid diagrams
5. **Current panzoom code** (lines 556-572) creates panzoom instance but doesn't store it for later access

## Desired End State
Mermaid diagrams in generated HTML will have:

### Visual Toolbar (appears on hover/focus) - GitHub Style
- **Reset (⟲)** button - fits diagram to viewport
- **Zoom Out (-)** button - decreases zoom level  
- **Zoom In (+)** button - increases zoom level

*Note: Order matches GitHub/mermaid-live-editor: Reset, Zoom Out, Zoom In (left to right)*

### Keyboard Shortcuts (when diagram is focused)
| Key | Action |
|-----|--------|
| `←` / `→` | Pan left / right (50px per press) |
| `↑` / `↓` | Pan up / down (50px per press) |
| `+` / `=` | Zoom in |
| `-` / `_` | Zoom out |
| `0` | Reset zoom to fit |
| `Tab` | Focus diagram for keyboard control |
| `Escape` | Blur diagram (optional, for future fullscreen) |

### Mouse Interactions (preserved/enhanced)
- **Shift + wheel** - zoom at cursor (already works)
- **Click + drag** - pan (already works via panzoom)
- **Wheel** (without shift) - could add vertical pan or scroll page (TBD)

## What We're NOT Doing
- Fullscreen modal/lightbox (future enhancement)
- Touch gestures (pinch-to-zoom) - panzoom handles this natively
- Diagram type-specific controls
- Persistence of zoom/pan state across page loads
- Export/download buttons

## Implementation Approach
Extend the existing panzoom initialization in `template.ts` to:
1. **Store panzoom instance** on SVG element for later access
2. **Add toolbar HTML/CSS** - injected into each mermaid container on hover
3. **Add keyboard event handlers** - for arrow keys, +/-, 0
4. **Add focus management** - make diagrams focusable for keyboard access
5. **Wire toolbar buttons** - to panzoom API methods

The implementation will be pure client-side JavaScript embedded in the generated HTML template.

## Phase 1: Core Panzoom Enhancement & Toolbar

### Overview
Add the zoom toolbar UI and wire it to panzoom API. Add keyboard event handlers for pan/zoom.

### Changes Required:

#### 1. File: `packages/mdopen/src/template.ts`
**Location A**: Lines 556-572 (existing panzoom initialization block) - **MODIFY** to store panzoom instance
**Location B**: After line 572 (after the panzoom initialization block) - **ADD** toolbar & keyboard code

**Changes at Location A (modify existing code)**:
- Store panzoom instance on SVG element: `diagram.__panzoom = panzoom`

**Changes at Location B (add new code)**:
- Add CSS for toolbar (hidden by default, shown on hover/focus)
- Add toolbar HTML injection for each mermaid diagram
- Add keyboard event listeners for arrow keys, +/-, 0
- Add focus/blur handlers for keyboard accessibility
- Wire toolbar buttons to panzoom methods

```typescript
// MODIFICATION at Location A (lines 556-572): Add storage of panzoom instance
// Find the existing panzoom initialization block and add: diagram.__panzoom = panzoom;
// after line 564 (var panzoom = Panzoom(diagram, {canvas: true});)

// Example of modified block:
    svg.forEach((diagram) => {
      var panzoom = Panzoom(diagram, {canvas: true});
      diagram.__panzoom = panzoom;  // ADD THIS LINE
      diagram.parentElement.parentElement.addEventListener('wheel', (e) => {
        if (!e.shiftKey) return;
        panzoom.zoomWithWheel(e);
      });
    });

// ADDITION at Location B (after line 572):
// Mermaid Pan/Zoom Toolbar & Keyboard Navigation

// Toolbar CSS (injected into page styles)
const toolbarCSS = `
.mermaid-panzoom-toolbar {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  padding: 4px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 6px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  z-index: 10;
}
.mermaid:hover .mermaid-panzoom-toolbar,
.mermaid:focus-within .mermaid-panzoom-toolbar,
.mermaid-panzoom-toolbar:hover {
  opacity: 1;
  pointer-events: auto;
}
.mermaid-panzoom-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #fff;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  transition: background 0.15s ease;
}
.mermaid-panzoom-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}
.mermaid-panzoom-btn:active {
  background: rgba(255, 255, 255, 0.3);
}
.mermaid-panzoom-btn:focus {
  outline: 2px solid #58a6ff;
  outline-offset: 2px;
}
.mermaid-panzoom-btn svg {
  width: 16px;
  height: 16px;
}
._theme-github-dark .mermaid-panzoom-toolbar,
._color-dark .mermaid-panzoom-toolbar {
  background: rgba(0, 0, 0, 0.85);
}
@media (prefers-color-scheme: dark) {
  ._color-auto .mermaid-panzoom-toolbar {
    background: rgba(0, 0, 0, 0.85);
  }
}
`;

// Inject toolbar CSS
const styleEl = document.createElement('style');
styleEl.textContent = toolbarCSS;
document.head.appendChild(styleEl);

// SVG icons for toolbar buttons (GitHub/mermaid-live-editor style)
const resetIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>';
const zoomOutIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>';
const zoomInIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>';

// Create toolbar for each mermaid diagram
var diagrams = document.querySelectorAll('div.mermaid');
diagrams.forEach(function(container) {
  var svg = container.querySelector('svg');
  if (!svg) return;
  
  // Make container focusable for keyboard navigation
  container.setAttribute('tabindex', '0');
  container.setAttribute('role', 'region');
  container.setAttribute('aria-label', 'Mermaid diagram with pan and zoom controls');
  
  // Create toolbar (GitHub/mermaid-live-editor order: Reset, Zoom Out, Zoom In)
  var toolbar = document.createElement('div');
  toolbar.className = 'mermaid-panzoom-toolbar';
  toolbar.innerHTML = 
    '<button class="mermaid-panzoom-btn" aria-label="Reset zoom" title="Reset zoom (0)">' + resetIcon + '</button>' +
    '<button class="mermaid-panzoom-btn" aria-label="Zoom out" title="Zoom out (-)">' + zoomOutIcon + '</button>' +
    '<button class="mermaid-panzoom-btn" aria-label="Zoom in" title="Zoom in (+)">' + zoomInIcon + '</button>';
  container.appendChild(toolbar);
  
  // Wait for panzoom to be initialized on this SVG
  var pzCheck = setInterval(function() {
    var panzoom = svg.__panzoom;
    if (panzoom) {
      clearInterval(pzCheck);
      
      // Wire toolbar buttons (order: Reset, Zoom Out, Zoom In)
      var buttons = toolbar.querySelectorAll('.mermaid-panzoom-btn');
      // Reset button (index 0)
      buttons[0].addEventListener('click', function(e) {
        e.stopPropagation();
        panzoom.moveTo(0, 0);
        panzoom.zoomAbs(0, 0, 1);
      });
      // Zoom Out button (index 1)
      buttons[1].addEventListener('click', function(e) {
        e.stopPropagation();
        panzoom.smoothZoom(svg.clientWidth / 2, svg.clientHeight / 2, 1/1.2);
      });
      // Zoom In button (index 2)
      buttons[2].addEventListener('click', function(e) {
        e.stopPropagation();
        panzoom.smoothZoom(svg.clientWidth / 2, svg.clientHeight / 2, 1.2);
      });
      
      // Keyboard navigation (panzoom has built-in support but needs focusable element)
      // Arrow keys pan, +/- zoom, 0 reset
      container.addEventListener('keydown', function(e) {
        var transform = panzoom.getTransform();
        var scale = transform.scale;
        var step = 50 / scale; // 50px in screen coordinates
        
        switch(e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            panzoom.moveBy(step, 0);
            break;
          case 'ArrowRight':
            e.preventDefault();
            panzoom.moveBy(-step, 0);
            break;
          case 'ArrowUp':
            e.preventDefault();
            panzoom.moveBy(0, step);
            break;
          case 'ArrowDown':
            e.preventDefault();
            panzoom.moveBy(0, -step);
            break;
          case '+':
          case '=':
            e.preventDefault();
            panzoom.smoothZoom(svg.clientWidth / 2, svg.clientHeight / 2, 1.2);
            break;
          case '-':
          case '_':
            e.preventDefault();
            panzoom.smoothZoom(svg.clientWidth / 2, svg.clientHeight / 2, 1/1.2);
            break;
          case '0':
            e.preventDefault();
            panzoom.moveTo(0, 0);
            panzoom.zoomAbs(0, 0, 1);
            break;
        }
      });
      
      // Visual focus indicator
      container.addEventListener('focus', function() {
        container.style.outline = '2px solid #58a6ff';
        container.style.outlineOffset = '2px';
      });
      container.addEventListener('blur', function() {
        container.style.outline = 'none';
      });
    }
  }, 50);
});
```

### Success Criteria:

#### Automated Verification:
- [ ] Build passes: `cd packages/mdopen && bun run build`
- [ ] Visual regression tests pass: `cd packages/mdopen && bun run test`

#### Manual Verification:
- [ ] Open a markdown file with Mermaid diagram: `mdopen test/markdown-mermaid-research.md`
- [ ] Hover over diagram → toolbar appears with 3 buttons (⟲, -, +) in GitHub order
- [ ] Click "⟲" (Reset) → diagram resets to fit
- [ ] Click "-" (Zoom Out) → diagram zooms out  
- [ ] Click "+" (Zoom In) → diagram zooms in
- [ ] Click diagram → focus outline appears
- [ ] Arrow keys → pan diagram left/right/up/down
- [ ] "+" key → zoom in
- [ ] "-" key → zoom out
- [ ] "0" key → reset zoom to fit
- [ ] Shift + wheel → zoom at cursor (existing behavior preserved)
- [ ] Click + drag → pan diagram (existing behavior preserved)

## Phase 2: Polish & Edge Cases

### Overview
Handle edge cases: multiple diagrams, theme compatibility, accessibility, mobile touch.

### Changes Required:

#### 1. File: `packages/mdopen/src/template.ts`
**Additional enhancements**:
- Ensure toolbar works with all 30 themes (test via visual regression)
- Add touch-friendly sizing for mobile
- Ensure keyboard focus doesn't conflict with page scroll
- Add `aria-label` and `title` attributes for accessibility

### Success Criteria:

#### Automated Verification:
- [ ] Visual regression tests pass for all 30 themes

#### Manual Verification:
- [ ] Test with multiple diagrams on same page
- [ ] Test with different themes (github, github-dark, etc.)
- [ ] Test keyboard navigation doesn't interfere with page scroll when not focused
- [ ] Test on mobile/touch device (toolbar visible, pinch-to-zoom works)

## Testing Strategy

### Unit Tests:
- Not applicable (client-side only, tested via visual regression)

### Integration Tests:
- Visual regression tests already cover 30 themes with Mermaid diagrams
- Run: `cd packages/mdopen && bun run test`

### Manual Testing Steps:
1. Create test markdown with various Mermaid diagram types (flowchart, sequence, class, etc.)
2. Run `mdopen test-file.md --no-open --out test-output.html`
3. Open `test-output.html` in browser
4. Verify all interactions work

## Performance Considerations
- Toolbar CSS is minimal (~1KB)
- Event listeners only added after panzoom initializes (50ms interval check)
- No memory leaks - intervals cleared after initialization
- Panzoom library is lightweight (~3KB gzipped)

## Migration Notes
- No breaking changes - existing behavior preserved
- New features are additive (toolbar appears on hover, keyboard works on focus)
- No configuration needed - works out of the box

## References
- Current panzoom implementation: `packages/mdopen/src/template.ts:556-572`
- Visual test script: `packages/mdopen/scripts/visual-test.ts`
- Panzoom library: `panzoom` (anvaka/panzoom) v9.4.4 - already in monorepo dependencies
- Mermaid test file: `test/markdown-mermaid-research.md`
- GitHub-style toolbar reference: GitHub's Mermaid diagram viewer (via mermaid-live-editor open source)
- Similar implementations researched: mkdocs-panzoom, mermaid-diagram-pan-zoom, obsidian-mermaid-zoom
- mermaid-live-editor panZoom: `src/lib/util/panZoom.ts`, `src/lib/components/PanZoomToolbar.svelte`