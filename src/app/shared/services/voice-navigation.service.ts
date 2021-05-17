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
      case 'language menu':
      case 'languages menu': 
        this.router.navigate(['/languages-menu']);
        
        break;  
    }
  }
  
  skipLinkNavigator(link:string):void {
    this.router.navigate([link]);
  }
  /**
   * This method is used for navigating to the languages 
   * menu. The link parameter is a string type that represents
   * the name of the tutorial.
   * @param link 
   */
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
    switch (link) {
      case 'tutorial number one':
      case 'tutorial number 1':
        var tutorial: Tutorial = new Tutorial().deserialize(tutorials[0]);
        var str: string = tutorial.tutorialId.toString();
        this.router.navigate(['/tutorial-questions/'+ str]);
        break;
      case 'tutorial number two':
      case 'tutorial number 2':
        var tutorial: Tutorial = new Tutorial().deserialize(tutorials[1]);
        var str: string = tutorial.tutorialId.toString();
        this.router.navigate(['/tutorial-questions/'+ str]);
        break;
      case 'tutorial number three':
      case 'tutorial number 3':
        var tutorial: Tutorial = new Tutorial().deserialize(tutorials[2]);
        var str: string = tutorial.tutorialId.toString();
        this.router.navigate(['/tutorial-questions/'+ str]);
        break;
      case 'tutorial number four':
      case 'tutorial number 4':
        var tutorial: Tutorial = new Tutorial().deserialize(tutorials[3]);
        var str: string = tutorial.tutorialId.toString();
        this.router.navigate(['/tutorial-questions/'+ str]);
        break;
      case 'tutorial number five':
      case 'tutorial number 5':
        var tutorial: Tutorial = new Tutorial().deserialize(tutorials[4]);
        var str: string = tutorial.tutorialId.toString();
        this.router.navigate(['/tutorial-questions/'+ str]);
        break;
      case 'tutorial number six':
      case 'tutorial number 6':
        var tutorial: Tutorial = new Tutorial().deserialize(tutorials[5]);
        var str: string = tutorial.tutorialId.toString();
        this.router.navigate(['/tutorial-questions/'+ str]);
        break;
      case 'tutorial number seven':
      case 'tutorial number 7':
        var tutorial: Tutorial = new Tutorial().deserialize(tutorials[6]);
        var str: string = tutorial.tutorialId.toString();
        this.router.navigate(['/tutorial-questions/'+ str]);
        break;
      case 'tutorial number eight':
      case 'tutorial number 8':
        var tutorial: Tutorial = new Tutorial().deserialize(tutorials[7]);
        var str: string = tutorial.tutorialId.toString();
        this.router.navigate(['/tutorial-questions/'+ str]);
        break;
      case 'tutorial number nine':
      case 'tutorial number 9':
        var tutorial: Tutorial = new Tutorial().deserialize(tutorials[8]);
        var str: string = tutorial.tutorialId.toString();
        this.router.navigate(['/tutorial-questions/'+ str]);
        break;
      case 'tutorial number ten':
      case 'tutorial number 10':
        var tutorial: Tutorial = new Tutorial().deserialize(tutorials[9]);
        var str: string = tutorial.tutorialId.toString();
        this.router.navigate(['/tutorial-questions/'+ str]);
        break;
    }
  }
}
