/*TutorialService: this service communicates with the backend API in order to access the 
* tutorial component's CRUD methods.
*/

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TutorialUsuarioDTO } from '../models/tutorial-usuario-dto';
import { PostTutorialUsuarioDTO } from '../models/post-tutorial-usuario-dto'; 
import { PostRespuestaUsuarioDTO } from '../models/post-respuesta-usuario-dto'; 
import { Pregunta } from '../models/pregunta';
import { ResultadoDTO } from '../models/resultado-dto';
import { Tutorial } from '../models/tutorial';
import { TutorialNotes} from '../models/tutorial-notes';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class TutorialService {
  

  //Address for the backend API service
  baseUrl = 'https://localhost:44375'; 
    
  //address for the API Controllers
  private userTutorialUrl = this.baseUrl+'/api/TutorialUsuarios/';
  private getTutorialQuestionsUrl = this.baseUrl +'/api/Preguntas/getQuestionsByTutorial/'; 
  private postAnswerUrl = this.baseUrl +'/api/RespuestaUsuarios';
  private getTutorialUrl = this.baseUrl + '/api/Tutorials/Tutorial/';
  private tutorialNotesUrl = 'src/app/tutorial-notes';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
    
  //Lists the services used by this service, for dependency injection.
  constructor(
    private http: HttpClient,
  ) { }

  //Publishes a user tutorial record if the user has an incomplete previous attempt.
  getUserTutorial(userID: string, tutorialID:string ): Observable<TutorialUsuarioDTO> {
    return  this.http.get<TutorialUsuarioDTO>(`${this.userTutorialUrl}${userID}/${tutorialID}`);
  }

  /*Publishes a new user tutorial record, stored as a TutorialUsuarioDTO.
  * Parameters: a dto with the userID and tutorialID.
  */
  /**
   * 
   * @param dto 
   * @returns 
   */
  createUserTutorial(dto:PostTutorialUsuarioDTO): Observable<Array<TutorialUsuarioDTO>>{ 
    return this.http.post<Array<TutorialUsuarioDTO>>(`${this.userTutorialUrl}`, dto ); 
  }

  /*This method publishes an observable array of questions for the current tutorial.
  *Parameters: the tutorial ID as a string. The string is used to create the URL for the API's get mehtod.
  */
  /**
   * 
   * @param tutorialID 
   * @returns 
   */
  getQuestions(tutorialID: string): Observable<Array<Pregunta[]>>{
    return this.http.get<Array<Pregunta[]>>(`${this.getTutorialQuestionsUrl}${tutorialID}`); 
  }

  getTutorial(tutorialID: string): Observable<Tutorial> {
    return this.http.get<Tutorial>(`${this.getTutorialUrl}${tutorialID}`); 
  }

  /*Posts the user's answer to the API. The grading is perfomed in the API.
  *This method publishes an data transfer object for the result.
  */
  /**
   * 
   * @param dto 
   * @returns 
   */
  gradeAnswer(dto: PostRespuestaUsuarioDTO): Observable<ResultadoDTO>{
    return this.http.post<ResultadoDTO>(`${this.postAnswerUrl}`, dto);
  }

  /**
   * 
   * @param userTutorialId 
   * @param dto 
   * @returns 
   */
  updateUserTutorial(userTutorialId: number, dto: TutorialUsuarioDTO): Observable<void> {
    return this.http.put<void>(`${this.userTutorialUrl}${userTutorialId}`, dto); 
  }

  getNotes(id: number): Observable<TutorialNotes> {
    debugger;
    const url = `${this.tutorialNotesUrl}/${id}`;
    return this.http.get<TutorialNotes>(url).pipe(
      tap(_ => console.log(`fetched notes id=${id}`)),
      catchError(this.handleError<TutorialNotes>(`getNotes id=${id}`))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error); 
      return of(result as T);
    };
  }
}
