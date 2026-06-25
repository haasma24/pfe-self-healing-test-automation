import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';
import { AnalyticsResponse } from '../../models/pipeline.model';
import { ReplacePipe } from '../../shared/pipes/replace.pipe';
import { DonutChart } from '../../shared/charts/charts';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, ReplacePipe, DonutChart],
  templateUrl: './history.html',
  styleUrl: './history.scss'
})
export class HistoryPage implements OnInit, OnDestroy {

  analytics: AnalyticsResponse | null = null;
  allRuns: any[] = [];
  loading = true;

  statusFilter = '';
  locatorFilter = '';
  sortField = 'ts';
  sortDir: 'asc' | 'desc' = 'desc';
  page = 1;
  pageSize = 15;

  private subs: Subscription[] = [];

  constructor(private dash: DashboardService) {}

  ngOnInit(): void {
    this.subs.push(
      this.dash.getAnalyticsStream().subscribe(data => {
        this.analytics = data;
        this.loading = false;
      })
    );
    this.subs.push(
      this.dash.getHistoryStream().subscribe(r => {
        this.allRuns = r.runs ?? [];
        this.page = 1;
      })
    );
  }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }

  setSort(field: string): void {
    if (this.sortField === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDir = 'desc';
    }
    this.page = 1;
  }

  sortIcon(field: string): string {
    if (this.sortField !== field) return '⇅';
    return this.sortDir === 'asc' ? '▲' : '▼';
  }

  get filteredRuns(): any[] {
    let list = this.allRuns;
    if (this.statusFilter) {
      list = list.filter(r => r.status === this.statusFilter);
    }
    if (this.locatorFilter) {
      const q = this.locatorFilter.toLowerCase();
      list = list.filter(r =>
        (r.broken_selector && r.broken_selector.toLowerCase().includes(q)) ||
        (r.healed_selector && r.healed_selector.toLowerCase().includes(q))
      );
    }
    const dir = this.sortDir === 'asc' ? 1 : -1;
    list = [...list].sort((a, b) => {
      let va: any, vb: any;
      switch (this.sortField) {
        case 'ts':
          va = a.ts;
          vb = b.ts;
          break;
        case 'broken_selector':
          va = (a.broken_selector || '').toLowerCase();
          vb = (b.broken_selector || '').toLowerCase();
          break;
        case 'healed_selector':
          va = (a.healed_selector || '').toLowerCase();
          vb = (b.healed_selector || '').toLowerCase();
          break;
        case 'confidence':
          va = a.confidence ?? 0;
          vb = b.confidence ?? 0;
          break;
        default:
          va = a.ts;
          vb = b.ts;
      }
      return va < vb ? -dir : va > vb ? dir : 0;
    });
    return list;
  }

  get dateGroups(): { date: string; runs: any[] }[] {
    const groups: { date: string; runs: any[] }[] = [];
    const sorted = this.filteredRuns;
    for (const r of sorted) {
      const d = (r.ts || '').substring(0, 10);
      const last = groups[groups.length - 1];
      if (last && last.date === d) {
        last.runs.push(r);
      } else {
        groups.push({ date: d, runs: [r] });
      }
    }
    return groups;
  }

  get pagedRuns(): any[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredRuns.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredRuns.length / this.pageSize));
  }

  get startEntry(): number {
    return this.filteredRuns.length ? (this.page - 1) * this.pageSize + 1 : 0;
  }

  get endEntry(): number {
    return Math.min(this.page * this.pageSize, this.filteredRuns.length);
  }

  setFilter(type: 'status', value: string): void {
    this.statusFilter = value;
    this.page = 1;
  }

  selectedRun: any | null = null;

  showDetails(run: any): void {
    this.selectedRun = run;
  }

  closeDetails(): void {
    this.selectedRun = null;
  }

  get pages(): number[] {
    const total = this.totalPages;
    const cur = this.page;
    const maxVisible = 7;
    if (total <= maxVisible) return Array.from({ length: total }, (_, i) => i + 1);
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, cur - half);
    let end = Math.min(total, cur + half);
    if (end - start + 1 < maxVisible) {
      if (start === 1) end = Math.min(total, start + maxVisible - 1);
      else start = Math.max(1, end - maxVisible + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
  }

  get kpis() {
    const s = this.analytics?.summary;
    if (!s) return null;
    return [
      { label: 'Total Runs',      value: String(s.total ?? 0),                         sub: 'all time',           accent: 'var(--accent)' },
      { label: 'Heal Rate',       value: ((s.healRate ?? 0)).toFixed(1) + '%',          sub: `${s.healed ?? 0} healed / ${s.failed ?? 0} failed`, accent: 'var(--green)' },
      { label: 'Avg Confidence',  value: ((s.avgConfidence ?? 0)).toFixed(3),           sub: 'healed runs',        accent: 'var(--blue)'   },
      { label: 'Avg Time',        value: ((s.avgPipelineTime ?? 0)).toFixed(2) + 's',   sub: 'per heal call',      accent: 'var(--amber)'  },
    ];
  }

  get timeline() { return this.analytics?.timeline ?? []; }
  get scoreDistribution() { return this.analytics?.scoreDistribution ?? []; }
  get topBroken() { return this.analytics?.topBrokenSelectors ?? []; }
  get maxTimelineCount(): number {
    return Math.max(...this.timeline.map(t => t.total), 1);
  }

  get maxBrokenCount(): number {
    return Math.max(...this.topBroken.map(b => b.count), 1);
  }

  get maxScoreCount(): number {
    return Math.max(...this.scoreDistribution.map(b => b.count), 1);
  }

  showDateHeader(r: any, i: number): boolean {
    if (i === 0) return true;
    const prev = this.pagedRuns[i - 1];
    return (r.ts || '').substring(0, 10) !== (prev.ts || '').substring(0, 10);
  }

  trackByFn(_i: number, r: any): string {
    return r.ts + r.broken_selector;
  }
}
