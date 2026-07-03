import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { exec } from 'child_process';
import { loadSettings } from './settings';

function generateRandomFilename(): string {
    const random = Math.random().toString(36).substring(2, 8);
    return `pi-export-${random}.html`;
}

export function writeAndOpenHtml(html: string): Promise<{ filePath: string, opened: boolean }> {
    return new Promise((resolve) => {
        const settings = loadSettings();
        const exportDir = settings.exportDir || os.tmpdir();
        const filename = generateRandomFilename();
        const filePath = path.join(exportDir, filename);

        fs.mkdirSync(exportDir, { recursive: true });
        fs.writeFileSync(filePath, html, 'utf8');

        const command = `${settings.browser} "${filePath}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                resolve({ filePath, opened: false });
                return;
            }
            resolve({ filePath, opened: true });
        });
    });
}
