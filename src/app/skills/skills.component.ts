import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-skills',
  standalone: true,
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss'
})
export class SkillsComponent implements OnChanges {
  @Input() name: string = '';
  @Input() score: number = 0;
  @Input() description: string = '';
  @Input() visible: boolean = false;

  animatedScore: number = 0;
  private hasAnimated = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible'] && this.visible && !this.hasAnimated) {
      this.hasAnimated = true;
      this.animateScore();
    }
  }

  animateScore() {
    this.animatedScore = 0;
    setTimeout(() => {
      this.animatedScore = this.score;
    }, 50);
  }
}
