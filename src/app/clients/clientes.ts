import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ClienteService, Cliente } from '../services/cliente.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  templateUrl: './clientes.html',
  imports: [CommonModule, FormsModule, RouterModule],
  styleUrls: ['./clientes.css']
})
export class ClientesComponent implements OnInit {
  clientes = signal<Cliente[]>([]);
  
  showModal = signal(false);
  modoEdicion = signal(false);
  
  clienteActual: Cliente = this.nuevoCliente();
  clienteOriginal: Cliente = this.nuevoCliente();
  
  busqueda: string = '';
  filtroSeleccionado: string = 'todos';
  mostrarFiltro: boolean = false;
  
  isLoading = signal(false);
  
  showConfirmModal = signal(false);
  clienteAEliminar: string | null = null;
  
  showConfirmCloseModal = signal(false);
  
  menuAbierto: boolean = false;

  constructor(private clienteService: ClienteService) {}

  async ngOnInit() {
    await this.cargarClientes();
  }

  async cargarClientes() {
    this.isLoading.set(true);
    const clientes = await this.clienteService.getClientes();
    this.clientes.set(clientes);
    this.isLoading.set(false);
  }

  nuevoCliente(): Cliente {
    return {
      nombre: '',
      empresa: '',
      telefono: '',
      email: '',
      direccion: ''
    };
  }

  abrirModalAgregar() {
    this.modoEdicion.set(false);
    this.clienteActual = this.nuevoCliente();
    this.clienteOriginal = { ...this.clienteActual };
    this.showModal.set(true);
  }

  abrirModalEditar(cliente: Cliente) {
    this.modoEdicion.set(true);
    this.clienteActual = { ...cliente };
    this.clienteOriginal = { ...cliente };
    this.showModal.set(true);
  }

  hayCambiosSinGuardar(): boolean {
    return JSON.stringify(this.clienteActual) !== JSON.stringify(this.clienteOriginal);
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
    this.clienteActual = this.nuevoCliente();
    this.clienteOriginal = this.nuevoCliente();
  }

  async guardarCliente() {
    // Validaciones
    if (!this.clienteActual.nombre) {
      alert('Por favor completa el campo obligatorio: Nombre');
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (this.clienteActual.email && !emailRegex.test(this.clienteActual.email)) {
      alert('Por favor ingresa un email válido');
      return;
    }

    this.isLoading.set(true);

    let resultado;
    if (this.modoEdicion() && this.clienteActual.id) {
      resultado = await this.clienteService.actualizarCliente(
        this.clienteActual.id,
        this.clienteActual
      );
    } else {
      resultado = await this.clienteService.agregarCliente(this.clienteActual);
    }

    this.isLoading.set(false);

    if (resultado.success) {
      alert(this.modoEdicion() ? 'Cliente actualizado exitosamente' : 'Cliente agregado exitosamente');
      this.cerrarModal();
      await this.cargarClientes();
    } else {
      alert('Error: ' + resultado.error);
    }
  }

  confirmarEliminar(id: string | undefined) {
    if (!id) return;
    this.clienteAEliminar = id;
    this.showConfirmModal.set(true);
  }

  async eliminarCliente() {
    if (!this.clienteAEliminar) return;

    this.isLoading.set(true);
    const resultado = await this.clienteService.eliminarCliente(this.clienteAEliminar);
    this.isLoading.set(false);

    if (resultado.success) {
      alert('Cliente eliminado exitosamente');
      this.showConfirmModal.set(false);
      this.clienteAEliminar = null;
      await this.cargarClientes();
    } else {
      alert('Error al eliminar: ' + resultado.error);
    }
  }

  cancelarEliminar() {
    this.showConfirmModal.set(false);
    this.clienteAEliminar = null;
  }

  filtrarClientes() {
    const busquedaLower = this.busqueda.toLowerCase().trim();
    
    if (!busquedaLower) {
      return this.clientes();
    }

    return this.clientes().filter(cliente => {
      switch (this.filtroSeleccionado) {
        case 'nombre':
          return cliente.nombre.toLowerCase().includes(busquedaLower);
        case 'empresa':
          return cliente.empresa.toLowerCase().includes(busquedaLower);
        case 'email':
          return cliente.email.toLowerCase().includes(busquedaLower);
        default:
          return (
            cliente.nombre.toLowerCase().includes(busquedaLower) ||
            cliente.empresa.toLowerCase().includes(busquedaLower) ||
            cliente.email.toLowerCase().includes(busquedaLower) ||
            cliente.telefono.toLowerCase().includes(busquedaLower)
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