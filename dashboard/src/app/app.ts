import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Sidebar } from './layout/sidebar/sidebar';
import { Topbar } from './layout/topbar/topbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Sidebar, Topbar],
  template: `
    <div class="app-shell" [class.sidebar-open]="sidebarOpen">
      <div class="app-bg"></div>
      <div class="sidebar-overlay" *ngIf="sidebarOpen" (click)="sidebarOpen = false"></div>
      <div class="app-layout">
        <app-sidebar [collapsed]="!sidebarOpen"></app-sidebar>
        <div class="app-main">
          <app-topbar (toggleSidebar)="sidebarOpen = !sidebarOpen"></app-topbar>
          <main class="app-content">
            <router-outlet></router-outlet>
          </main>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-shell {
      min-height: 100vh;
      position: relative;
    }
    .app-bg {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      background:
        radial-gradient(ellipse at 20% 30%, rgba(124,58,237,0.05) 0%, transparent 60%),
        radial-gradient(ellipse at 80% 70%, rgba(6,182,212,0.03) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 10%, rgba(251,191,36,0.02) 0%, transparent 40%);
    }
    .app-layout {
      position: relative;
      z-index: 1;
      display: flex;
      min-height: 100vh;
    }
    .app-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .app-content {
      flex: 1;
      padding: 20px 24px 32px;
      overflow-y: auto;
    }
    .sidebar-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.3);
      z-index: 9;
      backdrop-filter: blur(4px);
    }
    @media (max-width: 900px) {
      .sidebar-overlay { display: block; }
    }
  `]
})
export class App {
  sidebarOpen = window.innerWidth > 900;

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 900) this.sidebarOpen = true;
  }
}
