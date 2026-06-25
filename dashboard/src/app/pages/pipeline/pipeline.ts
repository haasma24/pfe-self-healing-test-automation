import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ScoreBar } from '../../shared/score-bar/score-bar';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardResponse, FunnelStep, Candidate } from '../../models/pipeline.model';

@Component({
  selector: 'app-pipeline',
  standalone: true,
  imports: [CommonModule, ScoreBar],
  templateUrl: './pipeline.html',
  styleUrl: './pipeline.scss'
})
export class Pipeline implements OnInit, OnDestroy {

  data: DashboardResponse | null = null;
  loading = true;
  showLogs = false;
  private sub!: Subscription;

  constructor(private dash: DashboardService) {}

  ngOnInit(): void {
    this.sub = this.dash.getDashboardStream().subscribe(d => {
      this.data = d;
      this.loading = false;
    });
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  get funnel(): FunnelStep[] { return this.data?.lastRunDetails?.funnel ?? []; }
  get candidates(): Candidate[] { return this.data?.lastRunDetails?.candidates ?? []; }
  get logs(): string[] { return this.data?.lastRunDetails?.logs ?? []; }

  get stageTimings(): { name: string; time: number; pct: number }[] {
    const timings = this.data?.lastRunDetails?.stageTimings ?? [];
    const total = this.data?.lastRunDetails?.pipelineTimeSeconds ?? 1;
    return this.funnel.map((f, i) => ({
      name: f.name,
      time: timings[i] ?? 0,
      pct: Math.round(((timings[i] ?? 0) / total) * 100)
    }));
  }

  scoreColor(score: number): string {
    if (score >= 0.8) return 'var(--green)';
    if (score >= 0.6) return 'var(--accent)';
    if (score >= 0.4) return 'var(--amber)';
    return 'var(--red)';
  }

  expandedLogs: Set<number> = new Set();

  toggleLog(i: number): void {
    if (this.expandedLogs.has(i)) this.expandedLogs.delete(i);
    else this.expandedLogs.add(i);
  }

  isLogExpanded(i: number): boolean { return this.expandedLogs.has(i); }

  trackByIndex(i: number): number { return i; }
  trackByCandidate(i: number, c: Candidate): string { return c.id ?? String(i); }
  trackByStage(i: number): number { return i; }
  trackByTiming(i: number): number { return i; }
}