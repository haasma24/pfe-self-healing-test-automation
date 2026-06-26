// scripts/run-metrics.js


'use strict';

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { runScenario } from '../helpers/evaluator.js';
import {
  enrichResults,
  computeMetrics,
  buildComparisonTable,
  _printMetricsReport,
  printScoreNote,
} from '../helpers/metrics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── CLI args ──────────────────────────────────────────────────────────────────
const args        = process.argv.slice(2);
const reportFlag  = args.indexOf('--report');
const fromFlag    = args.indexOf('--from');
const compareFlag = args.indexOf('--compare');

const reportDir   = reportFlag  !== -1 ? args[reportFlag + 1]  : path.resolve(__dirname, '../eval/reports');
const fromFile    = fromFlag    !== -1 ? args[fromFlag + 1]    : null;
const compareRaw  = compareFlag !== -1 ? args[compareFlag + 1] : null;

// ── Parse --compare string: "name:acc=0.90,fpr=0.05,time=100" ────────────────
function parseCompetitors(raw) {
  if (!raw) return {};
  const competitors = {};
  for (const entry of raw.split(';')) {
    const [name, ...pairs] = entry.split(':');
    const data = {};
    for (const pair of (pairs[0] || '').split(',')) {
      const [k, v] = pair.split('=');
      if (k && v) data[k.trim()] = isNaN(v) ? v : parseFloat(v);
    }
    competitors[name.trim()] = data;
  }
  return competitors;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {

  let globalMetrics;
  let allResults = [];
  let scenarioDetails = [];

  // ── Mode A: re-analyze an existing report file ───────────────────────────
  if (fromFile) {
    console.log(`\n[Metrics] Re-analyzing: ${fromFile}`);
    const saved = JSON.parse(fs.readFileSync(fromFile, 'utf8').replace(/^\uFEFF/, ''));

    // Support both raw evaluator output and metrics report format
    if (saved.global) {
      globalMetrics = saved.global;
      console.log('\n[Metrics] Loaded pre-computed metrics from report.\n');
      _printMetricsReport(globalMetrics, saved.scenarios || []);
    } else if (Array.isArray(saved.details)) {
      allResults    = enrichResults(saved.details);
      globalMetrics = computeMetrics(allResults);
      _printMetricsReport(globalMetrics);
    } else {
      console.error('[Metrics] Unrecognized report format.');
      process.exit(1);
    }

  // ── Mode B: run scenarios live ───────────────────────────────────────────
  } else {
    const scenariosDir = path.resolve(__dirname, '../eval/scenarios');

    if (!fs.existsSync(scenariosDir)) {
      console.error(`[Metrics] scenarios dir not found: ${scenariosDir}`);
      console.error(`  Create JSON scenario files in eval/scenarios/ first.`);
      console.error(`  See eval/scenarios/example-scenario.json for format.`);
      process.exit(1);
    }

    const files = fs.readdirSync(scenariosDir)
      .filter(f => f.endsWith('.json'))
      .map(f => path.join(scenariosDir, f));

    if (files.length === 0) {
      console.error('[Metrics] No .json scenario files found.');
      process.exit(1);
    }

    console.log(`\n[Metrics] Running ${files.length} scenario file(s)...\n`);

    for (const file of files) {
      const t0      = Date.now();
      const raw     = await runScenario(file);
      const elapsed = Date.now() - t0;

      const withTiming = raw.map(r => ({
        ...r,
        heal_time_ms: r.heal_time_ms ?? r.pipelineTime ?? (elapsed / raw.length),
      }));

      const enriched     = enrichResults(withTiming);
      const scnMetrics   = computeMetrics(enriched);

      scenarioDetails.push({ file: path.basename(file), metrics: scnMetrics, results: enriched });
      allResults.push(...enriched);
    }

    globalMetrics = computeMetrics(allResults);
    _printMetricsReport(globalMetrics, scenarioDetails);
  }

  printScoreNote();

  // ── Comparison table (only if --compare flag provided) ─────────────────────
  let table = [];
  const competitors = parseCompetitors(compareRaw);
  if (Object.keys(competitors).length > 0) {
    table = buildComparisonTable(globalMetrics, competitors);
    console.log('  COMPARISON TABLE');
    console.log('  ' + '─'.repeat(58));
    const headers = ['Tool', 'Accuracy', 'Precision', 'F1', 'FPR', 'Avg(ms)'];
    console.log('  ' + headers.map((h, i) => h.padEnd(i === 0 ? 22 : 12)).join(''));
    console.log('  ' + '─'.repeat(58));
    for (const row of table) {
      console.log(
        '  ' + [
          (row.name || '').padEnd(22),
          String(row.accuracy      || 'N/A').padEnd(12),
          String(row.precision     || 'N/A').padEnd(12),
          String(row.f1            || 'N/A').padEnd(12),
          String(row.false_positive_rate || 'N/A').padEnd(12),
          String(row.avg_time_ms   || 'N/A'),
        ].join('')
      );
    }
    console.log('  ' + '─'.repeat(58));
  }

  // ── Save report ────────────────────────────────────────────────────────────
  fs.mkdirSync(reportDir, { recursive: true });
  const outPath = path.join(reportDir, `metrics-${Date.now()}.json`);
  fs.writeFileSync(outPath, JSON.stringify({
    global:      globalMetrics,
    scenarios:   scenarioDetails,
    comparison:  table,
  }, null, 2), 'utf8');
  console.log(`\n  💾  Report saved → ${outPath}\n`);
}

main().catch(err => {
  console.error('[Metrics] Fatal error:', err.message);
  process.exit(1);
});
