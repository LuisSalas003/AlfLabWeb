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
    loadComponent: () => import('./suppliers/proveedores').then(m => m.ProveedoresComponent) 
  },
  { 
  path: 'clientes', 
  loadComponent: () => import('./clients/clientes').then(m => m.ClientesComponent)
  },

 { 
  path: 'cotizaciones', 
  loadComponent: () => import('./quotes/cotizaciones').then(m => m.CotizacionesComponent)
  },
  { 
  path: 'configuracion', 
  loadComponent: () => import('./configuration/configuracion').then(m => m.ConfiguracionComponent)
  },
];
