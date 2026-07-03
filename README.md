# pi-open-message-in-browser (monorepo)

This repo is a bun workspaces monorepo with two packages:

- [`packages/mdopen`](packages/mdopen) — core Markdown → HTML conversion
  (GitHub styling, highlight.js syntax highlighting, Mermaid diagrams), plus
  the standalone `mdopen` CLI. Zero `pi` dependency; published to npm as
  [`mdopen`](https://www.npmjs.com/package/mdopen).
- [`packages/pi-open-message-in-browser`](packages/pi-open-message-in-browser) —
  the `pi` extension that opens the last assistant response in a browser. Thin
  wrapper around `mdopen`; published to npm as
  [`pi-open-message-in-browser`](https://www.npmjs.com/package/pi-open-message-in-browser).

## Install

- As a `pi` extension: `pi install npm:pi-open-message-in-browser`
- As a standalone CLI: `npm install -g mdopen`

See each package's README for usage details.

## Development

```bash
bun install               # link workspaces
bun run --filter mdopen build
```

## 📜 License

This project is licensed under the MIT License.
