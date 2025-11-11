import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './main.html',
  styleUrls: ['./main.css']
})
export class MainComponent {
  busqueda = '';
  filtroSeleccionado = 'todos';
  mostrarFiltro = false;
  
  productos = [
    { 
      codigo: '7501234567890', 
      nombre: 'Microscopio Compuesto', 
      caracteristicas: 'Óptico binocular 1000x LED', 
      precio: '$12,500.00', 
      stock: 5, 
      proveedor: 'LabTech México',
      imagen: 'https://via.placeholder.com/60x60?text=Microscopio'
    },
    { 
      codigo: '7501234567891', 
      nombre: 'Probeta Graduada', 
      caracteristicas: 'Vidrio borosilicato 250ml', 
      precio: '$145.00', 
      stock: 20, 
      proveedor: 'GlassPro',
      imagen: 'https://via.placeholder.com/60x60?text=Probeta'
    },
    { 
      codigo: '7501234567892', 
      nombre: 'Balanza Analítica', 
      caracteristicas: 'Digital precisión 0.0001g', 
      precio: '$8,900.00', 
      stock: 10, 
      proveedor: 'MedEquip',
      imagen: 'https://via.placeholder.com/60x60?text=Balanza'
    },
    { 
      codigo: '7501234567893', 
      nombre: 'Pipeta Volumétrica', 
      caracteristicas: 'Vidrio clase A 10ml', 
      precio: '$85.00', 
      stock: 15, 
      proveedor: 'GlassPro',
      imagen: 'https://via.placeholder.com/60x60?text=Pipeta'
    },
    { 
      codigo: '7501234567894', 
      nombre: 'Mechero Bunsen', 
      caracteristicas: 'Base metálica regulable', 
      precio: '$320.00', 
      stock: 8, 
      proveedor: 'LabSupply',
      imagen: 'https://via.placeholder.com/60x60?text=Mechero'
    }
  ];

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
          return p.codigo.includes(this.busqueda);
        case 'nombre':
          return p.nombre.toLowerCase().includes(busquedaLower);
        case 'proveedor':
          return p.proveedor.toLowerCase().includes(busquedaLower);
        case 'todos':
        default:
          return p.nombre.toLowerCase().includes(busquedaLower) ||
                 p.codigo.includes(this.busqueda) ||
                 p.proveedor.toLowerCase().includes(busquedaLower) ||
                 p.caracteristicas.toLowerCase().includes(busquedaLower);
      }
    });
  }
}