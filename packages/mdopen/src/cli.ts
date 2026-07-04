import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { convertMarkdownToHtml } from './converter';
import { generateHtmlDocument } from './template';
import { getAssets } from './assets';
import { writeAndOpenHtml } from './browser';
import type { Theme } from './types';
import type { CompilerName, CompilerOptions } from './compilers';

const VALID_COMPILERS: CompilerName[] = ['markdown-it', 'marked', 'commonmark', 'remarkable'];

interface CliArgs {
    file?: string;
    theme: Theme;
    compiler?: CompilerName;
    compilerOptions?: CompilerOptions;
    out?: string;
    browser: string;
    open: boolean;
    toc: boolean;
    math: boolean;
    emoji: boolean;
    width?: string;
}

function printHelp(): void {
    console.log(`mdopen - convert a Markdown file to styled HTML and open it in a browser

Usage:
  mdopen <file.md> [options]

Options:
  -t, --theme <theme>                    Theme to use (default: light)
  -c, --compiler <compiler>            Compiler to use (default: markdown-it)
                                       Options: markdown-it, marked, commonmark, remarkable
  --toc                                 Generate a Table of Contents sidebar
  --math                                Enable MathJax for LaTeX rendering
  --emoji                               Enable emoji rendering (:emoji:)
  --width <width>                       Content width (auto, full, wide, large, medium, small, tiny)
  -o, --out <file.html>                Write HTML to this path instead of a temp file
  -b, --browser <command>              Command used to open the file (default: "open" on macOS, "xdg-open" elsewhere)
  -n, --no-open                        Only convert/write the HTML, do not open a browser
  -h, --help                           Show this help message

Examples:
  mdopen README.md
  mdopen notes.md --theme dark
  mdopen notes.md --compiler marked
  mdopen notes.md --out notes.html --no-open
`);
}

function parseArgs(argv: string[]): CliArgs {
    const args: CliArgs = {
        file: undefined,
        theme: 'light',
        out: undefined,
        browser: process.platform === 'darwin' ? 'open' : 'xdg-open',
        open: true,
        toc: false,
        math: false,
        emoji: false,
    };

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        switch (arg) {
            case '-h':
            case '--help':
                printHelp();
                process.exit(0);
                break;
            case '-t':
            case '--theme': {
                const value = argv[++i];
                if (!value) {
                    throw new Error('--theme requires a value');
                }
                args.theme = value as Theme;
                break;
            }
            case '-c':
            case '--compiler': {
                const value = argv[++i];
                if (!value || !VALID_COMPILERS.includes(value as CompilerName)) {
                    throw new Error(`--compiler must be one of: ${VALID_COMPILERS.join(', ')}`);
                }
                args.compiler = value as CompilerName;
                break;
            }
            case '--toc':
                args.toc = true;
                break;
            case '--math':
                args.math = true;
                break;
            case '--emoji':
                args.emoji = true;
                break;
            case '--width': {
                const value = argv[++i];
                const validWidths = ['auto', 'full', 'wide', 'large', 'medium', 'small', 'tiny'];
                if (!value || !validWidths.includes(value)) {
                    throw new Error(`--width must be one of: ${validWidths.join(', ')}`);
                }
                args.width = value;
                break;
            }
            case '-o':
            case '--out':
                args.out = argv[++i];
                if (!args.out) throw new Error('--out requires a file path');
                break;
            case '-b':
            case '--browser':
                args.browser = argv[++i];
                if (!args.browser) throw new Error('--browser requires a command');
                break;
            case '-n':
            case '--no-open':
                args.open = false;
                break;
            default:
                if (arg.startsWith('-')) {
                    throw new Error(`Unknown option: ${arg}`);
                }
                if (args.file) {
                    throw new Error(`Unexpected extra argument: ${arg}`);
                }
                args.file = arg;
        }
    }

    if (!args.file) {
        throw new Error('Missing required <file.md> argument');
    }

    return args;
}

function parseArgsOrExit(argv: string[]): CliArgs {
    try {
        return parseArgs(argv);
    } catch (err) {
        console.error(`Error: ${(err as Error).message}\n`);
        printHelp();
        return process.exit(1);
    }
}

export async function main(argv: string[] = process.argv.slice(2)): Promise<void> {
    const args: CliArgs = parseArgsOrExit(argv);

    const inputPath = path.resolve(process.cwd(), args.file!);
    if (!fs.existsSync(inputPath)) {
        console.error(`Error: file not found: ${inputPath}`);
        process.exit(1);
    }

    const markdown = fs.readFileSync(inputPath, 'utf8');
    const { html: htmlBody, metadata } = await convertMarkdownToHtml(markdown, args.theme, args.compiler, args.compilerOptions);
    const { css, js } = await getAssets(args.theme);
    const fullHtml = generateHtmlDocument(htmlBody, css, js, args.theme, args.toc, metadata, args.width, args.math, args.emoji);

    const outputPath = args.out
        ? path.resolve(process.cwd(), args.out)
        : undefined;

    const sourceBaseName = path.basename(inputPath, path.extname(inputPath));

    if (!args.open) {
        const filePath = outputPath || path.join(os.tmpdir(), `${sourceBaseName}-${Math.random().toString(36).substring(2, 8)}.html`);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, fullHtml, 'utf8');
        console.log(filePath);
        return;
    }

    const { filePath, opened } = await writeAndOpenHtml(fullHtml, {
        browser: args.browser,
        filePath: outputPath,
        filenamePrefix: sourceBaseName,
    });

    if (opened) {
        console.log(`Opened in browser: ${filePath}`);
    } else {
        console.log(`Could not open browser automatically ("${args.browser}"). File saved to: ${filePath}`);
    }
}

if (require.main === module) {
    main();
}
