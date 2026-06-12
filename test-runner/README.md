# Self-Healing Playwright

Playwright tests with **transparent AI self-healing** via a Colab/ngrok backend.

Test writers write **100% normal Playwright code**. No annotations, no `smartLocator`,
no `BasePage`. Healing happens automatically underneath via a fixture.

---

## Project Structure

```
self-healing-playwright/
│
├── helpers/
│   ├── fixtures.ts      ← 🔑 THE MAGIC — Playwright fixture that intercepts failures
│   ├── helpers.ts       ← waitForProducts + BASE_URL
│   ├── config.js        ← reads .env.healing
│   ├── healer.js        ← calls Colab /heal endpoint
│   └── evaluator.js     ← eval harness (run-eval.js)
│
├── tests/
│   ├── 01-page-structure.spec.ts   ← broken selectors for demo/testing healing
│   ├── 02-navigation.spec.ts
│   ├── 03-hero-and-banners.spec.ts
│   ├── 04-product-cards.spec.ts
│   ├── 05-product-modal.spec.ts
│   ├── 06-cart.spec.ts
│   ├── 07-wishlist.spec.ts
│   └── 08-search.spec.ts
│
├── scripts/
│   ├── heal-test.js     ← one-shot CLI healer
│   ├── ping-colab.js    ← connectivity check
│   ├── run-eval.js      ← batch evaluator
│   └── capture-gt.js    ← capture ground truth from live DOM
│
├── eval/
│   ├── scenarios/       ← JSON scenario files for evaluator
│   └── reports/         ← timestamped eval reports
│
├── reports/             ← per-heal JSON reports (auto-created)
├── pages/               ← your arcane-shop.html goes here
├── .env.healing.template
├── playwright.config.js
├── package.json
└── tsconfig.json
```

---

## How the healing works

```
test writer writes:
  await page.locator('#promo-barr').click()   // ← typo, will fail

at runtime:
  fixture intercepts the failure
  → calls Colab /heal endpoint with the broken selector + page URL
  → Colab returns: { recommended: '#promo-bar', score: 0.97 }
  → fixture retries with the healed locator  
  → patches the .spec.ts file in-place (creates .bak backup)
  → saves a JSON report to /reports/
```

The test writer **never sees any of this**. Their code just works.

---

## Files to DELETE from the old project

| File | Reason |
|---|---|
| `helpers/base.js` | Replaced by `helpers/fixtures.ts` — `BasePage` and `smartLocator` no longer needed |
| Old spec files with `smartLocator` | Replaced by clean specs in `tests/` |

---

## Files to KEEP unchanged

| File | Status |
|---|---|
| `helpers/healer.js` |  Kept as-is |
| `helpers/config.js` |  Kept as-is |
| `helpers/evaluator.js` |  Kept as-is |
| `scripts/ping-colab.js` |  Kept as-is |
| `playwright.config.js` |  Kept as-is |

---

## Files that are NEW

| File | What it does |
|---|---|
| `helpers/fixtures.ts` | Playwright `test` + `expect` re-export with healing Proxy baked in |
| `helpers/helpers.ts` | Simplified — just `BASE_URL` and `waitForProducts` |
| `tests/*.spec.ts` | Clean tests — **only** `import { test, expect, BASE_URL, waitForProducts } from '../helpers/fixtures.js'` |

---

## What test writers import

```typescript
// Every spec file — that's the ONLY import needed
import { test, expect, BASE_URL, waitForProducts } from '../helpers/fixtures.js';
```

That's it. `test` and `expect` are drop-in replacements for the standard
`@playwright/test` exports. The healing is invisible.

---

## Setup

```bash
# 1. Install
npm install
npx playwright install chromium

# 2. Configure
cp .env.healing.template .env.healing
# Edit .env.healing — paste your Colab ngrok URL

# 3. Serve test page
npm run serve

# 4. Check connectivity
npm run ping

# 5. Run tests
npm test
```

---

## Broken selectors in 01-page-structure.spec.ts

These are intentionally broken for testing the healer:

| Broken | What it should be |
|---|---|
| `#promo-barr` | `#promo-bar` |
| `#nav-hom` | `#nav-home` |
| `#logoo` | `#logo` |
| `navigation-link-homme` | `navigation-link-home` |
| `#btn-searchh` | `#btn-search` |
| `#btn-wish-list-nav` | `#btn-wishlist-nav` |
| `#count-shownn` | `#count-shown` |
| `#count-totall` | `#count-total` |
| `#newsletter-emai` | `#newsletter-email` |
| `#cart-countt` | `#cart-count` |
| `#promo-countdow` | `#promo-countdown` |

All other spec files (02–08) use correct selectors and test real functionality.
