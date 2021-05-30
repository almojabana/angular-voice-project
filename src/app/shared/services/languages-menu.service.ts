import { Injectable } from '@angular/core';
import { Language } from '../models/language2';
import { LANGUAGES } from '../../mock-languages'; 
import { Observable, of } from 'rxjs';
import { catchError, map, tap} from 'rxjs/operators'; 
import { trimTrailingNulls } from '@angular/compiler/src/render3/view/util';


@Injectable({
  providedIn: 'root'
})

//This class retrieves the list of languages from a local list
export class LanguagesMenuService {

  constructor(
  ) { }
  
  //Gets the languages list from a local interface
  getLanguages(): Observable<Language[]> {
    return of(LANGUAGES); 
  }
 
  

 
  
}
