// scripts/ping-colab.js
import https from 'https';
import http  from 'http';
import { COLAB_API_URL, PAGE_URL } from '../helpers/config.js';

if (!COLAB_API_URL || COLAB_API_URL.includes('PASTE')) {
  console.error('  Set COLAB_API_URL in .env.healing first');
  process.exit(1);
}

async function ping(url, label, isApi = false, _redirectCount = 0) {
  if (_redirectCount > 3) {
    console.error(`  ${label}: Too many redirects`);
    return false;
  }

  return new Promise((resolve) => {
    let parsed;
    try { parsed = new URL(url); }
    catch { console.error(`  ${label}: Invalid URL: ${url}`); return resolve(false); }

    const isHttps = parsed.protocol === 'https:';
    const options = {
      hostname:           parsed.hostname,
      port:               parsed.port || (isHttps ? 443 : 80),
      path:               parsed.pathname || '/',
      method:             'GET',
      headers:            { 'ngrok-skip-browser-warning': '1' },
      timeout:            10_000,
      rejectUnauthorized: false,
    };

    const req = (isHttps ? https : http).request(options, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
        const location = res.headers['location'];
        if (location) {
          const next = location.startsWith('http') ? location : `${parsed.protocol}//${parsed.host}${location}`;
          console.log(`   ↪  ${label}: ${res.statusCode} → ${next}`);
          res.resume();
          return resolve(ping(next, label, isApi, _redirectCount + 1));
        }
      }

      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        const body = data.trim();

        if (res.statusCode !== 200) {
          console.error(`  ${label}: HTTP ${res.statusCode}`);
          return resolve(false);
        }

        if (isApi) {
          if (body.startsWith('<!') || body.includes('ERR_NGROK') || body.includes('offline')) {
            console.error(`  ${label}: Tunnel offline or interstitial`);
            console.error(`    ${body.slice(0, 100).replace(/\n/g, ' ')}`);
            return resolve(false);
          }
          try {
            const json = JSON.parse(body);
            if (json.status === 'ok') {
              console.log(`  ${label}: status=ok  model=${json.model}  baseline="${json.baseline}"`);
              return resolve(true);
            }
            console.error(`  ${label}: Unexpected JSON`);
            return resolve(false);
          } catch {
            console.error(`  ${label}: Invalid JSON — ${body.slice(0, 100)}`);
            return resolve(false);
          }
        } else {
          console.log(`  ${label}: reachable (${body.length} bytes)`);
          return resolve(true);
        }
      });
    });

    req.on('timeout', () => { req.destroy(); console.error(`  ${label}: Timeout`); resolve(false); });
    req.on('error',   (e) => { console.error(`  ${label}: ${e.message}`); resolve(false); });
    req.end();
  });
}

async function main() {
  console.log('──────────────────────────────────────');
  console.log('  Self-Healing connectivity check     ');
  console.log('──────────────────────────────────────');
  console.log(`  API  : ${COLAB_API_URL}`);
  console.log(`  Page : ${PAGE_URL}`);
  console.log('');

  const apiOk  = await ping(`${COLAB_API_URL}/ping`, 'Flask API /ping ', true);
  const pageOk = await ping(PAGE_URL,                'Test page       ', false);

  console.log('');
  console.log('──────────────────────────────────────');

  if (apiOk && pageOk) {
    console.log('  All systems GO — run: npm test');
    process.exit(0);
  }

  if (!apiOk) {
    console.log('\n  Flask API unreachable:');
    console.log('  1. Re-run Cell 7 in Colab');
    console.log('  2. Copy the new URL → paste in .env.healing as COLAB_API_URL=');
  }
  if (!pageOk) {
    console.log('\n  Test page unreachable:');
    console.log('  1. Run: npm run serve');
  }
  process.exit(1);
}

main();