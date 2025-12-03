import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

export interface UserData {
  uid: string;
  email: string;
  username?: string;
  rol?: string;
  fechaCreacion?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User | null>;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    this.user$ = new Observable((observer) => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        observer.next(user);
      });
      return () => unsubscribe();
    });
  }

  async login(email: string, password: string): Promise<{success: boolean, error?: string}> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      
      try {
        const userDoc = await getDoc(doc(this.firestore, 'usuarios', userCredential.user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserData;
          localStorage.setItem('userData', JSON.stringify(userData));
          console.log('Usuario logueado:', userData);
        }
      } catch (firestoreError) {
        console.warn('No se pudieron obtener datos adicionales de Firestore:', firestoreError);
      }
      
      // Esperar un momento antes de navegar para que el modal se cierre si está abierto
      setTimeout(() => {
        this.router.navigate(['/main']);
      }, 100);
      
      return { success: true };
      
    } catch (error: any) {
      console.error('Error en login:', error);
      console.error('Código de error:', error.code);
      const errorMessage = this.getErrorMessage(error.code);
      return { success: false, error: errorMessage };
    }
  }

  async register(email: string, password: string, username?: string, rol: string = 'usuario'): Promise<{success: boolean, error?: string}> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      const userData: UserData = {
        uid: userCredential.user.uid,
        email: email,
        username: username || email.split('@')[0],
        rol: rol,
        fechaCreacion: new Date()
      };
      
      try {
        await setDoc(doc(this.firestore, 'usuarios', userCredential.user.uid), userData);
        localStorage.setItem('userData', JSON.stringify(userData));
        console.log('Usuario registrado:', userData);
      } catch (firestoreError) {
        console.warn('Error al guardar datos en Firestore:', firestoreError);
      }
      
      setTimeout(() => {
        this.router.navigate(['/main']);
      }, 100);
      
      return { success: true };
      
    } catch (error: any) {
      console.error('Error en registro:', error);
      console.error('Código de error:', error.code);
      const errorMessage = this.getErrorMessage(error.code);
      return { success: false, error: errorMessage };
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      localStorage.removeItem('userData');
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  getUserData(): UserData | null {
    const data = localStorage.getItem('userData');
    return data ? JSON.parse(data) : null;
  }

  async getUserDataFromFirestore(uid: string): Promise<UserData | null> {
    try {
      const userDoc = await getDoc(doc(this.firestore, 'usuarios', uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserData;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.auth.currentUser !== null;
  }

  private getErrorMessage(errorCode: string): string {
    const errors: { [key: string]: string } = {
      'auth/invalid-email': 'El email no es válido',
      'auth/user-disabled': 'El usuario ha sido deshabilitado',
      'auth/user-not-found': 'Email o contraseña incorrectos',
      'auth/wrong-password': 'Email o contraseña incorrectos',
      'auth/email-already-in-use': 'El email ya está en uso',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/invalid-credential': 'Email o contraseña incorrectos',
      'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde',
      'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
      'auth/operation-not-allowed': 'Operación no permitida',
      'auth/requires-recent-login': 'Por seguridad, vuelve a iniciar sesión'
    };
    return errors[errorCode] || 'Email o contraseña incorrectos';
  }
}