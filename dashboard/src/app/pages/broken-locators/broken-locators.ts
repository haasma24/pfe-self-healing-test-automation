import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';
import { LocatorResult } from '../../models/pipeline.model';

@Component({
  selector: 'app-broken-locators',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './broken-locators.html',
  styleUrl: './broken-locators.scss'
})
export class BrokenLocators implements OnInit, OnDestroy {

  filter: 'all' | 'healed' | 'failed' = 'all';
  locators: LocatorResult[] = [];
  loading = true;
  private sub!: Subscription;

  constructor(private dash: DashboardService) {}

  ngOnInit(): void {
    this.sub = this.dash.getDashboardStream().subscribe(d => {
      this.locators = d.lastRunDetails?.locators ?? [];
      this.loading = false;
    });
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  get filteredLocators(): LocatorResult[] {
    return this.filter === 'all'
      ? this.locators
      : this.locators.filter(l => l.status === this.filter);
  }

  get healedCount(): number { return this.locators.filter(l => l.status === 'healed').length; }
  get failedCount():  number { return this.locators.filter(l => l.status === 'failed').length; }

  copy(event: MouseEvent, text: string): void {
    navigator.clipboard.writeText(text).catch(() => {});
    const el = event.target as HTMLElement;
    const orig = el.style.color;
    el.style.color = 'var(--green)';
    setTimeout(() => { el.style.color = orig; }, 600);
  }
}
