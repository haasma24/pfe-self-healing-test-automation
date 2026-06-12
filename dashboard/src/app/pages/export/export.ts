import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardResponse } from '../../models/pipeline.model';

@Component({
  selector: 'app-export',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './export.html',
  styleUrl: './export.scss'
})
export class Export implements OnInit, OnDestroy {

  data: DashboardResponse | null = null;
  private sub!: Subscription;
  copied = '';

  constructor(private dash: DashboardService) {}

  ngOnInit(): void {
    this.sub = this.dash.getDashboardStream().subscribe(d => this.data = d);
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  downloadJSON(key: string, payload: any, filename: string): void {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    this._trigger(blob, filename);
  }

  downloadCSV(): void {
    const cands = this.data?.lastRunDetails?.candidates ?? [];
    const header = 'rank,id,tag,blendedScore,semanticScore,contextualScore,tfidfScore,ssimScore,locatorType,stability\n';
    const rows = cands.map(c =>
      [c.rank, `"${c.id}"`, c.tag, c.blendedScore, c.semanticScore, c.contextualScore, c.tfidfScore, c.ssimScore, c.locatorType, c.stability].join(',')
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    this._trigger(blob, 'score-matrix.csv');
  }

  downloadPlaywrightPatch(): void {
    const locs = this.data?.lastRunDetails?.locators ?? [];
    const lines = locs
      .filter(l => l.status === 'healed' && l.healedLocator)
      .map(l => `// ${l.testName}\n// was: ${l.brokenLocator}\nawait page.locator('${l.healedLocator}').click();\n`)
      .join('\n');
    const blob = new Blob([lines], { type: 'text/plain' });
    this._trigger(blob, 'playwright-patch.ts');
  }

  private _trigger(blob: Blob, name: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  }

  copyText(event: MouseEvent, text: string, key: string): void {
    navigator.clipboard.writeText(text).catch(() => {});
    this.copied = key;
    setTimeout(() => this.copied = '', 1200);
  }

  copyConfidence(event: MouseEvent): void {
    const text = `{"locator":"${this.winnerLocator}","confidence":${this.winnerScore}}`;
    this.copyText(event, text, 'conf');
  }

  copyApi(event: MouseEvent): void {
    this.copyText(event, 'POST /heal  {"url":"…","broken_selector":"…"}', 'api');
  }

  get winnerLocator(): string {
    return this.data?.lastRunDetails?.winner?.['id'] ?? '—';
  }

  get winnerScore(): number {
    return this.data?.lastRunDetails?.bestScore ?? 0;
  }
}
