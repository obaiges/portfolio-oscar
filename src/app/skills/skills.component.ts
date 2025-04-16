import { NgStyle } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, QueryList, SimpleChanges, ViewChildren } from '@angular/core';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss'
})
export class SkillsComponent implements OnChanges {

  @Input() name: string = '';
  @Input() score: number = 0;
  @Input() skillId: string = 'skill'; // id del elemento a observar

  animatedScore: number = 0;
  shouldAnimate: boolean = false;

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    this.checkScroll();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['score'] && this.shouldAnimate) {
      this.animateScore();
    }
  }

  animateScore() {
    this.animatedScore = 0;
    setTimeout(() => {
      this.animatedScore = this.score;
    }, 10);
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.checkScroll();
  }

  checkScroll() {
    const skill = document.getElementById(this.skillId);
    if (!skill) return;
    const distanciaTitle = window.innerHeight - skill.getBoundingClientRect().top;
    if (distanciaTitle > 200 && !this.shouldAnimate) {
      this.shouldAnimate = true;
      this.animateScore();
    }
    if (distanciaTitle < 0 && this.shouldAnimate) {
      this.shouldAnimate = false;
      this.animatedScore = 0;
    }
  }

}
