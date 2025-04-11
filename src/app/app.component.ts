import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'portfolio';

  mode: string = 'dark'; // Valor por defecto
  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Cargar el tema inicial desde localStorage
      const savedMode = localStorage.getItem('mode');
      if (savedMode) {
        this.mode = savedMode;
      }
      this.applyTheme();
    }
  }

  toggleMode(): void {
    this.mode = this.mode === 'light' ? 'dark' : 'light';
    localStorage.setItem('mode', this.mode); // Guardamos el estado en localStorage
    this.applyTheme();
  }

  applyTheme(): void {
    if (this.mode === 'dark') {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }

  getYears(): number {
    const date = new Date().getFullYear();;
    const age = date - 2022;
    return age;
  }
}
