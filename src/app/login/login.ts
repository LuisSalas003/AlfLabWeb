import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./login.css']
})
export class LoginComponent {
  usuario: string = '';
  password: string = '';

  constructor(private readonly router: Router) {}

  login() {
    if (this.usuario && this.password) {
      this.router.navigate(['/main']);
    } else {
      alert('Por favor ingresa usuario y contraseña');
    }
  }
}
