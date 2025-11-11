// 📁 src/main.ts

import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';  // 👈 Cambio aquí
import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app/app';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),  // 👈 Usa este en lugar del otro
    provideRouter(routes),
    importProvidersFrom(FormsModule)
  ]
}).catch(err => console.error(err));