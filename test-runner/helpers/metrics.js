// helpers/metrics.js
// ══════════════════════════════════════════════════════════════════════════════
//  Self-Healing Pipeline — Metrics Engine
//
//  Generates comparable metrics for the self-healing pipeline:
//    • Accuracy, Precision, Recall, F1
//    • False positive rate (healed but wrong element)
//    • Heal time distribution (typo vs ML pipeline)
//    • Pipeline layer contribution (Semantic / TF-IDF / Visual)
//    • Confidence score distribution
//    • Per-scenario breakdowns
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
//  1. CORE CLASSIFICATION
//     Maps each result into one of 4 standard categories.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Classifies a single heal result.
 *
 * ┌─────────────────┬────────────────────────────────────────────────────────┐
 * │  Category       │  Meaning                                               │
 * ├─────────────────┼────────────────────────────────────────────────────────┤
 * │  TP (True Pos)  │  API said "healed" + correct element found             │
 * │  FP (False Pos) │  API said "healed" + WRONG element returned            │
 * │  TN (True Neg)  │  API said "failed" + no valid target existed           │
 * │  FN (False Neg) │  API said "failed" + correct target DID exist          │
 * └─────────────────┴────────────────────────────────────────────────────────┘
 *
 * @param {object} result     - Single result from evaluator.runScenario()
 * @param {boolean} hasTarget - Whether a healable target was expected to exist
 */
export function classify(result, hasTarget = true) {
  const healed  = result.api_success === true;
  const correct = result.correct === true;

  if (healed && correct)  return 'TP';
  if (healed && !correct) return 'FP';
  if (!healed && !hasTarget) return 'TN';
  return 'FN'; // !healed && hasTarget
}


// ─────────────────────────────────────────────────────────────────────────────
//  2. AGGREGATE METRICS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Computes all comparable metrics from a flat array of classified results.
 *
 * @param {object[]} results  - Results enriched with `.classification` field
 * @returns {object}          - Full metrics object
 */
export function computeMetrics(results) {
  const tp = results.filter(r => r.classification === 'TP').length;
  const fp = results.filter(r => r.classification === 'FP').length;
  const tn = results.filter(r => r.classification === 'TN').length;
  const fn = results.filter(r => r.classification === 'FN').length;

  const total    = results.length;
  const healed   = tp + fp;
  const notHeal  = tn + fn;

  // ── Core rates ─────────────────────────────────────────────────────────────
  const accuracy        = total > 0 ? (tp + tn) / total : 0;
  const precision       = healed > 0 ? tp / healed : 0;
  const recall          = (tp + fn) > 0 ? tp / (tp + fn) : 0;
  const f1              = (precision + recall) > 0
                            ? 2 * (precision * recall) / (precision + recall)
                            : 0;
  const falsePositiveRate = healed > 0 ? fp / healed : 0;
  const falseNegativeRate = (tp + fn) > 0 ? fn / (tp + fn) : 0;
  const healRate          = total > 0 ? healed / total : 0;

  // ── Timing ─────────────────────────────────────────────────────────────────
  const timings   = results.filter(r => typeof r.heal_time_ms === 'number');
  const typoTimes = timings.filter(r => r.strategy === 'typo').map(r => r.heal_time_ms);
  const mlTimes   = timings.filter(r => r.strategy === 'ml').map(r => r.heal_time_ms);
  const allTimes  = timings.map(r => r.heal_time_ms);

  const timing = {
    overall:  _timingStats(allTimes),
    typo:     _timingStats(typoTimes),
    ml:       _timingStats(mlTimes),
  };

  // ── Confidence score distribution ──────────────────────────────────────────
  const scores = results.filter(r => typeof r.score === 'number').map(r => r.score);
  const scoreDistribution = _scoreDistribution(scores);

  // ── Strategy breakdown ─────────────────────────────────────────────────────
  const byStrategy = {};
  for (const r of results) {
    const s = r.strategy || 'unknown';
    if (!byStrategy[s]) byStrategy[s] = { total: 0, tp: 0, fp: 0, fn: 0, tn: 0 };
    byStrategy[s].total++;
    byStrategy[s][r.classification.toLowerCase()]++;
  }
  for (const s of Object.keys(byStrategy)) {
    const b = byStrategy[s];
    const h = b.tp + b.fp;
    byStrategy[s].precision = h > 0 ? b.tp / h : 0;
    byStrategy[s].recall    = (b.tp + b.fn) > 0 ? b.tp / (b.tp + b.fn) : 0;
  }

  // ── Layer contribution (from pipeline_layers field if present) ─────────────
  const layerStats = _computeLayerStats(results);

  return {
    summary: {
      total,
      tp, fp, tn, fn,
      healed,
      failed: notHeal,
    },
    rates: {
      accuracy:          _pct(accuracy),
      precision:         _pct(precision),
      recall:            _pct(recall),
      f1:                _round(f1, 4),
      false_positive_rate: _pct(falsePositiveRate),
      false_negative_rate: _pct(falseNegativeRate),
      heal_rate:         _pct(healRate),
    },
    timing,
    scoreDistribution,
    byStrategy,
    layerStats,
    generatedAt: new Date().toISOString(),
  };
}


// ─────────────────────────────────────────────────────────────────────────────
//  3. SCENARIO ENRICHMENT
//     Takes raw evaluator output and adds classification + timing fields.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Enriches a flat results array (from evaluator.runScenario) with:
 *   • classification (TP/FP/TN/FN)
 *   • heal_time_ms  (from api result if present)
 *   • strategy      (typo | ml | unknown)
 *
 * @param {object[]} results
 * @param {object}   [options]
 * @param {boolean}  [options.allTargetsExist=true] - assume every broken selector has a target
 */
export function enrichResults(results, { allTargetsExist = true } = {}) {
  return results.map(r => ({
    ...r,
    classification: classify(r, r.has_target ?? allTargetsExist),
    heal_time_ms:   r.heal_time_ms ?? r.pipelineTime ?? null,
    strategy:       r.strategy ?? (r.score === 0.95 ? 'typo' : 'ml'),
  }));
}


// ─────────────────────────────────────────────────────────────────────────────
//  4. SCENARIO FILE RUNNER (wraps existing evaluator)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Runs all scenarios in a directory and returns full metrics.
 * Drop-in enhancement for scripts/run-eval.js.
 *
 * @param {string}   scenariosDir
 * @param {string}   [reportDir]
 * @param {Function} runScenarioFn  - evaluator.runScenario
 */
export async function runWithMetrics(scenariosDir, reportDir, runScenarioFn) {
  const files = fs.readdirSync(scenariosDir)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(scenariosDir, f));

  if (files.length === 0) {
    console.warn('[Metrics] No scenario files found in', scenariosDir);
    return null;
  }

  const allRaw          = [];
  const scenarioDetails = [];

  for (const file of files) {
    const t0      = Date.now();
    const raw     = await runScenarioFn(file);
    const elapsed = Date.now() - t0;

    // Attach timing to individual results if API didn't return it
    const withTiming = raw.map(r => ({
      ...r,
      heal_time_ms: r.heal_time_ms ?? r.pipelineTime ?? (elapsed / raw.length),
    }));

    const enriched = enrichResults(withTiming);
    const metrics  = computeMetrics(enriched);

    scenarioDetails.push({
      file:    path.basename(file),
      metrics,
      results: enriched,
    });

    allRaw.push(...enriched);
  }

  const globalMetrics = computeMetrics(allRaw);

  _printMetricsReport(globalMetrics, scenarioDetails);

  if (reportDir) {
    fs.mkdirSync(reportDir, { recursive: true });
    const reportPath = path.join(reportDir, `metrics-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify({
      global:    globalMetrics,
      scenarios: scenarioDetails,
    }, null, 2), 'utf8');
    console.log(`\n  💾  Metrics report → ${reportPath}`);
  }

  return { globalMetrics, scenarioDetails, allResults: allRaw };
}


// ─────────────────────────────────────────────────────────────────────────────
//  5. CONSOLE REPORT
// ─────────────────────────────────────────────────────────────────────────────

export function _printMetricsReport(metrics, scenarioDetails = []) {
  const { summary, rates, timing, byStrategy, layerStats } = metrics;

  console.log('\n' + '═'.repeat(62));
  console.log('  SELF-HEALING METRICS REPORT');
  console.log('═'.repeat(62));

  // ── Confusion matrix ───────────────────────────────────────────────────────
  console.log('\n  CONFUSION MATRIX');
  console.log(`    TP (healed + correct)  : ${summary.tp}`);
  console.log(`    FP (healed + WRONG)    : ${summary.fp}  ← false positives`);
  console.log(`    FN (not healed, missed): ${summary.fn}  ← false negatives`);
  console.log(`    TN (correctly skipped) : ${summary.tn}`);

  // ── Core rates ─────────────────────────────────────────────────────────────
  console.log('\n  RATES');
  console.log(`    Accuracy              : ${rates.accuracy}`);
  console.log(`    Precision             : ${rates.precision}  (of healed, how many correct)`);
  console.log(`    Recall                : ${rates.recall}  (of healable, how many found)`);
  console.log(`    F1 Score              : ${rates.f1}`);
  console.log(`    False Positive Rate   : ${rates.false_positive_rate}  (healed but wrong)`);
  console.log(`    False Negative Rate   : ${rates.false_negative_rate}  (missed healable)`);
  console.log(`    Heal Rate             : ${rates.heal_rate}  (attempted / total)`);

  // ── Timing ─────────────────────────────────────────────────────────────────
  console.log('\n  TIMING (ms)');
  _printTimingRow('Overall', timing.overall);
  _printTimingRow('Typo pass', timing.typo);
  _printTimingRow('ML pipeline', timing.ml);

  // ── Strategy ───────────────────────────────────────────────────────────────
  if (Object.keys(byStrategy).length > 0) {
    console.log('\n  BY STRATEGY');
    for (const [strat, s] of Object.entries(byStrategy)) {
      console.log(`    ${strat.padEnd(12)} total=${s.total}  TP=${s.tp}  FP=${s.fp}  precision=${_pct(s.precision)}  recall=${_pct(s.recall)}`);
    }
  }

  // ── Layers ─────────────────────────────────────────────────────────────────
  if (layerStats.length > 0) {
    console.log('\n  PIPELINE LAYER CONTRIBUTION');
    for (const l of layerStats) {
      const bar = '█'.repeat(Math.round(l.avgScore * 20)).padEnd(20, '░');
      console.log(`    ${l.name.padEnd(12)} avg=${l.avgScore.toFixed(3)}  [${bar}]  n=${l.count}`);
    }
  }

  // ── Score distribution ─────────────────────────────────────────────────────
  const dist = metrics.scoreDistribution;
  if (dist.count > 0) {
    console.log('\n  CONFIDENCE SCORE DISTRIBUTION');
    console.log(`    min=${dist.min.toFixed(3)}  p25=${dist.p25.toFixed(3)}  median=${dist.median.toFixed(3)}  p75=${dist.p75.toFixed(3)}  max=${dist.max.toFixed(3)}`);
    console.log(`    mean=${dist.mean.toFixed(3)}  stddev=${dist.stddev.toFixed(3)}`);
    console.log(`    above 0.8: ${dist.highConfidence}  |  0.45–0.8: ${dist.mediumConfidence}  |  below 0.45: ${dist.lowConfidence}`);
  }

  // ── Per-scenario summary ───────────────────────────────────────────────────
  if (scenarioDetails.length > 1) {
    console.log('\n  PER-SCENARIO BREAKDOWN');
    for (const s of scenarioDetails) {
      const r = s.metrics.rates;
      console.log(
        `    ${s.file.padEnd(35)} acc=${r.accuracy}  prec=${r.precision}  FPR=${r.false_positive_rate}`
      );
    }
  }

  console.log('\n' + '═'.repeat(62) + '\n');
}


// ─────────────────────────────────────────────────────────────────────────────
//  6. COMPARISON TABLE BUILDER
//     Generates a structured object suitable for reporting vs competitors.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds a side-by-side comparison table entry from your metrics.
 * Fill in the `competitors` object with values from their published benchmarks.
 *
 * @param {object} yourMetrics       - Output of computeMetrics()
 * @param {object} [competitors={}]  - { name: { accuracy, fpr, avgTimeMs, ... }, ... }
 */
export function buildComparisonTable(yourMetrics, competitors = {}) {
  const yours = {
    name:              'Your Healer',
    accuracy:          yourMetrics.rates.accuracy,
    precision:         yourMetrics.rates.precision,
    recall:            yourMetrics.rates.recall,
    f1:                yourMetrics.rates.f1,
    false_positive_rate: yourMetrics.rates.false_positive_rate,
    avg_time_ms:       yourMetrics.timing.overall.mean?.toFixed(0) ?? 'N/A',
    p95_time_ms:       yourMetrics.timing.overall.p95?.toFixed(0) ?? 'N/A',
    typo_time_ms:      yourMetrics.timing.typo.mean?.toFixed(0) ?? 'N/A',
    ml_time_ms:        yourMetrics.timing.ml.mean?.toFixed(0) ?? 'N/A',
  };

  const rows = [yours];
  for (const [name, data] of Object.entries(competitors)) {
    rows.push({ name, ...data });
  }

  return rows;
}


// ─────────────────────────────────────────────────────────────────────────────
//  PRIVATE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function _timingStats(arr) {
  if (!arr || arr.length === 0) return { count: 0, mean: null, median: null, p95: null, min: null, max: null, stddev: null };
  const sorted = [...arr].sort((a, b) => a - b);
  const n      = sorted.length;
  const mean   = arr.reduce((s, v) => s + v, 0) / n;
  const variance = arr.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
  return {
    count:  n,
    mean:   _round(mean),
    median: _round(sorted[Math.floor(n / 2)]),
    p95:    _round(sorted[Math.floor(n * 0.95)]),
    p99:    _round(sorted[Math.floor(n * 0.99)]),
    min:    _round(sorted[0]),
    max:    _round(sorted[n - 1]),
    stddev: _round(Math.sqrt(variance)),
  };
}

function _scoreDistribution(scores) {
  if (!scores || scores.length === 0) return { count: 0 };
  const sorted = [...scores].sort((a, b) => a - b);
  const n      = sorted.length;
  const mean   = scores.reduce((s, v) => s + v, 0) / n;
  const variance = scores.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
  return {
    count:            n,
    mean:             _round(mean, 4),
    stddev:           _round(Math.sqrt(variance), 4),
    min:              sorted[0],
    p25:              sorted[Math.floor(n * 0.25)],
    median:           sorted[Math.floor(n * 0.5)],
    p75:              sorted[Math.floor(n * 0.75)],
    max:              sorted[n - 1],
    highConfidence:   scores.filter(s => s >= 0.8).length,
    mediumConfidence: scores.filter(s => s >= 0.45 && s < 0.8).length,
    lowConfidence:    scores.filter(s => s < 0.45).length,
  };
}

function _computeLayerStats(results) {
  const layers = {};
  for (const r of results) {
    if (!r.pipeline_layers) continue;
    for (const [layerName, score] of Object.entries(r.pipeline_layers)) {
      if (!layers[layerName]) layers[layerName] = [];
      layers[layerName].push(score);
    }
  }
  return Object.entries(layers).map(([name, scores]) => ({
    name,
    count:    scores.length,
    avgScore: _round(scores.reduce((s, v) => s + v, 0) / scores.length, 4),
    maxScore: Math.max(...scores),
  }));
}

function _printTimingRow(label, t) {
  if (!t || t.count === 0) { console.log(`    ${label.padEnd(14)} no data`); return; }
  console.log(
    `    ${label.padEnd(14)} mean=${t.mean}ms  median=${t.median}ms  p95=${t.p95}ms  min=${t.min}ms  max=${t.max}ms  n=${t.count}`
  );
}

function _pct(v) {
  return typeof v === 'number' ? (v * 100).toFixed(1) + '%' : 'N/A';
}

function _round(v, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(v * factor) / factor;
}


// ─────────────────────────────────────────────────────────────────────────────
//  SCORE NOTE — exported for run-metrics.js to print
// ─────────────────────────────────────────────────────────────────────────────
export function printScoreNote() {
  console.log('\n  NOTE SUR LES SCORES');
  console.log('  Les scores de précision, rappel et F1 sont basés sur les classifications TP/FP/TN/FN selon les définitions suivantes :');
  console.log('    • TP (True Positive) : le pipeline a dit "guéri" et a trouvé le bon élément');
  console.log('    • FP (False Positive): le pipeline a dit "guéri" mais a trouvé un élément incorrect');
  console.log('    • TN (True Negative) : le pipeline a dit "échec" et il n\'y avait pas de cible guérissable');
  console.log('    • FN (False Negative): le pipeline a dit "échec" mais il y avait une cible guérissable qui a été manquée');
}
