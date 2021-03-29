import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs'; 
import { SpeechRecognitionService } from '../shared/services/web-apis/speech-recognition.service';
import { TutorialService } from '../shared/services/tutorial.service'; 
import { SpeechResults } from '../shared/models/speech-results';
import { ActivatedRoute } from '@angular/router';
import { TutorialUsuario } from '../shared/models/tutorial-usuario'; 
import { throwMatDuplicatedDrawerError } from '@angular/material/sidenav';
import { first } from 'rxjs/operators';
import { TutorialUsuarioDto } from '../shared/DTO/tutorial-usuario-dto';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.css']
})

export class TutorialComponent implements OnInit {
  speechResults: SpeechResults;
  
  //During development, for testing purposes, the app runs with a test user, user =1
  userID: number = 1;

  userTutorial: Array<TutorialUsuario>;  
  question: string; 
  questionCounter: number = 0; 
  userAnswer: string = '';

  constructor(
    public speechRecognition: SpeechRecognitionService, 
    private tutorialService: TutorialService, 
    private route: ActivatedRoute
    ) { }

  ngOnInit(): void {
    this.fetchUserTutorial(); 
    //this.getQuestion(); 
    this.speechRecognition.statement.subscribe(e => {
      console.log("statement subscription from tutorial ", e);
      this.captureVoiceCode(e);
    });
  }

  fetchUserTutorial(){
    var tutorialID = this.route.snapshot.paramMap.get('tutorialID'); 
    this.tutorialService.fetchUserTutorial(this.userID.toString(), tutorialID).
    subscribe(
      userTutorial => {
      this.userTutorial = userTutorial;
      console.log("userTutorial fetched from usertutorialservice ",this.userTutorial); 
      if (this.userTutorial.length===0) {
        var dto : TutorialUsuarioDto = { usuario: this.userID, tutorial: parseInt(tutorialID)}; 
        this.tutorialService.createUserTutorial(dto).subscribe(
          userTutorial => {
            this.userTutorial.push(userTutorial);
            console.log("created userTutorial from usertutorialService ", this.userTutorial) 
          }
        );
      }
     }); 
  }   


  getQuestion() {
  //   const name = this.route.snapshot.paramMap.get('id');
  //   this.tutorialService.getQuestion(id).subscribe(tutorials => {
  //     this.tutorials = tutorials
  //   }); 
 }

 gradeUserAnswer(){

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
    if (predicate.match(/camel case | camelcase/i)) {
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
      tempPredicate = tempPredicate.replace(/camel case .* | camelcase .*/i, ' ' + variableName.trim());
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
