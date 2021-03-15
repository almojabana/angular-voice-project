import { Component, OnInit } from '@angular/core';
import { Language } from '../language'; 
import { LanguagesMenuService } from '../languages-menu.service'; 
import { TutorialsMenuService} from '../tutorials-menu.service'; 
import { fromEventPattern } from 'rxjs';
import  { LANGUAGES } from '../mock-languages';
//import { TutorialsMenuComponent } from '../tutorials-menu/tutorials-menu.component';

@Component({
  selector: 'app-languages-menu',
  templateUrl: './languages-menu.component.html',
  styleUrls: ['./languages-menu.component.css']
})
export class LanguagesMenuComponent implements OnInit {
  
  languages: Language[]; 

  constructor( 
    private languagesMenuService : LanguagesMenuService ) { }

  ngOnInit(): void {
    this.getLanguages(); 
  }
  getLanguages():void{
    this.languagesMenuService.getLanguages().subscribe(languages => this.languages = languages);
  }

}
