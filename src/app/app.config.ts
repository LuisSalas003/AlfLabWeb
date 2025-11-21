import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { initializeApp } from "firebase/app";
import { routes } from './app.routes';

const firebaseConfig = {
  apiKey: "AIzaSyBbluQ9NiE9pdVTttX38EGj-Gty1a8Ot4Y",
  authDomain: "alflabweb.firebaseapp.com",
  projectId: "alflabweb",
  storageBucket: "alflabweb.firebasestorage.app",
  messagingSenderId: "1067914372354",
  appId: "1:1067914372354:web:a3ac05da337bf139bb8e1b"
};


const app = initializeApp(firebaseConfig);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes)
  ]
};
