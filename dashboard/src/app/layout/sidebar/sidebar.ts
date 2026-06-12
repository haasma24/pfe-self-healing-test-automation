import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardResponse } from '../../models/pipeline.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar implements OnInit, OnDestroy {

  failedCount = 0;
  stageCount  = 0;
  totalRuns   = 0;
  isConnected = false;
  isUploadMode = false;

  private subs: Subscription[] = [];

  constructor(private dash: DashboardService) {}

  ngOnInit(): void {
    this.subs.push(
      this.dash.getDashboardStream().subscribe((d: DashboardResponse) => {
        this.failedCount = (d.lastRunDetails?.locators ?? []).filter((l: any) => l.status === 'failed').length;
        this.stageCount  = d.lastRunDetails?.funnel?.length ?? 0;
        this.totalRuns   = d.stats?.total_attempts ?? 0;
      }),
      this.dash.connected$.subscribe((v: boolean | undefined) => this.isConnected = v ?? false),
      this.dash.source$.subscribe((s: string) => this.isUploadMode = s === 'upload')
    );
  }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }

  get statusLabel(): string {
    if (this.isUploadMode) return 'Offline Mode';
    if (this.isConnected)  return 'Engine Online';
    return 'Connecting…';
  }

  get statusOnline(): boolean {
    return this.isConnected && !this.isUploadMode;
  }
}
