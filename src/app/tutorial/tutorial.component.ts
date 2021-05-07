import { Component, OnInit } from '@angular/core';
import { SpeechRecognitionService } from '../shared/services/web-apis/speech-recognition.service';
import { TutorialService } from '../shared/services/tutorial.service'; 
import { SpeechResults } from '../shared/models/speech-results';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { TutorialUsuarioDTO } from '../shared/models/tutorial-usuario-dto'; 
import { Pregunta } from '../shared/models/pregunta'; 
import { PostRespuestaUsuarioDTO } from '../shared/models/post-respuesta-usuario-dto'; 
import { PostTutorialUsuarioDTO } from '../shared/models/post-tutorial-usuario-dto';
import { Tutorial } from '../shared/models/tutorial';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.css']
})

export class TutorialComponent implements OnInit {

  /*****Class Properties*****/
  //During development,the app runs with a hardcoded userID, example: user =1
  userID: number = 1;
  mainContentSkipLink: string; 
  userTutorial: TutorialUsuarioDTO;   
  questions: Array<Pregunta[]> 
  currQuestion: Pregunta; 
  questionCounter: number = 0; 
  userAnswer: string = "";
  totalPoints: number = 0; 
  currResult: number = -1; 
  tutorial: Tutorial; 
  options: string[]; 

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
    this.getTutorialName(this.tutorialID)
    
    //Captures voice commands by subscribing to the speech recognition service
    this.speechRecognition.statement.subscribe(command => {
      console.log("statement subscription from tutorial ", command);
      this.captureVoiceCommand(command);
    });
  }

  /*****Class Methods ******/
  /*
   * getUserTutorial fetches the user's record for the current tutorial.
   * The user id and tutorial id are used to subscribe to the backend endpoint.
  */
  getUserTutorial(tutorialID: string){
    this.tutorialService
    .getUserTutorial(this.userID.toString(), tutorialID)
    .subscribe(
      userTutorial => {
      this.userTutorial = userTutorial;
      console.log("FETCHED USERTUTORIAL ",this.userTutorial);

      //If no incomplete user tutorial record exists, a new one is create
      if(!this.userTutorial){
        this.createUserTutorial(this.userID, tutorialID);
       }       
     }
    ); 
  }

  /*the createUserTutorial function subscribes 
   * to an endpoint to recieve a new user tutorial record
  */
  createUserTutorial(userID: number, tutorialID: string){
    var dto : PostTutorialUsuarioDTO = { 
      usuarioId: userID, tutorialId: parseInt(tutorialID)
    }; 
    this.tutorialService.createUserTutorial(dto).subscribe(
      userTutorial => {
        this.userTutorial = new TutorialUsuarioDTO().deserialize(userTutorial); 
        console.log("CREATED USERTUTORIAL:  ", this.userTutorial) 
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
      console.log(this.currQuestion); 
    }); 
  }

  getTutorialName(tutorialID: string) {
    this.tutorialService.getTutorial(tutorialID).subscribe(tutorial => {
      this.tutorial = tutorial; 
    })
  }
 
  /* 
   * The gradeAnswer function is activated when the user submits an answer. 
   * The answer is sent to an endpoint for grading. 
   * The function subscribes to the backend for the result.
  */
  gradeAnswer(userAnswer: string){ 
    // The answer, current question id, and user tutorial id are used to create a DTO
    var dto: PostRespuestaUsuarioDTO = { 
      respuesta: userAnswer.replace(/\s+/g, ''), 
      preguntaId: this.currQuestion.preguntaId, 
      tutorialUsuarioId: this.userTutorial.tutorialUsuarioId
    }; 

    this.tutorialService.gradeAnswer(dto).subscribe((result)=>{
      //Current results and total points are updated 
      this.currResult = result.resultado;
      this.totalPoints+= result.resultado; 
    });
  }

 
  /* The displayNextQuestion method is activated when the user decides to 
   * continue the tutorial. 
  */
  displayNextQuestion(){
    //The question counter is updated
    this.questionCounter+=1; 
    
    //Checks if there are questions left in the questions array
    if(this.questionCounter<this.questions.length){
      
      //Deserialize the question
      this.currQuestion = new Pregunta()
      .deserialize(this.questions[this.questionCounter]);
      
      //Refresh result and user answer 
      this.currResult = -1; 
      this.userAnswer = ""; 
    }
    else{
      this.userTutorial.completado = true; 
      this.endTutorial(this.userTutorial.tutorialUsuarioId, this.userTutorial)
    }
  }

  endTutorial(userTutorialId: number, userTutorial: TutorialUsuarioDTO){
    this.tutorialService.endTutorial(userTutorialId, userTutorial).subscribe(()=>{}); 
    console.log("TUTORIAL ENDED: ", this.userTutorial); 
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

    else if (speechResult.action === 'delete' 
    && speechResult.predicate === 'word') {

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

    else if (speechResult.action === 'delete' 
    && speechResult.predicate === 'everything') {
      this.userAnswer = "";
    }

    else if(speechResult.action === 'navigate') {
      if(speechResult.predicate === 'next'){
        this.displayNextQuestion(); 
      }
      else if(speechResult.predicate === 'check answer'){
        this.gradeAnswer(this.userAnswer); 
      }
      else {;}
      
    }

    else { console.log("Tutorial Component: The voice command was not recognized");}
  }

  voiceCodeHelper(predicate: string): string {
   
    let tempPredicate = predicate;
    if (predicate.match("for Loop")) {
      tempPredicate = tempPredicate.replace("for Loop", "for (");
    }
    //variable declarations
    if (predicate.match("faults")){
      tempPredicate = tempPredicate.replace("faults", "false");
    }
    if (predicate.match("an integer variable")) {
      tempPredicate = tempPredicate.replace("an integer variable", "int");
    }

    if (predicate.match("a double variable")) {
      tempPredicate = tempPredicate.replace("a double variable", "double");
    }

    if (predicate.match("a string variable")) {
      tempPredicate = tempPredicate.replace("a string variable", "string");
    }

    if (predicate.match("a Boolean variable")){
      tempPredicate = tempPredicate.replace("a Boolean variable", "bool");
    }

    if (predicate.match("a character variable")){
      tempPredicate = tempPredicate.replace("a Boolean variable", "bool");
    }
    
    // Commands for camelcasing and Pascal Casing
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
    
    //Voice commands for equality operators
    if (predicate.match(/an? equal sign/i)) {
      tempPredicate = predicate.replace(/an equal sign/i, "="); 
    }

    if (predicate.match(/equals/i)){
      this.options = ["=", "==", "Equals"];
      tempPredicate = predicate.replace(/equals/i, ""); 
    }
    
    if (predicate.match(/not equal/i)){
      tempPredicate = predicate.replace(/not equal/i, "!="); 
    }
    
    //Voice commands for writing arithmetic operators
    if (predicate.match(/a? plus sign/i)) {
      tempPredicate = predicate.replace(/a? plus sign/i, "+");
    }
    
    if (predicate.match(/.* plus .*/i)) {
      tempPredicate = predicate.replace(/plus/i, "+");
    }

    if (predicate.match(/a? minus sign/i)) {
      tempPredicate = predicate.replace(/a minus sign/i, "-");
    }

    if (predicate.match(/.* minus .*/i)) {
      tempPredicate = predicate.replace(/minus/i, "-");
    }

    if (predicate.match(/division sign/i)) {
      tempPredicate = predicate.replace(/division sign/i, "/");
    }

    if (predicate.match(/.* times. */i)) {
      tempPredicate = predicate.replace(/times/i, "*");
    }

    if (predicate.match(/increment/i)) {
      tempPredicate = predicate.replace(/increment/i, "++");
    }

    if (predicate.match(/decrement/i)) {
      tempPredicate = predicate.replace(/decrement/i, "--");
    }
     
    //Voice commands for writing comparison operators
    if (predicate.match(/greater than/i)) {
      tempPredicate = predicate.replace(/greater than/i, ">");
    }

    if (predicate.match(/greater than or equal to/i)) {
      tempPredicate = predicate.replace(/greater than or equal to/i, ">=");
    }

    if (predicate.match(/less than/i)) {
      tempPredicate = predicate.replace(/less than/i, "<");
    }

    if (predicate.match(/less than or equal to/i)) {
      tempPredicate = predicate.replace(/less than or equal to/i, "<=");
    }

    //Voice commands for writing logical operators
    if (predicate.match(/a? logical and/i)) {
      tempPredicate = predicate.replace(/a? logical and/i, "&&");
    }

    if (predicate.match(/a? logical or/i)) {
      tempPredicate = predicate.replace(/a? logical or/i, "||");
    }

    //Voice commands for punctuation, parentheses, 

    //Command for managing homophones
    if (predicate.match (/choose option [0-9]/i)){
        ;
    }

    predicate = tempPredicate;
    return predicate;

  }

}
