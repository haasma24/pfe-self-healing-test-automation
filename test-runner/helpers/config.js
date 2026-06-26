// helpers/config.js
'use strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`[Config]   .env.healing not found at: ${filePath} — falling back to process.env`);
    return {};
  }
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

const envPath = path.resolve(__dirname, '../.env.healing');
const env     = loadEnv(envPath);

function loadSharedUrls() {
  const urlsFile = 'C:/ProgramData/.pfe-urls.json';
  if (!fs.existsSync(urlsFile)) return {};
  try {
    const raw = fs.readFileSync(urlsFile, 'utf8');
    const clean = raw.charCodeAt(0) === 0xFEFF ? raw.slice(1) : raw;
    const data = JSON.parse(clean);
    return {
      PAGE_URL:       data.page_url ? `${data.page_url.replace(/\/+$/, '')}/arcane-shop.html` : '',
      COLAB_API_URL:  data.api_url  || '',
    };
  } catch (e) {
    console.warn(`[Config]   Failed to parse ${urlsFile}: ${e.message}`);
    return {};
  }
}

function cleanUrl(raw) {
  if (!raw) return '';
  const m = raw.match(/https?:\/\/[^\s"']+/);
  return m ? m[0].replace(/\/$/, '') : raw.trim();
}

const shared = loadSharedUrls();

export const COLAB_API_URL        = cleanUrl(process.env.COLAB_API_URL  || env.COLAB_API_URL  || shared.COLAB_API_URL || '');
export const PAGE_URL             = cleanUrl(process.env.PAGE_URL       || env.PAGE_URL       || shared.PAGE_URL      || '');
export const CONFIDENCE_THRESHOLD = parseFloat(process.env.CONFIDENCE_THRESHOLD || env.CONFIDENCE_THRESHOLD || '0.45');
export const REQUEST_TIMEOUT_MS   = 180_000;

export default { COLAB_API_URL, PAGE_URL, CONFIDENCE_THRESHOLD, REQUEST_TIMEOUT_MS };
