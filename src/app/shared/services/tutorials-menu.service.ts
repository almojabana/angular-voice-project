/**Tutorials-menu service
 * tutorials-menu.service.ts
 * This service retrieves the menu's data from the back end or local storage
 */
import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import { Tutorial } from '../models/tutorial'; 
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { LANGUAGES } from 'src/app/mock-languages';
import { Language } from '../models/language2';


@Injectable({
  providedIn: 'root'
})
export class TutorialsMenuService {
  //The url to reach the backend API
  baseUrl = 'https://localhost:44375';
  private tutorialUrl = this.baseUrl+'/api/Tutorials/';

  constructor(private http: HttpClient) { }
 
  //Gets the list of tutorials by language ID
  getTutorials(languageId:string):Observable<Array<Tutorial[]>>{
    return this.http.get<Array<Tutorial[]>>(`${this.tutorialUrl}${languageId}`).pipe(
      tap(data=>console.log("tutorials that the tutorial service got from backend: ", data)));; 
  }

  //gethe shte language's name by its id
  getLanguageName(languageID:string): Language {
   var language = LANGUAGES.find(l =>l.id === Number(languageID)); 
   return language;  
  }
}
 