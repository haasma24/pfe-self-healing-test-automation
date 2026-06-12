// ── ARCANE Dashboard — Data Models ────────────────────────────────────────

export interface HealingStats {
  total_attempts: number;
  typo_fixes: number;
  ml_fixes: number;
  failed_heals: number;
  start_time: string;
}

export interface SystemMetrics {
  ram: string;
  cpu: string;
  server_status: string;
  device: string;
}

export interface HistoryEntry {
  ts: string;
  brokenSelector: string;
  healedSelector: string;
  confidence: number;
  status: 'healed' | 'failed';
}

export interface ScoreLayer {
  name: string;
  label: string;
  score: number;
  color: string;
}

export interface FunnelStep {
  name: string;
  count: number;
  pct: number;
}

export interface Candidate {
  rank: number;
  id: string;
  tag: string;
  blendedScore: number;
  semanticScore: number;
  contextualScore: number;
  tfidfScore: number;
  ssimScore: number;
  locatorType: string;
  stability: string;
}

export interface LocatorResult {
  testName: string;
  brokenLocator: string;
  healedLocator: string;
  confidence: number | null;
  status: 'healed' | 'failed';
}

export interface LastRunDetails {
  bestScore: number;
  totalCandidates: number;
  pipelineTimeSeconds: number;
  confidenceGap: number;
  winner: Record<string, any>;
  layers: ScoreLayer[];
  funnel: FunnelStep[];
  candidates: Candidate[];
  locators: LocatorResult[];
  stageCounts: number[];
  stageTimings: number[];
  logs: string[];
}

export interface DashboardResponse {
  stats: HealingStats;
  system: SystemMetrics;
  history: HistoryEntry[];
  lastRunDetails: LastRunDetails;
}

export interface UploadedRun {
  id: string;
  name: string;
  uploadedAt: string;
  data: DashboardResponse;
}

export type DataSource = 'live' | 'upload';

// ── Analytics (for History page) ─────────────────────────────────────────

export interface TimelineEntry {
  day: string;
  total: number;
  healed: number;
  failed: number;
  avgConfidence: number;
}

export interface ScoreBucket {
  range: string;
  count: number;
}

export interface BrokenSelector {
  selector: string;
  count: number;
}

export interface StrategyEntry {
  strategy: string;
  total: number;
  healed: number;
  failed: number;
}

export interface AnalyticsSummary {
  total: number;
  healed: number;
  failed: number;
  healRate: number;
  avgConfidence: number;
  avgPipelineTime: number;
  typoFixes: number;
  mlFixes: number;
}

export interface AnalyticsResponse {
  summary: AnalyticsSummary;
  timeline: TimelineEntry[];
  scoreDistribution: ScoreBucket[];
  topBrokenSelectors: BrokenSelector[];
  strategyBreakdown: StrategyEntry[];
}

export interface HistoryRunList {
  runs: any[];
  total: number;
}
