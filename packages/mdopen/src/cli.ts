import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { performance } from 'perf_hooks';
import { convertMarkdownToHtml } from './converter';
import { generateHtmlDocument } from './template';
import { getAssets } from './assets';
import { writeAndOpenHtml } from './browser';
import { validateMermaid } from './mermaid-validator';
import type { Theme } from './types';
import type { CompilerName, CompilerOptions } from './compilers';

const VALID_COMPILERS: CompilerName[] = ['markdown-it', 'marked', 'commonmark', 'remarkable'];

const VALID_THEMES = [
  'light', 'dark', 'auto', 'github', 'github-dark',
  'almond', 'awsm', 'axist', 'bamboo', 'bullframe', 'holiday',
  'kacit', 'latex', 'marx', 'mini', 'modest', 'new', 'no-class',
  'pico', 'retro', 'sakura', 'sakura-vader', 'semantic', 'simple',
  'style-sans', 'style-serif', 'stylize', 'superstylin', 'tacit',
  'vanilla', 'water', 'water-dark', 'writ',
];

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
    validateMermaid: boolean;
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
  --no-validate-mermaid                 Skip mermaid diagram validation
  --width <width>                       Content width (auto, full, wide, large, medium, small, tiny)
  -o, --out <file.html>                Write HTML to this path instead of a temp file
  -b, --browser <command>              Command used to open the file (default: "open" on macOS, "xdg-open" elsewhere)
  -n, --no-open                        Only convert/write the HTML, do not open a browser
  -h, --help                           Show this help message

  Environment Variables:
    MDOPEN_TIMING=1                    Show a detailed timing breakdown of the conversion process

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
        validateMermaid: true,
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
                if (!VALID_THEMES.includes(value)) {
                    throw new Error(`--theme must be one of: ${VALID_THEMES.join(', ')}`);
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
            case '--no-validate-mermaid':
                args.validateMermaid = false;
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

    const startTotal = performance.now();

    const inputPath = path.resolve(process.cwd(), args.file!);
    if (!fs.existsSync(inputPath)) {
        console.error(`Error: file not found: ${inputPath}`);
        process.exit(1);
    }

    const startRead = performance.now();
    const markdown = fs.readFileSync(inputPath, 'utf8');
    const endRead = performance.now();

    const startConvert = performance.now();
    const { html: htmlBody, metadata, mermaidBlocks } = await convertMarkdownToHtml(markdown, args.theme, args.compiler, args.compilerOptions);
    const endConvert = performance.now();

    const startAssets = performance.now();
    const { css, js } = await getAssets(args.theme);
    const endAssets = performance.now();

    const startTemplate = performance.now();
    const fullHtml = generateHtmlDocument(htmlBody, css, js, args.theme, args.toc, metadata, args.width, args.math, args.emoji);
    const endTemplate = performance.now();

    // Validate mermaid diagrams if markdown contains them
    let mermaidTime = 0;
    if (args.validateMermaid && /```mermaid/.test(markdown)) {
        const startMermaid = performance.now();
        const result = await validateMermaid(mermaidBlocks);
        mermaidTime = performance.now() - startMermaid;
        if (result.total > 0 && result.failed > 0) {
            console.error(`Mermaid validation: ${result.failed}/${result.total} diagram(s) failed to render:`);
            for (const err of result.errors) {
                console.error(`  #${err.index}: ${err.error}`);
                console.error(`    Source: ${err.source.substring(0, 80)}...`);
            }
            if (args.out) {
                process.exit(1);
            }
        }
    }

    const outputPath = args.out
        ? path.resolve(process.cwd(), args.out)
        : undefined;

    const sourceBaseName = path.basename(inputPath, path.extname(inputPath));

    let writeTime = 0;
    if (!args.open) {
        const startWrite = performance.now();
        const filePath = outputPath || path.join(os.tmpdir(), `${sourceBaseName}-${Math.random().toString(36).substring(2, 8)}.html`);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, fullHtml, 'utf8');
        writeTime = performance.now() - startWrite;
        console.log(filePath);
    } else {
        const startWrite = performance.now();
        const { filePath, opened } = await writeAndOpenHtml(fullHtml, {
            browser: args.browser,
            filePath: outputPath,
            filenamePrefix: sourceBaseName,
        });
        writeTime = performance.now() - startWrite;

        if (opened) {
            console.log(`Opened in browser: ${filePath}`);
        } else {
            console.log(`Could not open browser automatically ("${args.browser}"). File saved to: ${filePath}`);
        }
    }

    const endTotal = performance.now();

    if (process.env.MDOPEN_TIMING === '1') {
        const timingData = [
            { name: 'Read file', duration: endRead - startRead },
            { name: 'Convert MD->HTML', duration: endConvert - startConvert },
            { name: 'Get assets', duration: endAssets - startAssets },
            { name: 'Template HTML', duration: endTemplate - startTemplate },
            { name: 'Mermaid validate', duration: mermaidTime },
            { name: 'Write/Open file', duration: writeTime },
        ].sort((a, b) => b.duration - a.duration);

        console.log('\n--- Conversion Timing Breakdown (Sorted) ---');
        for (const item of timingData) {
            console.log(`${item.name.padEnd(20)}: ${item.duration.toFixed(2)}ms`);
        }
        console.log(`--------------------------------------------`);
        console.log(`Internal Total time: ${(endTotal - startTotal).toFixed(2)}ms\n`);
    }
}

if (require.main === module) {
    main();
}
