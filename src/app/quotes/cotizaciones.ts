import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CotizacionService, Cotizacion, ProductoCotizado } from '../services/cotizacion.service';
import { ClienteService, Cliente } from '../services/cliente.service';
import { ProductoService, Producto } from '../services/product.service';

@Component({
  selector: 'app-cotizaciones',
  standalone: true,
  templateUrl: './cotizaciones.html',
  imports: [CommonModule, FormsModule, RouterModule],
  styleUrls: ['./cotizaciones.css']
})



export class CotizacionesComponent implements OnInit {
  // Listas
  cotizaciones = signal<Cotizacion[]>([]);
  clientes = signal<Cliente[]>([]);
  productos = signal<Producto[]>([]);
  clienteSeleccionadoId: string = '';
  
  // Carrito de productos
  carrito = signal<ProductoCotizado[]>([]);
  
  // Cliente seleccionado
  clienteSeleccionado: Cliente | null = null;
  
  // Producto para agregar
  productoSeleccionadoId: string = '';
  cantidadProducto: number = 1;
  
  // Estados
  isLoading = signal(false);
  vistaActual: 'lista' | 'nueva' = 'lista';
  
  // Modales
  showConfirmModal = signal(false);
  cotizacionAEliminar: string | null = null;
  
  showDetalleModal = signal(false);
  cotizacionDetalle: Cotizacion | null = null;
  
  // Menú y búsqueda
  menuAbierto: boolean = false;
  busqueda: string = '';
  
  constructor(
    private cotizacionService: CotizacionService,
    private clienteService: ClienteService,
    private productoService: ProductoService
  ) {}

  async ngOnInit() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    this.isLoading.set(true);
    const [cotizaciones, clientes, productos] = await Promise.all([
      this.cotizacionService.getCotizaciones(),
      this.clienteService.getClientes(),
      this.productoService.getProductos()
    ]);
    
    this.cotizaciones.set(cotizaciones);
    this.clientes.set(clientes);
    this.productos.set(productos);
    this.isLoading.set(false);
  }

  // Cambiar vista
  mostrarNuevaCotizacion() {
    this.vistaActual = 'nueva';
    this.limpiarFormulario();
  }

  mostrarListaCotizaciones() {
    this.vistaActual = 'lista';
    this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.clienteSeleccionado = null;
    this.carrito.set([]);
    this.productoSeleccionadoId = '';
    this.cantidadProducto = 1;
  }

  // Seleccionar cliente
  seleccionarCliente(id: string) {
  this.clienteSeleccionado = this.clientes().find(c => c.id === id) || null;
}


  // Agregar producto al carrito
  agregarProductoAlCarrito() {
    if (!this.productoSeleccionadoId) {
      alert('⚠️ Por favor selecciona un producto');
      return;
    }

    if (this.cantidadProducto <= 0) {
      alert('⚠️ La cantidad debe ser mayor a 0');
      return;
    }

    const producto = this.productos().find(p => p.id === this.productoSeleccionadoId);
    if (!producto) {
      alert('❌ Producto no encontrado');
      return;
    }

    // Verificar si ya está en el carrito
    const carritoActual = [...this.carrito()];
    const indexExistente = carritoActual.findIndex(p => p.productoId === producto.id);

    if (indexExistente >= 0) {
      // Actualizar cantidad
      carritoActual[indexExistente].cantidad += this.cantidadProducto;
      carritoActual[indexExistente].subtotal = 
        carritoActual[indexExistente].cantidad * carritoActual[indexExistente].precio;
    } else {
      // Agregar nuevo
      const productoCotizado: ProductoCotizado = {
        productoId: producto.id!,
        nombre: producto.nombre,
        codigo: producto.codigo,
        proveedor: producto.proveedor,
        precio: producto.precio,
        cantidad: this.cantidadProducto,
        subtotal: producto.precio * this.cantidadProducto
      };
      carritoActual.push(productoCotizado);
    }

    this.carrito.set(carritoActual);
    
    // Resetear selección
    this.productoSeleccionadoId = '';
    this.cantidadProducto = 1;
  }

  // Eliminar producto del carrito
  eliminarDelCarrito(index: number) {
    const carritoActual = [...this.carrito()];
    carritoActual.splice(index, 1);
    this.carrito.set(carritoActual);
  }

  // Actualizar cantidad en el carrito
  actualizarCantidad(index: number, cantidad: number) {
    if (cantidad <= 0) return;
    
    const carritoActual = [...this.carrito()];
    carritoActual[index].cantidad = cantidad;
    carritoActual[index].subtotal = carritoActual[index].precio * cantidad;
    this.carrito.set(carritoActual);
  }

  // Calcular total
  calcularTotal(): number {
    return this.carrito().reduce((total, item) => total + item.subtotal, 0);
  }

  // Generar cotización
  async generarCotizacion() {
    // Validaciones
    if (!this.clienteSeleccionado) {
      alert('⚠️ Por favor selecciona un cliente');
      return;
    }

    if (this.carrito().length === 0) {
      alert('⚠️ Por favor agrega al menos un producto');
      return;
    }

    this.isLoading.set(true);

    const nuevaCotizacion: Cotizacion = {
      clienteId: this.clienteSeleccionado.id!,
      clienteNombre: this.clienteSeleccionado.nombre,
      clienteEmpresa: this.clienteSeleccionado.empresa,
      productos: this.carrito(),
      total: this.calcularTotal(),
      fecha: new Date(),
      estado: 'pendiente'
    };

    const resultado = await this.cotizacionService.crearCotizacion(nuevaCotizacion);

    this.isLoading.set(false);

    if (resultado.success) {
      alert('✅ Cotización generada exitosamente');
      await this.cargarDatos();
      this.mostrarListaCotizaciones();
    } else {
      alert('❌ Error al generar cotización: ' + resultado.error);
    }
  }

  // Ver detalle de cotización
  async verDetalle(cotizacion: Cotizacion) {
    this.cotizacionDetalle = cotizacion;
    this.showDetalleModal.set(true);
  }

  cerrarDetalle() {
    this.showDetalleModal.set(false);
    this.cotizacionDetalle = null;
  }

  // Confirmar eliminación
  confirmarEliminar(id: string | undefined) {
    if (!id) return;
    this.cotizacionAEliminar = id;
    this.showConfirmModal.set(true);
  }

  async eliminarCotizacion() {
    if (!this.cotizacionAEliminar) return;

    this.isLoading.set(true);
    const resultado = await this.cotizacionService.eliminarCotizacion(this.cotizacionAEliminar);
    this.isLoading.set(false);

    if (resultado.success) {
      alert('✅ Cotización eliminada exitosamente');
      this.showConfirmModal.set(false);
      this.cotizacionAEliminar = null;
      await this.cargarDatos();
    } else {
      alert('❌ Error al eliminar: ' + resultado.error);
    }
  }

  cancelarEliminar() {
    this.showConfirmModal.set(false);
    this.cotizacionAEliminar = null;
  }

  // Filtrar cotizaciones
  filtrarCotizaciones() {
    const busquedaLower = this.busqueda.toLowerCase().trim();
    
    if (!busquedaLower) {
      return this.cotizaciones();
    }

    return this.cotizaciones().filter(cot => 
      cot.clienteNombre.toLowerCase().includes(busquedaLower) ||
      cot.clienteEmpresa.toLowerCase().includes(busquedaLower)
    );
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  // Imprimir cotización (básico)
  imprimirCotizacion(cotizacion: Cotizacion) {
    window.print();
  }
}