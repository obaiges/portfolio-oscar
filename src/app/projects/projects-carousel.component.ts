import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Component,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  PLATFORM_ID,
  signal,
  ViewChild,
} from '@angular/core';

type Project = {
  name: string;
  description: string;
  image: string;
  technologies: string[];
  link: string;
};

@Component({
  selector: 'app-projects-carousel',
  standalone: true,
  templateUrl: './projects-carousel.component.html',
  styleUrl: './projects-carousel.component.scss',
})
export class ProjectsCarouselComponent implements OnDestroy {
  @Input() projects: Project[] = [];

  @ViewChild('track') track?: ElementRef<HTMLElement>;

  currentPage = signal(0);
  totalPages = signal(1);

  private resizeCleanups: (() => void)[] = [];
  private rafPending = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      afterNextRender(() => {
        this.recompute();
        const onResize = () => this.recompute();
        window.addEventListener('resize', onResize);
        this.resizeCleanups.push(() => window.removeEventListener('resize', onResize));
      });
    }
  }

  get canPrev(): boolean {
    return this.currentPage() > 0;
  }

  get canNext(): boolean {
    return this.currentPage() < this.totalPages() - 1;
  }

  pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i);
  }

  prev(): void {
    this.goTo(this.currentPage() - 1);
  }

  next(): void {
    this.goTo(this.currentPage() + 1);
  }

  goTo(page: number): void {
    const el = this.track?.nativeElement;
    if (!el) return;
    const clamped = Math.max(0, Math.min(this.totalPages() - 1, page));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: 'smooth' });
  }

  onTrackScroll(): void {
    if (this.rafPending || !isPlatformBrowser(this.platformId)) return;
    this.rafPending = true;
    requestAnimationFrame(() => {
      this.rafPending = false;
      this.updateFromScroll();
    });
  }

  private recompute(): void {
    const el = this.track?.nativeElement;
    if (!el || el.clientWidth === 0) return;
    const pagesCount = Math.max(1, Math.round(el.scrollWidth / el.clientWidth));
    if (pagesCount !== this.totalPages()) this.totalPages.set(pagesCount);
    this.updateFromScroll();
  }

  private updateFromScroll(): void {
    const el = this.track?.nativeElement;
    if (!el || el.clientWidth === 0) return;
    const page = Math.max(
      0,
      Math.min(this.totalPages() - 1, Math.round(el.scrollLeft / el.clientWidth))
    );
    if (page !== this.currentPage()) this.currentPage.set(page);
  }

  // Tilt 3D
  onTilt(ev: MouseEvent): void {
    const card = ev.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    const px = (ev.clientX - rect.left) / rect.width;
    const py = (ev.clientY - rect.top) / rect.height;
    card.style.transition = 'transform .12s ease-out';
    card.style.transform =
      `perspective(900px) rotateX(${((0.5 - py) * 5).toFixed(2)}deg) rotateY(${((px - 0.5) * 6).toFixed(2)}deg) translateY(-4px)`;
    card.style.setProperty('--shine-x', `${(px * 100).toFixed(1)}%`);
    card.style.setProperty('--shine-y', `${(py * 100).toFixed(1)}%`);
  }

  resetTilt(ev: MouseEvent): void {
    const card = ev.currentTarget as HTMLElement;
    card.style.transition = '';
    card.style.transform = '';
  }

  ngOnDestroy(): void {
    this.resizeCleanups.forEach((fn) => fn());
  }
}
