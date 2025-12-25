import { Injectable } from '@angular/core';
import { PrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import Lara from '@primeng/themes/lara';
import Nora from '@primeng/themes/nora';

interface Theme {
  name: string;
  value: string;
  preset: any;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themes: Theme[] = [
    { name: 'Aura', value: 'aura', preset: Aura },
    { name: 'Lara', value: 'lara', preset: Lara },
    { name: 'Nora', value: 'nora', preset: Nora }
  ];

  private currentThemeIndex = 0;

  constructor(private primeng: PrimeNG) {}

  loadSavedTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      const themeIndex = this.themes.findIndex(t => t.value === savedTheme);
      if (themeIndex !== -1) {
        this.currentThemeIndex = themeIndex;
        this.applyTheme(this.themes[themeIndex]);
      }
    }
  }

  toggleTheme(): void {
    this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themes.length;
    const theme = this.themes[this.currentThemeIndex];
    this.applyTheme(theme);
    localStorage.setItem('theme', theme.value);
  }

  getCurrentThemeName(): string {
    return this.themes[this.currentThemeIndex].name;
  }

  private applyTheme(theme: Theme): void {
    this.primeng.theme.set({ preset: theme.preset });
  }
}
