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
  finalScore = this.totalPoints / this.totalPossiblePoints * 100;
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
    this.getTutorialName(this.tutorialID);
    this.displayTutorialNotes(this.tutorialID);

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

  displayTutorialNotes(tutorialID: string) {

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
      console.log("totalPoints" + this.totalPoints)
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
    this.finalScore = this.totalPoints / this.totalPossiblePoints;
    console.log("Finalscore" + this.finalScore)
    if (this.finalScore > 0.6) {
      this.passedTutorial = true;
      this.userTutorial.completado = true;
      this.tutorialService.updateUserTutorial(userTutorialId, userTutorial).subscribe(() => {
        console.log("PASSED");
      });
    }
  }

  //VOICE FUNCTIONS (CONSIDER MOVING BELOW FUNCTIONS TO A SEPARATE SERVICE************/
  captureVoiceCommand(speechResult: SpeechResults): void {
    console.log("Command received by the tutorial component: " + "`${speechResult.action}`");
    let predicate = speechResult.predicate.trim();

    //manages spacing in the predicate
    if (speechResult.action === 'write') {
      if (this.userAnswer === "") {
        this.userAnswer += this.voiceCodeWriter(predicate);
      }
      else { this.userAnswer += ' ' + this.voiceCodeWriter(predicate); }
    }

    else if (speechResult.action === 'delete'
      && speechResult.predicate.match(/.*word[s]?/i)) {
      debugger;
      predicate = this.parseHassleWords(predicate);
      let iterations: number = parseInt(predicate.split(" ").slice(0).toString());

      let tempArray: string[] = this.userAnswer.split(' ');
      if (tempArray.length - iterations >= 0) {
        this.userAnswer = '';
        for (let idx = 0; idx < tempArray.length - iterations -1; idx++) {
          if (idx === tempArray.length - 2) {
            this.userAnswer += tempArray[idx];
          }
          else {
            this.userAnswer += tempArray[idx] + ' ';
          }
        }
      }
      else{ this.userAnswer='';}
    }

      else if (speechResult.action === 'delete'
        && speechResult.predicate === 'everything') {
        this.userAnswer = "";
      }

      else if (speechResult.action === 'navigate') {
        if (speechResult.predicate === 'next') {
          this.displayNextQuestion();
        }
        else if (speechResult.predicate.match(/.*next[button]?/i)) {
          this.displayNextQuestion();
        }
        else if (speechResult.predicate.match(/.*check answer button/i)) {
          this.gradeAnswer(this.userAnswer);
        }
        else if (speechResult.predicate.match(/.*check answer/i)) {
          this.gradeAnswer(this.userAnswer);
        }
        else { ; }

      }
      else { console.log("Tutorial Component: The voice command was not recognized"); }
    }
    voiceCodeWriter(predicate: string): string {

      //the original predicate is saved for debugging purposes
      let tempPredicate = predicate;
      tempPredicate = this.parseHassleWords(tempPredicate);
      //naming conventions
      //Loop Commands
      if (predicate.match("for loop")) {
        return tempPredicate = tempPredicate.replace("for loop", "for ( int");
      }
      else { ; }

      //variale and constant declarations)
      if (tempPredicate.match(/constant integer type named .*?/i)) {
        tempPredicate = this.writeConstant(tempPredicate);
        tempPredicate = this.integerType(tempPredicate);
        tempPredicate = tempPredicate.replace("named", "Pascal case");
        tempPredicate = this.pascalCasing(tempPredicate);
        return predicate = tempPredicate;
      }
      else if (tempPredicate.match(/constant integer named .*?/i)) {
        tempPredicate = this.writeConstant(tempPredicate);
        tempPredicate = this.integerType(tempPredicate);
        tempPredicate = tempPredicate.replace("named", "Pascal case");
        tempPredicate = this.pascalCasing(tempPredicate);
        return predicate = tempPredicate;
      }
      if (tempPredicate.match(/constant double type named .*?/i)) {
        tempPredicate = this.writeConstant(tempPredicate);
        tempPredicate = this.doubleType(tempPredicate);
        tempPredicate = tempPredicate.replace("named", "Pascal case");
        tempPredicate = this.pascalCasing(tempPredicate);
        return predicate = tempPredicate;
      }
      else if (tempPredicate.match(/constant double named .*?/i)) {
        tempPredicate = this.writeConstant(tempPredicate);
        tempPredicate = this.doubleType(tempPredicate);
        tempPredicate = tempPredicate.replace("named", "Pascal case");
        tempPredicate = this.pascalCasing(tempPredicate);
        return tempPredicate;
      }
      else if (tempPredicate.match(/constant/i)) {
        tempPredicate = this.writeConstant(tempPredicate);
        return predicate = tempPredicate;
      }
      else if (tempPredicate.match(/integer type named/i)) {
        tempPredicate = this.integerType(tempPredicate);
        tempPredicate = tempPredicate.replace("named", "camelcase");
        tempPredicate = this.camelCasing(tempPredicate);
        return tempPredicate
      }

      else if (tempPredicate.match(/integer type/i)) {
        return tempPredicate = tempPredicate.replace("integer type", "int");
      }
      else if (tempPredicate.match(/public double method name[d]?/i)) {
        tempPredicate = tempPredicate.replace("method named", "Pascal case");
        tempPredicate = this.pascalCasing(tempPredicate);
        return tempPredicate
      }
      else if (tempPredicate.match(/first double type parameter name[d]?/i)) {
        tempPredicate = tempPredicate.replace("first", "(");
        tempPredicate = this.doubleType(tempPredicate);
        tempPredicate = tempPredicate.replace(/parameter name[d]?/i, "camelcase");
        tempPredicate = this.camelCasing(tempPredicate);
        return tempPredicate
      }
      else if (tempPredicate.match(/last double type parameter named/i)) {
        tempPredicate = tempPredicate.replace("last", "");
        tempPredicate = this.doubleType(tempPredicate);
        tempPredicate = tempPredicate.replace("parameter named", "camelcase");
        tempPredicate = this.camelCasing(tempPredicate) + ")";
        return tempPredicate
      }
      else if (tempPredicate.match(/double type named/i)) {
        tempPredicate = this.doubleType(tempPredicate);
        tempPredicate = tempPredicate.replace("named", "camelcase");
        tempPredicate = this.camelCasing(tempPredicate);
        return tempPredicate
      }
      else if (tempPredicate.match("double type")) {
        return tempPredicate = tempPredicate.replace("double type", "double");
      }

      else if (tempPredicate.match("string type")) {
        return tempPredicate = tempPredicate.replace("string type", "string");
      }

      else if (tempPredicate.match("Boolean type")) {
        return tempPredicate = tempPredicate.replace("Boolean type", "bool");
      }

      else if (tempPredicate.match("character type")) {
        return tempPredicate = tempPredicate.replace("character type", "char");
      }
      else { ; }

      //Voice commands for equality operators
      if (tempPredicate.match(/\s?equal sign/i)) {
        tempPredicate = this.preCasingForExpressions(tempPredicate, "equal sign");
        return tempPredicate = tempPredicate.replace(/an equal sign/i, "=");
      }

      else if (tempPredicate.match(/\s?equals operator/i)) {
        tempPredicate = this.preCasingForExpressions(tempPredicate, "equals operator");
        return tempPredicate = tempPredicate.replace(/equals operator/i, "==");
      }

      // else if (predicate.match(/equals/i)) {
      //   this.options = ["=", "==", "Equals"];
      //   return tempPredicate = predicate.replace(/equals/i, "");
      // }

      else if (tempPredicate.match(/not equal to/i)) {
        tempPredicate = this.preCasingForExpressions(tempPredicate, "not equal to");
        return tempPredicate = tempPredicate.replace(/not equal to/i, "!=");
      }

      else if (tempPredicate.match(/not equal/i)) {
        tempPredicate = this.preCasingForExpressions(tempPredicate, "not equal");
        return tempPredicate = tempPredicate.replace(/not equal/i, "!=");
      }

      //Voice commands for writing arithmetic operators
      else if (tempPredicate.match(/\s?plus sign/i)) {
        return tempPredicate = tempPredicate.replace(/a? plus sign/i, "+");
      }

      else if (tempPredicate.match(/.*plus.*/i)) {
        tempPredicate = this.preCasingForExpressions(tempPredicate, "plus");
        return tempPredicate = tempPredicate.replace(/plus/i, "+");
      }

      else if (tempPredicate.match(/\s?minus sign/i)) {
        tempPredicate = this.preCasingForExpressions(tempPredicate, "minus");
        return tempPredicate = tempPredicate.replace(/minus sign/i, "-");
      }

      else if (tempPredicate.match(/.*minus.*/i)) {
        tempPredicate = this.preCasingForExpressions(tempPredicate, "minus");
        return tempPredicate = tempPredicate.replace(/minus/i, "-");
      }

      else if (tempPredicate.match(/division sign/i)) {
        return tempPredicate = tempPredicate.replace(/division sign/i, "/");
      }

      else if (tempPredicate.match(/.*times.*/i)) {
        tempPredicate = this.preCasingForExpressions(tempPredicate, "times");
        return tempPredicate = tempPredicate.replace(/times/i, "*");
      }

      else if (tempPredicate.match(/postfix increment/i)) {
        return tempPredicate = tempPredicate.replace(/postfix increment/i, "++");
      }

      else if (tempPredicate.match(/postfix decrement/i)) {
        return tempPredicate = tempPredicate.replace(/decrement/i, "--");

      }
      else if (tempPredicate.match(/\s?percent sign/i)) {
        tempPredicate = this.preCasingForExpressions(tempPredicate, " mod ");
        return tempPredicate = tempPredicate.replace(/\s?percent sign/i, "%");
      }
      else if (tempPredicate.match(/.*mod.*/i)) {
        tempPredicate = this.preCasingForExpressions(tempPredicate, " mod ");
        return tempPredicate = tempPredicate.replace(/mod/i, "%");
      }

      //Voice commands for writing comparison operators
      else if (tempPredicate.match(/greater than/i)) {
        tempPredicate = this.preCasingForExpressions(tempPredicate, " greater than ");
        return tempPredicate = tempPredicate.replace(/greater than/i, ">");
      }

      else if (tempPredicate.match(/greater than or equal to/i)) {
        tempPredicate = this.preCasingForExpressions(tempPredicate, " greater than or equal to ");
        return tempPredicate = tempPredicate.replace(/greater than or equal to/i, ">=");
      }

      else if (tempPredicate.match(/less than/i)) {
        tempPredicate = this.preCasingForExpressions(tempPredicate, " less than ");
        return tempPredicate = tempPredicate.replace(/less than/i, "<");
      }

      else if (tempPredicate.match(/less than or equal to/i)) {
        tempPredicate = this.preCasingForExpressions(tempPredicate, " less than or equal to ");
        return tempPredicate = tempPredicate.replace(/less than or equal to/i, "<=");
      }


      //Voice commands for writing logical operators
      else if (tempPredicate.match(/\s?logical and/i)) {
        tempPredicate = this.preCasingForExpressions(tempPredicate, " logical and ");
        return tempPredicate = tempPredicate.replace(/a? logical and/i, "&&");
      }

      else if (tempPredicate.match(/\s?logical or/i)) {
        tempPredicate = this.preCasingForExpressions(tempPredicate, " logical or ");
        return tempPredicate = tempPredicate.replace(/a?.*logical or/i, "||");
      }

      //Voice commands for braces, parenthesis, commas
      else if (tempPredicate.match(/open parenthesis/i)) {
        return tempPredicate = tempPredicate.replace(/open parenthesis/i, "(");
      }
      else if (tempPredicate.match(/close parenthesis/i)) {
        return tempPredicate = tempPredicate.replace(/close parenthesis/i, ")");
      }
      else if (tempPredicate.match(/open curly bracket[s]?/i)) {
        return tempPredicate = tempPredicate.replace(/open curly bracket[s]?/i, "{");
      }
      else if (tempPredicate.match(/close curly bracket/i)) {
        return tempPredicate = tempPredicate.replace(/close curly/i, "}");
      }
      else if (tempPredicate.match(/\s?comma/i)) {
        return tempPredicate = tempPredicate.replace(/open parentheses/i, ",");
      }
      else if (tempPredicate.match(/\s?semicolon/i)) {
        return tempPredicate = tempPredicate.replace(/a semicolon/i, ";");
      }
      else if (tempPredicate.match(/an exclamation mark/i)) {
        return tempPredicate = tempPredicate.replace(/a semicolon/i, ";");
      }
      else if (tempPredicate.match(/.*between quotes/i)) {
        debugger;
        tempPredicate = this.preCasingForStrings(tempPredicate);
        return tempPredicate = "\" " + tempPredicate.replace(/between quotes/i, "\"");
      }
      else if (tempPredicate.match(/quote[s]?/i)) {
        return tempPredicate = tempPredicate.replace(/quotes/i, "\"");
      }
      //must stay last
      // Commands for camelcasing and Pascal Casing
      else if (tempPredicate.match(/camelcase/i)) {
        return this.camelCasing(tempPredicate);
      }

      else if (tempPredicate.match(/pascal case/i)) {
        return tempPredicate = this.pascalCasing(tempPredicate);
      }

      else if (tempPredicate.match(/\s?uppercase .*/i)) {
        return tempPredicate = this.upperCasing(tempPredicate);
      }


      //Command for managing homophones
      // if (predicate.match (/choose option [0-9]/i)){
      //     ;
      // }
      else { ; }
      return predicate = tempPredicate;
    }

    writeConstant(predicate: string): string {
      return predicate = predicate.replace("constant", "const");
    }

    integerType(predicate: string): string {
      if (predicate.match("integer type")) {
        return predicate = predicate.replace("integer type", "int");
      }
      else if (predicate.match("integer")) {
        return predicate = predicate.replace("integer", "int");
      }
    }

    doubleType(predicate: string): string {
      if (predicate.match("double type")) {
        return predicate = predicate.replace("double type", "double");
      }
      else if (predicate.match("double")) {
        return predicate = predicate.replace("double", "double");
      }
    }

    preCasingForExpressions(predicate: string, operator: string): string {
      var testring = predicate.match(/camelcase/g);
      if (predicate.match(/camelcase/g).length === 2) {
        var predicateArr: string[] = predicate.split(operator);
        predicateArr[0].replace(operator, " ");
        var temp1: string = this.camelCasing(predicateArr[0]) + " " + operator;
        var temp2: string = this.camelCasing(predicateArr[1])
        return temp1 + temp2;
      }
      // if(predicate.match(/pascal case/).length === 2){
      //   var predicateArr: string[] = predicate.split(operator);
      //   var temp1: string = this.pascalCasing(predicateArr[0]) + operator; 
      //   var temp2: string = this.pascalCasing(predicateArr[1])
      //   return temp1 + temp2; 
      // }
    }
    preCasingForStrings(predicate: string): string{
      if(predicate.match(/.*uppercase.*/i)){
        return predicate = this.upperCasing(predicate);
      }
      return predicate
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

    upperCasing(predicate: string): string {
      let variableName = '';
      let variableNameArr: string[] = predicate.split(/uppercase/i);
      variableNameArr = variableNameArr[1].split(" ");
      for (let idx = 1; idx < variableNameArr.length; idx++) {
        for (let j = 0; j < variableNameArr[idx].length; j++) {
          if (j === 0) {
            variableName += ' ' + variableNameArr[idx][0].toUpperCase();
          }
          else { variableName += variableNameArr[idx][j].toLowerCase() }
        }
      }
      return predicate = predicate.replace(/uppercase .*/i, ' ' + variableName.trim());
    }

    camelCasing(tempPredicate: string) {
      let variableName = '';
      tempPredicate = tempPredicate.trim();
      let variableNameArr: string[] = tempPredicate.split(/camelcase /i);
      variableNameArr = variableNameArr[1].split(" ");
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
      return tempPredicate = tempPredicate.replace(/camelcase .*/i, ' ' + variableName.trim());
    }

    parseHassleWords(predicate: string): string {
      //Forced troubleshooting recongition for the word  "false" 
      if (predicate.match("faults")) {
        predicate = predicate.replace("faults", "false");
      }
      else if (predicate.match("falls")) {
        predicate = predicate.replace("falls", "false");
      }
      else if (predicate.match("spots")) {
        predicate = predicate.replace("spots", "false");
      }
      else if (predicate.match("thougths")) {
        predicate = predicate.replace("thougts", "false");
      }
      else { ; }

      //parsing words that represent integers "one", "two"...
      if (predicate.match(" one ")) {
        predicate = predicate.replace(" one ", "1");
      }
      else if (predicate.match(" two ")) {
        predicate = predicate.replace(" two ", "2");
      }
      else if (predicate.match(" three ")) {
        predicate = predicate.replace("three", "3");
      }
      else if (predicate.match(" four ")) {
        predicate = predicate.replace(" four ", "4");
      }
      else if (predicate.match(" five ")) {
        predicate = predicate.replace(" five ", "5");
      }
      else if (predicate.match(" six ")) {
        predicate = predicate.replace(" six ", "6");
      }
      else if (predicate.match(" seven ")) {
        predicate = predicate.replace(" seven ", "7");
      }
      else if (predicate.match(" eight ")) {
        predicate = predicate.replace(" eight ", "8");
      }
      else if (predicate.match(" nine ")) {
        predicate = predicate.replace(" nine ", "9");
      }
      else { ; }

      //Forced troubleshooting recognition for the word "Main"
      if (predicate.match("the state of maine")) {
        predicate = predicate.replace("the state of maine", "Maine");
      }
      else if (predicate.match("maine")) {
        predicate = predicate.replace("maine", "main");
      }
      else { ; }

      if (predicate.match(/x/)) {
        predicate = predicate.replace("x", "times");
      }
      //Forced troubleshooting for recongizing "pascal case"
      if (predicate.match(/past the case/gi)) {
        predicate = predicate.replace(/past the case/gi,"pascal case");
      }

      //Forced troubleshooting for recongizing "camel case"
      if (predicate.match(/.*camo case.*/gi)) {
        predicate = predicate.replace(/camo case/gi, "camelcase");
      }
      else if (predicate.match(/.*camel case.*/gi)) {
        predicate = predicate.replace(/camel case/gi, "camelcase");
      }
      else if (predicate.match(/.*camel tape.*/gi)) {
        predicate = predicate.replace(/camel tape/gi, "camelcase");
      }
      else { ; }

      //Removing the words "an", "a", and "the" from the beginning of 
      if (predicate.startsWith("an")) {
        predicate = predicate.replace("an", "").trim();
      }
      else if (predicate.startsWith("a")) {
        predicate = predicate.replace("a", "").trim();
      }
      else { ; }
      return predicate;
    }

  }
