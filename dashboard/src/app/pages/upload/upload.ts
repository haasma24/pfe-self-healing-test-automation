import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardResponse, UploadedRun } from '../../models/pipeline.model';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upload.html',
  styleUrl: './upload.scss'
})
export class UploadPage {

  runName = '';
  jsonText = '';
  error = '';
  success = false;

  constructor(private dash: DashboardService, private router: Router) {}

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.jsonText = e.target?.result as string ?? '';
    };
    reader.readAsText(file);
  }

  load(): void {
    this.error = '';
    try {
      const parsed: DashboardResponse = JSON.parse(this.jsonText);
      // Basic validation
      if (!parsed.stats || !parsed.lastRunDetails) {
        throw new Error('Missing required fields: stats, lastRunDetails');
      }
      const run: UploadedRun = {
        id: Date.now().toString(),
        name: this.runName || `Run ${new Date().toLocaleTimeString()}`,
        uploadedAt: new Date().toISOString(),
        data: parsed
      };
      this.dash.loadUploadedRun(run);
      this.success = true;
      setTimeout(() => this.router.navigate(['/overview']), 1200);
    } catch (e: any) {
      this.error = 'Invalid JSON: ' + (e?.message ?? 'parse error');
    }
  }

  goLive(): void {
    this.dash.clearUpload();
    this.router.navigate(['/overview']);
  }

  loadExample(): void {
    this.runName = 'Example Run';
    this.jsonText = JSON.stringify(EXAMPLE_RUN, null, 2);
  }
}

// Minimal example so users can see the expected shape
const EXAMPLE_RUN: DashboardResponse = {
  stats: { total_attempts: 8, typo_fixes: 1, ml_fixes: 5, failed_heals: 2, start_time: new Date().toISOString() },
  system: { ram: '3.2/12.0 GB', cpu: '14%', server_status: 'Active', device: 'CPU' },
  history: [],
  lastRunDetails: {
    bestScore: 0.847, totalCandidates: 142, pipelineTimeSeconds: 3.24,
    confidenceGap: 0.206, winner: { id: '#nav-link-homme' },
    layers: [
      { name: 'Semantic',    label: 'NLP',     score: 0.881, color: 'var(--accent)' },
      { name: 'Contextual',  label: 'DOM',     score: 0.942, color: 'var(--green)'  },
      { name: 'TF-IDF',     label: 'Text',    score: 0.761, color: 'var(--amber)'  },
      { name: 'Visual',      label: 'SSIM',    score: 0.847, color: 'var(--blue)'   },
    ],
    funnel: [
      { name: 'Semantic',   count: 142, pct: 100 },
      { name: 'Contextual', count: 15,  pct: 11  },
      { name: 'TF-IDF',    count: 8,   pct: 6   },
      { name: 'Visual',     count: 5,   pct: 4   },
    ],
    candidates: [
      { rank:1, id:'#nav-link-homme',   tag:'a', blendedScore:0.847, semanticScore:0.881, contextualScore:0.942, tfidfScore:0.761, ssimScore:0.847, locatorType:'ID',   stability:'high'   },
      { rank:2, id:'[data-nav="homme"]',tag:'a', blendedScore:0.641, semanticScore:0.72,  contextualScore:0.80,  tfidfScore:0.60,  ssimScore:0.55,  locatorType:'Attr', stability:'high'   },
      { rank:3, id:'.nav-link.homme',   tag:'a', blendedScore:0.571, semanticScore:0.65,  contextualScore:0.70,  tfidfScore:0.55,  ssimScore:0.40,  locatorType:'Class','stability':'medium'},
    ],
    locators: [
      { testName:'should navigate', brokenLocator:'#nav-homme', healedLocator:'#nav-link-homme', confidence:0.847, status:'healed' },
      { testName:'add to cart',     brokenLocator:'.btn-cart',  healedLocator:'[data-testid="add-to-cart"]', confidence:0.921, status:'healed' },
      { testName:'promo code',      brokenLocator:'.promo-btn', healedLocator:'', confidence:0.312, status:'failed' },
    ],
    stageCounts: [142, 15, 8, 5],
    stageTimings: [1.2, 0.8, 0.6, 0.64],
    logs: ['[Semantic] 142 candidates extracted', '[Contextual] 15 surviving', '[TF-IDF] 8 surviving', '[Visual] 5 surviving', '[Winner] #nav-link-homme @ 0.847']
  }
};
