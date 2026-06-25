import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject, Observable, interval, switchMap, catchError,
  of, shareReplay, startWith, map, distinctUntilChanged
} from 'rxjs';
import { environment } from '../../environments/environment';
import {
  DashboardResponse, DataSource, UploadedRun,
  AnalyticsResponse, HistoryRunList
} from '../models/pipeline.model';

const EMPTY_DASHBOARD: DashboardResponse = {
  stats: { total_attempts: 0, failed_heals: 0, start_time: new Date().toISOString() },
  system: { ram: '—', cpu: '—', server_status: 'Not connected', device: '—' },
  history: [],
  lastRunDetails: {
    bestScore: 0, totalCandidates: 0, pipelineTimeSeconds: 0,
    confidenceGap: 0, winner: {},
    layers: [], funnel: [], candidates: [], locators: [],
    stageCounts: [], stageTimings: [], logs: []
  }
};

const EMPTY_ANALYTICS: AnalyticsResponse = {
  summary: { total: 0, healed: 0, failed: 0, healRate: 0, avgConfidence: 0, avgPipelineTime: 0 },
  timeline: [],
  scoreDistribution: [],
  topBrokenSelectors: []
};

@Injectable({ providedIn: 'root' })
export class DashboardService {

  private readonly LS_URL  = 'arcane_api_url';
  private readonly LS_POLL = 'arcane_poll_ms';

  private apiUrlSubject    = new BehaviorSubject<string>(this._loadUrl());
  private pollSubject      = new BehaviorSubject<number>(this._loadPoll());
  private sourceSubject    = new BehaviorSubject<DataSource>('live');
  private uploadSubject    = new BehaviorSubject<UploadedRun | null>(null);
  private connectedSubject = new BehaviorSubject<boolean | undefined>(undefined);

  source$    = this.sourceSubject.asObservable();
  connected$ = this.connectedSubject.asObservable();

  /** true when the user has set a non-empty API URL */
  hasUrl$: Observable<boolean> = this.apiUrlSubject.pipe(
    map(u => u.trim().length > 0)
  );

  private dashStream$:      Observable<DashboardResponse>;
  private analyticsStream$: Observable<AnalyticsResponse>;
  private historyStream$:   Observable<HistoryRunList>;

  constructor(private http: HttpClient) {
    this.dashStream$ = this.sourceSubject.pipe(
      switchMap(src => {
        if (src === 'upload') {
          return this.uploadSubject.pipe(
            map(run => run ? run.data : EMPTY_DASHBOARD)
          );
        }
        // If no URL configured, return empty immediately (no HTTP noise)
        if (!this.apiUrlSubject.value.trim()) {
          return of(EMPTY_DASHBOARD);
        }
        return this.pollSubject.pipe(
          switchMap(ms =>
            interval(ms).pipe(
              startWith(0),
              switchMap(() => this._fetchDashboard())
            )
          )
        );
      }),
      shareReplay(1)
    );

    this.analyticsStream$ = this.apiUrlSubject.pipe(
      switchMap(url => {
        if (!url.trim()) return of(EMPTY_ANALYTICS);
        return this.pollSubject.pipe(
          switchMap(ms =>
            interval(ms * 3).pipe(
              startWith(0),
              switchMap(() => this._fetchAnalytics())
            )
          )
        );
      }),
      shareReplay(1)
    );

    this.historyStream$ = this.apiUrlSubject.pipe(
      switchMap(url => {
        if (!url.trim()) return of({ runs: [], total: 0 });
        return this.pollSubject.pipe(
          switchMap(ms =>
            interval(ms * 2).pipe(
              startWith(0),
              switchMap(() => this._fetchHistory())
            )
          )
        );
      }),
      shareReplay(1)
    );
  }

  getDashboardStream(): Observable<DashboardResponse> {
    return this.dashStream$;
  }

  getAnalyticsStream(): Observable<AnalyticsResponse> {
    return this.analyticsStream$;
  }

  getHistoryStream(): Observable<HistoryRunList> {
    return this.historyStream$;
  }

  getHistory(limit = 100, status?: string): Observable<HistoryRunList> {
    const url = `${this.apiUrlSubject.value}/history?limit=${limit}${status ? '&status=' + status : ''}`;
    return this.http.get<HistoryRunList>(url).pipe(
      catchError(() => of({ runs: [], total: 0 }))
    );
  }

  private _fetchDashboard(): Observable<DashboardResponse> {
    const url = `${this.apiUrlSubject.value}/dashboard-data`;
    return this.http.get<DashboardResponse>(url).pipe(
      map(data => { this.connectedSubject.next(true); return data; }),
      catchError(() => { this.connectedSubject.next(false); return of(EMPTY_DASHBOARD); })
    );
  }

  private _fetchAnalytics(): Observable<AnalyticsResponse> {
    const url = `${this.apiUrlSubject.value}/analytics`;
    return this.http.get<AnalyticsResponse>(url).pipe(
      catchError(() => of(EMPTY_ANALYTICS))
    );
  }

  private _fetchHistory(): Observable<HistoryRunList> {
    const url = `${this.apiUrlSubject.value}/history?limit=500`;
    return this.http.get<HistoryRunList>(url).pipe(
      catchError(() => of({ runs: [], total: 0 }))
    );
  }

  ping(): Observable<any> {
    const url = `${this.apiUrlSubject.value}/dashboard-data`;
    return this.http.get(url).pipe(
      map(r => { this.connectedSubject.next(true); return r; }),
      catchError(e => { this.connectedSubject.next(false); return of(null); })
    );
  }

  setApiUrl(url: string): void {
    const trimmed = url.trim().replace(/\/$/, ''); // remove trailing slash
    localStorage.setItem(this.LS_URL, trimmed);
    this.apiUrlSubject.next(trimmed);
    // Re-trigger streams by resetting source
    if (this.sourceSubject.value === 'live') {
      this.sourceSubject.next('live');
    }
  }

  setPollInterval(ms: number): void {
    const safe = Math.max(1000, ms);
    localStorage.setItem(this.LS_POLL, String(safe));
    this.pollSubject.next(safe);
  }

  getApiUrl(): string       { return this.apiUrlSubject.value; }
  getPollInterval(): number { return this.pollSubject.value;  }

  setSource(src: DataSource): void {
    this.sourceSubject.next(src);
    if (src === 'live') this.connectedSubject.next(false);
  }

  loadUploadedRun(run: UploadedRun): void {
    this.uploadSubject.next(run);
    this.sourceSubject.next('upload');
  }

  clearUpload(): void {
    this.uploadSubject.next(null);
    this.sourceSubject.next('live');
  }

  private _loadUrl(): string {
    return localStorage.getItem(this.LS_URL) ?? environment.apiUrl ?? '';
  }

  private _loadPoll(): number {
    const saved = localStorage.getItem(this.LS_POLL);
    return saved ? parseInt(saved, 10) : 2000;
  }
}
