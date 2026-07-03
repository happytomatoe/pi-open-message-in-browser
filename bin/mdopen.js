#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const os = require("os");
const { exec } = require("child_process");
const { marked } = require("marked");

const VALID_THEMES = ["light", "dark", "auto"];

function printHelp() {
	console.log(`mdopen - convert a Markdown file to styled HTML and open it in a browser

Usage:
  mdopen <file.md> [options]

Options:
  -t, --theme <light|dark|auto>   Theme to use (default: light)
  -o, --out <file.html>           Write HTML to this path instead of a temp file
  -b, --browser <command>         Command used to open the file (default: "open" on macOS, "xdg-open" elsewhere)
  -n, --no-open                   Only convert/write the HTML, do not open a browser
  -h, --help                      Show this help message

Examples:
  mdopen README.md
  mdopen notes.md --theme dark
  mdopen notes.md --out notes.html --no-open
`);
}

function parseArgs(argv) {
	const args = {
		file: undefined,
		theme: "light",
		out: undefined,
		browser: process.platform === "darwin" ? "open" : "xdg-open",
		open: true,
	};

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		switch (arg) {
			case "-h":
			case "--help":
				printHelp();
				process.exit(0);
				break;
			case "-t":
			case "--theme": {
				const value = argv[++i];
				if (!value || !VALID_THEMES.includes(value)) {
					throw new Error(`--theme must be one of: ${VALID_THEMES.join(", ")}`);
				}
				args.theme = value;
				break;
			}
			case "-o":
			case "--out":
				args.out = argv[++i];
				if (!args.out) throw new Error("--out requires a file path");
				break;
			case "-b":
			case "--browser":
				args.browser = argv[++i];
				if (!args.browser) throw new Error("--browser requires a command");
				break;
			case "-n":
			case "--no-open":
				args.open = false;
				break;
			default:
				if (arg.startsWith("-")) {
					throw new Error(`Unknown option: ${arg}`);
				}
				if (args.file) {
					throw new Error(`Unexpected extra argument: ${arg}`);
				}
				args.file = arg;
		}
	}

	if (!args.file) {
		throw new Error("Missing required <file.md> argument");
	}

	return args;
}

function convertMarkdownToHtml(markdown) {
	const renderer = new marked.Renderer();
	renderer.code = function (code, infostring) {
		const lang = infostring?.split(" ")[0];
		if (lang === "mermaid") {
			return `<div class="mermaid">${code}</div>`;
		}
		return `<pre><code class="language-${lang || "text"}">${code}</code></pre>`;
	};
	return marked.parse(markdown, { renderer });
}

function cssFileForTheme(theme) {
	switch (theme) {
		case "dark":
			return "github-markdown-css/github-markdown-dark.css";
		case "light":
			return "github-markdown-css/github-markdown-light.css";
		case "auto":
		default:
			return "github-markdown-css/github-markdown.css";
	}
}

function getAssets(theme) {
	const cssPath = require.resolve(cssFileForTheme(theme));
	const jsPath = require.resolve("mermaid/dist/mermaid.min.js");
	return {
		css: fs.readFileSync(cssPath, "utf8"),
		js: fs.readFileSync(jsPath, "utf8"),
	};
}

function generateHtmlDocument(body, css, js, theme, title) {
	const mermaidTheme = theme === "dark" ? "dark" : "default";
	const htmlDataTheme = theme === "auto" ? "" : ` data-theme="${theme}"`;
	const bgColor = theme === "dark" ? "#0d1117" : theme === "light" ? "#ffffff" : "transparent";
	return `<!DOCTYPE html>
<html lang="en"${htmlDataTheme}>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        html {
            background-color: ${bgColor};
        }
        body.markdown-body {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
        }
        ${css}
    </style>
</head>
<body class="markdown-body">
    ${body}
    <script type="module">
        ${js}
        mermaid.initialize({ startOnLoad: true, theme: '${mermaidTheme}' });
    </script>
</body>
</html>`;
}

function generateRandomFilename() {
	const random = Math.random().toString(36).substring(2, 8);
	return `mdopen-${random}.html`;
}

function openInBrowser(browserCommand, filePath) {
	return new Promise((resolve) => {
		exec(`${browserCommand} "${filePath}"`, (error) => {
			if (error) {
				resolve(false);
				return;
			}
			resolve(true);
		});
	});
}

async function main() {
	let args;
	try {
		args = parseArgs(process.argv.slice(2));
	} catch (err) {
		console.error(`Error: ${err.message}\n`);
		printHelp();
		process.exit(1);
	}

	const inputPath = path.resolve(process.cwd(), args.file);
	if (!fs.existsSync(inputPath)) {
		console.error(`Error: file not found: ${inputPath}`);
		process.exit(1);
	}

	const markdown = fs.readFileSync(inputPath, "utf8");
	const htmlBody = convertMarkdownToHtml(markdown);
	const { css, js } = getAssets(args.theme);
	const title = path.basename(inputPath);
	const fullHtml = generateHtmlDocument(htmlBody, css, js, args.theme, title);

	const outputPath = args.out
		? path.resolve(process.cwd(), args.out)
		: path.join(os.tmpdir(), generateRandomFilename());

	fs.mkdirSync(path.dirname(outputPath), { recursive: true });
	fs.writeFileSync(outputPath, fullHtml, "utf8");

	if (!args.open) {
		console.log(outputPath);
		return;
	}

	const opened = await openInBrowser(args.browser, outputPath);
	if (opened) {
		console.log(`Opened in browser: ${outputPath}`);
	} else {
		console.log(`Could not open browser automatically ("${args.browser}"). File saved to: ${outputPath}`);
	}
}

main();
