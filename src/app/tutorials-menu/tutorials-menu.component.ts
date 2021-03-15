import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
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
  constructor(
    private route: ActivatedRoute,
    private tutorialsMenuService: TutorialsMenuService,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.getTutorials();
  }

  getTutorials(): void {
    const name = this.route.snapshot.paramMap.get('name');
    this.tutorialsMenuService.getTutorials(name.toString()).subscribe(tutorials => { 
      debugger
      this.tutorials = tutorials
     })
  }
}
