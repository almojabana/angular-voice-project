import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs'; 
import { tap } from 'rxjs/operators';
import { TutorialUsuario } from '../models/tutorial-usuario';
import {TutorialUsuarioDTO } from '../models/DTO/user-tutorial-dto'; 

@Injectable({
  providedIn: 'root'
})

export class TutorialService {
    //Address for the backend API server
    baseUrl = 'https://localhost:44375'; 
    
    //address for acessing the userTutorial controller
    private userTutorialUrl = this.baseUrl+'/api/TutorialUsuarios/'; 
    
    constructor(
      private http: HttpClient,
    ) { }

  //Retrieves information from the TutorialUsuario table, if the user has previously attempted the tutorial
  fetchUserTutorial(userID: string, tutorialID:string ): Observable<Array<TutorialUsuario>> {
    return  this.http.get<Array<TutorialUsuario>>(`${this.userTutorialUrl}${userID}/${tutorialID}`).pipe(
        tap(data=>console.log("userTutorial that the tutorial service got from backend: ", data))); 
  }

  //Sends a dto in order to create a new TutorialUsuario record.
  createUserTutorial(dto:TutorialUsuarioDTO): Observable<Array<TutorialUsuario>>{ 
    
    return this.http.post<Array<TutorialUsuario>>(`${this.userTutorialUrl}`, dto ); 
  }

  //Retrieves the questions for the tutorial
 // getQuestions(tutorialID:string):Observable<Array<Question[]>>{}

    // saveUserAnswer(): Observable<>{
    //   return this.http.post<Lenguajes[]>(this.languagesUrl).pipe(
    //     tap(data=>console.log("data that the service got from backend: ", JSON.stringify(data)))); 
    // }
}
