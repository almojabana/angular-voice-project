import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs'; 
import { tap } from 'rxjs/operators';
import { TutorialUsuario } from '../models/tutorial-usuario';
import { TutorialUsuarioDto } from '../../shared/DTO/tutorial-usuario-dto'; 

@Injectable({
  providedIn: 'root'
})
export class TutorialService {

    baseUrl = 'https://localhost:44375'; 
    
    //address for getting userTutorial by ID
    private userTutorialUrl = this.baseUrl+'/api/TutorialUsuarios/'; 
    
    constructor(
      private http: HttpClient,
    ) { }
    
  fetchUserTutorial(userID: string, tutorialID:string ): Observable<Array<TutorialUsuario>> {
    return  this.http.get<Array<TutorialUsuario>>(`${this.userTutorialUrl}${userID}/${tutorialID}`).pipe(
        tap(data=>console.log("userTutorial that the tutorial service got from backend: ", data))); 
  }

  createUserTutorial(dto: TutorialUsuarioDto): Observable<Array<TutorialUsuario>>{ 
    
    return this.http.post<Array<TutorialUsuario>>(`${this.userTutorialUrl}`, dto ); 
  } 

    // saveUserAnswer(): Observable<>{
    //   return this.http.post<Lenguajes[]>(this.languagesUrl).pipe(
    //     tap(data=>console.log("data that the service got from backend: ", JSON.stringify(data)))); 
    // }
}
