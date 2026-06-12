import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { StatCard } from '../../shared/stat-card/stat-card';
import { ScoreBar } from '../../shared/score-bar/score-bar';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardResponse, Candidate, ScoreLayer } from '../../models/pipeline.model';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, StatCard, ScoreBar],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview implements OnInit, OnDestroy {

  data: DashboardResponse | null = null;
  loading = true;
  hasUrl = false;

  // inline URL setup banner
  inlineUrl = '';
  urlSaved = false;

  private subs: Subscription[] = [];

  constructor(private dash: DashboardService, private router: Router) {}

  ngOnInit(): void {
    this.inlineUrl = this.dash.getApiUrl();

    this.subs.push(
      this.dash.getDashboardStream().subscribe(d => {
        this.data = d;
        this.loading = false;
      }),
      this.dash.hasUrl$.subscribe(v => this.hasUrl = v)
    );
  }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }

  saveUrl(): void {
    if (!this.inlineUrl.trim()) return;
    this.dash.setApiUrl(this.inlineUrl.trim());
    this.urlSaved = true;
    setTimeout(() => this.urlSaved = false, 2500);
  }

  goConfig(): void { this.router.navigate(['/configuration']); }

  get healRate(): number {
    const s = this.data?.stats;
    if (!s || s.total_attempts === 0) return 0;
    return Math.round(((s.total_attempts - s.failed_heals) / s.total_attempts) * 100);
  }

  get topCandidates(): Candidate[] {
    return (this.data?.lastRunDetails?.candidates ?? []).slice(0, 5);
  }

  get gaugeOffset(): number {
    const score = this.data?.lastRunDetails?.bestScore ?? 0;
    return 157 * (1 - score);
  }

  get scoreBars(): { range: string; count: number; pct: number; color: string }[] {
    const candidates = this.data?.lastRunDetails?.candidates ?? [];
    if (candidates.length === 0) return [];
    const buckets = [
      { range: '0.8–1.0', min: 0.8, max: 1.01, color: 'var(--green)' },
      { range: '0.6–0.8', min: 0.6, max: 0.8,  color: 'var(--accent)' },
      { range: '0.4–0.6', min: 0.4, max: 0.6,  color: 'var(--amber)' },
      { range: '0.2–0.4', min: 0.2, max: 0.4,  color: 'rgba(88,88,140,0.6)' },
      { range: '0.0–0.2', min: 0.0, max: 0.2,  color: 'rgba(88,88,120,0.4)' },
    ];
    const maxCount = Math.max(...buckets.map(b =>
      candidates.filter(c => c.blendedScore >= b.min && c.blendedScore < b.max).length
    ), 1);
    return buckets.map(b => {
      const count = candidates.filter(c => c.blendedScore >= b.min && c.blendedScore < b.max).length;
      return { range: b.range, count, pct: Math.round((count / maxCount) * 100), color: b.color };
    });
  }

  get signalScores(): ScoreLayer[] { return this.data?.lastRunDetails?.layers ?? []; }
  get funnelStages() { return this.data?.lastRunDetails?.funnel ?? []; }
  get stageArrows(): number[] {
    const len = this.funnelStages.length;
    return len > 1 ? Array(len - 1).fill(0) : [];
  }

  stabilityClass(s: string): string { return s === 'high' ? 'tag-c' : s === 'medium' ? 'tag-d' : 'tag-e'; }
  typeClass(t: string): string {
    if (t === 'ID') return 'tag-a';
    if (t === 'Attr') return 'tag-b';
    if (t === 'Class') return 'tag-a';
    return 'tag-d';
  }
  scoreColor(score: number): string {
    if (score >= 0.8) return 'var(--green)';
    if (score >= 0.6) return 'var(--accent)';
    if (score >= 0.4) return 'var(--amber)';
    return 'var(--red)';
  }
  get verdict(): string {
    const score = this.data?.lastRunDetails?.bestScore ?? 0;
    if (score >= 0.8) return '✓ HEALED SUCCESSFULLY';
    if (score >= 0.5) return '⚠ LOW CONFIDENCE';
    return '✗ HEAL FAILED';
  }
  get verdictClass(): string {
    const score = this.data?.lastRunDetails?.bestScore ?? 0;
    return score >= 0.8 ? 'verdict-ok' : score >= 0.5 ? 'verdict-warn' : 'verdict-fail';
  }
}
