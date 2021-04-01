import { HttpClient} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs'; 
import { map } from 'rxjs/operators';
import { TutorialUsuario } from '../models/tutorial-usuario';
import { TutorialUsuarioDTO } from '../models/DTO/user-tutorial-dto'; 
import { PostRespuestaUsuarioDTO } from '../models/DTO/respuesta-usuario'; 
import { Pregunta } from '../models/pregunta';

@Injectable({
  providedIn: 'root'
})

export class TutorialService {
  /*TutorialService: this service is in charge of handling the tutrorial component's CRUD methods */

    //Address for the backend API server
    baseUrl = 'https://localhost:44375'; 
    
    //address for acessing the userTutorial controller
    private userTutorialUrl = this.baseUrl+'/api/TutorialUsuarios/';
    private getQuestionsByTutorialUrl = this.baseUrl +'/api/Preguntas/getQuestionsByTutorial/'; 
    private postAnswerUrl = this.baseUrl +'/api/RespuestaUsuarios/'; 
    
    constructor(
      private http: HttpClient,
    ) { }

  /****GET UserTutorial:  Retrieves the user's record from the TutorialUsuario table, 
  if the user has previously attempted the tutorial****/
  getUserTutorial(userID: string, tutorialID:string ): Observable<TutorialUsuario> {
    return  this.http
    .get<TutorialUsuario>(`${this.userTutorialUrl}${userID}/${tutorialID}`)
    .pipe(map( response => new TutorialUsuario().deserialize(response))); 
    
  }

  /****POST UserTutorial: Sends a dto in order to create a new TutorialUsuario record.*/
  createUserTutorial(dto:TutorialUsuarioDTO): Observable<TutorialUsuario>{ 
    return this.http
    .post<TutorialUsuario>(`${this.userTutorialUrl}`, dto )
    .pipe(map( response => new TutorialUsuario().deserialize(response))); 
  }

  /****GET Retrieves a list of questions that correspond to the tutorial ****/
  getQuestions(tutorialID: string): Observable<Pregunta[]> {
    return this.http
    .get<Pregunta[]>(`${this.getQuestionsByTutorialUrl}${tutorialID}`)
    .pipe( map (response => {
      const arr = JSON.parse(JSON.stringify(response));
      const questions = arr.map( q => new Pregunta().deserialize(q));
      return questions; 
    }));

    /*Brainstorming idea: creating a Question child component of Tutorial
     *"localhost/tutorial/1"
     *"localhost/tutorial/1/pregunta/5" 
     */
  }

  /****POST Saves the user's answer, which is corrected in the backend server API
   * Retruns the grading result.
  */
  gradeAnswer(dto: PostRespuestaUsuarioDTO){
    return this.http
    .post<PostRespuestaUsuarioDTO>(`${this.postAnswerUrl}`, dto);
  }

}
