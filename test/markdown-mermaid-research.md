# 📚 Complete Research: Markdown + Mermaid Extensions & Markdown → HTML Converters

> Generated: 2026-07-04
> Searches: web_search (multiple queries), browser-web-search (Google AI, Perplexity), GitHub repo fetches, dedicated researcher subagents

---

## Part 1: Browser Extensions for Markdown + Mermaid

### 🥇 Top Full-Featured Extensions

| Extension | Browsers | Stars | Mermaid | Export | Highlights |
|---|---|---|---|---|---|
| **Markdown Viewer (xicilion)** | Chrome, Firefox, Edge, VS Code, Mobile | ~1K | ✅ 7 diagram types | **DOCX** (native equations), HTML, PDF | Best Word export; cross-platform; 29 themes; Vega, Drawio, Graphviz |
| **MarkView** | Chrome (+Chromium) | ~1 | ✅ | HTML, DOCX, PDF | Richest features: folder browser, presentation mode, cloud storage, 9 themes |
| **Markdown Viewer (simov)** | Chrome, Firefox, Edge, Opera, Brave, Vivaldi, Chromium | **1.6K** | ✅ (disabled by default) | ❌ None | Most mature (since 2014); 5 parsers to choose; 30+ themes; MIT |
| **Markdown Preview Plus** | Chrome | 253 | ✅ | HTML only | Simple, open source, KaTeX + MathJax |
| **Mermaid Preview** | Chrome | — | ✅ | ✅ Export | Drag-drop `.md`/`.mermaid` files, LaTeX math |
| **Markdown Previewer** | Chrome | — | ✅ | ❌ None | Clean GitHub-style rendering; interactive checkboxes |

### 🧜 Mermaid-Specific Extensions

| Extension | Browsers | Stars | What it does |
|---|---|---|---|
| **Mermaid Anywhere** | Chrome | ~new | Auto-renders Mermaid on **any webpage** (ChatGPT, GitHub, Confluence, Stack Overflow) — 21 diagram types, MIT |
| **Mermaid Previewer** | Chrome, Firefox | 27 | Renders Mermaid code blocks locally; custom site rules; export |
| **Mermaid Visualizer** | Chrome | — | One-click visualize Mermaid on GitHub, Confluence, Jira, GitLab |
| **Myrmaid** | Chrome | — | Zero-config auto-detect & render Mermaid on any webpage |

### 🆚 Head-to-Head: The Big Three

**→ Markdown Viewer (xicilion)** — Best for **cross-platform** + **export to Word with native equations**. Handles 7+ diagram formats (Mermaid, PlantUML, Vega, Drawio, Graphviz, Canvas, Infographic). Smart cache: first load ~5s, subsequent <1s even with 50 diagrams. **Free & open source (ISC)**.

- GitHub: https://github.com/markdown-viewer/markdown-viewer-extension
- Chrome: https://chromewebstore.google.com/detail/markdown-viewer/ckkdlimhmcjmikdlpkmbgfkaikojcbjk
- Firefox: https://addons.mozilla.org/en-US/firefox/addon/markdown-viewer-extension/

**→ MarkView** — Best for **feature richness** inside Chrome. Presentation mode, folder browser, cloud storage (Google Drive, SharePoint, OneDrive), CodeMirror 6 editor, bookmarks, word count. Some premium features behind paywall. **MIT licensed**.

- GitHub: https://github.com/davidcforbes/markview-chrome
- Chrome: https://chromewebstore.google.com/detail/markview-markdown-viewer/cfopbpknalachedpcddhgbgjoigklien

**→ Markdown Viewer (simov)** — Best for **maturity and configurability**. Choice of 5 different parsers, most browser support (7 browsers), granular origin permissions. Dated UI but rock-solid. **MIT, free**.

- GitHub: https://github.com/simov/markdown-viewer
- Chrome: https://chromewebstore.google.com/detail/markdown-viewer/ckkdlimhmcjmikdlpkmbgfkaikojcbjk

---

## Part 2: VS Code Extensions

| Extension | Stars | Mermaid | Other Diagrams | Export |
|---|---|---|---|---|
| **VS Code Built-in** (since 1.121) | N/A | ✅ Native | ❌ | ❌ |
| **Markdown Preview Enhanced** | **2K** | ✅ | PlantUML, GraphViz, Vega, WaveDrom, Ditaa (9 types) | PDF, Pandoc |
| **Markdown Mermaid Zoom** | — | ✅ (zoom/pan) | ❌ | ❌ |
| **Mermaid Chart (official)** | — | ✅ AI-powered | ❌ | SVG/PNG |

- Markdown Preview Enhanced: https://github.com/shd101wyy/vscode-markdown-preview-enhanced

---

## Part 3: Web-Based Markdown Editors

| Tool | Stars | Mermaid | Math | Export | Collaboration |
|---|---|---|---|---|---|
| **Mermaid Live Editor** | **7K** | ✅ 11 types | ❌ | SVG, PNG | Shareable links |
| **StackEdit** | **23K** | ✅ | ✅ LaTeX | HTML, PDF, MD | Cloud sync (GDrive, Dropbox, GitHub) |
| **HedgeDoc** | **7.3K** | ✅ | ✅ KaTeX | HTML, PDF, slides | **Real-time** collaborative |
| **Dillinger** | **8.2K** | ❌ | ❌ | HTML, PDF, MD | Cloud storage sync |
| **MDBuild** (PWA) | — | ✅ | ✅ KaTeX | PNG, PDF, HTML, DOCX | Offline-first |
| **MarkdownLab** (PWA) | — | ✅ | ✅ KaTeX | Browser print | Offline |

- Mermaid Live Editor: https://github.com/mermaid-js/mermaid-live-editor
- StackEdit: https://github.com/benweet/stackedit
- HedgeDoc: https://github.com/hedgedoc/hedgedoc
- Dillinger: https://github.com/joemccann/dillinger

---

## Part 4: Markdown → HTML Libraries (by Language)

### JavaScript / TypeScript

| Library | Stars | Standard | Speed | Extensions | Differentiator |
|---|---|---|---|---|---|
| **marked** | **37K** | GFM | ⚡ Fastest | Minimal | Speed king; 12M weekly downloads |
| **markdown-it** | **21.6K** | CommonMark | ⚡ Fast | **200+ plugins** | Best balance speed/extensibility |
| **showdown** | **14.9K** | GFM | Medium | Medium | **Bidirectional** (HTML↔Markdown) |
| **remark/unified** | **8.9K** | CommonMark+GFM+MDX | Medium | **100+ plugins** | AST-first; most powerful pipeline |
| **micromark** | **2.3K** | CommonMark | ⚡ Fast | Via remark | **Smallest** (~14KB); 100% CommonMark |
| **PreMarkdown** | — | CommonMark | ⚡ **10x markdown-it** | Plugin | Incremental parsing; **sub-ms updates** |
| **comark** | 650 | CommonMark+Components | Fast | Component syntax | Vue/React/Svelte components in Markdown |
| **featherdown** | — | CommonMark | Fast | Publishing pipeline | Mermaid, KaTeX, sanitized, ESM-first |
| **markdown-exit** | — | CommonMark | Fast | markdown-it compatible | TypeScript-native; async rendering |

- marked: https://github.com/markedjs/marked
- markdown-it: https://github.com/markdown-it/markdown-it
- showdown: https://github.com/showdownjs/showdown
- remark: https://github.com/remarkjs/remark
- micromark: https://github.com/micromark/micromark
- comark: https://github.com/comarkdown/comark
- featherdown: https://github.com/karuifeather/featherdown

### Python

| Library | Stars | Standard | Extensions | Differentiator |
|---|---|---|---|---|
| **Python-Markdown** | **4.2K** | Original | Extensive | Stdlib-adjacent; powers MkDocs |
| **mistune** | **3K** | CommonMark | Plugin-based | **Fastest Python**; clean modern API |
| **markdown2** | **2.8K** | Original | Many extras | Closest to original Markdown.pl |

- Python-Markdown: https://github.com/Python-Markdown/markdown
- mistune: https://github.com/lepture/mistune
- markdown2: https://github.com/trentm/python-markdown2

### Go

| Library | Stars | Standard | Extensions | Differentiator |
|---|---|---|---|---|
| **goldmark** | **4.7K** | CommonMark+GFM | Good | **Hugo's default**; extensible |
| **blackfriday** | **5.6K** | Original (not CommonMark) | Limited | Battle-tested; being superseded by goldmark |
| **gomarkdown** | **2K** | Original | Medium | Actively maintained fork of blackfriday |

- goldmark: https://github.com/yuin/goldmark
- blackfriday: https://github.com/russross/blackfriday
- gomarkdown: https://github.com/gomarkdown/markdown

### Rust

| Library | Stars | Standard | Extensions | Differentiator |
|---|---|---|---|---|
| **pulldown-cmark** | **2.6K** | CommonMark | Via options | **Zero-copy pull parser**; Zola's engine |
| **comrak** | ~1.5K | CommonMark+GFM | Plugin | Full GFM support |
| **markdown-rs** | **1.3K** | CommonMark+GFM+MDX+Math | Extensive | Most feature-complete Rust parser |

- pulldown-cmark: https://github.com/pulldown-cmark/pulldown-cmark
- comrak: https://github.com/kivikakk/comrak
- markdown-rs: https://github.com/wooorm/markdown-rs

### C/C++ / WASM

| Library | Stars | Standard | Differentiator |
|---|---|---|---|
| **cmark** | **2K** | CommonMark (reference) | Official C reference implementation |
| **cmark-gfm** | **1.1K** | GFM | **GitHub's own parser** |
| **md4c** | **1.3K** | CommonMark | **Fastest CommonMark parser** in any language |
| **markdown-wasm** | **1.7K** | CommonMark | md4c speed in browser via WASM; 31KB gzip |

- cmark: https://github.com/commonmark/cmark
- cmark-gfm: https://github.com/github/cmark
- md4c: https://github.com/mity/md4c
- markdown-wasm: https://github.com/rsms/markdown-wasm

### Java

| Library | Stars | Standard | Extensions | Differentiator |
|---|---|---|---|---|
| **commonmark-java** | **2.7K** | CommonMark | Medium | Java standard; used by Atlassian, OpenJDK |
| **flexmark-java** | **2.6K** | CommonMark+ | **Extensive** | Swiss Army knife; emulates other parsers |

- commonmark-java: https://github.com/commonmark/commonmark-java
- flexmark-java: https://github.com/vsch/flexmark-java

### .NET

| Library | Stars | Standard | Extensions | Differentiator |
|---|---|---|---|---|
| **markdig** | **5.3K** | CommonMark+GFM | Extensive | The .NET standard |

- markdig: https://github.com/xoofx/markdig

---

## Part 5: CLI Tools (Markdown → HTML)

| Tool | Lang | Stars | Mermaid | Export | Differentiator |
|---|---|---|---|---|---|
| **Pandoc** | Haskell | **45K** | Via filters/pandoc-mermaid | **All formats** (HTML, PDF, DOCX, EPUB, LaTeX...) | The universal converter |
| **mmdc** (mermaid-cli) | JS | **4.7K** | ✅ Native | SVG, PNG, PDF | Official Mermaid CLI |
| **mkdown** | Go | New | ✅ (CDN) | Self-contained HTML | Single binary; beautiful default template; batch |
| **MD2X** | Python | New | ✅ Automatic | PDF, DOCX, HTML, EPUB, LaTeX | Pandoc wrapper with auto-Mermaid |
| **marky** | Go | New | ✅ | Themed HTML pages | Syntax highlighting + LaTeX + Mermaid |
| **MarkieCli** | Rust | New | ✅ **Native** | SVG, PNG, PDF | Pure Rust; zero runtime deps |
| **mdtohtml** | Go | New | ✅ | HTML | GitHub-style rendering with Mermaid |
| **mddoco** | Python | — | ✅ | HTML, PDF | Jinja2 templates; recursive directory |
| **Glow** | Go | **25.6K** | ❌ | Terminal only | Beautiful terminal Markdown rendering |
| **Grip** | Python | **6.8K** | ❌ | Browser preview | Exact GitHub-style preview server |

- Pandoc: https://github.com/jgm/pandoc
- mmdc: https://github.com/mermaid-js/mermaid-cli
- mkdown: https://github.com/ekinertac/mkdown
- MD2X: https://github.com/ChaoticQubit/MD2X
- marky: https://github.com/metafates/marky
- MarkieCli: https://github.com/lsj5031/MarkieCli
- mdtohtml: https://github.com/Reperion/mdtohtml
- Glow: https://github.com/charmbracelet/glow
- Grip: https://github.com/joeyespo/grip

---

## Part 6: Static Site Generators

| Tool | Lang | Stars | Markdown Engine | Mermaid | Differentiator |
|---|---|---|---|---|---|
| **Hugo** | Go | **88K** | goldmark | ⚡ Shortcodes | **Fastest build**; single binary; massive theme ecosystem |
| **Jekyll** | Ruby | **52K** | kramdown | Plugin | GitHub Pages native |
| **MkDocs + Material** | Python | **22K+22K** | Python-Markdown | ✅ Plugin | **Best documentation SSG**; beautiful Material theme |
| **mdBook** | Rust | **21.7K** | pulldown-cmark | ❌ (plugin) | Book/documentation authoring |
| **Eleventy** | JS | **19.7K** | markdown-it (configurable) | Plugin | Most flexible; 10+ template languages |
| **Zola** | Rust | **17.1K** | pulldown-cmark | ❌ | Single binary; Tera templates; very fast |
| **Docusaurus** | JS/React | **57K** | remark | ✅ Native | **React-powered**; best for project docs |
| **Quarto** | TS/Lua | **5.4K** | Pandoc | ✅ | Scientific/technical publishing |

- Hugo: https://github.com/gohugoio/hugo
- Jekyll: https://github.com/jekyll/jekyll
- MkDocs: https://github.com/mkdocs/mkdocs
- Material for MkDocs: https://github.com/squidfunk/mkdocs-material
- mdBook: https://github.com/rust-lang/mdBook
- Eleventy: https://github.com/11ty/eleventy
- Zola: https://github.com/getzola/zola
- Docusaurus: https://github.com/facebook/docusaurus
- Quarto: https://github.com/quarto-dev/quarto-cli

---

## Part 7: Desktop GUI Editors

| Editor | Stars | Price | Mermaid | Export | Differentiator |
|---|---|---|---|---|---|
| **Typora** | Proprietary | $14.99 one-time | ✅ | HTML, PDF, DOCX, EPUB, LaTeX... | **Best WYSIWYG** — seamless live preview |
| **MarkText** | **57K** | Free (FOSS) | ✅ | HTML, PDF | Best **open-source** WYSIWYG |
| **Obsidian** | 19.4K (releases) | Free (Sync/Publish paid) | ✅ Plugin | Via plugins | **Best PKM**; 2,000+ plugins; graph view |
| **Zettlr** | **13K** | Free (FOSS) | ✅ | Pandoc-powered | **Academic writing**; Zotero integration |
| **Ghostwriter** | **4.9K** | Free (KDE) | ❌ | HTML, PDF | Native; distraction-free |

- MarkText: https://github.com/marktext/marktext
- Obsidian: https://obsidian.md (proprietary; plugin repo: https://github.com/obsidianmd/obsidian-releases)
- Zettlr: https://github.com/Zettlr/Zettlr
- Ghostwriter: https://github.com/KDE/ghostwriter
- Typora: https://typora.io

---

## 🔍 Key Gaps Identified

1. **Safari/iOS** — No major Markdown+Mermaid extension exists for Safari. All are Chrome/Firefox/Chromium.
2. **Mermaid version tracking** — Most extensions don't disclose which Mermaid.js version they bundle.
3. **Performance benchmarks** — No standardized benchmarks exist for rendering speed/memory across extensions.
4. **Mobile** — xicilion's extension has mobile support (iOS/Android) but it's the only one.
5. **Mermaid in CLI-to-HTML** — Most CLI converters need post-processing or CDN for Mermaid; few do it natively. Standouts:
   - **MD2X** — auto-renders Mermaid to images via Pandoc
   - **MarkieCli** — pure Rust native Mermaid rendering
   - **mkdown** — loads Mermaid from CDN
   - **mmdc** (mermaid-cli) — official but diagram-only

---

## 🏆 Quick Picks Summary

| Use Case | Recommended Tool |
|---|---|
| **Browser extension** (cross-platform) | [Markdown Viewer (xicilion)](https://github.com/markdown-viewer/markdown-viewer-extension) — best export, 7 diagram types |
| **Chrome-only power user** | [MarkView](https://github.com/davidcforbes/markview-chrome) — richest feature set |
| **Render Mermaid on any site** | [Mermaid Anywhere](https://github.com/starmorph/mermaid-anywhere) — ChatGPT, GitHub, Confluence |
| **VS Code editing** | Built-in (1.121+) + [Markdown Preview Enhanced](https://github.com/shd101wyy/vscode-markdown-preview-enhanced) |
| **JS library (balanced)** | [markdown-it](https://github.com/markdown-it/markdown-it) — 200+ plugins, fast, CommonMark |
| **JS library (speed)** | [marked](https://github.com/markedjs/marked) — fastest, 37K stars |
| **JS library (AST/pipelines)** | [remark](https://github.com/remarkjs/remark) + unified ecosystem |
| **CLI converter (universal)** | [Pandoc](https://github.com/jgm/pandoc) — 45K stars, all formats |
| **CLI converter (Mermaid-aware)** | [MD2X](https://github.com/ChaoticQubit/MD2X) or [mkdown](https://github.com/ekinertac/mkdown) |
| **Static site (general)** | [Hugo](https://github.com/gohugoio/hugo) — speed, ecosystem, 88K stars |
| **Static site (docs)** | [MkDocs](https://github.com/mkdocs/mkdocs) + [Material](https://github.com/squidfunk/mkdocs-material) |
| **Static site (books)** | [mdBook](https://github.com/rust-lang/mdBook) — rust-lang's tool |
| **Desktop editor (WYSIWYG)** | [Typora](https://typora.io) (paid) or [MarkText](https://github.com/marktext/marktext) (free) |
| **Desktop editor (PKM)** | [Obsidian](https://obsidian.md) — 2,000+ plugins |
| **Desktop editor (academic)** | [Zettlr](https://github.com/Zettlr/Zettlr) — citations, Pandoc integration |
| **Web editor (feature-rich)** | [StackEdit](https://github.com/benweet/stackedit) — 23K stars |
| **Web editor (real-time collab)** | [HedgeDoc](https://github.com/hedgedoc/hedgedoc) — Google Docs for Markdown |
| **Standalone diagram editor** | [Mermaid Live Editor](https://github.com/mermaid-js/mermaid-live-editor) — 7K stars |
