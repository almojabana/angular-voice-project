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
  speechResults: SpeechResults;
  
  //During development,the app runs with a hardcoded userID, example: user =1
  userID: number = 1;

  mainContentSkipLink: string; 
  userTutorial: TutorialUsuario;   
  questions: Array<Pregunta[]> 
  currQuestion: Pregunta; 
  questionCounter: number = 0; 
  userAnswer: string = '';

  //the current tutorial's id is retrieved from the current url
  tutorialID = this.route.snapshot.paramMap.get('tutorialID'); 

  constructor(
    public speechRecognition: SpeechRecognitionService, 
    private tutorialService: TutorialService, 
    private route: ActivatedRoute
    ) { }

  ngOnInit(): void {
    
    //Creates the skip link for skipping the navigation bar
    this.mainContentSkipLink = this.route.snapshot.url
    .toString()
    .replace(",", "/") + "#main-content"; 

    //Gets the records that will be interacted with during the tutorial
    this.getUserTutorial(this.tutorialID); 
    this.getQuestions(this.tutorialID);
    
    //Subscribes to the speech recognition service
    this.speechRecognition.statement.subscribe(words => {
      console.log("statement subscription from tutorial ", words);
      this.captureVoiceCode(words);
    });
  }

  /*
  Returns the current user's record for the current tutorial. 
  If a previous attempt has not been completed, it is fetched from the database. 
  Otherwise, a new record for this attempt is created and returned.
  */
  getUserTutorial(tutorialID: string){
    this.tutorialService.getUserTutorial(this.userID.toString(), tutorialID).
    subscribe(
      userTutorialArray => {
      this.userTutorial = userTutorialArray[0];
      console.log("FETCHED USERTUTORIAL ",this.userTutorial); 
     // if (this.userTutorial.length===0) {
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
   * Returns an array of questions for the current tutorial.
   */
  getQuestions(tutorialID: string) {
   // var tutorialID = this.route.snapshot.paramMap.get('tutorialID');
    this.tutorialService.getQuestions(tutorialID).subscribe(questions => {
      this.questions = questions; 
      this.currQuestion = new Pregunta().deserialize(questions[0]);  
      console.log("QUESTION: ", this.currQuestion); 
    }); 
  }
 
  gradeAnswer(userAnswer: string){ 
    var dto: PostRespuestaUsuarioDTO = { 
      respuesta: userAnswer, 
      preguntaId: this.currQuestion.preguntaId, 
      tutorialUsuarioId: this.userTutorial.tutorialUsuarioId}; 
    this.tutorialService.gradeAnswer(dto).subscribe(()=>{});
  }
 
  diplayNextQuestion(){
    if(this.questionCounter<this.questions.length){
      this.currQuestion = new Pregunta()
      .deserialize(this.questions[++this.questionCounter]); 
    }
  }
 

//VOICE FUNCTIONS (CONSIDER MOVING BELOW FUNCTIONS TO A SEPARATE SERVICE************/
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
