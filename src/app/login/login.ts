import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  isLoading = signal(false);
  showErrorModal = signal(false);
  errorMessage = signal('');

  constructor(private authService: AuthService) {}

  async login() {
    if (!this.email || !this.password) {
      this.showError('Por favor ingresa email y contraseña');
      return;
    }

    this.isLoading.set(true);
    
    try {
      console.log('Intentando login...');
      const result = await this.authService.login(this.email, this.password);
      
      if (!result.success) {
        console.log('Mostrando error:', result.error);
        this.showError(result.error || 'Error al iniciar sesión');
      }
      
    } catch (error: any) {
      console.error('Error inesperado:', error);
      this.showError('Error inesperado. Por favor intenta de nuevo.');
    } finally {
      this.isLoading.set(false);
    }
  }

  showError(message: string) {
    console.log('showError llamado con:', message);
    this.errorMessage.set(message);
    this.showErrorModal.set(true);
    console.log('showErrorModal:', this.showErrorModal());
  }

  closeErrorModal() {
    this.showErrorModal.set(false);
    this.errorMessage.set('');
  }
}