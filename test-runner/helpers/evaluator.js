// helpers/evaluator.js
'use strict';

import fs   from 'fs';
import path from 'path';
import { healSelector as _healRaw } from './healer.js';
import { PAGE_URL } from './config.js';

// ─────────────────────────────────────────────────────────────────────────────
//  DOM TAG LOOKUP
//  Fetches the page HTML once and finds the tag for a bare #id selector.
//  No extra dependencies — uses the built-in fetch (Node 18+).
// ─────────────────────────────────────────────────────────────────────────────

// Cache so we only download each page once per run
const _htmlCache = new Map();

async function fetchTagFromPage(pageUrl, selector) {
  let id = null;
  const bareId = selector.match(/^#([\w-]+)$/);
  if (bareId) id = bareId[1];
  const locatorId = selector.match(/locator\(['"]#([\w-]+)['"]\)/);
  if (!id && locatorId) id = locatorId[1];
  const testidAttr = selector.match(/\[data-testid=["']([\w-]+)["']\]/);
  if (!id && testidAttr) id = testidAttr[1];
  if (!id) return null;

  try {
    let html = _htmlCache.get(pageUrl);
    if (!html) {
      const res = await fetch(pageUrl, { signal: AbortSignal.timeout(10_000) });
      html = await res.text();
      _htmlCache.set(pageUrl, html);
    }

    // Match: <tagName ... id="the-id"  or  id='the-id'
    const re = new RegExp(`<(\\w+)[^>]+\\bid=["']${id}["']`, 'i');
    const m  = html.match(re);
    return m ? m[1].toLowerCase() : null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  ADAPTER — normalise la réponse Colab vers le format attendu
//
//  Colab /heal retourne :          evaluator attend :
//  ──────────────────────          ─────────────────
//  status: "healed"          →     success: true
//  healed_selector: "..."    →     recommended: "..."
//  confidence: 0.97          →     score: 0.97
//  strategy: "typo"          →     strategy: "typo"
//  (pas d'objet element)     →     element: { id, tag, ... }  ← on le parse
// ─────────────────────────────────────────────────────────────────────────────
async function healSelector(params) {
  const raw = await _healRaw(params);
  if (!raw) return null;

  // Déjà normalisé (guard)
  if ('success' in raw) return raw;

  const healed = raw.status === 'healed' && !!raw.healed_selector;
  const element = healed ? _parseLocator(raw.healed_selector) : null;

  return {
    success:      healed,
    recommended:  raw.healed_selector  ?? '',
    score:        raw.confidence       ?? 0,
    message:      healed ? 'healed' : `failed (status=${raw.status})`,
    strategy:     raw.strategy         ?? 'ml',
    pipelineTime: raw.pipelineTime     ?? null,
    run_id:       raw.run_id           ?? null,
    element,
    _raw: raw,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  PARSER DE LOCATOR
//  Transforme "page.locator("#promo-bar")" → { id: "promo-bar", tag: null, ... }
//  Transforme "page.locator("button.search")" → { tag: "button", class: "search" }
// ─────────────────────────────────────────────────────────────────────────────
function _parseLocator(locatorStr) {
  if (!locatorStr) return null;

  const el = { tag: null, id: null, name: null, text: null,
               aria_label: null, placeholder: null, role: null,
               class: null, _locator: locatorStr };

  // Bare CSS id selector: "#promo-bar"  (Colab typo-fix returns this directly)
  const bareId = locatorStr.match(/^#([\w-]+)$/);
  if (bareId) { el.id = bareId[1]; return el; }

  // Bare testid selector: "[data-testid=\"nav-shop\"]"
  const bareTestid = locatorStr.match(/^\[data-testid=["']([\w-]+)["']\]$/);
  if (bareTestid) { el.id = bareTestid[1]; return el; }

  // Bare CSS tag+id: "button#btn-search"
  const bareTagId = locatorStr.match(/^(\w+)#([\w-]+)$/);
  if (bareTagId) { el.tag = bareTagId[1]; el.id = bareTagId[2]; return el; }

  // Bare CSS tag+class: "button.search-btn"
  const bareTagClass = locatorStr.match(/^(\w+)\.([\w-]+)$/);
  if (bareTagClass) { el.tag = bareTagClass[1]; el.class = bareTagClass[2]; return el; }

  // page.locator("#some-id")  or  page.locator('#some-id')
  const idMatch = locatorStr.match(/locator\(['"]#([\w-]+)['"]\)/);
  if (idMatch) { el.id = idMatch[1]; return el; }

  // page.locator("tag#id")
  const tagIdMatch = locatorStr.match(/locator\(['"](\w+)#([\w-]+)['"]\)/);
  if (tagIdMatch) { el.tag = tagIdMatch[1]; el.id = tagIdMatch[2]; return el; }

  // page.locator("tag.class")
  const tagClassMatch = locatorStr.match(/locator\(['"](\w+)\.([\w-]+)['"]\)/);
  if (tagClassMatch) { el.tag = tagClassMatch[1]; el.class = tagClassMatch[2]; return el; }

  // page.getByRole("button", { name: "Search" })
  const roleMatch = locatorStr.match(/getByRole\(['"](\w+)['"]/);
  const nameMatch = locatorStr.match(/name:\s*['"]([^'"]+)['"]/);
  if (roleMatch) { el.role = roleMatch[1]; if (nameMatch) el.text = nameMatch[1]; return el; }

  // page.getByLabel("Email")
  const labelMatch = locatorStr.match(/getByLabel\(['"]([^'"]+)['"]\)/);
  if (labelMatch) { el.aria_label = labelMatch[1]; return el; }

  // page.getByPlaceholder("Search...")
  const phMatch = locatorStr.match(/getByPlaceholder\(['"]([^'"]+)['"]\)/);
  if (phMatch) { el.placeholder = phMatch[1]; return el; }

  // page.getByText("Add to cart")
  const txtMatch = locatorStr.match(/getByText\(['"]([^'"]+)['"]\)/);
  if (txtMatch) { el.text = txtMatch[1]; return el; }

  // page.locator("tag") — bare tag
  const tagMatch = locatorStr.match(/locator\(['"](\w+)['"]\)/);
  if (tagMatch) { el.tag = tagMatch[1]; return el; }

  return el;
}

// ─────────────────────────────────────────────────────────────────────────────
//  MATCH — compare l'élément parsé avec le ground truth du scénario
// ─────────────────────────────────────────────────────────────────────────────
export function matchesExpected(element, expected) {
  if (!element || !expected) return false;

  const checks = [];

  if (expected.id) {
    if (element.id) {
      checks.push(element.id === expected.id);
    } else {
      checks.push((element._locator || '').includes(expected.id));
    }
    // Also verify tag when both id and tag are expected and we have a tag
    if (expected.tag && element.tag) {
      checks.push(element.tag === expected.tag);
    }
  } else if (expected.tag) {
    checks.push(element.tag === expected.tag);
  }

  if (expected.name)
    checks.push(element.name === expected.name);

  if (expected.input_type)
    checks.push(element.input_type === expected.input_type);

  if (expected.aria_label)
    checks.push(element.aria_label === expected.aria_label);

  if (expected.placeholder)
    checks.push(element.placeholder === expected.placeholder);

  if (expected.text_contains)
    checks.push((element.text || element.id || element._locator || '')
                  .toLowerCase()
                  .includes(expected.text_contains.toLowerCase()));

  if (expected.role)
    checks.push(element.role === expected.role);

  if (checks.length === 0) return null;
  return checks.every(Boolean);
}

// ─────────────────────────────────────────────────────────────────────────────
//  RUN SCENARIO
// ─────────────────────────────────────────────────────────────────────────────
export async function runScenario(scenarioPath, options = {}) {
  const scenario = JSON.parse(fs.readFileSync(scenarioPath, 'utf8').replace(/^\uFEFF/, ''));
  // Use scenario URL as fallback if config PAGE_URL is empty
  const activeUrl = (PAGE_URL || scenario.url || '').replace(/\/+$/, '');
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  EVAL: ${scenario.scenario}`);
  console.log(`  URL : ${activeUrl}`);
  console.log(`  Cases: ${scenario.cases.length}`);
  console.log('='.repeat(60));

  const results = [];

  for (const c of scenario.cases) {
    console.log(`\n[${c.id}] ${c.description}`);
    console.log(`  broken_selector : ${c.broken_selector}`);

    let apiResult = null;
    let error     = null;
    const t0      = Date.now();

    try {
      /*apiResult = await healSelector({
        url:                  activeUrl,
        brokenSelector:       c.broken_selector,
        baselineText:         c.baseline_text || undefined,
        confidenceThreshold:  c.confidence_threshold ?? 0.70,
        skipStages:           options.skipStages,
      });*/
      apiResult = await healSelector({
      url:                  activeUrl,
      brokenSelector:       c.broken_selector,
      baselineText:         c.baseline_text || undefined,
      confidenceThreshold:  c.confidence_threshold ?? 0.70,
      skipStages:           options.skipStages,
      clickBefore:          c.click_before || undefined,
      });
    } catch (e) {
      error = e.message;
      console.error(`   API error: ${e.message}`);
    }

    const healTimeMs = Date.now() - t0;

    let correct   = false;
    let matchInfo = null;

    if (apiResult?.success) {
      // Enrich element.tag from the live page when the typo-pass returns a bare #id selector
      if (apiResult.element && !apiResult.element.tag && apiResult.recommended) {
        const domTag = await fetchTagFromPage(activeUrl, apiResult.recommended);
        if (domTag) apiResult.element.tag = domTag;
      }

      const matched = matchesExpected(apiResult.element, c.expected);
      correct   = matched === true;
      matchInfo = matched;

      const icon = correct ? '' : matched === null ? '❓' : '';
      console.log(`  ${icon} score=${apiResult.score?.toFixed(3)}  recommended=${apiResult.recommended}`);
      console.log(`     got : id="${apiResult.element?.id ?? '-'}"  tag="${apiResult.element?.tag ?? '-'}"  locator="${apiResult.recommended}"`);
      console.log(`     want: ${JSON.stringify(c.expected)}`);
    } else if (apiResult && !apiResult.success) {
      console.log(`    Pipeline refused (score too low or no candidate)`);
    } else {
      console.log(`   No result from pipeline`);
    }

    const pipeline_layers = _extractLayers(apiResult);

    results.push({
      id:              c.id,
      description:     c.description,
      broken_selector: c.broken_selector,
      expected:        c.expected,
      has_target:      c.has_target ?? true,
      correct,
      match_info:      matchInfo,
      score:           apiResult?.score       ?? null,
      recommended:     apiResult?.recommended ?? null,
      got_element:     apiResult?.element     ?? null,
      api_success:     apiResult?.success     ?? false,
      strategy:        apiResult?.strategy    ?? null,
      heal_time_ms:    healTimeMs,
      pipeline_layers,
      error,
    });
  }

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
//  EXTRACT LAYERS
// ─────────────────────────────────────────────────────────────────────────────
function _extractLayers(apiResult) {
  if (!apiResult) return null;
  const layers = apiResult.layers || apiResult._raw?.layers;
  if (!layers || !Array.isArray(layers)) return null;
  const out = {};
  for (const l of layers) {
    if (l.name && typeof l.score === 'number') out[l.name] = l.score;
  }
  return Object.keys(out).length > 0 ? out : null;
}

// ─────────────────────────────────────────────────────────────────────────────
//  RUN ALL SCENARIOS
// ─────────────────────────────────────────────────────────────────────────────
export async function runAllScenarios(scenariosDir, reportDir) {
  const files = fs.readdirSync(scenariosDir)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(scenariosDir, f));

  if (files.length === 0) {
    console.warn('[Eval] No scenario files found in', scenariosDir);
    return;
  }

  const allResults        = [];
  const scenarioSummaries = [];

  for (const file of files) {
    const results = await runScenario(file);
    allResults.push(...results);

    const total    = results.length;
    const correct  = results.filter(r => r.correct).length;
    const unknown  = results.filter(r => r.match_info === null).length;
    const scored   = results.filter(r => r.score !== null);
    const avgScore = scored.length > 0
      ? scored.reduce((sum, r) => sum + r.score, 0) / scored.length : 0;

    scenarioSummaries.push({
      file:      path.basename(file),
      total, correct,
      wrong:     total - correct - unknown,
      unknown,
      accuracy:  total > 0 ? correct / (total - unknown) : 0,
      avg_score: avgScore,
    });
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('  EVALUATION SUMMARY');
  console.log('='.repeat(60));

  for (const s of scenarioSummaries) {
    const pct = (s.accuracy * 100).toFixed(1);
    console.log(
      `  ${s.file.padEnd(30)} ${s.correct}/${s.total - s.unknown} correct` +
      `  (${pct}%)  avg_score=${s.avg_score.toFixed(3)}`
    );
  }

  if (reportDir) {
    fs.mkdirSync(reportDir, { recursive: true });
    const reportPath = path.join(reportDir, `eval-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      scenarios: scenarioSummaries,
      details:   allResults,
    }, null, 2), 'utf8');
    console.log(`\n  💾  Report → ${reportPath}`);
  }

  return { scenarioSummaries, allResults };
}
