# pi-open-message-in-browser

[Markdown preview extension](https://github.com/simov/markdown-viewer) repackaged as CLI and [Pi](https://github.com/earendil-works/pi) extension. Converts Markdown to GitHub-flavored HTML with syntax highlighting and Mermaid diagram support.

## Prerequisites

- [Bun](https://bun.sh) (required for CLI and development)
- [Pi](https://github.com/earendil-works/pi) (required for the Pi extension)

## Install

### As a Pi extension

```bash
just install-extension
```

### As a standalone CLI

```bash
just install
```

This adds the `mdopen` command to your PATH.

## Usage

### CLI

```bash
mdopen <file.md> [options]
```

| Flag | Description | Default |
|------|-------------|---------|
| `-t, --theme <theme>` | Theme: `github`, `github-dark`, `auto`, or any bundled theme | `github` |
| `-c, --compiler <compiler>` | Markdown compiler: `markdown-it`, `marked`, `commonmark`, `remarkable` | `markdown-it` |
| `--toc` | Generate a Table of Contents sidebar | off |
| `--math` | Enable MathJax for LaTeX rendering | off |
| `--emoji` | Enable emoji rendering | off |
| `--no-validate-mermaid` | Skip Mermaid diagram validation | on |
| `--width <width>` | Content width: `auto`, `full`, `wide`, `large`, `medium`, `small`, `tiny` | `auto` |
| `-o, --out <file.html>` | Write HTML to this path instead of a temp file | temp file |
| `-b, --browser <command>` | Command used to open the file | `open` (macOS) / `xdg-open` (Linux) |
| `-n, --no-open` | Convert only, don't open a browser | opens by default |
| `-h, --help` | Show help | |

Examples:

```bash
mdopen README.md                       # open with github theme
mdopen notes.md --theme github-dark    # force dark theme
mdopen notes.md --out notes.html -n    # just convert, don't open
mdopen notes.md --toc --math           # with ToC and LaTeX support
```

### Pi extension

Once installed, the extension adds a command to open the last assistant message in your browser:

```
/open-last-in-browser
```

The extension:
- Extracts the last assistant response from the conversation
- Converts Markdown to styled HTML with Mermaid support
- Opens it in your default browser

## Development

```bash
bun install               # link workspaces
bun run --filter mdopen build   # compile mdopen
```

## 📜 License

This project is licensed under the MIT License.
