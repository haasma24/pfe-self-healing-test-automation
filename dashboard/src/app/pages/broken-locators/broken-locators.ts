import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';
import { Candidate, ScoreLayer, LocatorResult } from '../../models/pipeline.model';

@Component({
  selector: 'app-broken-locators',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './broken-locators.html',
  styleUrl: './broken-locators.scss'
})
export class BrokenLocators implements OnInit, OnDestroy {

  filter: 'all' | 'healed' | 'failed' = 'all';
  searchQuery = '';
  locators: (LocatorResult & { ts?: string; pipelineTime?: number })[] = [];
  candidates: Candidate[] = [];
  layers: ScoreLayer[] = [];
  screenshotAnnotatedUrl = '';
  screenshotBaselineUrl = '';
  hasScreenshots = false;
  loading = true;
  expandedIndex: number | null = null;
  zoomImage: string | null = null;
  imgError = { annotated: false, baseline: false };

  private subs: Subscription[] = [];

  constructor(public dash: DashboardService) {}

  ngOnInit(): void {
    this.subs.push(
      this.dash.getDashboardStream().subscribe(d => {
        this.candidates = d.lastRunDetails?.candidates ?? [];
        this.layers = d.lastRunDetails?.layers ?? [];
        const api = this.dash.getApiUrl();
        const info = d.lastRunDetails?.screenshotInfo;
        this.hasScreenshots = !!info;
        this.screenshotAnnotatedUrl = info ? api + info.annotated : '';
        this.screenshotBaselineUrl = info ? api + info.baseline : '';
        this.loading = false;
      }),
      this.dash.getHistoryStream().subscribe(h => {
        const runs = h.runs ?? [];
        const mapped: (LocatorResult & { ts?: string; pipelineTime?: number })[] = runs.map((r: any) => ({
          testName: r.url || r.testName || '',
          brokenLocator: r.broken_selector || r.brokenLocator || '',
          healedLocator: r.healed_selector || r.healedLocator || '',
          confidence: r.confidence ?? null,
          status: r.status === 'healed' ? 'healed' as const : 'failed' as const,
          ts: r.ts || '',
          pipelineTime: r.pipeline_time ?? undefined,
          cropUrl: r.crop_url || r.cropUrl || ''
        }));
        const seen = new Set<string>();
        this.locators = mapped.filter(l => {
          const key = l.brokenLocator + (l.healedLocator ?? '') + (l.ts ?? '');
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        this.loading = false;
      })
    );
  }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }

  get filteredLocators(): (LocatorResult & { ts?: string; pipelineTime?: number })[] {
    let list = this.filter === 'all'
      ? this.locators
      : this.locators.filter(l => l.status === this.filter);
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(l =>
        l.brokenLocator.toLowerCase().includes(q) ||
        (l.healedLocator ?? '').toLowerCase().includes(q) ||
        (l.testName ?? '').toLowerCase().includes(q) ||
        (l.ts ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }

  get healedCount(): number { return this.locators.filter(l => l.status === 'healed').length; }
  get failedCount():  number { return this.locators.filter(l => l.status === 'failed').length; }

  toggleRow(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }

  copy(event: MouseEvent, text: string): void {
    navigator.clipboard.writeText(text).catch(() => {});
    const el = event.target as HTMLElement;
    const orig = el.style.color;
    el.style.color = 'var(--green)';
    setTimeout(() => { el.style.color = orig; }, 600);
  }

  scoreColor(score: number): string {
    if (score >= 0.8) return 'var(--green)';
    if (score >= 0.6) return 'var(--accent)';
    if (score >= 0.4) return 'var(--amber)';
    return 'var(--red)';
  }

  matchingCandidates(loc: any): Candidate[] {
    if (!loc.healedLocator) return [];
    return this.candidates.filter(c =>
      c.id && loc.healedLocator.toLowerCase().includes(c.id.toLowerCase())
    ).slice(0, 3);
  }

  cropUrlForLocator(loc: any): string {
    if (loc.cropUrl) return this.dash.getApiUrl() + loc.cropUrl;
    if (!loc.healedLocator) return '';
    const match = this.candidates.find(c =>
      c.id && loc.healedLocator.toLowerCase().includes(c.id.toLowerCase())
    );
    return match?.cropUrl ? this.dash.getApiUrl() + match.cropUrl : '';
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

  trackByLoc(i: number, l: any): string { return l.brokenLocator + (l.healedLocator ?? '') + (l.ts ?? ''); }
}
