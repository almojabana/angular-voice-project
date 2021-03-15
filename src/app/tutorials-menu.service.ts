import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import { TUTORIALS } from './mock-tutorials';
import { Tutorial } from './tutorial'; 
import { Observable, of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class TutorialsMenuService {

  constructor() { }
  
  getTutorials(name:string): Observable<Tutorial[]> {
    const tutorials = of(TUTORIALS.filter(tutorial => tutorial.language === name));
    return tutorials;
  }
}
 