// playwright.config.js
import { defineConfig, devices } from '@playwright/test';
import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  return Object.fromEntries(
    fs.readFileSync(filePath, 'utf8')
      .split('\n')
      .filter(l => l.includes('=') && !l.startsWith('#'))
      .map(l => {
        const idx = l.indexOf('=');
        return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '')];
      })
  );
}

const env      = loadEnv(path.resolve(__dirname, '.env.healing'));
const PAGE_URL = env.PAGE_URL || process.env.PAGE_URL || 'https://0db08412a5d665.lhr.life/arcane-shop.html';

export default defineConfig({
  testDir:   './tests',
  timeout:   180_000,
  retries:   1,
  workers:   4,
  reporter:  [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],

  use: {
    extraHTTPHeaders: { 'ngrok-skip-browser-warning': 'true' },
    baseURL:       PAGE_URL,
    headless:      true,
    screenshot:    'only-on-failure',
    video:         'retain-on-failure',
    trace:         'on-first-retry',
    actionTimeout: 15_000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
