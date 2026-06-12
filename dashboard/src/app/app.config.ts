import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { withInterceptors } from '@angular/common/http';
import { ngrokHeaderInterceptor } from './interceptors/ngrok-header.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([ngrokHeaderInterceptor])),
    provideAnimations(),
  ]
};
