import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import {
  TimelineChart, DonutChart, GaugeChart, FunnelChart, ScoreDistribution
} from '../../shared/charts/charts';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardResponse, Candidate, LocatorResult } from '../../models/pipeline.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    TimelineChart, DonutChart, GaugeChart, FunnelChart, ScoreDistribution
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit, OnDestroy {

  data: DashboardResponse | null = null;
  loading = true;
  hasUrl = false;
  connected: boolean | undefined = false;
  inlineUrl = '';
  urlSaved = false;
  showSetup = true;

  zoomImage: string | null = null;
  imgError = { annotated: false, baseline: false };
  candidateZoom: Candidate | null = null;

  private subs: Subscription[] = [];

  constructor(private dash: DashboardService, private router: Router) {}

  ngOnInit(): void {
    this.inlineUrl = this.dash.getApiUrl();
    this.showSetup = !this.inlineUrl.trim();

    this.subs.push(
      this.dash.getDashboardStream().subscribe(d => {
        this.data = d;
        this.loading = false;
      }),
      this.dash.hasUrl$.subscribe(v => {
        this.hasUrl = v;
        if (v) this.showSetup = false;
      }),
      this.dash.connected$.subscribe(v => {
        this.connected = v;
        if (!v && this.hasUrl && !this.showSetup) {
          this.loading = false;
        }
      })
    );
  }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }

  saveUrl(): void {
    if (!this.inlineUrl.trim()) return;
    this.dash.setApiUrl(this.inlineUrl.trim());
    this.urlSaved = true;
    this.showSetup = false;
    this.loading = true;
  }

  disconnect(): void {
    this.dash.setApiUrl('');
    this.inlineUrl = '';
    this.showSetup = true;
    this.loading = false;
    this.data = null;
  }

  get healRate(): number {
    const s = this.data?.stats;
    if (!s || s.total_attempts === 0) return 0;
    return Math.round(((s.total_attempts - s.failed_heals) / s.total_attempts) * 100);
  }

  get healRateColor(): string {
    const r = this.healRate;
    return r >= 80 ? 'var(--green)' : r >= 50 ? 'var(--amber)' : 'var(--red)';
  }

  get topCandidates() {
    return (this.data?.lastRunDetails?.candidates ?? []).slice(0, 5);
  }

  get winner() {
    return this.data?.lastRunDetails?.winner ?? {};
  }

  get verdict(): string {
    const score = this.data?.lastRunDetails?.bestScore ?? 0;
    if (score >= 0.8) return '✓ SUCCESSFULLY HEALED';
    if (score >= 0.5) return '⚠ LOW CONFIDENCE';
    return '✗ HEAL FAILED';
  }

  get verdictClass(): string {
    const score = this.data?.lastRunDetails?.bestScore ?? 0;
    return score >= 0.8 ? 'verdict-ok' : score >= 0.5 ? 'verdict-warn' : 'verdict-fail';
  }

  get stageColors(): string[] {
    return ['var(--accent)', 'var(--green)', 'var(--amber)', 'var(--blue)', 'var(--pink)'];
  }

  get funnelData() {
    const f = this.data?.lastRunDetails?.funnel ?? [];
    const colors = this.stageColors;
    return f.map((s, i) => ({
      name: s.name,
      count: s.count,
      pct: Math.round(s.pct),
      color: colors[i % colors.length]
    }));
  }

  get stageTimingData() {
    return this.data?.lastRunDetails?.stageTimings ?? [];
  }

  get stageTimingLabels() {
    const f = this.data?.lastRunDetails?.funnel ?? [];
    return f.map(s => s.name.substring(0, 4));
  }

  get timelineData() {
    const h = this.data?.history ?? [];
    return h.slice(-10).map(e => ({
      value: e.confidence ?? 0,
      label: e.ts ? e.ts.substring(11, 16) : ''
    }));
  }

  get donutData() {
    const s = this.data?.stats;
    if (!s) return [];
    const healed = s.total_attempts - s.failed_heals;
    return [
      { name: 'Healed', value: healed, color: 'var(--green)' },
      { name: 'Failed', value: s.failed_heals, color: 'var(--red)' },
    ];
  }

  get scoreBars() {
    const candidates = this.data?.lastRunDetails?.candidates ?? [];
    if (candidates.length === 0) return [];
    const buckets = [
      { label: '0.8–1.0', min: 0.8, max: 1.01, color: 'var(--green)' },
      { label: '0.6–0.8', min: 0.6, max: 0.8,  color: 'var(--accent)' },
      { label: '0.4–0.6', min: 0.4, max: 0.6,  color: 'var(--amber)' },
      { label: '0.2–0.4', min: 0.2, max: 0.4,  color: 'rgba(140,140,200,0.4)' },
      { label: '0.0–0.2', min: 0.0, max: 0.2,  color: 'rgba(100,100,160,0.25)' },
    ];
    return buckets.map(b => {
      const count = candidates.filter(c => c.blendedScore >= b.min && c.blendedScore < b.max).length;
      return { label: b.label, count, color: b.color };
    });
  }

  get signalScores() {
    return (this.data?.lastRunDetails?.layers ?? []).map(l => ({
      label: l.label || l.name,
      score: l.score,
      color: l.color || 'var(--accent)'
    }));
  }

  get history() {
    return this.data?.history ?? [];
  }

  scoreColor(score: number): string {
    if (score >= 0.8) return 'var(--green)';
    if (score >= 0.6) return 'var(--accent)';
    if (score >= 0.4) return 'var(--amber)';
    return 'var(--red)';
  }

  locatorTypeClass(t: string): string {
    if (t === 'ID') return 'tag--blue';
    if (t === 'Name') return 'tag--amber';
    if (t === 'Class') return 'tag--purple';
    if (t === 'Attr') return 'tag--gold';
    return 'tag--pink';
  }

  stabilityClass(s: string): string {
    if (s === 'high') return 'tag--green';
    if (s === 'medium') return 'tag--purple';
    return 'tag--red';
  }

  get stageTimingMax(): number {
    return Math.max(...this.stageTimingData, 0.01);
  }

  trackByCandidate(i: number, c: any): string { return c.id ?? i; }
  trackByHistory(i: number, h: any): string { return h.ts + (h.brokenSelector ?? ''); }
  trackByLocator(i: number, l: any): string { return l.brokenLocator + (l.healedLocator ?? ''); }
  trackBySignal(i: number, s: any): string { return s.label; }
  trackByTiming(i: number): number { return i; }
  trackByFunnel(i: number): number { return i; }

  get locatorResults(): LocatorResult[] {
    return this.data?.lastRunDetails?.locators ?? [];
  }

  get hasScreenshots(): boolean {
    return !!this.data?.lastRunDetails?.screenshotInfo;
  }

  get screenshotAnnotatedUrl(): string {
    const info = this.data?.lastRunDetails?.screenshotInfo;
    return info ? this.dash.getApiUrl() + info.annotated : '';
  }

  get screenshotBaselineUrl(): string {
    const info = this.data?.lastRunDetails?.screenshotInfo;
    return info ? this.dash.getApiUrl() + info.baseline : '';
  }

  openZoom(url: string): void {
    this.zoomImage = url;
  }

  closeZoom(): void {
    this.zoomImage = null;
  }

  onImgError(type: 'annotated' | 'baseline'): void {
    this.imgError[type] = true;
  }

  readonly zoomColors = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#f97316'];

  selectCandidate(c: Candidate): void {
    if (this.candidateZoom?.rank === c.rank) {
      this.candidateZoom = null;
      return;
    }
    this.candidateZoom = c.cropUrl ? c : null;
  }

  clearCandidateZoom(): void {
    this.candidateZoom = null;
  }

  get selectedCropUrl(): string {
    const url = this.candidateZoom?.cropUrl;
    return url ? this.dash.getApiUrl() + url : '';
  }

  getFullUrl(path: string | null | undefined): string {
    return path ? this.dash.getApiUrl() + path : '';
  }
}
