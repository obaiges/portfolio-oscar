import { NgStyle } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, QueryList, ViewChildren } from '@angular/core';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [ NgStyle ],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss'
})
export class SkillsComponent {

  @Input() name: string = '';
  @Input() score: number = 0;

  constructor() { }

}
