import { Injectable } from '@angular/core';
import { Router } from '@angular/router'; 
import { Tutorial } from '../models/tutorial';
declare var speechSynthesis:any; 
@Injectable({
  providedIn: 'root'
})

export class VoiceNavigationService {
  synth = speechSynthesis
  constructor(
  private router: Router
  ) { } 

  generalNavigator(link:string) : void {
    switch (link) {
      case 'the languages menu':
        this.router.navigate(['/languages-menu']);
        
        break;  
    }
  }

  languagesMenuNavigator(link: string): void {
    switch (link) {
      case 'the c tutorial':
      case 'the c tutorials':
        this.router.navigate(['/language-tutorials/1']); 
        break;
      case 'the java tutorial': 
      case 'the java tutorials': 
        this.router.navigate(['/language-tutorials/6']);
        break;
      case 'the c sharp tutorial': 
      case 'the c sharp tutorials':
      case 'c sharp tutorials':
      case 'c sharp tutorial':
        this.router.navigate(['/language-tutorials/11']);
        break;
    }
  }

  tutorialsMenuNavigator(link: string, tutorials: Tutorial[][]): void {
    var tutorial: Tutorial = new Tutorial().deserialize(tutorials[0]);
    var str: string = tutorial.tutorialId.toString();
    switch (link) {
      case 'tutorial number one':
      case 'tutorial number 1':
        this.router.navigate(['/tutorial-questions/'+ str]);
        break;
      case ' tutorial number two':
      case ' tutorial number 2':
        this.router.navigate(['/tutorial-questions/'+ str]);
        break;
      case ' tutorial number three':
      case ' tutorial number 3':
        this.router.navigate(['/tutorial-questions/'+ str]);
        break;
      case 'tutorial number four':
      case 'tutorial number 4':
        this.router.navigate(['/tutorial-questions/'+ str]);
        break;
      case 'tutorial number five':
      case 'tutorial number 5':
        this.router.navigate(['/tutorial-questions/'+ str]);
        break;
      case 'tutorial number six':
      case 'tutorial number 6':
        this.router.navigate(['/tutorial-questions/'+ str]);
        break;
      case 'tutorial number seven':
      case 'tutorial number 7':
        this.router.navigate(['/tutorial-questions/'+ str]);
        break;
      case 'tutorial number eight':
      case ' tutorial number 8':
        this.router.navigate(['/tutorial-questions/'+ str]);
        break;
      case ' tutorial number nine':
      case ' tutorial number 9':
        this.router.navigate(['/tutorial-questions/'+ str]);
        break;
      case ' tutorial number ten':
      case ' tutorial number 10':
        this.router.navigate(['/tutorial-questions/'+ str]);
        break;

    }
  }
}
