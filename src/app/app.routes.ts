import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/login', 
    pathMatch: 'full' 
  },
  { 
    path: 'login', 
    loadComponent: () => import('./login/login').then(m => m.LoginComponent) 
  },
  { 
    path: 'main', 
    loadComponent: () => import('./main/main').then(m => m.MainComponent)
  },
  { 
    path: 'productos', 
    loadComponent: () => import('./products/productos').then(m => m.ProductosComponent)
  },
  { 
    path: 'proveedores', 
    redirectTo: '/main' 
  },
  { 
    path: 'categorias', 
    redirectTo: '/main' 
  },
  { 
    path: 'reportes', 
    redirectTo: '/main' 
  },
  { 
    path: 'configuracion', 
    redirectTo: '/main' 
  }
];
