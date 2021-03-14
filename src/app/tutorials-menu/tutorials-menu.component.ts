import { Component, OnInit } from '@angular/core';
import { TUTORIALS } from '../mock-tutorials';
import { Tutorial } from '../tutorial';
import { TutorialsMenuService } from '../tutorials-menu.service';

@Component({
  selector: 'app-tutorials-menu',
  templateUrl: './tutorials-menu.component.html',
  styleUrls: ['./tutorials-menu.component.css']
})
export class TutorialsMenuComponent implements OnInit {
  tutorials: Tutorial[] = [];
  constructor(private tutorialsMenuService: TutorialsMenuService) { }

  ngOnInit(): void {
    this.getTutorials();
  }

  getTutorials(): void {
    this.tutorialsMenuService.getTutorials().subscribe(tutorials => this.tutorials = tutorials)
  }



}
