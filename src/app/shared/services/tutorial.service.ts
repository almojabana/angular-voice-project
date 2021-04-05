import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs'; 
import { TutorialUsuario } from '../models/tutorial-usuario';
import { PostTutorialUsuarioDTO } from '../models/DTO/post-tutorial-usuario-dto'; 
import { PostRespuestaUsuarioDTO } from '../models/DTO/post-respuesta-usuario-dto'; 
import { Pregunta } from '../models/pregunta';

@Injectable({
  providedIn: 'root'
})

export class TutorialService {
  /*TutorialService: this service is in charge of handling the tutrorial component's CRUD methods */

    //Address for the backend API server
    baseUrl = 'https://localhost:44375'; 
    
    //address for acessing the API Controllers
    private userTutorialUrl = this.baseUrl+'/api/TutorialUsuarios/';
    private getQuestionsByTutorialUrl = this.baseUrl +'/api/Preguntas/getQuestionsByTutorial/'; 
    private postAnswerUrl = this.baseUrl +'/api/RespuestaUsuarios'; 
    
    constructor(
      private http: HttpClient,
    ) { }

  //Retrieves information from the TutorialUsuario table, if the user has previously attempted the tutorial
  getUserTutorial(userID: string, tutorialID:string ): Observable<Array<TutorialUsuario>> {
    return  this.http.get<Array<TutorialUsuario>>(`${this.userTutorialUrl}${userID}/${tutorialID}`);
  }

  //Sends a dto in order to create a new TutorialUsuario record.
  createUserTutorial(dto:PostTutorialUsuarioDTO): Observable<Array<TutorialUsuario>>{ 
    return this.http.post<Array<TutorialUsuario>>(`${this.userTutorialUrl}`, dto ); 
  }

  getQuestions(tutorialID: string): Observable<Array<Pregunta[]>>{
    return this.http.get<Array<Pregunta[]>>(`${this.getQuestionsByTutorialUrl}${tutorialID}`); 
  }

  gradeAnswer(dto: PostRespuestaUsuarioDTO){
    return this.http.post(`${this.postAnswerUrl}`, dto);
  }
}
