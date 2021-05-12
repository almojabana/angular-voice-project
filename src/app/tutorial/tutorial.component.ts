import { Component, OnInit } from '@angular/core';
import { SpeechRecognitionService } from '../shared/services/web-apis/speech-recognition.service';
import { TutorialService } from '../shared/services/tutorial.service';
import { SpeechResults } from '../shared/models/speech-results';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { TutorialUsuarioDTO } from '../shared/models/tutorial-usuario-dto';
import { Pregunta } from '../shared/models/pregunta';
import { PostRespuestaUsuarioDTO } from '../shared/models/post-respuesta-usuario-dto';
import { PostTutorialUsuarioDTO } from '../shared/models/post-tutorial-usuario-dto';
import { Tutorial } from '../shared/models/tutorial';
import Swal from 'sweetalert2';
import { parseHostBindings } from '@angular/compiler';


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
  totalPossiblePoints: number = 0;
  finalScore = this.totalPoints/this.totalPossiblePoints *100; 
  currResult: number = -1;
  isFinished: boolean = false;
  tutorial: Tutorial;
  options: string[];
   //used in the html template
   passedTutorial: boolean = false; 

  //the current tutorial's id is retrieved from the component url
  tutorialID = this.route.snapshot.paramMap.get('tutorialID');

  constructor(
    public speechRecognition: SpeechRecognitionService,
    private tutorialService: TutorialService,
    private route: ActivatedRoute,
    private router: Router
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
      this.captureVoiceCommand(command);
    });
  }

  /*****Class Methods ******/
  /*
   * getUserTutorial fetches the user's record for the current tutorial.
   * The user id and tutorial id are used to subscribe to the backend endpoint.
  */
  getUserTutorial(tutorialID: string) {
    this.tutorialService
      .getUserTutorial(this.userID.toString(), tutorialID)
      .subscribe(
        userTutorial => {
          this.userTutorial = userTutorial;
          console.log("FETCHED USERTUTORIAL ", this.userTutorial);

          //If no incomplete user tutorial record exists, a new one is create
          if (!this.userTutorial) {
            this.createUserTutorial(this.userID, tutorialID);
          }
        }
      );
  }

  /*the createUserTutorial function subscribes 
   * to an endpoint to recieve a new user tutorial record
  */
  createUserTutorial(userID: number, tutorialID: string) {
    var dto: PostTutorialUsuarioDTO = {
      usuarioId: userID, tutorialId: parseInt(tutorialID)
    };
    this.tutorialService.createUserTutorial(dto).subscribe(
      userTutorial => {
        this.userTutorial = new TutorialUsuarioDTO().deserialize(userTutorial);
        console.log("CREATED USERTUTORIAL:  ", this.userTutorial)
      }
    );
  }

/**
 * Fetches an array of questions for the current tutorial.
 * The question array is assigned to a class property.
 * @param tutorialID 
 */
  getQuestions(tutorialID: string) {
    this.tutorialService.getQuestions(tutorialID).subscribe(questions => {
      this.questions = questions;
      this.currQuestion = new Pregunta().deserialize(questions[0]);
      console.log(this.currQuestion);
    });
  }

/**
 * Fetches tutorial data that will bind to the html template
 * @param tutorialID 
 */
  getTutorialName(tutorialID: string) {
    this.tutorialService.getTutorial(tutorialID).subscribe(tutorial => {
      this.tutorial = tutorial;
    })
  }

 /**
  * This function is activated when the user submits an answer. 
  * The answer is sent to an endpoint for grading.
  * Current points are updated. 
  * @param userAnswer 
  */
  gradeAnswer(userAnswer: string) {
    // The answer, current question id, and user tutorial id are used to create a DTO
    var dto: PostRespuestaUsuarioDTO = {
      respuesta: userAnswer.replace(/\s+/g, ''),
      preguntaId: this.currQuestion.preguntaId,
      tutorialUsuarioId: this.userTutorial.tutorialUsuarioId
    };
    //The function subscribes to the backend for the result.
    this.tutorialService.gradeAnswer(dto).subscribe((result) => {
      //Current results and total points are updated 
      this.currResult = result.resultado;
      this.totalPoints += result.resultado;
      this.totalPossiblePoints += this.currQuestion.valor; 
    });
  }

 /**
  * Displays the next question in the questions array
  * This funtion is activated when the user presses 
  * the "next button".
  */
  displayNextQuestion() {
    //The question counter is updated
    this.questionCounter += 1;

    //Checks if there are questions left in the questions array
    if (this.questionCounter < this.questions.length) {

      //Deserialize the question
      this.currQuestion = new Pregunta()
        .deserialize(this.questions[this.questionCounter]);

      //Refresh result and user answer 
      this.currResult = -1;
      this.userAnswer = "";
      console.log("totalPoints" +this.totalPoints)
    }
    else {
      this.endTutorial(this.userTutorial.tutorialUsuarioId, this.userTutorial)
    }
  }

  /**
   * 
   * @param userTutorialId 
   * @param userTutorial 
   */
  endTutorial(userTutorialId: number, userTutorial: TutorialUsuarioDTO) { 
    this.isFinished = true;
    this.finalScore = this.totalPoints/this.totalPossiblePoints;
    console.log("Finalscore" + this.finalScore)
    if(this.finalScore > 0.6){
      this.passedTutorial = true;
      this.userTutorial.completado = true;
      this.tutorialService.updateUserTutorial(userTutorialId, userTutorial).subscribe(() => {
       console.log("PASSED"); 
      });
    }
  }

  //VOICE FUNCTIONS (CONSIDER MOVING BELOW FUNCTIONS TO A SEPARATE SERVICE************/
  captureVoiceCommand(speechResult: SpeechResults): void {
    console.log("Command received by the tutorial component:" + speechResult); 
    let predicate = speechResult.predicate.trim();
    
    //manages spacing in the predicate
    if (speechResult.action === 'write') {
      if (this.userAnswer === "") {
        this.userAnswer += this.voiceCodeWriter(predicate);
      }
      else { this.userAnswer += ' ' + this.voiceCodeWriter(predicate); }
    }

    else if (speechResult.action === 'delete'
      && speechResult.predicate === 'a word') {

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
      && speechResult.predicate.match(/multiple words/i)) {
      let words = 2;//parseInt(predicate.split(' ')[0]);
      while (words > 0) {
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
        words--;
      }
    }
 
    else if (speechResult.action === 'delete'
      && speechResult.predicate === 'everything') {
      this.userAnswer = "";
    }

    else if (speechResult.action === 'navigate') {
      debugger;
      if (speechResult.predicate === 'next') {
        this.displayNextQuestion();
      }
      else if (speechResult.predicate.match(/.*check answer button/i)){
        this.gradeAnswer(this.userAnswer);
      }
      else if (speechResult.predicate.match(/.*check answer/i)){
        this.gradeAnswer(this.userAnswer);
      }
      else { ; }

    }

    else { console.log("Tutorial Component: The voice command was not recognized"); }
  }
  voiceCodeWriter(predicate: string): string {
    //the original predicate is saved for debugging purposes
    let tempPredicate = predicate;
    tempPredicate = this.replaceHassleWords(tempPredicate);
    //Loop Commands
    if (predicate.match("for Loop")) {
      return tempPredicate = tempPredicate.replace("for Loop", "for ( int");
    }

    //Forced troubleshooting recongition for the word  "false" 
    else if (predicate.match("faults")) {
      return tempPredicate = tempPredicate.replace("faults", "false");
    }
    else if(predicate.match("falls")) {
      return tempPredicate = tempPredicate.replace("falls", "false");
    }
    else if(predicate.match("spots")) {
      return tempPredicate = tempPredicate.replace("spots", "false");
    }
    else if(predicate.match("thougths")) {
      return tempPredicate = tempPredicate.replace("thougts", "false");
    }

    //variale and constant declarations)

    else if (predicate.match(/constant integer type named .*?/i)){
      tempPredicate = this.writeConstant(tempPredicate);
      tempPredicate = this.integerType(tempPredicate);
      tempPredicate = tempPredicate.replace("named", "Pascal case"); 
      tempPredicate = this.pascalCasing(tempPredicate);
      return predicate = tempPredicate; 
    }
    else if (predicate.match(/constant/i)){
      tempPredicate = this.writeConstant(tempPredicate);
      return predicate = tempPredicate; 
    }

    else if (predicate.match(/\s?integer type/i)) {
      return tempPredicate = tempPredicate.replace("integer type", "int");
    }

    else if (predicate.match("a double type")) {
      return tempPredicate = tempPredicate.replace("a double type", "double");
    }

    else if (predicate.match("a string type")) {
      return tempPredicate = tempPredicate.replace("a string type", "string");
    }

    else if (predicate.match("a Boolean type")) {
      return tempPredicate = tempPredicate.replace("a Boolean type", "bool");
    }

    else if (predicate.match("a character type")) {
      return tempPredicate = tempPredicate.replace("a character type", "char");
    }

    // Commands for camelcasing and Pascal Casing
    else if (predicate.match(/camel\w?case/i)){
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
     return predicate = tempPredicate;
    }

    else if (predicate.match(/pascal case/i)) {
      return tempPredicate = this.pascalCasing(tempPredicate); 
    }

    else if (predicate.match(/uppercase .*/i)) {
      tempPredicate = this.upperCasing(predicate, tempPredicate);
    }

    //Voice commands for equality operators
    else if (predicate.match(/an? equal sign/i)) {
      return tempPredicate = predicate.replace(/an equal sign/i, "=");
    }

    else if (predicate.match(/equals/i)) {
      this.options = ["=", "==", "Equals"];
      return tempPredicate = predicate.replace(/equals/i, "");
    }

    else if (predicate.match(/not equal/i)) {
      return tempPredicate = predicate.replace(/not equal/i, "!=");
    }

    //Voice commands for writing arithmetic operators
    else if (predicate.match(/a? plus sign/i)) {
      tempPredicate = predicate.replace(/a? plus sign/i, "+");
    }

    else if (predicate.match(/.* plus .*/i)) {
      return tempPredicate = predicate.replace(/plus/i, "+");
    }

    else if (predicate.match(/a? minus sign/i)) {
      return tempPredicate = predicate.replace(/a minus sign/i, "-");
    }

    else if (predicate.match(/.* minus .*/i)) {
      return tempPredicate = predicate.replace(/minus/i, "-");
    }

    else if (predicate.match(/division sign/i)) {
      return tempPredicate = predicate.replace(/division sign/i, "/");
    }

    else if (predicate.match(/.* times. */i)) {
      return tempPredicate = predicate.replace(/times/i, "*");
    }

    else if (predicate.match(/increment/i)) {
      return tempPredicate = predicate.replace(/increment/i, "++");
    }

    else if (predicate.match(/decrement/i)) {
      tempPredicate = predicate.replace(/decrement/i, "--");
      return predicate = tempPredicate; 
    }

    //Voice commands for writing comparison operators
    else if (predicate.match(/greater than/i)) {
      return tempPredicate = predicate.replace(/greater than/i, ">");
    }

    else if (predicate.match(/greater than or equal to/i)) {
      return tempPredicate = predicate.replace(/greater than or equal to/i, ">=");
    }

    else if (predicate.match(/less than/i)) {
      return tempPredicate = predicate.replace(/less than/i, "<");
    }

    else if (predicate.match(/less than or equal to/i)) {
      return tempPredicate = predicate.replace(/less than or equal to/i, "<=");
    }

    else if (predicate.match(/a? percent sign/i)) {
      return tempPredicate = predicate.replace(/a? percent sign/i, "%");
    }

    //Voice commands for writing logical operators
    else if (predicate.match(/a? logical and/i)) {
      return tempPredicate = predicate.replace(/a? logical and/i, "&&");
    }

    else if (predicate.match(/a?.*logical or/i)) {
      return tempPredicate = predicate.replace(/a?.*logical or/i, "||");
    }

    //Voice commands for braces, parenthesis, commas
    else if (predicate.match(/open parenthesis/i)) {
      return tempPredicate = predicate.replace(/open parenthesis/i, "(");
    }
    else if (predicate.match(/close parenthesis/i)) {
      return tempPredicate = predicate.replace(/close parenthesis/i, ")");
    }
    else if (predicate.match(/open curly/i)) {
      return tempPredicate = predicate.replace(/open curly/i, "{");
    }
    else if (predicate.match(/close curly/i)) {
      return tempPredicate = predicate.replace(/close curly/i, "}");
    }
    else if (predicate.match(/a comma/i)) {
      return tempPredicate = predicate.replace(/open parentheses/i, ",");
    }
    else if (predicate.match(/a semicolon/i)) {
      return tempPredicate = predicate.replace(/a semicolon/i, ";");
    }
    else if (predicate.match(/an exclamation mark/i)) {
      return tempPredicate = predicate.replace(/a semicolon/i, ";");
    }
    else if (predicate.match(/quotes/i)) {
      return tempPredicate = predicate.replace(/quotes/i, "\"");
    }
    //must stay last
    else if (predicate.match(/.* between quotes/i)) {
      return tempPredicate = "\" " + predicate.replace(/between quotes/i, "\"");
    }
    //Command for managing homophones
    // if (predicate.match (/choose option [0-9]/i)){
    //     ;
    // }
    else {
    return predicate = tempPredicate;
    }
  }


  writeConstant(predicate: string): string {
    return predicate = predicate.replace("constant", "const");
  }

  integerType(predicate: string): string{
    return predicate = predicate.replace("integer type", "int");
  }

  pascalCasing(predicate: string): string {
    let variableName = '';
      let variableNameArr: string[] = predicate.split(/pascal case/i);
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
      return predicate = predicate.replace(/pascal case .*/i, ' ' + variableName.trim());
  
  }

  upperCasing(predicate: string, tempPredicate): string {
    let variableName = '';
    let variableNameArr: string[] = predicate.split(/uppercase/i);
    variableNameArr = variableNameArr[1].split(" ");
    for (let idx = 0; idx < variableNameArr.length; idx++) {
      for (let j = 0; j < variableNameArr[idx].length; j++) {
        if (j === 0) {
          variableName += ' ' + variableNameArr[idx][0].toUpperCase();
        }
        else { variableName += variableNameArr[idx][j].toLowerCase() }
      }
    }
    return tempPredicate = tempPredicate.replace(/uppercase .*/i, ' ' + variableName.trim());
  }

  replaceHassleWords(predicate: string): string {
        //Forced troubleshooting recognition for the word "Main"
        if(predicate.match("the state of maine")) {
          return predicate = predicate.replace("the state of maine", "Maine");
        }
        else if(predicate.match("maine")) {
          return predicate = predicate.replace("maine", "main");
        }
        else {;}
  }

}
