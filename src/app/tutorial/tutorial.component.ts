import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SpeechRecognitionService } from '../shared/services/web-apis/speech-recognition.service';
import { TutorialService } from '../shared/services/tutorial.service';
import { SpeechResults } from '../shared/models/speech-results';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { TutorialUsuarioDTO } from '../shared/models/tutorial-usuario-dto';
import { Pregunta } from '../shared/models/pregunta';
import { PostRespuestaUsuarioDTO } from '../shared/models/post-respuesta-usuario-dto';
import { PostTutorialUsuarioDTO } from '../shared/models/post-tutorial-usuario-dto';
import { Tutorial } from '../shared/models/tutorial';
import { TutorialNotes } from '../shared/models/tutorial-notes';
import { VoiceNavigationService } from '../shared/services/voice-navigation.service';
import { identifierModuleUrl } from '@angular/compiler';

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
  returnRoute: string;
  @ViewChild('skipLink') skipLink: ElementRef;
  userTutorial: TutorialUsuarioDTO;
  questions: Array<Pregunta[]>
  currQuestion: Pregunta;
  questionCounter: number = 0;
  userAnswer: string = "";
  oldAnswer: string = this.userAnswer; 
  totalPoints: number = 0;
  totalPossiblePoints: number = 0;
  finalScore = this.totalPoints / this.totalPossiblePoints * 100;
  currResult: number = -1;
  isFinished: boolean = false;
  tutorial: Tutorial;
  options: string[];
  notes: TutorialNotes;
  //used in the html template
  passedTutorial: boolean = false;

  //the current tutorial's id is retrieved from the component url
  tutorialID = this.route.snapshot.paramMap.get('tutorialID');

  constructor(
    public speechRecognition: SpeechRecognitionService,
    private tutorialService: TutorialService,
    private route: ActivatedRoute,
    private navigationService: VoiceNavigationService
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
    this.getTutorial(this.tutorialID);

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
  getTutorial(tutorialID: string) {
    this.tutorialService.getTutorial(tutorialID).subscribe(tutorial => {
      this.tutorial = tutorial;
      this.returnRoute = '/language-tutorials/'+ this.tutorial.lenguajeIdFk1.toString();
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
    });
  }

  /**
   * Displays the next question in the questions array
   * This funtion is activated when the user presses 
   * the "next button".
   */
  displayNextQuestion() {
    //The question counter is updated
    this.totalPossiblePoints += this.currQuestion.valor;
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
    let predicate = speechResult.predicate.trim();

    //manages spacing in the useranswer
    if (speechResult.action === 'write') {
      var voiceCodeResult = this.voiceCodeWriter(predicate);
      voiceCodeResult = voiceCodeResult != null ? voiceCodeResult.replace(/\s+/g, ' ').trim() : voiceCodeResult;
      if (this.userAnswer === "") { 
        this.userAnswer += voiceCodeResult;
      }
      else { this.userAnswer += ' ' + voiceCodeResult; }
    }

    else if (speechResult.action === 'delete'
      && predicate.match(/.*word[s]?/i)) {
      predicate = this.parseHassleWords(predicate);
      let iterations: number = 0;
      if(predicate.match(/a word/i))
        iterations = 1; 
      else iterations = parseInt(predicate.split(" ").slice(0).toString());
      let tempArray: string[] = this.userAnswer.trim().split(' ');
      if (tempArray.length - iterations >= 0) {
        this.userAnswer = '';
        for (let idx = 0; idx < tempArray.length - iterations; idx++) {
          if (idx === tempArray.length - 1) {
            this.userAnswer += tempArray[idx].trim();
          }
          else 
            this.userAnswer += tempArray[idx].trim() + ' ';
        }
      }
      else { this.userAnswer = ''; }
    }

    else if (speechResult.action === 'delete'
      && predicate === 'everything') {
      this.userAnswer = "";
    }

    else if (speechResult.action === 'navigate') {
      if (predicate === 'next') {
        this.displayNextQuestion();
      }
      else if (predicate.match(/.*next\s?/i)) {
        this.displayNextQuestion();
      }
      else if (predicate.match(/.*check answer\s?/i)) {
        this.gradeAnswer(this.userAnswer);
      }
      else if (predicate.match(/.*check the answer\s?/i)) {
        this.gradeAnswer(this.userAnswer);
      }
      //Currently only works with c#
      else if (predicate.match(/c sharp tutorials/i)) {
        predicate = this.parseHassleWords2(predicate);
        this.navigationService.languagesMenuNavigator(predicate);
      }
      else if (predicate.match(/skip.*main content/i)){
        //debugger;
        this.skipLink.nativeElement.click();
      }
    }
    else { console.log("Tutorial Component: The voice command was not recognized"); }
  }
  
  voiceCodeWriter(predicate: string): string {
    //the original predicate is saved for debugging purposes
    let tempPredicate = predicate;
    tempPredicate = this.parseHassleWords(tempPredicate);
    
    //Loop Commands
    if (tempPredicate.match("for loop")) {
      tempPredicate = this.parseHassleWords(tempPredicate);
      return tempPredicate = tempPredicate.replace("for loop", "for ( int");
    }

    //command for writing public static method signatures
    //Avoid using method names that contain reserved words like bool, dobule, or integer
    //The matchtype funtion is does not take positioning into account
    if (tempPredicate.match(/a?\s?public[ static ]?.* method name[d]?/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      tempPredicate = this.matchType(tempPredicate);
      tempPredicate = tempPredicate.replace("method named", "pascal case");
      tempPredicate = this.pascalCasing(tempPredicate);
      return tempPredicate
    }

    if (tempPredicate.match(/a?\s?first.*parameter name[d]?/i)) {
      tempPredicate = tempPredicate.replace(/a?first/, "(");
      tempPredicate = this.matchType(tempPredicate); 
      tempPredicate = tempPredicate.replace(/parameter name[d]?/i, "camelcase");
      tempPredicate = this.camelCasing(tempPredicate);
      return tempPredicate
    }
    else if (tempPredicate.match(/last.*parameter name[d]?/i)) {
      tempPredicate = tempPredicate.replace("last", "," );
      tempPredicate = this.matchType(tempPredicate);
      tempPredicate = tempPredicate.replace(/parameter name[d]?/i, "camelcase");
      tempPredicate = this.camelCasing(tempPredicate) + ")";
      return tempPredicate
    }
    else if (tempPredicate.match(/another.*parameter name[d]?/i)) {
      tempPredicate = this.parseHassleWords(tempPredicate);
      tempPredicate = tempPredicate.replace("another", " , ");
      tempPredicate = this.matchType(tempPredicate);
      tempPredicate = tempPredicate.replace(/parameter name[d]?/i, "camelcase");
      tempPredicate = this.camelCasing(tempPredicate)
      return tempPredicate
    }

    //Managing declaration of constants

   if (tempPredicate.match(/constant integer name[d]?[s]?.*?/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      tempPredicate = this.writeConstant(tempPredicate);
      tempPredicate = this.integerType(tempPredicate);
      tempPredicate = tempPredicate.replace(/name[d]?[s?]?/i, "pascal case");
      tempPredicate = this.pascalCasing(tempPredicate);
      return predicate = tempPredicate;
    }
   
    else if (tempPredicate.match(/constant double name[d]?[s]?.*?/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      tempPredicate = this.writeConstant(tempPredicate);
      tempPredicate = this.doubleType(tempPredicate);
      tempPredicate = tempPredicate.replace(/named[d]?[s]?/i, "pascal case");
      tempPredicate = this.pascalCasing(tempPredicate);
      return tempPredicate;
    }

    else if (tempPredicate.match(/constant boolean name[d]?[s]? .*?/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      tempPredicate = this.writeConstant(tempPredicate);
      tempPredicate = this.boolType(tempPredicate);
      tempPredicate = tempPredicate.replace(/named[d]?[s]?/i, "pascal case");
      tempPredicate = this.pascalCasing(tempPredicate);
      return tempPredicate;
    }

    else if (tempPredicate.match(/constant character name[d]?[s]?.*?/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      tempPredicate = this.writeConstant(tempPredicate);
      tempPredicate = this.characterType(tempPredicate);
      tempPredicate = tempPredicate.replace(/named[d]?[s]?/i, "pascal case");
      tempPredicate = this.pascalCasing(tempPredicate);
      return tempPredicate;
    }

    else if (tempPredicate.match(/constant keyword/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      tempPredicate = this.writeConstant(tempPredicate);
      return predicate = tempPredicate;
    }
    
    //Conditions for integer types
    //declares a variable: type + name
    else if (tempPredicate.match(/integer name[d]?/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      tempPredicate = this.integerType(tempPredicate);
      tempPredicate = tempPredicate.replace(/name[d]?/i, "camelcase");
      tempPredicate = this.camelCasing(tempPredicate);
      return tempPredicate
    }
    //writes out the keyword int
    else if (tempPredicate.match(/integer type/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      return tempPredicate = tempPredicate.replace("integer type", "int");
    }

    //Conditions for double types
    //delcares a double variable: type + name
    if (tempPredicate.match(/double name[d]?/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      tempPredicate = this.doubleType(tempPredicate);
      tempPredicate = tempPredicate.replace("named", "camelcase");
      tempPredicate = this.camelCasing(tempPredicate);
      return tempPredicate
    }

    //writes the keyword, double
    else if (tempPredicate.match("double type")) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      return tempPredicate = tempPredicate.replace("double type", "double");
    }

    else if (tempPredicate.match("string type")) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      return tempPredicate = tempPredicate.replace("string type", "string");
    }

    else if (tempPredicate.match("boolean type")) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      return tempPredicate = tempPredicate.replace("boolean type", "bool");
    }

    else if (tempPredicate.match("character type")) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      return tempPredicate = tempPredicate.replace("character type", "char");
    }

    //Voice commands for equality operators
    if (tempPredicate.match(/\s?equal sign/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      tempPredicate = this.preCasingForExpressions(tempPredicate, "equal sign");
      return tempPredicate = tempPredicate.replace(/an equal sign/i, "=");
    }

    else if (tempPredicate.match(/\s?equals operator/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      tempPredicate = this.preCasingForExpressions(tempPredicate, "equals operator");
      return tempPredicate = tempPredicate.replace(/equals operator/i, "==");
    }

    else if (tempPredicate.match(/not equal to/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      tempPredicate = this.preCasingForExpressions(tempPredicate, "not equal to");
      return tempPredicate = tempPredicate.replace(/not equal to/i, "!=");
    }

    else if (tempPredicate.match(/not equal/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      tempPredicate = this.preCasingForExpressions(tempPredicate, "not equal");
      return tempPredicate = tempPredicate.replace(/not equal/i, "!=");
    }

    else if (tempPredicate.match(/equals/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      tempPredicate = this.preCasingForExpressions(tempPredicate, "equals");
      return tempPredicate = tempPredicate.replace(/equals/i, "=");
    }

    //Voice commands for writing arithmetic operators
    else if (tempPredicate.match(/\s?plus sign/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      return tempPredicate = tempPredicate.replace(/\s?plus sign/i, "+");
    }

    else if (tempPredicate.match(/.*plus.*/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      tempPredicate = this.preCasingForExpressions(tempPredicate, "plus");
      return tempPredicate = tempPredicate.replace(/plus/i, "+");
    }

    else if (tempPredicate.match(/\s?minus sign/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      tempPredicate = this.preCasingForExpressions(tempPredicate, "minus");
      return tempPredicate = tempPredicate.replace(/minus sign/i, " - ");
    }

    else if (tempPredicate.match(/.*minus.*/i)) {
      debugger;
      tempPredicate = this.parseHassleWords2(tempPredicate);
      tempPredicate = this.preCasingForExpressions(tempPredicate, "minus");
      return tempPredicate = tempPredicate.replace(/minus/i, " - ");
    }
    else if (tempPredicate.match(/division sign/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      return tempPredicate = tempPredicate.replace(/division sign/i, "/");
    }
    else if (tempPredicate.match(/.*\/.*/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      tempPredicate = this.preCasingForExpressions(tempPredicate, " / ");
      return tempPredicate = tempPredicate.replace(/\//i, " / ");
    }

    else if (tempPredicate.match(/.*times.*/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      tempPredicate = this.preCasingForExpressions(tempPredicate, "times");
      return tempPredicate = tempPredicate.replace(/times/i, "*");
    }

    else if (tempPredicate.match(/increment operator/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      return tempPredicate = tempPredicate.replace(/increment operator/i, "++");
    }

    else if (tempPredicate.match(/decrement operator/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      return tempPredicate = tempPredicate.replace(/decrement operator/i, "--");

    }
    else if (tempPredicate.match(/\s?percent sign/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      tempPredicate = this.preCasingForExpressions(tempPredicate, " mod ");
      return tempPredicate = tempPredicate.replace(/ mod /i, "%");
    }
    else if (tempPredicate.match(/.*mod.*/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      tempPredicate = this.preCasingForExpressions(tempPredicate, " mod ");
      return tempPredicate = tempPredicate.replace(/mod/i, "%");
    }

    //Voice commands for writing comparison operators
    else if (tempPredicate.match(/greater than or equal to/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      tempPredicate = this.preCasingForExpressions(tempPredicate, " greater than or equal to ");
      return tempPredicate = tempPredicate.replace(/greater than or equal to/i, ">=");
    }
    else if (tempPredicate.match(/greater than/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      tempPredicate = this.preCasingForExpressions(tempPredicate, " greater than ");
      return tempPredicate = tempPredicate.replace(/greater than/i, ">");
    }
    else if (tempPredicate.match(/less than or equal to/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      tempPredicate = this.preCasingForExpressions(tempPredicate, " less than or equal to ");
      return tempPredicate = tempPredicate.replace(/less than or equal to/i, "<=");
    }
    else if (tempPredicate.match(/less than/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      tempPredicate = this.preCasingForExpressions(tempPredicate, " less than ");
      return tempPredicate = tempPredicate.replace(/less than/i, "<");
    }

    //Voice commands for writing logical operators
    else if (tempPredicate.match(/\s?logical and/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      tempPredicate = this.preCasingForExpressions(tempPredicate, " logical and ");
      return tempPredicate = tempPredicate.replace(/logical and/i, "&&");
    }

    else if (tempPredicate.match(/\s?logical or/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      tempPredicate = this.preCasingForExpressions(tempPredicate, " logical or ");
      return tempPredicate = tempPredicate.replace(/logical or/i, "||");
    }

    //Voice commands for braces, parenthesis, commas
    else if (tempPredicate.match(/open parenthesis/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      return tempPredicate = tempPredicate.replace(/open parenthesis/i, "(");
    }
    else if (tempPredicate.match(/close parenthesis/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      return tempPredicate = tempPredicate.replace(/close parenthesis/i, ")");
    }
    else if (tempPredicate.match(/open curly bracket[s]?/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      return tempPredicate = tempPredicate.replace(/open curly bracket[s]?/i, "{");
    }
    else if (tempPredicate.match(/close curly bracket[s]?/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      return tempPredicate = tempPredicate.replace(/close curly bracket[s]?/i, "}");
    }
    else if (tempPredicate.match(/a?\s?comma/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      return tempPredicate = tempPredicate.replace(/a?\s?comma/i, ", ");
    }
    else if (tempPredicate.match(/a?,/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      return tempPredicate = tempPredicate.replace(/a?,/i, ", ");
    }
    else if (tempPredicate.match(/a?\s?semicolon/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      return tempPredicate = tempPredicate.replace(/a?\s?semicolon/i, ";");
    }
    else if (tempPredicate.match(/\s?exclamation mark/i)) {
      tempPredicate = this.parseHassleWords2(tempPredicate);
      return tempPredicate = tempPredicate.replace(/\s?exclamation mark/i, "!");
    }
    else if (tempPredicate.match(/^an!/i)) {
      return tempPredicate = tempPredicate.replace(/an!/i, "!");
    }
    else if (tempPredicate.match(/.*between quotes/i)) {
      tempPredicate = this.preCasingForStrings(tempPredicate);
      return tempPredicate = "\" " + tempPredicate.replace(/between quotes/i, "\"");
    }
    else if (tempPredicate.match(/quote[s]?/i)) {
      return tempPredicate = tempPredicate.replace(/quotes/i, "\"");
    }

    //Naming conventions
    else if (tempPredicate.match(/camelcase/i)) {
      return this.camelCasing(tempPredicate);
    }

    else if (tempPredicate.match(/pascal case/i)) {
      return tempPredicate = this.pascalCasing(tempPredicate);
    }

    else if (tempPredicate.match(/\s?uppercase.*/i)) {
      debugger;
      return tempPredicate = this.upperCasing(tempPredicate);
    }
   
    // Prototype Command for managing homophones
    // if (predicate.match (/choose option [0-9]/i)){
    //     ;
    // }
    return predicate = tempPredicate;
  }

  writeConstant(predicate: string): string {
    return predicate = predicate.replace("constant", "const");
  }
  /**
   * Use of this funtion is discouraged if the input 
   * could contain one or more substrings equal to
   * the data type names. Each type name is only filtered once!  
   * @param predicate 
   * @returns 
   */
  
  matchType(predicate: string): string {
    if(predicate.match(/double/i))
     return predicate = this.doubleType(predicate);
    else if(predicate.match(/integer/i)){
     return predicate = this.integerType(predicate);
    }
    else if(predicate.match(/boolean/i))
     return predicate = this.boolType(predicate);
    else if(predicate.match(/void/i))
     return predicate = this.voidType(predicate);
    else return predicate;
  }

  integerType(predicate: string): string {
    if (predicate.match(/integer type/i)) {
      return predicate = predicate.replace("integer type", "int");
    }
    else if (predicate.match(/integer/i)) {
      return predicate = predicate.replace("integer", "int");
    }
  }

  doubleType(predicate: string): string {
    if (predicate.match("double type")) {
      return predicate = predicate.replace("double type", "double");
    }
  }

  boolType(predicate: string): string {
    if (predicate.match("boolean type")) {
      return predicate = predicate.replace("boolean type", "bool");
    }
    else if (predicate.match("boolean")) {
      return predicate = predicate.replace("boolean", "bool");
    }
  }

  voidType(predicate: string): string {
    if (predicate.match("void type")) {
      return predicate = predicate.replace("void type", "void");
    }
  }

  characterType(predicate: string): string {
    if (predicate.match("character type")) {
      return predicate = predicate.replace("character type", "void");
    }
    else if(predicate.match("character")){
      return predicate = predicate.replace("character", "char"); 
    }
  }

  //Implements camelcasing and pascal casing functions on operands
  preCasingForExpressions(predicate: string, operator: string): string {
    if (predicate.match(/camelcase/g)) {
      var predicateArr: string[] = predicate.split(operator);
      predicateArr.forEach(substring => {
        if(substring.match(/camelcase/g)){
          var stringToReplace = this.camelCasing(substring);
          predicate = predicate.replace(substring, stringToReplace);
        }
        console.log("predicate", predicate)
      });
    }
    if (predicate.match(/pascal case/g)) {
      var predicateArr: string[] = predicate.split(operator);
      predicateArr.forEach(substring => {
        console.log("substring", substring);
        if(substring.match(/pascal case/g)){
          var stringToReplace = this.pascalCasing(substring);
          predicate = predicate.replace(substring, stringToReplace);
        }
        console.log("predicate", predicate)
      });
    }
    return predicate;
  }
  preCasingForStrings(predicate: string): string {
    if (predicate.match(/.*uppercase.*/i)) {
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
    //The space after uppercase is needed! Do not remove it.
    let variableNameArr: string[] = predicate.split(/uppercase/i);
    variableNameArr.forEach(substring => {
      
      substring[0][0].toUpperCase
      
    });
    return predicate = predicate.replace(/uppercase.*/i, ' ' + variableName.trim());
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
/**
 * This function 
 * @param predicate a string value to  
 * @returns 
 */
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

    //parsing words that represent integers 1 through nine "one", "two"...
    //
    if (predicate.match("one")) {
      if (predicate.startsWith("one "))
        predicate = predicate.replace("one ", "1 ");
      else if (predicate.match(" one "))
        predicate = predicate.replace(" one ", " 1 ");
      else if (predicate.match(" one"))
        predicate = predicate.replace(" one", " 1");
    }

    if (predicate.match("two")) {
      if (predicate.startsWith("two "))
        predicate = predicate.replace("two ", "2 ");
      else if (predicate.match(" two "))
        predicate = predicate.replace(" two ", " 2 ");
      else if (predicate.match(" two"))
        predicate = predicate.replace(" two", " 2");
    }

    if (predicate.match("three")) {
      if (predicate.startsWith("three "))
        predicate = predicate.replace("three ", "3 ");
      else if (predicate.match(" three "))
        predicate = predicate.replace(" three ", " 3 ");
      else if (predicate.match(" three"))
        predicate = predicate.replace(" three", " 3");
    }

    /**condition added to prevent bugs with "for loop" command
     * this phrase must be processed before the word "four" to
     * prevent replacing it with an integer */
    if (predicate.match("four loop")) {
      predicate = predicate.replace("four loop", "for loop");
    }

    //continues parsing integers...
    if (predicate.match("four")) {
      if (predicate.startsWith("four "))
        predicate = predicate.replace("four ", "4 ");
      else if (predicate.match(" four "))
        predicate = predicate.replace(" four ", " 4 ");
      else if (predicate.match(" four"))
        predicate = predicate.replace(" four", " 4");
    }

    if (predicate.match("five")) {
      if (predicate.startsWith("five "))
        predicate = predicate.replace("five ", "5 ");
      else if (predicate.match(" five "))
        predicate = predicate.replace(" five ", " 5 ");
      else if (predicate.match(" five "))
        predicate = predicate.replace(" five", " 5");
    }

    if (predicate.match("six")) {
      if (predicate.startsWith("six "))
        predicate = predicate.replace("six ", "6 ");
      else if (predicate.match(" six "))
        predicate = predicate.replace(" six ", " 6 ");
      else if(predicate.match(" six"))
        predicate = predicate.replace(" six", " 6"); 
    }

    if (predicate.match("seven")) {
      if (predicate.startsWith("seven "))
        predicate = predicate.replace("seven ", "7 ");
      else if (predicate.match(" seven "))
        predicate = predicate.replace(" seven ", " 7 ");
      else if(predicate.match(" seven"))
        predicate = predicate.replace(" seven", " 7"); 
    }

    if (predicate.match("eight")) {
      if (predicate.startsWith("eight "))
        predicate = predicate.replace("eight ", "8 ");
      else if (predicate.match(" eight "))
        predicate = predicate.replace(" eight ", " 8");
      else if(predicate.match(" eight"))
        predicate = predicate.replace(" eight", " 8"); 
    }

    if (predicate.match("nine")) {
      if (predicate.startsWith("nine "))
        predicate = predicate.replace("nine ", "9 ");
      else if (predicate.match(" nine "))
        predicate = predicate.replace(" nine ", " 9 ");
      else if (predicate.match(" nine"))
        predicate = predicate.replace(" nine", " 9");
    }

    //Forced troubleshooting recognition for the word "Main"
    if (predicate.match("the state of maine")) {
      predicate = predicate.replace("the state of maine", "Maine");
    }
    if (predicate.match("maine")) {
      predicate = predicate.replace("maine", "main");
    }

    if (predicate.match(/ x /i)) {
      predicate = predicate.replace(/ x /i, "times");
    }
    //Forced troubleshooting for recongizing "pascal case"
    if (predicate.match(/past the case/gi)) {
      predicate = predicate.replace(/past the case/gi, "pascal case");
    }
    if (predicate.match(/.*pasco case.*/gi)) {
      predicate = predicate.replace(/pasco case/gi, "pascal case");
    }

    //Forced troubleshooting for recongizing "camel case"
    if (predicate.match(/.*camo case.*/gi)) {
      predicate = predicate.replace(/camo case/gi, "camelcase");
    }
    if (predicate.match(/.*camel case.*/gi)) {
      predicate = predicate.replace(/camel case/gi, "camelcase");
    }
    if (predicate.match(/.*camel tape.*/gi)) {
      predicate = predicate.replace(/camel tape/gi, "camelcase");
    }
   
    if(predicate.match(/.*-.*/)){
      if(predicate.match(/ greater-?than.*/)){
        predicate = predicate.replace(/-/g, " "); 
      }
      else if(predicate.match(/ less-?than.*/g)){
        predicate = predicate.replace(/-/g, " ");
      }
      predicate = predicate = predicate.replace(/-/g, " minus");
    }

    return predicate;
  }

  parseHassleWords2(predicate:string):string{
    //Removing the words "an", "a", and "the" from the beginning of 
    if (predicate.startsWith("an ")) {
     return predicate = predicate.replace("an ", "").trim();
    }
    else if (predicate.startsWith("a ")) {
     return predicate = predicate.replace("a ", "").trim();
    }
    else if (predicate.startsWith("the ")){
      return predicate = predicate.replace("the ", "").trim(); 
    }
    else return predicate; 
  }
}
