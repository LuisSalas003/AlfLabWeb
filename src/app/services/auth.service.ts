import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User | null>;

  constructor(
    private auth: Auth,
    private router: Router
  ) {
    this.user$ = new Observable((observer) => {
      this.auth.onAuthStateChanged(observer);
    });
  }

  // Login con email y contraseña
  async login(email: string, password: string): Promise<boolean> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      this.router.navigate(['/main']);
      return true;
    } catch (error: any) {
      console.error('Error en login:', error);
      alert('Error: ' + this.getErrorMessage(error.code));
      return false;
    }
  }

  // Registro de nuevo usuario
  async register(email: string, password: string): Promise<boolean> {
    try {
      await createUserWithEmailAndPassword(this.auth, email, password);
      this.router.navigate(['/main']);
      return true;
    } catch (error: any) {
      console.error('Error en registro:', error);
      alert('Error: ' + this.getErrorMessage(error.code));
      return false;
    }
  }

  // Cerrar sesión
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  // Obtener usuario actual
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  // Mensajes de error en español
  private getErrorMessage(errorCode: string): string {
    const errors: { [key: string]: string } = {
      'auth/invalid-email': 'El email no es válido',
      'auth/user-disabled': 'El usuario ha sido deshabilitado',
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/email-already-in-use': 'El email ya está en uso',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/invalid-credential': 'Credenciales inválidas'
    };
    return errors[errorCode] || 'Error desconocido';
  }
}