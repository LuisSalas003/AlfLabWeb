// src/main.ts

import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

import { AppComponent } from './app/app';
import { routes } from './app/app.routes';

const firebaseConfig = {
  apiKey: "AIzaSyBbluQ9NiE9pdVTttX38EGj-Gty1a8Ot4Y",
  authDomain: "alflabweb.firebaseapp.com",
  projectId: "alflabweb",
  storageBucket: "alflabweb.firebasestorage.app",
  messagingSenderId: "1067914372354",
  appId: "1:1067914372354:web:a3ac05da337bf139bb8e1b"
};

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    importProvidersFrom(FormsModule),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ]
}).catch(err => console.error(err));