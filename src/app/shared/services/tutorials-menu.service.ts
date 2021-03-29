import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import { TUTORIALS } from '../../mock-tutorials';
import { Tutorial } from '../models/tutorial'; 
import { Observable, of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class TutorialsMenuService {

  constructor() { }
  
  getTutorials(id:string): Observable<Tutorial[]> {
    const tutorials = of(TUTORIALS.filter(tutorial => tutorial.language.toString() === id));
    return tutorials;
  }
}
 