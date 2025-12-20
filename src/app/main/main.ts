import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';

export interface Producto {
  id?: string;
  codigo: string;
  nombre: string;
  caracteristicas: string;
  precio: number;
  stock: number;
  proveedor: string;
  imagen?: string;
}

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './main.html',
  styleUrls: ['./main.css']
})
export class MainComponent implements OnInit {
  busqueda = '';
  filtroSeleccionado = 'todos';
  mostrarFiltro = false;
  menuAbierto = false;
  productos: Producto[] = [];
  
  constructor(
    private firestore: Firestore,
    private cdr: ChangeDetectorRef  
  ) {}

  async ngOnInit() {
    try {
      const productosRef = collection(this.firestore, 'productos');
      const querySnapshot = await getDocs(productosRef);
      
      this.productos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Producto[];
      
      console.log('Productos cargados:', this.productos);
      this.cdr.detectChanges(); 
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  toggleFiltro() {
    this.mostrarFiltro = !this.mostrarFiltro;
  }

  filtrarProductos() {
    if (!this.busqueda) {
      return this.productos;
    }

    const busquedaLower = this.busqueda.toLowerCase();

    return this.productos.filter(p => {
      switch (this.filtroSeleccionado) {
        case 'codigo':
          return p.codigo?.includes(this.busqueda);
        case 'nombre':
          return p.nombre?.toLowerCase().includes(busquedaLower);
        case 'proveedor':
          return p.proveedor?.toLowerCase().includes(busquedaLower);
        case 'todos':
        default:
          return p.nombre?.toLowerCase().includes(busquedaLower) ||
                 p.codigo?.includes(this.busqueda) ||
                 p.proveedor?.toLowerCase().includes(busquedaLower) ||
                 p.caracteristicas?.toLowerCase().includes(busquedaLower);
      }
    });
  }
}