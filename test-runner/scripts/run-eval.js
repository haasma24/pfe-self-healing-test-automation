// scripts/run-eval.js
import path from 'path';
import { fileURLToPath } from 'url';
import { runAllScenarios } from '../helpers/evaluator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

runAllScenarios(
  path.resolve(__dirname, '../eval/scenarios'),
  path.resolve(__dirname, '../eval/reports')
).catch(console.error);
