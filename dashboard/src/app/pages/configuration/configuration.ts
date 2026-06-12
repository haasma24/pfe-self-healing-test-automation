import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuration.html',
  styleUrl: './configuration.scss'
})
export class Configuration implements OnInit {

  // ── Live / editable settings ─────────────────────────────────────────────
  apiUrl = '';
  pollInterval = 4000;
  saved = false;

  // ── Static pipeline config display (read from API in future) ─────────────
  sections = [
    {
      title: 'Core Settings',
      rows: [
        { key: 'auto_heal',            value: '',      type: 'badge-on'  },
        { key: 'retry_count',          value: '3',     type: 'val'       },
        { key: 'confidence_threshold', value: '0.60',  type: 'val'       },
        { key: 'max_candidates',       value: '15',    type: 'val'       },
        { key: 'timeout_ms',           value: '5000',  type: 'val'       },
        { key: 'parallel_stages',      value: '',      type: 'badge-off' },
      ]
    },
    {
      title: 'Stage Weights',
      rows: [
        { key: 'semantic_weight',   value: '0.40', type: 'val' },
        { key: 'contextual_weight', value: '0.30', type: 'val' },
        { key: 'tfidf_weight',      value: '0.15', type: 'val' },
        { key: 'visual_weight',     value: '0.15', type: 'val' },
        { key: 'selector_boost',    value: '+0.15',type: 'val' },
        { key: 'visual_blend',      value: '70/30',type: 'val' },
      ]
    },
    {
      title: 'Contextual Boost',
      rows: [
        { key: 'tag_match',              value: '+0.30', type: 'val' },
        { key: 'text_contains_baseline', value: '+0.70', type: 'val' },
        { key: 'aria_label_match',       value: '+0.40', type: 'val' },
        { key: 'contextual_fusion',      value: '0.30',  type: 'val' },
        { key: 'textual_fusion',         value: '0.40',  type: 'val' },
        { key: 'abbrev_expand_thr',      value: '0.55',  type: 'val' },
      ]
    },
    {
      title: 'Embedding Model',
      rows: [
        { key: 'model',              value: 'all-MiniLM-L6-v2', type: 'val' },
        { key: 'vector_dim',         value: '384',   type: 'val' },
        { key: 'batch_size',         value: '32',    type: 'val' },
        { key: 'cache_embeddings',   value: '',      type: 'badge-on' },
        { key: 'ssim_fallback_thr',  value: '0.40',  type: 'val' },
        { key: 'stage3_top_k',       value: '5',     type: 'val' },
      ]
    },
  ];

  constructor(private dash: DashboardService) {}

  ngOnInit(): void {
    this.apiUrl       = this.dash.getApiUrl();
    this.pollInterval = this.dash.getPollInterval();
  }

  save(): void {
    this.dash.setApiUrl(this.apiUrl.trim());
    this.dash.setPollInterval(this.pollInterval);
    this.saved = true;
    setTimeout(() => this.saved = false, 2500);
  }

  ping(): void {
    this.dash.ping().subscribe();
  }
}
