import { Injectable } from '@angular/core';
import { Language } from './language'; 
import { LANGUAGES } from './mock-languages'; 
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguagesMenuService {

  constructor() { }
  
  getLanguages(): Observable<Language[]> {
    return of(LANGUAGES);
  }
  
}
