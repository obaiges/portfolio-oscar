import { isPlatformBrowser } from '@angular/common';
import { Component, computed, HostListener, Inject, PLATFORM_ID, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { textos } from './textos';

export const currentLang = signal<'en' | 'es'>('es');

export const t = computed(() => textos[currentLang()]);

export const setLang = (lang: 'en' | 'es') => {
  localStorage.setItem('lang', lang);
  currentLang.set(lang);
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Óscar Baiges Ruiz';

  mode: string = 'dark';
  t = t
  currentLang = currentLang
  showButton = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedLang = localStorage.getItem('lang') as 'en' | 'es' | null;
      if (savedLang) currentLang.set(savedLang);

      // Cargr el tema inicial desde localStorage
      const savedMode = localStorage.getItem('mode');
      if (savedMode) {
        this.mode = savedMode;
      }
      this.applyTheme();
    }
  }

  toggleMode(): void {
    this.mode = this.mode === 'light' ? 'dark' : 'light';
    localStorage.setItem('mode', this.mode);
    this.applyTheme();
  }

  applyTheme(): void {
    if (this.mode === 'dark') {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
  }

  getYears(): number {
    const date = new Date().getFullYear();;
    const age = date - 2022;
    return age;
  }

  setLanguage(lang: 'en' | 'es') {
    setLang(lang);
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    // Mostrar el botón si el scroll supera los 100px
    this.showButton = scrollPosition > 100;
  }


}
