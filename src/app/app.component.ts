import { isPlatformBrowser } from '@angular/common';
import { Component, computed, Inject, PLATFORM_ID, signal, afterNextRender } from '@angular/core';
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
  typewriterText = signal('');
  typewriterComplete = signal(false);
  oscarStart = 0;
  skillsVisible = signal(false);

  private observer: IntersectionObserver | null = null;
  private headerObserver: IntersectionObserver | null = null;
  private skillsObserver: IntersectionObserver | null = null;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  skillsByCategory = [
    {
      name: 'Frontend',
      icon: 'palette',
      skills: [
        { name: 'Angular 19+', score: 90 },
        { name: 'React', score: 80 },
        { name: 'HTML5 & CSS3', score: 90 },
        { name: 'SASS / SCSS', score: 85 },
        { name: 'TailwindCSS', score: 90 },
        { name: 'Angular Signals', score: 90 },
        { name: 'RxJS', score: 85 },
        { name: 'UX/UI & Figma', score: 95 },
      ]
    },
    {
      name: 'Backend',
      icon: 'dns',
      skills: [
        { name: 'Express / Node.js', score: 90 },
        { name: 'API REST', score: 90 },
        { name: 'NestJS', score: 85 },
        { name: 'TypeORM', score: 80 },
        { name: 'Spring Boot', score: 75 },
        { name: 'API SOAP', score: 80 },
      ]
    },
    {
      name: 'Bases de Datos',
      icon: 'storage',
      skills: [
        { name: 'MySQL', score: 95 },
        { name: 'PostgreSQL', score: 80 },
      ]
    },
    {
      name: 'Lenguajes',
      icon: 'code',
      skills: [
        { name: 'JavaScript', score: 95 },
        { name: 'TypeScript', score: 95 },
        { name: 'Java', score: 85 },
        { name: 'Python', score: 70 },
      ]
    },
    {
      name: 'DevOps & Tools',
      icon: 'construction',
      skills: [
        { name: 'Docker', score: 75 },
        { name: 'Jenkins', score: 50 },
        { name: 'Git & GitHub', score: 90 },
      ]
    },
    {
      name: 'Testing',
      icon: 'bug_report',
      skills: [
        { name: 'Jest', score: 85 },
        { name: 'Karma / Jasmine', score: 70 },
      ]
    },
  ]

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      afterNextRender(() => {
        this.initFromStorage();
        this.applyTheme();
        this.initScrollAnimations();
        this.initSkillsObserver();
        this.initHeaderObserver();
        this.startTypewriter();
        this.initFadeArticles();
      });
    }
  }

  private initFromStorage(): void {
    const savedLang = localStorage.getItem('lang') as 'en' | 'es' | null;
    if (savedLang) currentLang.set(savedLang);

    const savedMode = localStorage.getItem('mode');
    if (savedMode) {
      this.mode = savedMode;
    }
  }

  private initScrollAnimations(): void {
    const elements = document.querySelectorAll('.skills-show');
    if (!elements.length) return;

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('skills-show-animation');
        } else {
          entry.target.classList.remove('skills-show-animation');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });

    elements.forEach(el => this.observer!.observe(el));
  }

  private initSkillsObserver(): void {
    const section = document.getElementById('skills');
    if (!section) return;

    this.skillsObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !this.skillsVisible()) {
        this.skillsVisible.set(true);
        this.skillsObserver?.disconnect();
      }
    }, { threshold: 0.15 });

    this.skillsObserver.observe(section);
  }

  private initHeaderObserver(): void {
    const header = document.querySelector('header');
    if (!header) return;

    this.headerObserver = new IntersectionObserver(([entry]) => {
      this.showButton = !entry.isIntersecting;
    }, { rootMargin: '-100px 0px 0px 0px', threshold: 0 });

    this.headerObserver.observe(header);
  }

  private startTypewriter(): void {
    const title = this.t();
    const greeting = title?.header?.title ?? '';
    const fullText = greeting + ' Óscar';
    this.oscarStart = greeting.length + 1;
    if (!greeting) return;

    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        this.typewriterText.set(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => this.typewriterComplete.set(true), 600);
      }
    }, 75);
  }

  private initFadeArticles(): void {
    requestAnimationFrame(() => {
      const article = document.getElementById('fadeArticle');
      const article2 = document.getElementById('fadeArticle2');
      if (article) {
        article.classList.remove('opacity-0', 'translate-y-[-100px]');
        article.classList.add('opacity-100', 'translate-y-0');
      }
      if (article2) {
        article2.classList.remove('opacity-0', 'translate-y-[-100px]');
        article2.classList.add('opacity-100', 'translate-y-0');
      }
    });
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

  enviarCorreo(name: string, email: string, message: string) {
    if (!name || !email || !message) return;
    const subject = encodeURIComponent(`Nuevo mensaje de ${name} desde tu Portfolio`);
    const body = encodeURIComponent(`${message}`);
    window.location.href = `mailto:oscarbaigesr@gmail.com?subject=${subject}&body=${body}`;
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.skillsObserver?.disconnect();
    this.headerObserver?.disconnect();
  }
}
