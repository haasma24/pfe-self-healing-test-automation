// scripts/ablation.js
'use strict';

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { runScenario } from '../helpers/evaluator.js';
import { enrichResults, computeMetrics, _printMetricsReport } from '../helpers/metrics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const SCENARIOS_DIR = path.resolve(__dirname, '../eval/scenarios');
const REPORT_DIR    = path.resolve(__dirname, '../eval/reports/ablation');

const ABLATION_CONFIGS = [
  {
    label: '1. Semantic (SBERT) Only',
    description: 'SBERT embeddings seul — aucune fusion',
    skipStages: ['contextual', 'tfidf', 'ssim', 'cnn'],
  },
  {
    label: '2. Semantic + Contextual',
    description: 'SBERT + ARIA/Tag — pas de TF-IDF, SSIM ou CNN',
    skipStages: ['tfidf', 'ssim', 'cnn'],
  },
  {
    label: '3. Semantic + Contextual + TF-IDF',
    description: 'SBERT + ARIA + TF-IDF — pas de SSIM ou CNN',
    skipStages: ['ssim', 'cnn'],
  },
  {
    label: '4. Semantic + Contextual + TF-IDF + SSIM',
    description: 'Tous sauf CNN (EfficientNet-B0 désactivé)',
    skipStages: ['cnn'],
  },
  {
    label: '5. Full Pipeline (All 5 Stages)',
    description: 'Pipeline complète — SBERT + ARIA + TF-IDF + SSIM + CNN',
    skipStages: [],
  },
];

const QUICK_CONFIG = {
  label: 'Quick Mode (no SSIM, no CNN)',
  description: 'Mode rapide — saute les étages visuels lourds',
  skipStages: ['ssim', 'cnn'],
};

async function runAblation() {
  const args = process.argv.slice(2);
  const quickMode = args.includes('--quick');
  const saveReports = !args.includes('--no-save');

  const configs = quickMode ? [QUICK_CONFIG] : ABLATION_CONFIGS;

  if (!fs.existsSync(SCENARIOS_DIR)) {
    console.error(`[Ablation] Scenarios dir not found: ${SCENARIOS_DIR}`);
    process.exit(1);
  }

  const scenarioFiles = fs.readdirSync(SCENARIOS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(SCENARIOS_DIR, f));

  if (scenarioFiles.length === 0) {
    console.error('[Ablation] No .json scenario files found.');
    process.exit(1);
  }

  console.log('\n' + '█'.repeat(70));
  console.log('  ABLATION STUDY — Self-Healing Pipeline');
  console.log('  Compare les métriques de chaque combinaison d\'étages');
  console.log('█'.repeat(70) + '\n');

  if (quickMode) {
    console.log('  ⚡ Quick mode: seul le mode rapide est exécuté (SSIM + CNN désactivés)');
  }

  console.log(`  Scénarios: ${scenarioFiles.length} fichiers, ${configs.length} configurations\n`);

  const allResults = [];

  for (const config of configs) {
    console.log('\n' + '═'.repeat(70));
    console.log(`  ${config.label}`);
    console.log(`  ${config.description}`);
    console.log(`  skipStages: ${JSON.stringify(config.skipStages)}`);
    console.log('═'.repeat(70));

    const configResults = [];
    const tStart = Date.now();

    for (const file of scenarioFiles) {
      const raw = await runScenario(file, { skipStages: config.skipStages });
      configResults.push(...raw);
    }

    const elapsed = (Date.now() - tStart) / 1000;

    const enriched = enrichResults(configResults);
    const metrics = computeMetrics(enriched);

    config.results = enriched;
    config.metrics = metrics;
    config.timeSec = elapsed;

    _printMetricsReport(metrics);
    console.log(`\n  ⏱  Total time: ${elapsed.toFixed(1)}s`);

    allResults.push(config);
  }

  // ── Ablation comparison table ─────────────────────────────────────────────
  console.log('\n' + '█'.repeat(70));
  console.log('  ABLATION COMPARISON — Summary');
  console.log('█'.repeat(70));

  console.log('\n');
  console.log('  ' + 'Config'.padEnd(42) + 'Accuracy  Precision  Recall    F1        FPR      Avg(ms)   Time(s)');
  console.log('  ' + '─'.repeat(42) + '────────  ─────────  ────────  ────────  ───────  ────────  ───────');

  for (const r of allResults) {
    const m = r.metrics;
    const row = [
      r.label.padEnd(40),
      (m.rates.accuracy || 'N/A').padEnd(10),
      (m.rates.precision || 'N/A').padEnd(10),
      (m.rates.recall || 'N/A').padEnd(9),
      (String(m.rates.f1) || 'N/A').padEnd(9),
      (m.rates.false_positive_rate || 'N/A').padEnd(8),
      (m.timing.overall.mean ? m.timing.overall.mean.toFixed(0) : 'N/A').padEnd(9),
      r.timeSec.toFixed(1),
    ];
    console.log('  ' + row.join(''));
  }

  console.log('  ' + '─'.repeat(42) + '────────  ─────────  ────────  ────────  ───────  ────────  ───────');

  // Show deltas between successive configs
  console.log('\n  INDIVIDUAL LAYER CONTRIBUTION (delta par ajout)');
  console.log('  ' + '─'.repeat(70));

  for (let i = 1; i < allResults.length; i++) {
    const prev = allResults[i - 1].metrics;
    const curr = allResults[i].metrics;

    const stageName = allResults[i].label.split('+').pop()?.trim() || allResults[i].label;
    const accDelta = ((parseFloat(curr.rates.accuracy) - parseFloat(prev.rates.accuracy)) / 100).toFixed(3);
    const f1Delta = (curr.rates.f1 - prev.rates.f1).toFixed(4);

    console.log(`    +${stageName.padEnd(30)}  ΔAccuracy=${accDelta.startsWith('-') ? '' : '+'}${(accDelta * 100).replace('0.','.')}%  ΔF1=${f1Delta.startsWith('-') ? '' : '+'}${f1Delta}`);
  }

  // ── Save report ───────────────────────────────────────────────────────────
  if (saveReports) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });

    const summary = {
      generatedAt: new Date().toISOString(),
      configs: allResults.map(r => ({
        label: r.label,
        description: r.description,
        skipStages: r.skipStages,
        timeSec: r.timeSec,
        metrics: r.metrics,
      })),
    };

    const outPath = path.join(REPORT_DIR, `ablation-${Date.now()}.json`);
    fs.writeFileSync(outPath, JSON.stringify(summary, null, 2), 'utf8');

    // Markdown report
    const mdPath = path.join(REPORT_DIR, `ablation-${Date.now()}.md`);
    const mdLines = [];
    mdLines.push('# Ablation Study Report');
    mdLines.push('');
    mdLines.push(`Generated: ${new Date().toISOString()}`);
    mdLines.push('');
    mdLines.push('## Configuration Comparison');
    mdLines.push('');
    mdLines.push('| Config | Accuracy | Precision | Recall | F1 | FPR | Avg Time (ms) | Total Time (s) |');
    mdLines.push('|--------|----------|-----------|--------|----|-----|---------------|----------------|');

    for (const r of allResults) {
      const m = r.metrics;
      mdLines.push(`| ${r.label} | ${m.rates.accuracy} | ${m.rates.precision} | ${m.rates.recall} | ${m.rates.f1} | ${m.rates.false_positive_rate} | ${m.timing.overall.mean ? m.timing.overall.mean.toFixed(0) : 'N/A'} | ${r.timeSec.toFixed(1)} |`);
    }

    mdLines.push('');
    mdLines.push('## Layer Contribution (Δ)');
    mdLines.push('');
    mdLines.push('| Layer Added | ΔAccuracy | ΔF1 |');
    mdLines.push('|-------------|-----------|-----|');

    for (let i = 1; i < allResults.length; i++) {
      const prev = parseFloat(allResults[i - 1].metrics.rates.accuracy);
      const curr = parseFloat(allResults[i].metrics.rates.accuracy);
      const accDelta = ((curr - prev) / 100).toFixed(3);
      const f1Delta = (allResults[i].metrics.rates.f1 - allResults[i - 1].metrics.rates.f1).toFixed(4);
      const stageName = allResults[i].label.split('+').pop()?.trim() || allResults[i].label;
      mdLines.push(`| ${stageName} | ${accDelta} | ${f1Delta} |`);
    }

    fs.writeFileSync(mdPath, mdLines.join('\n'), 'utf8');

    console.log(`\n  💾  Ablation report → ${outPath}`);
    console.log(`  📊  Markdown report → ${mdPath}`);
  }

  // ── Winner ────────────────────────────────────────────────────────────────
  if (allResults.length > 1) {
    console.log('\n  ★ BEST CONFIG:', allResults[allResults.length - 1].label);
    console.log('    (Les configurations complètes obtiennent généralement les meilleures performances)\n');
  }
}

runAblation().catch(err => {
  console.error('[Ablation] Fatal error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
