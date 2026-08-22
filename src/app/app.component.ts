import { isPlatformBrowser } from '@angular/common';
import { Component, computed, Inject, PLATFORM_ID, signal, afterNextRender } from '@angular/core';
import { textos } from './textos';
import { SkillsComponent } from "./skills/skills.component";
import { ProjectsCarouselComponent } from "./projects/projects-carousel.component";

export const currentLang = signal<'en' | 'es'>('es');

export const t = computed(() => textos[currentLang()]);

export const setLang = (lang: 'en' | 'es') => {
  localStorage.setItem('lang', lang);
  currentLang.set(lang);
};

type Particle = { x: number; y: number; vx: number; vy: number; r: number };

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SkillsComponent, ProjectsCarouselComponent],
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

  // Preloader / boot terminal
  readonly bootText: string[] = [
    '$ npm run portfolio',
    '> loading modules ............ OK',
    '> compiling experience ....... OK',
    '> hydrating UI ............... OK',
    '> ready.',
  ];
  bootLines = signal<string[]>([]);
  bootLeaving = signal(false);
  bootGone = signal(false);

  // Scroll progress + active section
  scrollProgress = signal(0);
  activeSection = signal('');

  // Animated counters
  cYears = signal(0);
  cProjects = signal(0);
  cTechs = signal(0);

  // Fake terminal
  termCmd = signal('');
  termOut = signal('');

  private observer: IntersectionObserver | null = null;
  private headerObserver: IntersectionObserver | null = null;
  private skillsObserver: IntersectionObserver | null = null;
  private sectionObserver: IntersectionObserver | null = null;

  private timeouts: ReturnType<typeof setTimeout>[] = [];
  private particlesRAF = 0;
  private particleRGB = '187,134,252';
  private cleanups: (() => void)[] = [];

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
        { name: 'TailwindCSS', score: 90 },
        { name: 'Angular Signals', score: 90 },
        { name: 'RxJS', score: 85 },
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
        { name: 'API SOAP', score: 70 },
      ]
    },
    {
      name: 'Bases de Datos',
      icon: 'storage',
      skills: [
        { name: 'MySQL', score: 95 },
        { name: 'PostgreSQL', score: 80 },
        { name: 'Oracle', score: 70 },
      ]
    },
    {
      name: 'Lenguajes',
      icon: 'code',
      skills: [
        { name: 'JavaScript', score: 95 },
        { name: 'TypeScript', score: 95 },
        { name: 'Java', score: 85 },
        { name: 'Python', score: 50 },
      ]
    },
    {
      name: 'DevOps & Tools',
      icon: 'construction',
      skills: [
        { name: 'Git & GitHub', score: 90 },
        { name: 'Docker', score: 80 },
        { name: 'Jenkins', score: 50 },
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

  marqueeItems: string[] = [...new Set(
    this.skillsByCategory.flatMap(c => c.skills.map(s => s.name))
  )];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      afterNextRender(() => {
        this.initFromStorage();
        this.applyTheme();
        this.startBootSequence();
        this.initScrollAnimations();
        this.initSkillsObserver();
        this.initHeaderObserver();
        this.initActiveSection();
        this.initScrollProgress();
        this.startTypewriter();
        this.startTerminal();
        this.initFadeArticles();
        this.initParticles();
      });
    }
  }

  private later(fn: () => void, ms: number): void {
    this.timeouts.push(setTimeout(fn, ms));
  }

  // ---------- Preloader ----------
  private startBootSequence(): void {
    document.body.classList.add('boot-lock');
    this.bootText.forEach((line, i) => {
      this.later(() => this.bootLines.set([...this.bootLines(), line]), 120 + i * 170);
    });
    this.later(() => this.bootLeaving.set(true), 120 + this.bootText.length * 170 + 250);
    this.later(() => {
      this.bootGone.set(true);
      document.body.classList.remove('boot-lock');
      this.animateCounters();
    }, 120 + this.bootText.length * 170 + 1000);
  }

  // ---------- Counters ----------
  private animateCounters(): void {
    const targets = [
      this.getYears(),
      this.t().projects.list.length,
      new Set(this.skillsByCategory.flatMap(c => c.skills.map(s => s.name))).size,
    ];
    const duration = 1600;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      this.cYears.set(Math.round(targets[0] * eased));
      this.cProjects.set(Math.round(targets[1] * eased));
      this.cTechs.set(Math.round(targets[2] * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // ---------- Fake terminal ----------
  private startTerminal(): void {
    const runLine = (idx: number) => {
      const lines = this.t().terminal.lines;
      const line = lines[idx % lines.length];
      let i = 0;
      this.termOut.set('');
      const type = () => {
        if (i <= line.cmd.length) {
          this.termCmd.set(line.cmd.slice(0, i));
          i++;
          this.later(type, 70 + Math.random() * 70);
        } else {
          this.later(() => {
            this.termOut.set(line.out);
            this.later(() => runLine(idx + 1), 2800);
          }, 400);
        }
      };
      type();
    };
    this.later(() => runLine(0), 2400);
  }

  // ---------- Scroll progress ----------
  private initScrollProgress(): void {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      this.scrollProgress.set(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
      if (window.scrollY < 80) {
        this.clearHash();
        this.activeSection.set('');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    this.cleanups.push(() => window.removeEventListener('scroll', onScroll));
    onScroll();
  }

  // ---------- Active section in nav ----------
  private initActiveSection(): void {
    const ids = ['experiencia', 'skills', 'proyectos', 'sobre-mi', 'contact'];
    const els = ids
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);

    this.sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.activeSection.set(entry.target.id);
          this.updateHash(entry.target.id);
        }
      });
    }, { rootMargin: '-35% 0px -60% 0px', threshold: 0 });

    els.forEach(el => this.sectionObserver!.observe(el));
  }

  // Scroll-spy: refleja la sección visible en la URL sin ensuciar el historial
  private updateHash(id: string): void {
    const desired = `#${id}`;
    if (window.location.hash === desired) return;
    history.replaceState(null, '', window.location.pathname + window.location.search + desired);
  }

  private clearHash(): void {
    if (!window.location.hash) return;
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }

  // ---------- Particles network ----------
  private initParticles(): void {
    const canvas = document.getElementById('particles-canvas') as HTMLCanvasElement | null;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    let pts: Particle[] = [];
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(85, Math.max(30, Math.floor((w * h) / 26000)));
      pts = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.8 + 0.6,
      }));
    };

    const step = () => {
      ctx.clearRect(0, 0, w, h);
      const rgb = this.particleRGB;

      for (const p of pts) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 14400 && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const f = ((120 - d) / 120) * 0.03;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
        p.x += p.vx;
        p.y += p.vy;
        const sp = Math.hypot(p.vx, p.vy);
        if (sp < 0.08) {
          p.vx += (Math.random() - 0.5) * 0.02;
          p.vy += (Math.random() - 0.5) * 0.02;
        } else if (sp > 0.9) {
          p.vx *= 0.97;
          p.vy *= 0.97;
        }
        if (p.x < 0) p.x = w; else if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; else if (p.y > h) p.y = 0;
      }

      ctx.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i];
          const b = pts[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 130) {
            ctx.strokeStyle = `rgba(${rgb},${((1 - dist / 130) * 0.16).toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      ctx.fillStyle = `rgba(${rgb},0.45)`;
      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      this.particlesRAF = requestAnimationFrame(step);
    };

    const onMouse = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onMouseLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(this.particlesRAF);
      } else {
        cancelAnimationFrame(this.particlesRAF);
        this.particlesRAF = requestAnimationFrame(step);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouse, { passive: true });
    document.documentElement.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('visibilitychange', onVisibility);
    this.particlesRAF = requestAnimationFrame(step);

    this.cleanups.push(() => {
      cancelAnimationFrame(this.particlesRAF);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    });
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
      this.particleRGB = '187,134,252';
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
      this.particleRGB = '0,123,255';
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
    this.sectionObserver?.disconnect();
    this.timeouts.forEach(clearTimeout);
    this.cleanups.forEach(fn => fn());
  }
}
