import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { exec } from 'child_process';

export interface WriteAndOpenOptions {
    /** Command used to open the file, e.g. "open" (macOS) or "xdg-open" (Linux). */
    browser: string;
    /** Directory the HTML file is written to. Defaults to the OS temp dir. */
    exportDir?: string;
    /** Base filename prefix used when generating a random filename. */
    filenamePrefix?: string;
    /** Explicit output file path. Overrides exportDir/filenamePrefix when set. */
    filePath?: string;
}

function generateRandomFilename(prefix: string): string {
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${random}.html`;
}

export function writeAndOpenHtml(html: string, options: WriteAndOpenOptions): Promise<{ filePath: string, opened: boolean }> {
    return new Promise((resolve) => {
        const exportDir = options.exportDir || os.tmpdir();
        const filePath = options.filePath || path.join(exportDir, generateRandomFilename(options.filenamePrefix || 'mdopen'));

        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, html, 'utf8');

        const command = `${options.browser} "${filePath}"`;

        exec(command, (error: Error | null) => {
            if (error) {
                console.error(`exec error: ${error}`);
                resolve({ filePath, opened: false });
                return;
            }
            resolve({ filePath, opened: true });
        });
    });
}
