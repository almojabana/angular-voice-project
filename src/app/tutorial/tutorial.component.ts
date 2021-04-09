import { Component, OnInit } from '@angular/core';
import { SpeechRecognitionService } from '../shared/services/web-apis/speech-recognition.service';
import { TutorialService } from '../shared/services/tutorial.service'; 
import { SpeechResults } from '../shared/models/speech-results';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { TutorialUsuario } from '../shared/models/tutorial-usuario'; 
import { Pregunta } from '../shared/models/pregunta'; 
import { PostRespuestaUsuarioDTO } from '../shared/models/DTO/post-respuesta-usuario-dto'; 
import { PostTutorialUsuarioDTO } from '../shared/models/DTO/post-tutorial-usuario-dto';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.css']
})

export class TutorialComponent implements OnInit {

  //Class Properties----------------------------------------------------
  
  //speechResults: SpeechResults;
  //During development,the app runs with a hardcoded userID, example: user =1
  userID: number = 1;
  mainContentSkipLink: string; 
  userTutorial: TutorialUsuario;   
  questions: Array<Pregunta[]> 
  currQuestion: Pregunta; 
  questionCounter: number = 0; 
  userAnswer: string = "";
  totalPoints: number = 0; 
  currResult: number = -1; 

  //the current tutorial's id is retrieved from the component url
  tutorialID = this.route.snapshot.paramMap.get('tutorialID'); 

  constructor(
    public speechRecognition: SpeechRecognitionService, 
    private tutorialService: TutorialService, 
    private route: ActivatedRoute
    ) { }

  ngOnInit(): void {
    //Creates the skip link for skipping the navigation bar
    this.mainContentSkipLink = 
    this.route.snapshot.url
    .toString()
    .replace(",", "/") + "#main-content"; 

    //Gets the records that will be used during the tutorial
    this.getUserTutorial(this.tutorialID); 
    this.getQuestions(this.tutorialID);
    
    //Captures voice commands by subscribing to the speech recognition service
    this.speechRecognition.statement.subscribe(command => {
      console.log("statement subscription from tutorial ", command);
      this.captureVoiceCommand(command);
    });
  }

  //Class Methods-----------------------------------------------------------


  /*
  * getUserTutorial returns the user's record for the current tutorial.
  * The tutorial id and the user's id are used to search for an incomplete 
  * previous attempt. If none is found, a new record is created and the dto's 
  * content is  captured in a class property. 
  */
  getUserTutorial(tutorialID: string){
    this.tutorialService
    .getUserTutorial(this.userID.toString(), tutorialID)
    .subscribe(
      userTutorialArray => {
      this.userTutorial = userTutorialArray[0];
      console.log("FETCHED USERTUTORIAL ",this.userTutorial); 
       if(!this.userTutorial){
        var dto : PostTutorialUsuarioDTO = { 
          usuarioId: this.userID, tutorialId: parseInt(tutorialID)
        }; 
        this.tutorialService.createUserTutorial(dto).subscribe(
          userTutorial => {
            this.userTutorial = new TutorialUsuario().deserialize(userTutorial); 
            console.log("CREATED USERTUTORIAL:  ", this.userTutorial) 
          }
        );
      }  
     }
    ); 
  }  

  /*
   * The getQuestions function fetches an array of questions for the current tutorial.
   * The question array is assigned to a class property.
   */
  getQuestions(tutorialID: string) {
    this.tutorialService.getQuestions(tutorialID).subscribe(questions => {
      this.questions = questions; 
      this.currQuestion = new Pregunta().deserialize(questions[0]);  
      console.log("QUESTION: ", this.currQuestion); 
    }); 
  }
 
  /* 
  * The gradeAnswer function is activated when the user submits an answer. 
  * The answer and the current question id are used to create a 
  * DTO that is sent to the backend server.
  * The  graded result is captured in a class property.
  * Total points are updated.
  */
  gradeAnswer(userAnswer: string){ 
    
    var dto: PostRespuestaUsuarioDTO = { 
      respuesta: userAnswer, 
      preguntaId: this.currQuestion.preguntaId, 
      tutorialUsuarioId: this.userTutorial.tutorialUsuarioId
    }; 

    this.tutorialService.gradeAnswer(dto).subscribe((result)=>{
      this.currResult = result.resultado;
      this.totalPoints+= result.resultado;
      console.log("result: ", this.currResult); 
    });
  }
 
  displayNextQuestion(){
    this.questionCounter+=1; 
    
    if(this.questionCounter<this.questions.length){
      this.currQuestion = new Pregunta()
      .deserialize(this.questions[this.questionCounter]); 
      this.currResult = -1; 
      this.userAnswer = ""; 
    }
    else {
      this.endTutorial(this.userTutorial)
    }
  }

  endTutorial(userTutorial: TutorialUsuario){
    console.log("TUTORIAL ENDED")
  }
 

//VOICE FUNCTIONS (CONSIDER MOVING BELOW FUNCTIONS TO A SEPARATE SERVICE************/
  captureVoiceCommand(speechResult: SpeechResults): void {

    let predicate = speechResult.predicate.trim();

    //manages spacing in the predicate
    if (speechResult.action === 'write') {
      if (this.userAnswer === "") {
        this.userAnswer += this.voiceCodeHelper(predicate);
      }
      else { this.userAnswer += ' ' + this.voiceCodeHelper(predicate); }
    }

    else if (speechResult.action === 'delete' && speechResult.predicate === 'word') {

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
    }

    else if (speechResult.action === 'delete' && speechResult.predicate === 'everything') {
      this.userAnswer = '';
    }

    else if(speechResult.action === 'navigate') {
      if(speechResult.predicate === ' next'){
        this.displayNextQuestion(); 
      }
      else if(speechResult.predicate === ' check answer'){
        this.gradeAnswer(this.userAnswer); 
      }
      else { console.log( ":(")}
      
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
