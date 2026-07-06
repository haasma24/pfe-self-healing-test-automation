import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private renderer: Renderer2;
  private darkModeSubject = new BehaviorSubject<boolean>(this._load());
  darkMode$ = this.darkModeSubject.asObservable();

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.darkMode$.subscribe(v => {
      this.renderer.setAttribute(document.documentElement, 'data-theme', v ? 'dark' : 'light');
    });
  }

  toggle(): void {
    const next = !this.darkModeSubject.value;
    this.darkModeSubject.next(next);
    localStorage.setItem('arcane_theme', next ? 'dark' : 'light');
  }

  private _load(): boolean {
    return localStorage.getItem('arcane_theme') === 'dark';
  }
}
