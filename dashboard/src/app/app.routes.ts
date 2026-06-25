import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard)
  },
  {
    path: 'overview',
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard)
  },
  {
    path: 'pipeline',
    loadComponent: () => import('./pages/pipeline/pipeline').then(m => m.Pipeline)
  },
  {
    path: 'broken-locators',
    loadComponent: () => import('./pages/broken-locators/broken-locators').then(m => m.BrokenLocators)
  },
  {
    path: 'history',
    loadComponent: () => import('./pages/history/history').then(m => m.HistoryPage)
  },
  {
    path: 'upload',
    loadComponent: () => import('./pages/upload/upload').then(m => m.UploadPage)
  },
  {
    path: 'configuration',
    loadComponent: () => import('./pages/configuration/configuration').then(m => m.Configuration)
  },
  {
    path: 'export',
    loadComponent: () => import('./pages/export/export').then(m => m.Export)
  },
  { path: '**', redirectTo: 'dashboard' }
];
