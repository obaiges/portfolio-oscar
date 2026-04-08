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
  isMenuOpen = false;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  skills = [{
    name: 'Angular 19+',
    score: 90
  },
  {
    name: 'Express',
    score: 80
  },
  {
    name: 'JavaScript',
    score: 95
  },
  {
    name: 'TypeScript',
    score: 95
  },
  {
    name: 'HTML5, CSS3',
    score: 90
  },
  {
    name: 'SASS, SCSS',
    score: 85
  },
  {
    name: 'TailwindCSS',
    score: 90
  },
  {
    name: 'API REST',
    score: 90
  },
  {
    name: 'MySQL',
    score: 95
  },
  {
    name: 'Angular Signals',
    score: 90
  },
  {
    name: 'RxJS',
    score: 85
  },
  {
    name: 'UX/UI & Figma',
    score: 95
  },
  {
    name: 'React',
    score: 80
  },
  {
    name: 'Git & GitHub',
    score: 90
  },
  {
    name: 'Java',
    score: 80
  },
  {
    name: 'Spring Boot',
    score: 75
  },
  {
    name: 'PostgreSQL',
    score: 80
  },
  {
    name: 'Karma / Jasmine',
    score: 70
  },
  {
    name: 'Docker',
    score: 75
  },
  {
    name: 'Jenkins',
    score: 50
  },
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

    const aboutTitle = document.getElementById('about-title');
    if (aboutTitle) {
      const dist = window.innerHeight - aboutTitle.getBoundingClientRect().top;
      if (dist > 200) aboutTitle.classList.add('skills-show-animation');
      // optional: remove if scrolling up? kept consistent with skills-title
      if (dist < 0) aboutTitle.classList.remove('skills-show-animation');
    }

    const projectsTitle = document.getElementById('projects-title');
    if (projectsTitle) {
      const dist = window.innerHeight - projectsTitle.getBoundingClientRect().top;
      if (dist > 200) projectsTitle.classList.add('skills-show-animation');
      if (dist < 0) projectsTitle.classList.remove('skills-show-animation');
    }

    const projectsContent = document.getElementById('projects-content');
    if (projectsContent) {
      const dist = window.innerHeight - projectsContent.getBoundingClientRect().top;
      if (dist > 200) projectsContent.classList.add('skills-show-animation');
      if (dist < 0) projectsContent.classList.remove('skills-show-animation');
    }

    const aboutContent = document.getElementById('about-content');
    if (aboutContent) {
      const dist = window.innerHeight - aboutContent.getBoundingClientRect().top;
      if (dist > 200) aboutContent.classList.add('skills-show-animation');
      if (dist < 0) aboutContent.classList.remove('skills-show-animation');
    }

    const contactTitle = document.getElementById('contact-content');
    if (contactTitle) {
      const dist = window.innerHeight - contactTitle.getBoundingClientRect().top;
      if (dist > 200) contactTitle.classList.add('skills-show-animation');
      if (dist < 0) contactTitle.classList.remove('skills-show-animation');
    }

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      const dist = window.innerHeight - contactForm.getBoundingClientRect().top;
      if (dist > 200) contactForm.classList.add('skills-show-animation');
      if (dist < 0) contactForm.classList.remove('skills-show-animation');
    }

    // Mostrar el botón si el scroll supera los 100px
    this.showButton = scrollPosition > 100;
  }

  enviarCorreo(name: string, email: string, message: string) {
    if (!name || !email || !message) return;
    const subject = encodeURIComponent(`Nuevo mensaje de ${name} desde tu Portfolio`);
    const body = encodeURIComponent(`${message}`);
    window.location.href = `mailto:oscarbaigesr@gmail.com?subject=${subject}&body=${body}`;
  }
}
