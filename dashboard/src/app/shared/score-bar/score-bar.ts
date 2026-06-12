import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-score-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="score-bar-wrap">
      <div class="score-bar-track">
        <div class="score-bar-fill" [style.width.%]="value * 100" [style.background]="color"></div>
      </div>
      <span class="score-bar-label">{{ value | number:'1.2-2' }}</span>
    </div>
  `,
  styles: [`
    .score-bar-wrap { display: flex; align-items: center; gap: 6px; }
    .score-bar-track { flex: 1; height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; }
    .score-bar-fill { height: 100%; border-radius: 3px; transition: width 0.3s ease; }
    .score-bar-label { font-size: 11px; min-width: 34px; text-align: right; opacity: 0.8; }
  `]
})
export class ScoreBar {
  @Input() value = 0;
  @Input() color = 'var(--accent)';
}
