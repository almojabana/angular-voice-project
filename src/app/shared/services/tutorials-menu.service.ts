import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import { TUTORIALS } from '../../mock-tutorials';
import { Tutorial } from '../models/tutorial'; 
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { LANGUAGES } from 'src/app/mock-languages';
import { Language } from '../models/language';


@Injectable({
  providedIn: 'root'
})
export class TutorialsMenuService {
  baseUrl = 'https://localhost:44375';
  private tutorialUrl = this.baseUrl+'/api/Tutorials/'

  constructor(private http: HttpClient) { }
 
  getTutorials(languageId:string):Observable<Array<Tutorial[]>>{
    return this.http.get<Array<Tutorial[]>>(`${this.tutorialUrl}${languageId}`).pipe(
      tap(data=>console.log("tutorials that the tutorial service got from backend: ", data)));; 
  }

  getLanguageName(languageID:string): Language {
   var language = LANGUAGES.find(l =>l.id === Number(languageID)); 
   return language;  
  }
}
 