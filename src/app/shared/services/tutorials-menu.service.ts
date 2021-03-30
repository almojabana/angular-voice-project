import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import { TUTORIALS } from '../../mock-tutorials';
import { Tutorial } from '../models/tutorial'; 
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class TutorialsMenuService {
  baseUrl = 'https://localhost:44375';
  private tutorialUrl = this.baseUrl+'/api/Tutorials/'

  constructor(private http: HttpClient) { }
  /*Retrieves mock tutorials from the mock-tutorials file */
  // getTutorials(id:string): Observable<Tutorial[]> {
  //   const tutorials = of(TUTORIALS.filter(tutorial => tutorial.language.toString() === id));
  //   return tutorials;
  // }
  getTutorials(languageId:string):Observable<Array<Tutorial[]>>{
    return this.http.get<Array<Tutorial[]>>(`${this.tutorialUrl}${languageId}`).pipe(
      tap(data=>console.log("tutorials that the tutorial service got from backend: ", data)));; 
  }
}
 