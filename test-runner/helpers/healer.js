// helpers/healer.js
'use strict';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { COLAB_API_URL, CONFIDENCE_THRESHOLD, REQUEST_TIMEOUT_MS } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

/**
 * Calls the Colab /heal endpoint.
 */
export async function healSelector({ url, brokenSelector, baselineText, confidenceThreshold, skipStages }) {
  if (!COLAB_API_URL) {
    console.warn('[Healer]   COLAB_API_URL missing — auto-heal disabled');
    return null;
  }
  if (!brokenSelector) {
    console.warn('[Healer]   brokenSelector is empty — skipping');
    return null;
  }

  const payload = {
    url,
    broken_selector:      brokenSelector,
    confidence_threshold: confidenceThreshold ?? CONFIDENCE_THRESHOLD,
  };
  if (baselineText) payload.baseline_text = baselineText;
  if (skipStages && Array.isArray(skipStages) && skipStages.length > 0) payload.skip_stages = skipStages;

  const body = JSON.stringify(payload);

  console.log(`\n[Healer]  Calling Colab pipeline...`);
  console.log(`[Healer]     endpoint : ${COLAB_API_URL}/heal`);
  console.log(`[Healer]     selector : ${brokenSelector}`);
  console.log(`[Healer]     page     : ${url}`);

  return new Promise((resolve, reject) => {
    let fullUrl;
    try { fullUrl = new URL(`${COLAB_API_URL}/heal`); }
    catch (e) { return reject(new Error(`[Healer] Invalid COLAB_API_URL: ${COLAB_API_URL}`)); }

    const isHttps = fullUrl.protocol === 'https:';
    const lib     = isHttps ? https : http;

    if (isHttps) {
      console.warn('[Healer]   SSL cert verification disabled (rejectUnauthorized=false). Dev tunnels only.');
    }

    const options = {
      hostname:           fullUrl.hostname,
      port:               fullUrl.port || (isHttps ? 443 : 80),
      path:               fullUrl.pathname,
      method:             'POST',
      headers: {
        'Content-Type':               'application/json',
        'Content-Length':             Buffer.byteLength(body),
        'ngrok-skip-browser-warning': '1',
      },
      timeout:            REQUEST_TIMEOUT_MS,
      rejectUnauthorized: false,
    };

    const req = lib.request(options, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 && raw.trim().startsWith('<!DOCTYPE')) {
          return reject(new Error('[Healer] Got HTML — ngrok interstitial blocked the request.'));
        }
        try {
          const result = JSON.parse(raw);
          const healed = result.status === 'healed';
          if (healed) {
            console.log(`[Healer]   Healed  : ${result.healed_selector}`);
          } else {
            console.warn(`[Healer]   No candidate: ${result.message ?? 'low score'}`);
          }
          resolve(result);
        } catch (e) {
          reject(new Error(`[Healer] Invalid JSON from Colab: ${raw.slice(0, 300)}`));
        }
      });
    });

    req.on('timeout', () => { req.destroy(); reject(new Error('[Healer] Timeout — Colab did not respond in 3 min')); });
    req.on('error',   (e) => reject(new Error(`[Healer] Network error: ${e.message}`)));
    req.write(body);
    req.end();
  });
}

/**
 * Extracts the raw CSS selector string from a recommended locator expression.
 * Returns null when the result cannot be expressed as plain CSS (getByRole etc.)
 * so those cases safely skip file patching.
 *
 * Examples:
 *   'page.locator("#tab-new")'                    → '#tab-new'
 *   'locator("[data-testid=\"foo\"]")'             → '[data-testid="foo"]'
 *   'page.getByTestId("wishlist-count")'           → '[data-testid="wishlist-count"]'
 *   'page.get_by_role("button", name="Clear")'     → null  (skip patch)
 *   '[data-testid="nav-about"]'                    → '[data-testid="nav-about"]'
 */
function extractCssSelector(recommended) {
  if (!recommended) return null;

  // page.locator("...") or locator("...")
  const loc = recommended.match(/[Ll]ocator\(["'](.+?)["']\)/);
  if (loc) return loc[1];

  // getByTestId("...") → inline data-testid attribute selector
  const tid = recommended.match(/[Gg]et[_]?[Bb]y[_]?[Tt]est[_]?[Ii]d\(["'](.+?)["']\)/);
  if (tid) return `[data-testid="${tid[1]}"]`;

  // Already a plain CSS selector — no parens, no 'page.' prefix
  if (!recommended.includes('(') && !recommended.includes('page.')) return recommended.trim();

  // getByRole, getByText, get_by_role, etc. — cannot be inlined as CSS; skip patching
  return null;
}

/**
 * Patches the test file, replacing the broken CSS selector string with the healed one.
 * Only patches when the healed result can be expressed as a plain CSS selector.
 * Creates a .bak backup first.
 */
export function patchTestFile(filePath, brokenSelector, newLocator) {
  if (!fs.existsSync(filePath)) {
    console.warn(`[Healer]   File not found: ${filePath}`);
    return false;
  }
  if (!brokenSelector || !newLocator) return false;

  const replacement = extractCssSelector(newLocator);
  if (!replacement) {
    console.warn(`[Healer]   Skipping patch — healed locator cannot be inlined as CSS: ${newLocator}`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const escaped = brokenSelector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  if (!new RegExp(escaped).test(content)) {
    console.warn(`[Healer]   Selector not found in file: ${brokenSelector}`);
    return false;
  }

  fs.writeFileSync(filePath + '.bak', content, 'utf8');
  fs.writeFileSync(filePath, content.replace(new RegExp(escaped, 'g'), replacement), 'utf8');
  console.log(`[Healer]   Patched    : ${path.basename(filePath)}  (${brokenSelector} → ${replacement})`);
  return true;
}

/**
 * Saves the heal result to a timestamped JSON report.
 */
export function saveHealReport(result, context = {}) {
  const dir = path.resolve(__dirname, '../reports');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const file = path.join(dir, `heal-${Date.now()}.json`);
  fs.writeFileSync(file, JSON.stringify({
    timestamp: new Date().toISOString(),
    context,
    result,
  }, null, 2), 'utf8');

  console.log(`[Healer]  Report : ${path.relative(process.cwd(), file)}`);
  return file;
}
