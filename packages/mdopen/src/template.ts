import type { Theme } from './types';
import { EMOJI_SCRIPT } from './vendor/emoji';

// Theme color mapping (light/dark/auto) from markdown-viewer
const THEME_COLORS: Record<string, string> = {
  'github': 'light',
  'github-dark': 'dark',
  'almond': 'light',
  'awsm': 'light',
  'axist': 'light',
  'bamboo': 'auto',
  'bullframe': 'light',
  'holiday': 'auto',
  'kacit': 'light',
  'latex': 'light',
  'marx': 'light',
  'mini': 'light',
  'modest': 'light',
  'new': 'auto',
  'no-class': 'auto',
  'pico': 'auto',
  'retro': 'dark',
  'sakura': 'light',
  'sakura-vader': 'dark',
  'semantic': 'light',
  'simple': 'auto',
  'style-sans': 'light',
  'style-serif': 'light',
  'stylize': 'light',
  'superstylin': 'auto',
  'tacit': 'light',
  'vanilla': 'auto',
  'water': 'light',
  'water-dark': 'dark',
  'writ': 'light',
};

// Map legacy theme names to new names for backward compatibility
const THEME_ALIASES: Record<string, string> = {
  'light': 'github',
  'dark': 'github-dark',
};

function resolveThemeName(theme: Theme): string {
  return THEME_ALIASES[theme] || theme;
}

function isGitHubTheme(theme: Theme): boolean {
  const resolved = resolveThemeName(theme);
  return resolved === 'github' || resolved === 'github-dark';
}

function getThemeColor(theme: Theme): string {
  const resolved = resolveThemeName(theme);
  if (resolved === 'auto') return 'auto';
  return THEME_COLORS[resolved] || 'light';
}

function resolveColor(theme: Theme): 'light' | 'dark' {
  const c = getThemeColor(theme);
  if (c === 'auto') {
    return 'light';
  }
  return c as 'light' | 'dark';
}

export function generateHtmlDocument(
  body: string,
  css: string,
  js: string,
  theme: Theme = 'light',
  toc: boolean = false,
  metadata: any = {},
  width?: string,
  math: boolean = false,
  emoji: boolean = false,
): string {
  const title = metadata.title || 'Markdown';
  const color = resolveColor(theme);
  const themeColor = getThemeColor(theme);
  const isAuto = themeColor === 'auto';
  const isDark = color === 'dark';

  // Body classes - use resolved theme name for _theme- class
  const resolvedTheme = resolveThemeName(theme);
  const bodyClasses: string[] = [];
  bodyClasses.push(`_theme-${resolvedTheme}`);
  // For auto themes, use _color-auto so runtime JS can set the correct color
  bodyClasses.push(`_color-${isAuto ? 'auto' : color}`);
  if (toc) bodyClasses.push('_toc-left');

  // Content container class - use resolved theme name
  const contentClass = isGitHubTheme(resolvedTheme) ? 'markdown-body' : 'markdown-theme';

  // Width class
  const widthClass = width && width !== 'auto' ? ` _width-${width}` : '';

  // Background color - use resolved theme name
  let bgColor = 'transparent';
  if (resolvedTheme === 'github') bgColor = '#fff';
  else if (resolvedTheme === 'github-dark') bgColor = '#0d1117';
  // For auto themes, use CSS media query for background
  const autoBgStyle = isAuto ? `
    @media (prefers-color-scheme: dark) {
      html { background-color: #0d1117; }
    }
    @media (prefers-color-scheme: light) {
      html { background-color: #fff; }
    }` : '';

  // Mermaid theme
  const mermaidTheme = isDark ? 'dark' : 'default';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    html, body {
      padding: 0 !important;
      margin: 0 !important;
      width: auto !important;
      max-width: 100% !important;
      background-color: ${bgColor};
      box-sizing: border-box;
    }
    ${autoBgStyle}
    body {
      display: block;
    }
    details summary {
      cursor: pointer;
    }
    #_html, #_toc {
      word-wrap: break-word;
      visibility: hidden;
    }
    body._toc-left { padding-left: 300px !important; }
    body._toc-right { padding-right: 300px !important; }

    /* Theme overrides */
    ${css}

    /* TOC */
    @media (prefers-color-scheme: light) {
      body { --toc-delimiter: #e1e4e8; }
    }
    @media (prefers-color-scheme: dark) {
      body { --toc-delimiter: #30363d; }
    }
    #_toc {
      position: fixed;
      top: 0; bottom: 0; left: 0;
      width: 299px;
      height: 100%;
      border-right: 1px solid var(--toc-delimiter);
      overflow-y: auto;
      overflow-x: hidden;
      background-color: #fff;
      font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
      font-size: 16px;
      line-height: 1.5;
      word-wrap: break-word;
    }
    ._theme-github-dark #_toc,
    ._color-dark #_toc {
      background-color: #0d1117;
      color: #c9d1d9;
    }
    @media (prefers-color-scheme: dark) {
      ._color-auto #_toc {
        background-color: #0d1117;
        color: #c9d1d9;
      }
    }
    #_toc ._ul {
      padding-left: 20px !important;
      margin: 0 !important;
      list-style: none;
    }
    #_toc > ._ul {
      padding: 0 0 0 10px !important;
    }
    #_toc > ._ul:first-child {
      padding-top: 15px !important;
    }
    #_toc > ._ul:last-child {
      padding-bottom: 15px !important;
    }
    #_toc ._ul a {
      border: 0 !important;
      padding: 5px 10px !important;
      display: block !important;
      color: #0969da;
      text-decoration: none;
    }
    #_toc ._ul a:hover {
      text-decoration: underline;
    }
    ._theme-github-dark #_toc ._ul a {
      color: #58a6ff;
    }
    ._color-light #_toc {
      border-right: 1px solid #e1e4e8;
    }
    ._color-dark #_toc {
      border-right: 1px solid #30363d;
    }

    /* Anchor link styles */
    .markdown-body .octicon,
    .markdown-theme .octicon {
      display: inline-block;
      fill: currentColor;
      vertical-align: text-bottom;
      overflow: visible !important;
    }
    .markdown-body .anchor,
    .markdown-theme .anchor {
      float: left;
      padding-right: 4px;
      margin-left: -20px;
      line-height: 1;
    }
    .markdown-body .anchor:focus,
    .markdown-theme .anchor:focus {
      outline: none;
    }
    .markdown-body h1:hover .anchor .octicon-link:before,
    .markdown-body h2:hover .anchor .octicon-link:before,
    .markdown-body h3:hover .anchor .octicon-link:before,
    .markdown-body h4:hover .anchor .octicon-link:before,
    .markdown-body h5:hover .anchor .octicon-link:before,
    .markdown-body h6:hover .anchor .octicon-link:before,
    .markdown-theme h1:hover .anchor .octicon-link:before,
    .markdown-theme h2:hover .anchor .octicon-link:before,
    .markdown-theme h3:hover .anchor .octicon-link:before,
    .markdown-theme h4:hover .anchor .octicon-link:before,
    .markdown-theme h5:hover .anchor .octicon-link:before,
    .markdown-theme h6:hover .anchor .octicon-link:before {
      width: 16px;
      height: 16px;
      content: ' ';
      display: inline-block;
      background-color: currentColor;
      mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAxNiAxNicgdmVyc2lvbj0nMS4xJyBhcmlhLWhpZGRlbj0ndHJ1ZSc+PHBhdGggZmlsbC1ydWxlPSdldmVub2RkJyBkPSdNNy43NzUgMy4yNzVhLjc1Ljc1IDAgMDAxLjA2IDEuMDZsMS4yNS0xLjI1YTIgMiAwIDExMi44MyAyLjgzbC0yLjUgMi41YTIgMiAwIDAxLTIuODMgMCAuNzUuNzUgMCAwMC0xLjA2IDEuMDYgMy41IDMuNSAwIDAwNC45NSAwbDIuNS0yLjVhMy41IDMuNSAwIDAwLTQuOTUtNC45NWwtMS4yNSAxLjI1em0tNC42OSA5LjY0YTIgMiAwIDAxMC0yLjgzbDIuNS0yLjVhMiAyIDAgMDEyLjgzIDAgLjc1Ljc1IDAgMDAxLjA2LTEuMDYgMy41IDMuNSAwIDAwLTQuOTUgMGwtMi41IDIuNWEzLjUgMy41IDAgMDA0Ljk1IDQuOTVsMS4yNS0xLjI1YS43NS43NSAwIDAwLTEuMDYtMS4wNmwtMS4yNSAxLjI1YTIgMiAwIDAxLTIuODMgMHonPjwvcGF0aD48L3N2Zz4=");
    }
    .markdown-body h1 .octicon-link,
    .markdown-body h2 .octicon-link,
    .markdown-body h3 .octicon-link,
    .markdown-body h4 .octicon-link,
    .markdown-body h5 .octicon-link,
    .markdown-body h6 .octicon-link,
    .markdown-theme h1 .octicon-link,
    .markdown-theme h2 .octicon-link,
    .markdown-theme h3 .octicon-link,
    .markdown-theme h4 .octicon-link,
    .markdown-theme h5 .octicon-link,
    .markdown-theme h6 .octicon-link {
      vertical-align: middle;
      visibility: hidden;
    }
    .markdown-body h1:hover .anchor,
    .markdown-body h2:hover .anchor,
    .markdown-body h3:hover .anchor,
    .markdown-body h4:hover .anchor,
    .markdown-body h5:hover .anchor,
    .markdown-body h6:hover .anchor,
    .markdown-theme h1:hover .anchor,
    .markdown-theme h2:hover .anchor,
    .markdown-theme h3:hover .anchor,
    .markdown-theme h4:hover .anchor,
    .markdown-theme h5:hover .anchor,
    .markdown-theme h6:hover .anchor {
      text-decoration: none;
    }
    .markdown-body h1:hover .anchor .octicon-link,
    .markdown-body h2:hover .anchor .octicon-link,
    .markdown-body h3:hover .anchor .octicon-link,
    .markdown-body h4:hover .anchor .octicon-link,
    .markdown-body h5:hover .anchor .octicon-link,
    .markdown-body h6:hover .anchor .octicon-link,
    .markdown-theme h1:hover .anchor .octicon-link,
    .markdown-theme h2:hover .anchor .octicon-link,
    .markdown-theme h3:hover .anchor .octicon-link,
    .markdown-theme h4:hover .anchor .octicon-link,
    .markdown-theme h5:hover .anchor .octicon-link,
    .markdown-theme h6:hover .anchor .octicon-link {
      visibility: visible;
    }
    .markdown-theme .octicon-link {
      color: var(--anchor, currentColor);
    }
    .markdown-theme .anchor {
      border-bottom: 0;
    }

    /* Theme-specific anchor fixes */
    ._theme-almond .octicon,
    ._theme-awsm .octicon,
    ._theme-axist .octicon,
    ._theme-kacit .octicon,
    ._theme-mini .octicon,
    ._theme-new .octicon,
    ._theme-sakura .octicon,
    ._theme-sakura-vader .octicon,
    ._theme-semantic .octicon,
    ._theme-simple .octicon,
    ._theme-stylize .octicon,
    ._theme-superstylin .octicon {
      line-height: 1px;
    }
    ._theme-no-class h1 .octicon,
    ._theme-no-class h2 .octicon,
    ._theme-no-class h3 .octicon {
      position: relative;
      top: -5px;
    }
    ._theme-pico h1 .octicon,
    ._theme-pico h2 .octicon {
      position: relative;
      top: 5px;
    }
    ._theme-superstylin h1 .octicon {
      position: relative;
      top: -5px;
    }
    ._theme-writ .octicon {
      line-height: 0;
    }
    ._theme-writ h2 .octicon {
      position: relative;
      top: 4px;
    }
    ._theme-writ h3 .octicon {
      position: relative;
      top: 10px;
    }

    /* Task list checkbox fixes */
    ._theme-awsm input[type=checkbox],
    ._theme-kacit input[type=checkbox],
    ._theme-no-class input[type=checkbox],
    ._theme-semantic input[type=checkbox],
    ._theme-tacit input[type=checkbox],
    ._theme-vanilla input[type=checkbox] {
      display: inline-block !important;
      box-sizing: border-box !important;
      padding: 0 !important;
      margin: 0 !important;
    }
    ._theme-bullframe input[type=checkbox],
    ._theme-superstylin input[type=checkbox] {
      position: relative;
      top: 3px;
    }
    ._theme-mini input[type=checkbox] {
      position: relative;
      top: 4px;
    }
    ._theme-no-class input[type=checkbox] {
      width: auto !important;
    }
    ._theme-vanilla input[type=checkbox] {
      appearance: auto !important;
    }

    /* GitHub theme specifics */
    ._theme-github {
      background-color: #fff;
    }
    ._theme-github .markdown-body {
      overflow: auto;
      width: 100%;
      max-width: 830px;
      padding: 32px;
      margin: 20px auto !important;
      border: 1px solid #e1e4e8;
      box-sizing: border-box;
    }
    ._theme-github .markdown-body img {
      background-color: transparent;
    }
    ._theme-github-dark {
      background-color: #0d1117;
    }
    ._theme-github-dark .markdown-body {
      overflow: auto;
      width: 100%;
      max-width: 830px;
      padding: 32px;
      margin: 20px auto !important;
      border: 1px solid #30363d;
      box-sizing: border-box;
    }
    ._theme-github-dark a {
      color: #4493f8 !important;
    }

    /* Theme fixes */
    ._theme-axist ul li p {
      display: inline-block;
    }
    ._theme-axist pre::after {
      content: none;
    }
    ._theme-kacit pre code,
    ._theme-tacit pre code {
      display: block;
    }
    ._theme-mini table {
      overflow-x: clip !important;
      max-height: none !important;
    }
    ._theme-mini blockquote::before {
      content: "\\201C";
    }
    ._theme-mini [type=checkbox]:checked:before {
      content: "\\2713";
      top: -3px;
    }
    ._theme-simple {
      display: block;
    }
    ._theme-style-sans *:not(pre) > code::before,
    ._theme-style-sans *:not(pre) > code::after,
    ._theme-style-serif *:not(pre) > code::before,
    ._theme-style-serif *:not(pre) > code::after {
      content: '';
      padding-left: 5px;
      padding-right: 5px;
    }
    ._theme-superstylin ul ul,
    ._theme-superstylin ol ol {
      padding-left: 40px;
    }
    ._theme-superstylin ul li p,
    ._theme-superstylin ol li p {
      display: inline-block;
      margin-bottom: 0;
    }
    ._theme-vanilla pre {
      margin-bottom: 10px;
    }

    /* Mermaid per-theme fixes */
    ._theme-mini code { line-height: normal; }
    ._theme-tacit * { max-width: none; }
    ._theme-kacit * { max-width: none; }
    ._theme-mini pre > div.mermaid { padding: 0; }
    ._theme-superstylin pre > div.mermaid { background: none; padding: 0; margin: 0; border-radius: 0; }
    ._theme-superstylin pre:has(> div.mermaid) { background: #f6f6f6; padding: 1rem; margin-bottom: 1.563rem; border-radius: 10px; }
    ._theme-water pre > div.mermaid { padding: 0; background: none; border-radius: 0; }
    ._theme-water pre:has(> div.mermaid) { padding: 10px; background: #efefef; border-radius: 6px; }
    ._theme-water-dark pre > div.mermaid { padding: 0; background: none; border-radius: 0; }
    ._theme-water-dark pre:has(> div.mermaid) { padding: 10px; background: #161f27; border-radius: 6px; }

    /* Prism init */
    code[class*=language-], pre[class*=language-] {
      white-space: pre;
    }

    /* Mermaid */
    pre:has(> div.mermaid) {
      resize: vertical;
      overflow: auto;
    }
    .markdown-body div.mermaid,
    .markdown-theme div.mermaid {
      display: block;
      height: 100%;
    }
    svg[id^=mermaid] text {
      stroke: none !important;
    }

    /* Emoji */
    .emojione {
      font-size: inherit;
      height: 3ex;
      width: 3.1ex;
      min-height: 20px;
      min-width: 20px;
      display: inline-block;
      margin: -.2ex .15em .2ex;
      line-height: normal;
      vertical-align: middle;
    }
    img.emojione {
      width: auto;
    }

    /* Print */
    @media print {
      h1, h2, h3, h4 { break-after: avoid; }
      pre, blockquote, summary, table, math, svg { break-inside: avoid; }
      html body._toc-left { padding-left: 0px !important; }
      html body._toc-right { padding-right: 0px !important; }
      #_toc { display: none; }
      body._theme-github .markdown-body { border: 0; padding: 20px; }
      body._theme-github-dark .markdown-body { border: 0; padding: 20px; }
      pre, pre code, pre[class*=language-], code[class*=language-] {
        word-wrap: break-word !important;
        white-space: pre-wrap !important;
      }
    }

    /* Scrollbar */
    @media (prefers-color-scheme: light) {
      body { --scrollbar-track: #efefef; --scrollbar-thumb: #d5d5d5; --scrollbar-thumb-hover: #c4c4c4; }
    }
    @media (prefers-color-scheme: dark) {
      body { --scrollbar-track: #424242; --scrollbar-thumb: #686868; --scrollbar-thumb-hover: #7b7b7b; }
    }
    ::-webkit-scrollbar, ::-webkit-scrollbar-corner { height: 10px; width: 10px; }
    ::-webkit-scrollbar-track { background: var(--scrollbar-track); border-radius: 6px; }
    ::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb); border-radius: 6px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--scrollbar-thumb-hover); }
  </style>
</head>
<body class="${bodyClasses.join(' ')}">
  ${toc ? '<div id="_toc" class="tex2jax-ignore"></div>' : ''}
  <div id="_html" class="${contentClass}${widthClass}">
    ${body}
  </div>
  <script>
    // Auto theme color detection
    (function() {
      if (document.body.classList.contains('_color-auto')) {
        var isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.classList.remove('_color-auto');
        document.body.classList.add(isDark ? '_color-dark' : '_color-light');
        // Listen for changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
          document.body.classList.remove('_color-light', '_color-dark');
          document.body.classList.add(e.matches ? '_color-dark' : '_color-light');
        });
      }
    })();

    // Prism highlighting
    if (typeof Prism !== 'undefined') {
      Prism.highlightAll();
    }

    // Mermaid
    ${js}

    var isDark = document.body.classList.contains('_color-dark') ||
      (document.body.classList.contains('_color-auto') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var mermaidTheme = isDark ? 'dark' : 'default';
    mermaid.initialize({startOnLoad: true, theme: mermaidTheme});

    // Panzoom for mermaid
    if (typeof Panzoom !== 'undefined') {
      var diagrams = Array.from(document.querySelectorAll('div.mermaid'));
      var pzTimeout = setInterval(() => {
        var svg = Array.from(document.querySelectorAll('div.mermaid svg'));
        if (diagrams.length === svg.length) {
          clearInterval(pzTimeout);
          svg.forEach((diagram) => {
            var panzoom = Panzoom(diagram, {canvas: true});
            diagram.parentElement.parentElement.addEventListener('wheel', (e) => {
              if (!e.shiftKey) return;
              panzoom.zoomWithWheel(e);
            });
          });
        }
      }, 50);
    }

    // TOC
    (function() {
      var tocContainer = document.getElementById('_toc');
      if (!tocContainer) return;
      var headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      if (headings.length === 0) { tocContainer.style.display = 'none'; return; }
      var rootUl = document.createElement('ul');
      rootUl.className = '_ul';
      var stack = [{ level: 0, element: rootUl }];
      headings.forEach(heading => {
        var level = parseInt(heading.tagName.substring(1));
        var text = heading.textContent;
        var id = heading.id;
        // Generate id from text if compiler didn't provide one
        if (!id) {
          id = text.toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-+|-+$/g, '') || 'heading';
          heading.id = id;
        }
        while (stack.length > 1 && stack[stack.length - 1].level >= level) stack.pop();
        var parent = stack[stack.length - 1].element;
        var currentUl = parent;
        if (parent.tagName !== 'UL') {
          // Reuse existing ul if present, otherwise create new
          var existingUl = parent.querySelector(':scope > ul._ul');
          if (existingUl) {
            currentUl = existingUl;
          } else {
            currentUl = document.createElement('ul');
            currentUl.className = '_ul';
            parent.appendChild(currentUl);
          }
        }
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = '#' + id;
        a.innerText = text;
        li.appendChild(a);
        currentUl.appendChild(li);
        stack.push({ level: level, element: li });
      });
      tocContainer.appendChild(rootUl);
    })();

    // Show content
    document.getElementById('_html').style.visibility = 'visible';
    var tocEl = document.getElementById('_toc');
    if (tocEl) tocEl.style.visibility = 'visible';

    // Emoji
    ${emoji ? EMOJI_SCRIPT + `
    document.getElementById('_html').innerHTML = emojinator(document.getElementById('_html').innerHTML);
    ` : ''}
  </script>
  ${math ? `<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>` : ''}
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (tag) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[tag] || tag));
}
