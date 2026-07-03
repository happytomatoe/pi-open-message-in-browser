import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { convertMarkdownToHtml } from './converter';
import { generateHtmlDocument } from './template';
import { getAssets } from './assets';
import { writeAndOpenHtml } from './browser';
import type { Theme } from './types';

const VALID_THEMES: Theme[] = ['light', 'dark', 'auto'];

interface CliArgs {
    file?: string;
    theme: Theme;
    out?: string;
    browser: string;
    open: boolean;
}

function printHelp(): void {
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

function parseArgs(argv: string[]): CliArgs {
    const args: CliArgs = {
        file: undefined,
        theme: 'light',
        out: undefined,
        browser: process.platform === 'darwin' ? 'open' : 'xdg-open',
        open: true,
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
                if (!value || !VALID_THEMES.includes(value as Theme)) {
                    throw new Error(`--theme must be one of: ${VALID_THEMES.join(', ')}`);
                }
                args.theme = value as Theme;
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
    const htmlBody = await convertMarkdownToHtml(markdown, args.theme);
    const { css, js } = await getAssets(args.theme);
    const fullHtml = generateHtmlDocument(htmlBody, css, js, args.theme);

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
