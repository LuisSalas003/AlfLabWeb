import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { Auth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from '@angular/fire/auth';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  templateUrl: './configuracion.html',
  imports: [CommonModule, FormsModule, RouterModule],
  styleUrls: ['./configuracion.css']
})
export class ConfiguracionComponent implements OnInit {
  // Usuario
  userEmail: string = '';
  userName: string = '';
  
  // Tema
  temaActual: string = 'dark';
  
  // Lógica para ordenar opciones de tema
  opcionesTema = [
    { value: 'dark', label: '🌙 Modo Oscuro' },
    { value: 'light', label: '☀️ Modo Claro' }
  ];
  temasOrdenados: any[] = [];
  
  // Cambio de contraseña
  showModalPassword = signal(false);
  passwordActual: string = '';
  passwordNueva: string = '';
  passwordConfirmar: string = '';
  mostrarPasswordActual: boolean = false;
  mostrarPasswordNueva: boolean = false;
  mostrarPasswordConfirmar: boolean = false;
  
  // Estados
  isLoading = signal(false);
  mensajeExito: string = '';
  mensajeError: string = '';
  
  // Menú
  menuAbierto: boolean = false;

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private auth: Auth
  ) {}

  ngOnInit() {
    console.log('ngOnInit ejecutado');
    this.cargarInformacionUsuario();
    
    // Obtener tema actual
    this.temaActual = this.themeService.getCurrentTheme();
    
    // Ordenar la lista para que el tema actual aparezca primero
    this.ordenarTemas();
    
    console.log('temaActual:', this.temaActual);
  }

  cargarInformacionUsuario() {
    console.log('cargarInformacionUsuario ejecutado');
    const user = this.authService.getCurrentUser();
    console.log('user:', user);
    
    if (user) {
      this.userEmail = user.email || 'No disponible';
      console.log('userEmail asignado:', this.userEmail);
      
      const userData = this.authService.getUserData();
      console.log('userData:', userData);
      this.userName = userData?.username || this.userEmail.split('@')[0];
      console.log('userName asignado:', this.userName);
    } else {
      console.log('No hay usuario autenticado');
    }
  }

  // Cambiar tema
  cambiarTema(event: any) {
    const nuevoTema = event.target.value;
    
    // 1. Aplicar el tema
    this.themeService.applyTheme(nuevoTema);
    this.temaActual = nuevoTema;
    
    // 2. Reordenar la lista para reflejar el cambio en el select
    this.ordenarTemas();
    
    this.mostrarMensajeExito('Tema actualizado correctamente');
  }

  // Función auxiliar para mantener la opción seleccionada al principio
  ordenarTemas() {
    const seleccionado = this.opcionesTema.find(t => t.value === this.temaActual);
    const otros = this.opcionesTema.filter(t => t.value !== this.temaActual);
    
    if (seleccionado) {
      this.temasOrdenados = [seleccionado, ...otros];
    } else {
      this.temasOrdenados = [...this.opcionesTema];
    }
  }

  // Abrir modal de cambio de contraseña
  abrirModalPassword() {
    this.limpiarFormularioPassword();
    this.showModalPassword.set(true);
  }

  cerrarModalPassword() {
    this.showModalPassword.set(false);
    this.limpiarFormularioPassword();
  }

  limpiarFormularioPassword() {
    this.passwordActual = '';
    this.passwordNueva = '';
    this.passwordConfirmar = '';
    this.mostrarPasswordActual = false;
    this.mostrarPasswordNueva = false;
    this.mostrarPasswordConfirmar = false;
    this.mensajeError = '';
    this.mensajeExito = '';
  }

  // Cambiar contraseña
  async cambiarPassword() {
    this.mensajeError = '';
    this.mensajeExito = '';

    // Validaciones
    if (!this.passwordActual || !this.passwordNueva || !this.passwordConfirmar) {
      this.mostrarMensajeError('⚠️ Todos los campos son obligatorios');
      return;
    }

    if (this.passwordNueva.length < 6) {
      this.mostrarMensajeError('⚠️ La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (this.passwordNueva !== this.passwordConfirmar) {
      this.mostrarMensajeError('⚠️ Las contraseñas nuevas no coinciden');
      return;
    }

    if (this.passwordActual === this.passwordNueva) {
      this.mostrarMensajeError('⚠️ La nueva contraseña debe ser diferente a la actual');
      return;
    }

    this.isLoading.set(true);

    try {
      const user = this.auth.currentUser;
      
      if (!user || !user.email) {
        throw new Error('No hay usuario autenticado');
      }

      // Reautenticar usuario
      const credential = EmailAuthProvider.credential(user.email, this.passwordActual);
      await reauthenticateWithCredential(user, credential);

      // Actualizar contraseña
      await updatePassword(user, this.passwordNueva);

      this.mostrarMensajeExito('✅ Contraseña actualizada correctamente');
      
      setTimeout(() => {
        this.cerrarModalPassword();
      }, 2000);

    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      
      if (error.code === 'auth/wrong-password') {
        this.mostrarMensajeError('❌ La contraseña actual es incorrecta');
      } else if (error.code === 'auth/weak-password') {
        this.mostrarMensajeError('❌ La contraseña es muy débil');
      } else if (error.code === 'auth/requires-recent-login') {
        this.mostrarMensajeError('❌ Por seguridad, debes volver a iniciar sesión');
      } else {
        this.mostrarMensajeError('❌ Error al cambiar la contraseña: ' + error.message);
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  // Cerrar sesión
  async cerrarSesion() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      await this.authService.logout();
    }
  }

  // Mensajes
  mostrarMensajeExito(mensaje: string) {
    this.mensajeExito = mensaje;
    setTimeout(() => {
      this.mensajeExito = '';
    }, 3000);
  }

  mostrarMensajeError(mensaje: string) {
    this.mensajeError = mensaje;
    setTimeout(() => {
      this.mensajeError = '';
    }, 5000);
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  // Toggle visibilidad de contraseñas
  togglePasswordActual() {
    this.mostrarPasswordActual = !this.mostrarPasswordActual;
  }

  togglePasswordNueva() {
    this.mostrarPasswordNueva = !this.mostrarPasswordNueva;
  }

  togglePasswordConfirmar() {
    this.mostrarPasswordConfirmar = !this.mostrarPasswordConfirmar;
  }
}