import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProveedorService, Proveedor } from '../services/proveedor.service';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  templateUrl: './proveedores.html',
  imports: [CommonModule, FormsModule, RouterModule],
  styleUrls: ['./proveedores.css']
})
export class ProveedoresComponent implements OnInit {
  proveedores = signal<Proveedor[]>([]);
  
  showModal = signal(false);
  modoEdicion = signal(false);
  
  proveedorActual: Proveedor = this.nuevoProveedor();
  proveedorOriginal: Proveedor = this.nuevoProveedor();
  
  busqueda: string = '';
  filtroSeleccionado: string = 'todos';
  mostrarFiltro: boolean = false;
  
  isLoading = signal(false);
  
  showConfirmModal = signal(false);
  proveedorAEliminar: string | null = null;
  
  showConfirmCloseModal = signal(false);
  
  menuAbierto: boolean = false;

  constructor(private proveedorService: ProveedorService) {}

  async ngOnInit() {
    await this.cargarProveedores();
  }

  async cargarProveedores() {
    this.isLoading.set(true);
    const proveedores = await this.proveedorService.getProveedores();
    this.proveedores.set(proveedores);
    this.isLoading.set(false);
  }

  nuevoProveedor(): Proveedor {
    return {
      nombre: '',
      empresa: '',
      telefono: '',
      email: '',
      rfc: '',
      pais: '',
      direccion: ''
    };
  }

  abrirModalAgregar() {
    this.modoEdicion.set(false);
    this.proveedorActual = this.nuevoProveedor();
    this.proveedorOriginal = { ...this.proveedorActual };
    this.showModal.set(true);
  }

  abrirModalEditar(proveedor: Proveedor) {
    this.modoEdicion.set(true);
    this.proveedorActual = { ...proveedor };
    this.proveedorOriginal = { ...proveedor };
    this.showModal.set(true);
  }

  hayCambiosSinGuardar(): boolean {
    return JSON.stringify(this.proveedorActual) !== JSON.stringify(this.proveedorOriginal);
  }

  intentarCerrarModal() {
    if (this.hayCambiosSinGuardar()) {
      this.showConfirmCloseModal.set(true);
    } else {
      this.cerrarModal();
    }
  }

  confirmarCerrarSinGuardar() {
    this.showConfirmCloseModal.set(false);
    this.cerrarModal();
  }

  cancelarCerrar() {
    this.showConfirmCloseModal.set(false);
  }

  cerrarModal() {
    this.showModal.set(false);
    this.showConfirmCloseModal.set(false);
    this.proveedorActual = this.nuevoProveedor();
    this.proveedorOriginal = this.nuevoProveedor();
  }

  async guardarProveedor() {
  // Limpiar espacios en blanco
  this.proveedorActual.nombre = this.proveedorActual.nombre.trim();
  this.proveedorActual.empresa = this.proveedorActual.empresa.trim();
  this.proveedorActual.telefono = this.proveedorActual.telefono.trim();
  this.proveedorActual.email = this.proveedorActual.email.trim();
  this.proveedorActual.rfc = this.proveedorActual.rfc.trim();
  this.proveedorActual.pais = this.proveedorActual.pais.trim();
  this.proveedorActual.direccion = this.proveedorActual.direccion.trim();

  // Validaciones de campos obligatorios
  if (!this.proveedorActual.nombre) {
    alert('⚠️ El campo "Nombre" es obligatorio');
    return;
  }

  if (!this.proveedorActual.empresa) {
    alert('⚠️ El campo "Empresa" es obligatorio');
    return;
  }

  if (!this.proveedorActual.telefono) {
    alert('⚠️ El campo "Teléfono" es obligatorio');
    return;
  }

  if (!this.proveedorActual.email) {
    alert('⚠️ El campo "Email" es obligatorio');
    return;
  }

  if (!this.proveedorActual.rfc) {
    alert('⚠️ El campo "RFC" es obligatorio');
    return;
  }

  if (!this.proveedorActual.pais) {
    alert('⚠️ El campo "País" es obligatorio');
    return;
  }

  if (!this.proveedorActual.direccion) {
    alert('⚠️ El campo "Dirección" es obligatorio');
    return;
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(this.proveedorActual.email)) {
    alert('⚠️ Por favor ingresa un email válido (ejemplo: usuario@dominio.com)');
    return;
  }

  // Validar RFC (debe tener 12 o 13 caracteres)
  if (this.proveedorActual.rfc.length < 12 || this.proveedorActual.rfc.length > 13) {
    alert('⚠️ El RFC debe tener 12 o 13 caracteres');
    return;
  }

  // Validar teléfono (debe tener al menos 10 dígitos)
  const telefonoLimpio = this.proveedorActual.telefono.replace(/\D/g, '');
  if (telefonoLimpio.length < 10) {
    alert('⚠️ El teléfono debe tener al menos 10 dígitos');
    return;
  }

  this.isLoading.set(true);

  let resultado;
  if (this.modoEdicion() && this.proveedorActual.id) {
    resultado = await this.proveedorService.actualizarProveedor(
      this.proveedorActual.id,
      this.proveedorActual
    );
  } else {
    resultado = await this.proveedorService.agregarProveedor(this.proveedorActual);
  }

  this.isLoading.set(false);

  if (resultado.success) {
    alert('✅ ' + (this.modoEdicion() ? 'Proveedor actualizado exitosamente' : 'Proveedor agregado exitosamente'));
    this.cerrarModal();
    await this.cargarProveedores();
  } else {
    alert('❌ Error: ' + resultado.error);
  }
}

  confirmarEliminar(id: string | undefined) {
    if (!id) return;
    this.proveedorAEliminar = id;
    this.showConfirmModal.set(true);
  }

  async eliminarProveedor() {
    if (!this.proveedorAEliminar) return;

    this.isLoading.set(true);
    const resultado = await this.proveedorService.eliminarProveedor(this.proveedorAEliminar);
    this.isLoading.set(false);

    if (resultado.success) {
      alert('Proveedor eliminado exitosamente');
      this.showConfirmModal.set(false);
      this.proveedorAEliminar = null;
      await this.cargarProveedores();
    } else {
      alert('Error al eliminar: ' + resultado.error);
    }
  }

  cancelarEliminar() {
    this.showConfirmModal.set(false);
    this.proveedorAEliminar = null;
  }

  filtrarProveedores() {
    const busquedaLower = this.busqueda.toLowerCase().trim();
    
    if (!busquedaLower) {
      return this.proveedores();
    }

    return this.proveedores().filter(proveedor => {
      switch (this.filtroSeleccionado) {
        case 'nombre':
          return proveedor.nombre.toLowerCase().includes(busquedaLower);
        case 'empresa':
          return proveedor.empresa.toLowerCase().includes(busquedaLower);
        case 'rfc':
          return proveedor.rfc.toLowerCase().includes(busquedaLower);
        case 'pais':
          return proveedor.pais.toLowerCase().includes(busquedaLower);
        default:
          return (
            proveedor.nombre.toLowerCase().includes(busquedaLower) ||
            proveedor.empresa.toLowerCase().includes(busquedaLower) ||
            proveedor.rfc.toLowerCase().includes(busquedaLower) ||
            proveedor.email.toLowerCase().includes(busquedaLower) ||
            proveedor.pais.toLowerCase().includes(busquedaLower)
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
}