import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators'; 
import { SpeechRecognitionService } from '../shared/services/web-apis/speech-recognition.service';
import { TutorialService } from '../shared/services/tutorial.service'; 
import { SpeechResults } from '../shared/models/speech-results';
import { ActivatedRoute } from '@angular/router';
import { TutorialUsuario } from '../shared/models/tutorial-usuario'; 
import { throwMatDuplicatedDrawerError } from '@angular/material/sidenav';
import { Pregunta } from '../shared/models/pregunta'; 
import { RespuestaUsuarioDTO } from '../shared/models/DTO/respuesta-usuario'; 

import { TutorialUsuarioDTO } from '../shared/models/DTO/user-tutorial-dto';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.css']
})

export class TutorialComponent implements OnInit {
  speechResults: SpeechResults;
  
  //During development,the app runs with a hardcoded userID, example: user =1
  userID: number = 1;

  userTutorial: Array<TutorialUsuario>; 
  uT: TutorialUsuario;  
  questions: Array<Pregunta[]> 
  currQuestion: any; 
  questionCounter: number = 0; 
  userAnswer: string = '';
  tutorialID = this.route.snapshot.paramMap.get('tutorialID'); 

  constructor(
    public speechRecognition: SpeechRecognitionService, 
    private tutorialService: TutorialService, 
    private route: ActivatedRoute
    ) { }

  ngOnInit(): void {
    this.getUserTutorial(this.tutorialID); 
    this.getQuestions(this.tutorialID); 
    this.speechRecognition.statement.subscribe(words => {
      console.log("statement subscription from tutorial ", words);
      this.captureVoiceCode(words);
    });
  }

  getUserTutorial(tutorialID: string){
    //var tutorialID = this.route.snapshot.paramMap.get('tutorialID'); 
    this.tutorialService.getUserTutorial(this.userID.toString(), tutorialID).
    subscribe(
      userTutorial => {
      this.userTutorial = userTutorial;
      console.log("FETCHED USERTUTORIAL ",this.userTutorial); 
      if (this.userTutorial.length===0) {
        var dto : TutorialUsuarioDTO = { 
          usuarioId: this.userID, tutorialId: parseInt(tutorialID)
        }; 
        this.tutorialService.createUserTutorial(dto).subscribe(
          userTutorial => {
            this.userTutorial = (userTutorial);
            console.log("CREATED USERTUTORIAL:  ", this.userTutorial) 
          }
        );
      }
     }
    ); 
  }   

  getQuestions(tutorialID: string) {
   // var tutorialID = this.route.snapshot.paramMap.get('tutorialID');
    this.tutorialService.getQuestions(tutorialID).subscribe(questions => {
      this.questions = questions; 
      this.currQuestion = questions[0]; 
      console.log("QUESTION: ", this.currQuestion); 
    }); 
  }
 
  // gradeAnswer(userAnswer: string){ 
  //   var dto: RespuestaUsuarioDTO = { 
  //     respuesta: userAnswer, preguntaID: this., tutorialUsuarioID: this.uT.tutorial_usuario_id}; 
  //   this.tutorialService.gradeAnswer(dto);
  // }
 
  diplayNextQuestion(){
  }
 

//VOICE FUNCTIONS (CONSIDER MOVING BELOW FUNCTIONS TO A SEPARATE SERVICE******************************************** */
  captureVoiceCode(speechResult: SpeechResults): void {

    let predicate = speechResult.predicate;

    //manages spacing in the predicate
    if (speechResult.action === 'write') {
      if (this.userAnswer === "") {
        this.userAnswer += this.voiceCodeHelper(predicate);
      }
      else { this.userAnswer += ' ' + this.voiceCodeHelper(predicate); }
    }

    if (speechResult.action === 'delete' && speechResult.predicate === 'word') {

      let tempArray: string[] = this.userAnswer.split(' ');
      this.userAnswer = '';
      for (let idx = 0; idx < tempArray.length - 1; idx++) {
        if (idx === tempArray.length - 2) {
          this.userAnswer += tempArray[idx];
        }
        else {
          this.userAnswer += tempArray[idx] + ' ';
        }
      }
      console.log("temparray", tempArray)

    }

    if (speechResult.action === 'delete' && speechResult.predicate === 'everything') {
      this.userAnswer = '';
    }
  }

  voiceCodeHelper(predicate: string): string {
    //consider putting this in another function to include in the next if
    let tempPredicate = predicate;
    if (predicate.match("for Loop")) {
      tempPredicate = tempPredicate.replace("for Loop", "for (");
    }
    //variable declarations
    if (predicate.match("an integer variable")) {
      tempPredicate = tempPredicate.replace("an integer variable", "int");
    }

    if (predicate.match("a double variable")) {
      tempPredicate = tempPredicate.replace("a double variable", "double");
    }

    if (predicate.match("a string variable")) {
      tempPredicate = tempPredicate.replace("a string variable", "string");
    }

    //camelcase notation
    //debugger;
    if (predicate.match("camelcase")) {
      let variableName = '';
      let variableNameArr: string[] = predicate.split(/camelcase |camel case/i);
      variableNameArr = variableNameArr[1].toLowerCase().split(" ");
      console.log("variable name array here: ", variableNameArr)
      variableName += variableNameArr[0];

      if (variableNameArr.length > 1) {
        for (let idx = 1; idx < variableNameArr.length; idx++) {
          for (let j = 0; j < variableNameArr[idx].length; j++) {
            if (j === 0) {
              variableName += variableNameArr[idx][0].toUpperCase();
            }
            else { variableName += variableNameArr[idx][j].toLowerCase() }
          }
        }
      }
      tempPredicate = tempPredicate.replace(/camelcase .*/i, ' ' + variableName.trim());
    }

    if (predicate.match(/Pascal case/i)) {
      let variableName = '';
      let variableNameArr: string[] = predicate.split(/Pascal case/i);
      variableNameArr = variableNameArr[1].split(" ");
      console.log("variable name array here: ", variableNameArr)

      for (let idx = 0; idx < variableNameArr.length; idx++) {
        for (let j = 0; j < variableNameArr[idx].length; j++) {
          if (j === 0) {
            variableName += variableNameArr[idx][0].toUpperCase();
          }
          else { variableName += variableNameArr[idx][j].toLowerCase() }
        }
      }

      tempPredicate = tempPredicate.replace(/Pascal case .*/i, ' ' + variableName.trim());
    }

    if (predicate.match(/equal sign/i)) {
      tempPredicate = predicate.replace(/equal sign/i, "=")
    }

    predicate = tempPredicate;
    return predicate;

  }

}
