import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductoService, Producto } from '../services/product.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  templateUrl: './productos.html',
  imports: [CommonModule, FormsModule, RouterModule],
  styleUrls: ['./productos.css']
})
export class ProductosComponent implements OnInit {
  productos = signal<Producto[]>([]);
  
  showModal = signal(false);
  modoEdicion = signal(false);
  
  productoActual: Producto = this.nuevoProducto();
  productoOriginal: Producto = this.nuevoProducto(); // Para comparar cambios
  
  busqueda: string = '';
  filtroSeleccionado: string = 'todos';
  mostrarFiltro: boolean = false;
  
  isLoading = signal(false);
  
  showConfirmModal = signal(false);
  productoAEliminar: string | null = null;
  
  // Modal de confirmación para cerrar
  showConfirmCloseModal = signal(false);
  
  menuAbierto: boolean = false;
  
  opcionImagen: 'url' | 'archivo' = 'url';

  constructor(private productoService: ProductoService) {}

  async ngOnInit() {
    await this.cargarProductos();
  }

  async cargarProductos() {
    this.isLoading.set(true);
    const productos = await this.productoService.getProductos();
    this.productos.set(productos);
    this.isLoading.set(false);
  }

  nuevoProducto(): Producto {
    return {
      nombre: '',
      caracteristicas: '',
      codigo: '',
      precio: 0,
      proveedor: '',
      stock: 0,
      imagen: ''
    };
  }

  abrirModalAgregar() {
    this.modoEdicion.set(false);
    this.productoActual = this.nuevoProducto();
    this.productoOriginal = { ...this.productoActual };
    this.opcionImagen = 'url';
    this.showModal.set(true);
  }

  abrirModalEditar(producto: Producto) {
    this.modoEdicion.set(true);
    this.productoActual = { ...producto };
    this.productoOriginal = { ...producto };
    this.opcionImagen = 'url';
    this.showModal.set(true);
  }

  // Verificar si hay cambios sin guardar
  hayCambiosSinGuardar(): boolean {
    return JSON.stringify(this.productoActual) !== JSON.stringify(this.productoOriginal);
  }

  // Intentar cerrar modal
  intentarCerrarModal() {
    if (this.hayCambiosSinGuardar()) {
      this.showConfirmCloseModal.set(true);
    } else {
      this.cerrarModal();
    }
  }

  // Confirmar que quiere cerrar sin guardar
  confirmarCerrarSinGuardar() {
    this.showConfirmCloseModal.set(false);
    this.cerrarModal();
  }

  // Cancelar el cierre
  cancelarCerrar() {
    this.showConfirmCloseModal.set(false);
  }

  cerrarModal() {
    this.showModal.set(false);
    this.showConfirmCloseModal.set(false);
    this.productoActual = this.nuevoProducto();
    this.productoOriginal = this.nuevoProducto();
  }

  async guardarProducto() {
  // Limpiar espacios en blanco
  this.productoActual.nombre = this.productoActual.nombre.trim();
  this.productoActual.codigo = this.productoActual.codigo.trim();
  this.productoActual.caracteristicas = this.productoActual.caracteristicas.trim();
  this.productoActual.proveedor = this.productoActual.proveedor.trim();

  // Validaciones de campos obligatorios
  if (!this.productoActual.nombre) {
    alert('⚠️ El campo "Nombre" es obligatorio');
    return;
  }

  if (!this.productoActual.codigo) {
    alert('⚠️ El campo "Código" es obligatorio');
    return;
  }

  if (!this.productoActual.caracteristicas) {
    alert('⚠️ El campo "Características" es obligatorio');
    return;
  }

  if (!this.productoActual.proveedor) {
    alert('⚠️ El campo "Proveedor" es obligatorio');
    return;
  }

  // Validar números
  if (this.productoActual.precio <= 0) {
    alert('⚠️ El precio debe ser mayor a 0');
    return;
  }

  if (this.productoActual.stock < 0) {
    alert('⚠️ El stock no puede ser negativo');
    return;
  }

  // Validar imagen (opcional pero si se ingresa debe ser válida)
  if (this.productoActual.imagen && this.productoActual.imagen.trim() === '') {
    this.productoActual.imagen = '';
  }

  this.isLoading.set(true);

  let resultado;
  if (this.modoEdicion() && this.productoActual.id) {
    resultado = await this.productoService.actualizarProducto(
      this.productoActual.id,
      this.productoActual
    );
  } else {
    resultado = await this.productoService.agregarProducto(this.productoActual);
  }

  this.isLoading.set(false);

  if (resultado.success) {
    alert('✅ ' + (this.modoEdicion() ? 'Producto actualizado exitosamente' : 'Producto agregado exitosamente'));
    this.cerrarModal();
    await this.cargarProductos();
  } else {
    alert('❌ Error: ' + resultado.error);
  }
}

  confirmarEliminar(id: string | undefined) {
    if (!id) return;
    this.productoAEliminar = id;
    this.showConfirmModal.set(true);
  }

  async eliminarProducto() {
    if (!this.productoAEliminar) return;

    this.isLoading.set(true);
    const resultado = await this.productoService.eliminarProducto(this.productoAEliminar);
    this.isLoading.set(false);

    if (resultado.success) {
      alert('Producto eliminado exitosamente');
      this.showConfirmModal.set(false);
      this.productoAEliminar = null;
      await this.cargarProductos();
    } else {
      alert('Error al eliminar: ' + resultado.error);
    }
  }

  cancelarEliminar() {
    this.showConfirmModal.set(false);
    this.productoAEliminar = null;
  }

  filtrarProductos() {
    const busquedaLower = this.busqueda.toLowerCase().trim();
    
    if (!busquedaLower) {
      return this.productos();
    }

    return this.productos().filter(producto => {
      switch (this.filtroSeleccionado) {
        case 'codigo':
          return producto.codigo.toLowerCase().includes(busquedaLower);
        case 'nombre':
          return producto.nombre.toLowerCase().includes(busquedaLower);
        case 'proveedor':
          return producto.proveedor.toLowerCase().includes(busquedaLower);
        default:
          return (
            producto.codigo.toLowerCase().includes(busquedaLower) ||
            producto.nombre.toLowerCase().includes(busquedaLower) ||
            producto.proveedor.toLowerCase().includes(busquedaLower) ||
            producto.caracteristicas.toLowerCase().includes(busquedaLower)
          );
      }
    });
  }

  toggleFiltro() {
    this.mostrarFiltro = !this.mostrarFiltro;
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  onImagenArchivoSeleccionado(event: any) {
    const archivo = event.target.files[0];
    if (archivo) {
      if (!archivo.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
      }

      if (archivo.size > 2 * 1024 * 1024) {
        alert('La imagen es muy grande. Máximo 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.productoActual.imagen = e.target.result;
      };
      reader.readAsDataURL(archivo);
    }
  }
}