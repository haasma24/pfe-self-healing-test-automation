import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, Subscription } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';
import { SystemMetrics } from '../../models/pipeline.model';

const ROUTE_META: Record<string, { title: string; crumb: string }> = {
  '/overview':        { title: 'Overview',       crumb: 'Dashboard' },
  '/pipeline':        { title: 'Pipeline',        crumb: 'Stage Details' },
  '/broken-locators': { title: 'Locators',        crumb: 'Healing Report' },
  '/upload':          { title: 'Load Run',         crumb: 'Offline Analysis' },
  '/configuration':   { title: 'Configuration',   crumb: 'Parameters' },
  '/export':          { title: 'Export',           crumb: 'Download Results' },
};

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss'
})
export class Topbar implements OnInit, OnDestroy {

  title = 'Overview';
  crumb = 'Dashboard';

  system: SystemMetrics | null = null;
  isUploadMode = false;
  isConnected = false;

  private subs: Subscription[] = [];

  constructor(private router: Router, private dash: DashboardService) {}

  ngOnInit(): void {
    // Route tracking
    const url = this.router.url;
    const m = ROUTE_META[url] ?? { title: 'Overview', crumb: 'Dashboard' };
    this.title = m.title;
    this.crumb = m.crumb;

    this.subs.push(
      this.router.events.pipe(filter(e => e instanceof NavigationEnd))
        .subscribe((e: any) => {
          const meta = ROUTE_META[e.urlAfterRedirects] ?? { title: 'ARCANE', crumb: '' };
          this.title = meta.title;
          this.crumb = meta.crumb;
        }),

      this.dash.getDashboardStream().subscribe(d => {
        this.system = d.system;
      }),

      this.dash.source$.subscribe(s => this.isUploadMode = s === 'upload'),
      this.dash.connected$.subscribe(v => this.isConnected = v ?? false)
    );
  }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }

  onSimulate(): void {
    // Navigate to upload page for offline runs, or ping live API
    if (this.isUploadMode) {
      this.router.navigate(['/upload']);
    } else {
      this.dash.ping().subscribe();
    }
  }

  switchToLive(): void { this.dash.setSource('live'); }
}
