import * as fs from 'fs';
import * as path from 'path';

type Theme = 'light' | 'dark' | 'auto';

export interface Settings {
  browser: string;
  exportDir: string;
  theme: Theme;
}

const SETTINGS_FILE = path.join(__dirname, 'settings.json');

const defaultBrowser = process.platform === 'darwin' ? 'open' : 'xdg-open';
const defaultSettings: Settings = {
  browser: defaultBrowser,
  exportDir: '/tmp',
  theme: 'light'
};

export function loadSettings(): Settings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
      return { ...defaultSettings, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return defaultSettings;
}

export function saveSettings(settings: Settings): void {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}
