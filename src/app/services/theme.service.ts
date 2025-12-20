import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  
  constructor() {
    this.loadTheme();
  }

  // Cargar tema guardado
  loadTheme() {
    const savedTheme = localStorage.getItem(this.THEME_KEY) || 'dark';
    this.applyTheme(savedTheme);
  }

  // Aplicar tema
  applyTheme(theme: string) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem(this.THEME_KEY, theme);
  }

  // Obtener tema actual
  getCurrentTheme(): string {
    return localStorage.getItem(this.THEME_KEY) || 'dark';
  }

  // Alternar tema
  toggleTheme() {
    const currentTheme = this.getCurrentTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
    return newTheme;
  }
}