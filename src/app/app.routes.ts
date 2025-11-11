import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { MainComponent } from './main/main';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'main', component: MainComponent }
];