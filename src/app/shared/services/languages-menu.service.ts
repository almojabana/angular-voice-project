import { Injectable } from '@angular/core';
import { Language } from '../models/language';
import { LANGUAGES } from '../../mock-languages'; 
//import { Lenguajes } from '../models/lenguaje'; 
//import { HttpClient, HttpHeaders } from '@angular/common/http';  
import { Observable, of } from 'rxjs';
import { catchError, map, tap} from 'rxjs/operators'; 
import { trimTrailingNulls } from '@angular/compiler/src/render3/view/util';


@Injectable({
  providedIn: 'root'
})
export class LanguagesMenuService {

  //private languagesUrl = 'https://localhost:44375/api/Lenguajes';
 
    
  constructor(
    //private http: HttpClient,
  ) { }
  
  getLanguages(): Observable<Language[]> {
    return of(LANGUAGES);
  }
  // getLanguages(): Observable<Lenguajes[]>{
  //   return this.http.get<Lenguajes[]>(this.languagesUrl).pipe(
  //     tap(data=>console.log("data that the service got from backend: ", JSON.stringify(data)))); 
  // }
  

 
  
}
