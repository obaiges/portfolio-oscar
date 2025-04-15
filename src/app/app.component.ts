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
  imports: [RouterOutlet, SkillsComponent],
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
    score: 90
  },
  {
    name: 'Express',
    score: 85
  },
  {
    name: 'JavaScript',
    score: 90
  },
  {
    name: 'TypeScript',
    score: 90
  },
  {
    name: 'HTML, CSS',
    score: 100
  },
  {
    name: 'SASS, SCSS',
    score: 80
  },
  {
    name: 'Tailwind CSS',
    score: 80
  },
  {
    name: 'Pixel Perfect',
    score: 100
  },
  {
    name: 'API REST',
    score: 95
  },
  {
    name: 'MySQL',
    score: 100
  },
  {
    name: 'Signals',
    score: 75
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
    name: 'Python',
    score: 50
  },
  {
    name: 'Docker',
    score: 75
  },
  {
    name: 'Linux',
    score: 60
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
    const body = document.getElementById('skills-body');
    let distanciaTitle = window.innerHeight - titulo!.getBoundingClientRect().top;
    let distanciaBody = window.innerHeight - body!.getBoundingClientRect().top;
    if (distanciaTitle > 300) {
      titulo!.classList.add('skills-show-animation');
    }
    if (distanciaTitle > 450) {
      body!.classList.add('skills-show-animation');
    }
    if (distanciaTitle < 50) {
      titulo!.classList.remove('skills-show-animation');
      body!.classList.remove('skills-show-animation');
    }

    // Mostrar el botón si el scroll supera los 100px
    this.showButton = scrollPosition > 100;
  }


}
