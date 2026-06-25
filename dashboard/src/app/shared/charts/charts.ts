import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-timeline-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-wrap">
      <svg [attr.viewBox]="'0 0 ' + width + ' ' + height" class="chart-svg">
        <defs>
          <linearGradient [id]="'area-' + uid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" [attr.stop-color]="color" stop-opacity="0.25"/>
            <stop offset="100%" [attr.stop-color]="color" stop-opacity="0.01"/>
          </linearGradient>
        </defs>
        <polyline *ngIf="line" [attr.points]="line" fill="none" [attr.stroke]="color" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="chart-line"/>
        <path *ngIf="area" [attr.d]="area" [attr.fill]="'url(#area-' + uid + ')'" class="chart-area"/>
        <circle *ngFor="let p of points; let i = index"
          [attr.cx]="p.x" [attr.cy]="p.y" r="4" [attr.fill]="color"
          class="chart-dot" stroke="var(--bg-card)" stroke-width="1.5"
          (mouseenter)="tooltip = data[i]?.label + ': ' + (data[i]?.value ?? 0).toFixed(3); tooltipX = p.x; tooltipY = p.y"
          (mouseleave)="tooltip = ''"/>
      </svg>
      <div class="chart-tooltip" *ngIf="tooltip" [style.left.px]="tooltipX" [style.top.px]="tooltipY">{{ tooltip }}</div>
      <div class="chart-labels" *ngIf="labels.length">
        <span *ngFor="let l of labels" class="chart-label">{{ l }}</span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; position: relative; }
    .chart-wrap { width: 100%; position: relative; }
    .chart-svg { width: 100%; height: auto; overflow: visible; }
    .chart-line { stroke-dasharray: 2000; animation: drawLine 1.2s ease both; }
    .chart-area { animation: fadeIn 0.8s ease both; }
    .chart-dot { opacity: 0; animation: fadeIn 0.4s ease both; cursor: pointer; transition: r 0.2s; }
    .chart-dot:hover { r: 6; }
    .chart-labels { display: flex; justify-content: space-between; margin-top: 6px; padding: 0 4px; }
    .chart-label { font-size: 8px; color: var(--text-tertiary); font-family: var(--mono); white-space: nowrap; transform: rotate(-25deg); transform-origin: left; }
  `]
})
export class TimelineChart implements OnChanges {
  @Input() data: { value: number; label?: string }[] = [];
  @Input() color = 'var(--accent)';
  @Input() height = 90;
  @Input() width = 350;
  uid = Math.random().toString(36).slice(2, 8);
  line = '';
  area = '';
  points: { x: number; y: number }[] = [];
  labels: string[] = [];
  tooltip = '';
  tooltipX = 0;
  tooltipY = 0;

  ngOnChanges(): void {
    const n = this.data.length;
    if (n < 2) { return; }
    const pad = { t: 8, b: 4, l: 4, r: 4 };
    const w = this.width - pad.l - pad.r;
    const h = this.height - pad.t - pad.b;
    const vals = this.data.map(d => d.value);
    const mx = Math.max(...vals, 0.01);

    this.points = this.data.map((d, i) => ({
      x: pad.l + (i / (n - 1)) * w,
      y: pad.t + h - (d.value / mx) * h
    }));

    this.line = this.points.map(p => `${p.x},${p.y}`).join(' ');
    this.area = `M${this.points[0].x},${this.height} ${this.points.map(p => `L${p.x},${p.y}`).join(' ')} L${this.points[n-1].x},${this.height} Z`;
    this.labels = this.data.map(d => d.label ?? '');
  }
}

@Component({
  selector: 'app-donut-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="donut-wrap">
      <svg [attr.viewBox]="'0 0 120 120'" class="donut-svg">
        <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="16"/>
        <circle *ngFor="let s of segments; let i = index"
          cx="60" cy="60" r="45" fill="none"
          [attr.stroke]="s.color"
          stroke-width="16"
          stroke-linecap="round"
          [attr.stroke-dasharray]="s.len + ' ' + s.gap"
          [attr.stroke-dashoffset]="s.offset"
          style="transform-origin: center; transform: rotate(-90deg); transition: stroke-dasharray 1.2s ease, stroke-dashoffset 1.2s ease; cursor: pointer;"
          (mouseenter)="donutTooltip = s.name + ': ' + s.value"
          (mouseleave)="donutTooltip = ''"
        />
        <circle *ngFor="let s of segments; let i = index"
          cx="60" cy="60" r="45" fill="none"
          [attr.stroke]="s.color"
          stroke-width="2"
          stroke-linecap="round"
          [attr.stroke-dasharray]="s.len + ' ' + s.gap"
          [attr.stroke-dashoffset]="s.offset"
          style="transform-origin: center; transform: rotate(-90deg); opacity: 0.3;"
        />
      </svg>
      <div class="donut-center">
        <span class="donut-total">{{ total }}</span>
        <span class="donut-label">total</span>
      </div>
      <div class="chart-tooltip" *ngIf="donutTooltip" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-80%)">{{ donutTooltip }}</div>
      <div class="donut-legend" *ngIf="segments.length">
        <div class="legend-item" *ngFor="let s of segments">
          <span class="legend-dot" [style.background]="s.color" [style.box-shadow]="'0 0 8px ' + s.color"></span>
          <span class="legend-name">{{ s.name }}</span>
          <span class="legend-val">{{ s.value }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    .donut-wrap { display: flex; align-items: center; gap: 20px; }
    .donut-svg { width: 120px; height: 120px; flex-shrink: 0; }
    .donut-center { position: absolute; display: flex; flex-direction: column; align-items: center; pointer-events: none; }
    .donut-total { font-size: 26px; font-weight: 900; color: var(--text-primary); font-family: var(--mono); line-height: 1; }
    .donut-label { font-size: 9px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.08em; }
    .donut-legend { display: flex; flex-direction: column; gap: 6px; }
    .legend-item { display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--text-secondary); }
    .legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .legend-name { flex: 1; }
    .legend-val { font-family: var(--mono); color: var(--text-primary); font-weight: 600; }
  `]
})
export class DonutChart implements OnChanges {
  @Input() data: { name: string; value: number; color: string }[] = [];
  segments: { len: number; gap: number; offset: number; color: string; name: string; value: number }[] = [];
  total = 0;
  donutTooltip = '';

  ngOnChanges(): void {
    this.total = this.data.reduce((a, b) => a + b.value, 0);
    const circumference = 2 * Math.PI * 45;
    let offset = 0;
    this.segments = this.data.map(d => {
      const len = (d.value / Math.max(this.total, 1)) * circumference;
      const gap = circumference - len;
      const seg = { len, gap, offset: -offset, color: d.color, name: d.name, value: d.value };
      offset += len;
      return seg;
    });
  }
}

@Component({
  selector: 'app-gauge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="gauge-container">
      <svg class="gauge-svg" width="160" height="100" viewBox="0 0 160 100">
        <path d="M 20 85 A 60 60 0 0 1 140 85" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="14" stroke-linecap="round"/>
        <path d="M 20 85 A 60 60 0 0 1 140 85" fill="none" [attr.stroke]="color" stroke-width="14" stroke-linecap="round"
          [attr.stroke-dasharray]="circumference" [attr.stroke-dashoffset]="offset" class="gauge-arc"
          (mouseenter)="gaugeTooltip = (value * 100).toFixed(1) + '%'" (mouseleave)="gaugeTooltip = ''"/>
        <circle cx="80" cy="85" r="4" fill="var(--text-primary)" class="gauge-pivot"/>
        <line x1="80" y1="85" [attr.x2]="needleX" [attr.y2]="needleY" [attr.stroke]="color" stroke-width="2.5" stroke-linecap="round" class="gauge-needle"/>
      </svg>
      <div class="chart-tooltip" *ngIf="gaugeTooltip" style="position:absolute;top:20px;left:50%;transform:translateX(-50%)">{{ gaugeTooltip }}</div>
      <div class="gauge-info">
        <div class="gauge-value">{{ value }}</div>
        <div class="gauge-label">{{ label }}</div>
        <div class="gauge-verdict" *ngIf="verdict" [class]="verdictClass">{{ verdict }}</div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .gauge-container { display: flex; flex-direction: column; align-items: center; gap: 10px; }
    .gauge-svg { width: 160px; height: 100px; }
  .gauge-container { position: relative; }
  .gauge-arc { transition: stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
  .gauge-needle { transition: all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1); transform-origin: 80px 85px; }
  .gauge-pivot { animation: pulse 2s infinite; }
  .gauge-info { display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .gauge-value { font-size: 34px; font-weight: 900; color: var(--text-primary); font-family: var(--mono); line-height: 1; }
  .gauge-label { font-size: 9px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.08em; }
  .gauge-verdict { font-size: 10px; font-weight: 700; letter-spacing: 0.06em; padding: 4px 12px; border-radius: 6px; margin-top: 2px; }
  .verdict-ok { color: var(--green); background: var(--green-glow); }
  .verdict-warn { color: var(--amber); background: var(--amber-glow); }
  .verdict-fail { color: var(--red); background: var(--red-glow); }
  `]
})
export class GaugeChart implements OnChanges {
  @Input() value = 0;
  @Input() label = '';
  @Input() color = 'var(--green)';
  @Input() verdict = '';
  @Input() verdictClass = 'verdict-ok';
  circumference = 188.5;
  offset = 188.5;
  needleX = 80;
  needleY = 25;
  gaugeTooltip = '';

  ngOnChanges(): void {
    const ratio = Math.max(0, Math.min(1, this.value));
    this.offset = this.circumference * (1 - ratio);
    const angle = -180 + ratio * 180;
    const rad = (angle * Math.PI) / 180;
    this.needleX = 80 + 60 * Math.cos(rad);
    this.needleY = 85 + 60 * Math.sin(rad);
  }
}

@Component({
  selector: 'app-funnel-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="funnel-wrap">
        <div *ngFor="let s of stages; let i = index" class="funnel-stage" [style]="'--hue:' + (i * 45)">
          <div class="funnel-bar">
            <div class="funnel-fill" [style.width.%]="s.pct" [style.background]="s.color"
              (mouseenter)="funnelTooltip = s.name + ': ' + s.count + ' (' + s.pct + '%)'"
              (mouseleave)="funnelTooltip = ''">
              <span class="funnel-val" *ngIf="s.pct > 15">{{ s.count }}</span>
            </div>
          </div>
          <div class="funnel-meta">
            <span class="funnel-name">{{ s.name }}</span>
            <span class="funnel-pct">{{ s.pct }}%</span>
          </div>
        </div>
        <div class="chart-tooltip" *ngIf="funnelTooltip" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)">{{ funnelTooltip }}</div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    .funnel-wrap { display: flex; flex-direction: column; gap: 6px; padding: 4px 0; }
    .funnel-stage { display: flex; align-items: center; gap: 8px; }
    .funnel-bar {
      flex: 1;
      height: 32px;
      background: rgba(255,255,255,0.03);
      border-radius: 8px;
      overflow: hidden;
      position: relative;
      transition: all 0.3s ease;
    }
    .funnel-fill {
      height: 100%;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 10px;
      min-width: 20px;
      transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }
    .funnel-fill::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 8px;
      background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 100%);
    }
    .funnel-val { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.95); font-family: var(--mono); position: relative; z-index: 1; }
    .funnel-meta { display: flex; flex-direction: column; gap: 1px; min-width: 65px; }
    .funnel-name { font-size: 10px; color: var(--text-secondary); font-weight: 600; }
    .funnel-pct { font-size: 9px; color: var(--text-tertiary); font-family: var(--mono); }
  `]
})
export class FunnelChart implements OnChanges {
  @Input() stages: { name: string; count: number; pct: number; color: string }[] = [];
  funnelTooltip = '';

  ngOnChanges(): void {}
}

@Component({
  selector: 'app-score-distribution',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dist-wrap" *ngIf="bars.length">
      <div class="bar-row" *ngFor="let b of bars; trackBy: trackDist">
        <span class="bar-label">{{ b.label }}</span>
        <div class="bar-track"><div class="bar-fill" [style.width.%]="b.pct" [style.background]="b.color"
          (mouseenter)="distTooltip = b.label + ': ' + b.count" (mouseleave)="distTooltip = ''"><span class="bar-val">{{ b.count }}</span></div></div>
      </div>
      <div class="chart-tooltip" *ngIf="distTooltip" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)">{{ distTooltip }}</div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    .dist-wrap { display: flex; flex-direction: column; gap: 8px; }
    .bar-label { font-size: 11px; color: var(--text-tertiary); font-family: var(--mono); width: 80px; flex-shrink: 0; }
    .bar-track { flex: 1; height: 24px; background: rgba(255,255,255,0.03); border-radius: 8px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 8px; display: flex; align-items: center; justify-content: flex-end; padding-right: 8px; min-width: 20px; transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1); }
    .bar-val { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.9); font-family: var(--mono); }
  `]
})
export class ScoreDistribution implements OnChanges {
  @Input() data: { label: string; count: number; color: string }[] = [];
  bars: { label: string; count: number; pct: number; color: string }[] = [];
  distTooltip = '';

  trackDist(i: number): number { return i; }

  ngOnChanges(): void {
    const maxCount = Math.max(...this.data.map(d => d.count), 1);
    this.bars = this.data.map(d => ({
      label: d.label,
      count: d.count,
      pct: Math.round((d.count / maxCount) * 100),
      color: d.color
    }));
  }
}
