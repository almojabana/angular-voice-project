import { Component, OnInit } from '@angular/core';
import { Language } from '../shared/models/language'; 
import {Lenguajes } from '../shared/models/lenguaje';
import { LanguagesMenuService } from '../shared/services/languages-menu.service';
import  { LANGUAGES } from '../mock-languages';
import { Observable } from 'rxjs';
import { ActivatedRoute, ExtraOptions, Router } from '@angular/router';

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
 
  getLanguages() {
    console.log( "this is returned from langmenu service: " , 
    this.languagesMenuService.getLanguages().subscribe(languages =>this.languages = languages)); 
    
  }
}
