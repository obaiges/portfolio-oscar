import { isPlatformBrowser } from '@angular/common';
import { Component, computed, HostListener, Inject, PLATFORM_ID, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { textos } from './textos';
import { SkillsComponent } from "./skills/skills.component";

export const currentLang = signal<'en' | 'es'>('es');

export const t = computed(() => textos[currentLang()]);

export const setLang = (lang: 'en' | 'es') => {
  localStorage.setItem('lang', lang);
  currentLang.set(lang);
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SkillsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Óscar Baiges Ruiz';

  mode: string = 'dark';
  t = t
  currentLang = currentLang
  showButton = false;

  skills = [{
    name: 'Angular 17+',
    score: 85
  },
  {
    name: 'Express',
    score: 80
  },
  {
    name: 'JavaScript',
    score: 85
  },
  {
    name: 'TypeScript',
    score: 85
  },
  {
    name: 'HTML, CSS',
    score: 90
  },
  {
    name: 'SASS, SCSS',
    score: 85
  },
  {
    name: 'Tailwind CSS',
    score: 90
  },
  {
    name: 'API REST',
    score: 95
  },
  {
    name: 'MySQL',
    score: 95
  },
  {
    name: 'UX/UI & Figma',
    score: 95
  },
  {
    name: 'React',
    score: 60
  },
  {
    name: 'Git',
    score: 90
  },
  {
    name: 'Java',
    score: 50
  },
  {
    name: 'Docker',
    score: 75
  }
  ]

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
      window.addEventListener('DOMContentLoaded', () => {
        const article = document.getElementById('fadeArticle');
        const article2 = document.getElementById('fadeArticle2');
        requestAnimationFrame(() => {
          article!.classList.remove('opacity-0', 'translate-y-[-100px]');
          article!.classList.add('opacity-100', 'translate-y-0');
          article2!.classList.remove('opacity-0', 'translate-y-[-100px]');
          article2!.classList.add('opacity-100', 'translate-y-0');
        });
      });
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

  //Cada vez que hay scroll ejecuta esto
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const titulo = document.getElementById('skills-title');
    let distanciaTitle = window.innerHeight - titulo!.getBoundingClientRect().top;
    if (distanciaTitle > 200) {
      titulo!.classList.add('skills-show-animation');
    }
    if (distanciaTitle < 0) {
      titulo!.classList.remove('skills-show-animation');
    }

    // Mostrar el botón si el scroll supera los 100px
    this.showButton = scrollPosition > 100;
  }


}
