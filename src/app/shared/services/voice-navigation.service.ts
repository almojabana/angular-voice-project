import { Injectable } from '@angular/core';
import { Router } from '@angular/router'; 

@Injectable({
  providedIn: 'root'
})
export class VoiceNavigationService {
  
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
      case 'the C tutorial':
      case 'the C tutorials':
        this.router.navigate(['/language-tutorials/1']); 
        break;
      case 'the Java tutorial': 
      case 'the Java tutorials': 
        this.router.navigate(['/language-tutorials/6']);
        break;
      case 'the C sharp tutorial': 
      case 'the C sharp tutorials':
        this.router.navigate(['/language-tutorials/11']);
        break;
    }
  }

  // tutorialsMenuNavigator(link: string): void {
  //   switch (link) {
  //     case ''
  //   }
  // }
}
