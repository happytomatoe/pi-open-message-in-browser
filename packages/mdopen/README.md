## 💻 Standalone CLI

`mdopen` converts any Markdown file to GitHub-flavored HTML — with syntax
highlighting (highlight.js) and Mermaid diagram support — and opens it in a
browser. No `pi` agent required.

### Install

```bash
npm install -g mdopen
```

This adds the `mdopen` command to your `PATH`.

### Usage

```bash
mdopen <file.md> [options]
```

Options:

| Flag | Description | Default |
| --- | --- | --- |
| `-t, --theme <light\|dark\|auto>` | Theme to render with | `light` |
| `-o, --out <file.html>` | Write HTML to this path instead of a temp file | temp file |
| `-b, --browser <command>` | Command used to open the file | `open` (macOS) / `xdg-open` (Linux) |
| `-n, --no-open` | Convert only, don't open a browser | opens by default |
| `-h, --help` | Show help | |

### Environment Variables

| Variable | Description | Default |
| --- | --- | --- |
| `MDOPEN_TIMING` | Set to `1` to show a detailed timing breakdown of the conversion process | `undefined` |

Examples:

```bash
mdopen README.md                       # open with light theme
mdopen notes.md --theme dark           # force dark theme
mdopen notes.md --out notes.html -n    # just convert, don't open
```

## 📦 As a library

```ts
import { convertMarkdownToHtml, generateHtmlDocument, getAssets, writeAndOpenHtml } from "mdopen";

const htmlBody = convertMarkdownToHtml(markdown);
const { css, js } = await getAssets("dark");
const fullHtml = generateHtmlDocument(htmlBody, css, js, "dark");
await writeAndOpenHtml(fullHtml, { browser: "open" });
```

## 🏗️ Development

```bash
bun install   # from repo root, links workspaces
bun run build # compiles src/ -> dist/
```

## 📜 License

This project is licensed under the MIT License.
