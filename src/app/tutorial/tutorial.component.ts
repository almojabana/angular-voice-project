import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SpeechRecognitionService } from '../shared/services/web-apis/speech-recognition.service';
import { TutorialService } from '../shared/services/tutorial.service';
import { SpeechResults } from '../shared/models/speech-results';
import { CodeSelectorService } from '../shared/services/code-selector.service';
import { ActivatedRoute } from '@angular/router';
import { TutorialUsuarioDTO } from '../shared/models/tutorial-usuario-dto';
import { Pregunta } from '../shared/models/pregunta';
import { PostRespuestaUsuarioDTO } from '../shared/models/post-respuesta-usuario-dto';
import { PostTutorialUsuarioDTO } from '../shared/models/post-tutorial-usuario-dto';
import { Tutorial } from '../shared/models/tutorial';
import { TutorialNotes } from '../shared/models/tutorial-notes';
import { VoiceNavigationService } from '../shared/services/voice-navigation.service';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { Lenguaje} from '../shared/models/language';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.css']
})

export class TutorialComponent implements OnInit {

  /*****Class Properties*****/
  //During development,the app runs with a hardcoded userID, example: user =1
  userID: number = 1;
  mainContentSkipLink3: string;
  returnRoute: string;
  @ViewChild('skipToMain3') skipToMain3: ElementRef;
  userTutorial: TutorialUsuarioDTO;
  questions: Array<Pregunta[]>
  currQuestion: Pregunta;
  questionCounter: number = 0;
  userAnswer: string = "";
  oldAnswer: string = this.userAnswer;
  totalPoints: number = 0;
  totalPossiblePoints: number = 0;
  finalScore = (this.totalPoints / this.totalPossiblePoints)*100;
  currResult: number = -1;
  isFinished: boolean = false;
  tutorial: Tutorial;
  options: string[];
  notes: TutorialNotes;
  //used in the html template
  passedTutorial: boolean = false;
  voiceSubscription: Subscription;
  language: Lenguaje;

  //the current tutorial's id is retrieved from the component url
  tutorialID = this.route.snapshot.paramMap.get('tutorialID');

  constructor(
    public speechRecognition: SpeechRecognitionService,
    private tutorialService: TutorialService,
    private route: ActivatedRoute,
    private navigationService: VoiceNavigationService,
    private titleService: Title,
    public codeService: CodeSelectorService
  ) { }

  ngOnInit(): void {
    //Creates the skip link for skipping the navigation bar
    this.mainContentSkipLink3 =
      this.route.snapshot.url
        .toString()
        .replace(",", "/") + "#main-content3";
    //Gets the records that will be used during the tutorial
    this.getUserTutorial(this.tutorialID);

    this.getAdditionalData();
    // this.voiceSubscription = this.speechRecognition.statement.subscribe(command => {
    //   this.captureVoiceCommand(command)});
    
  }

  getAdditionalData() {
    // this.getTutorial(this.tutorialID);
      this.tutorialService.getTutorial(this.tutorialID).subscribe(tutorial => {
      // Set tutorial.
      this.tutorial = tutorial;
      this.returnRoute = '/language-tutorials/' + this.tutorial.lenguajeIdFk1.toString();
      this.setTitle("Tutorial " + this.tutorial.secuencia + ": " + this.tutorial.titulo);

      this.tutorialService.getLanguage(tutorial.lenguajeIdFk1.toString()).subscribe(language => {
        //Set language.
        this.language = language;
        console.log("id: ", this.tutorial.lenguajeIdFk1)
        console.log("Language: " , this.language);
        //Captures voice commands by subscribing to the speech recognition service
        this.voiceSubscription = this.speechRecognition.statement.subscribe(command => {
          this.captureVoiceCommand(command);
        });
      });
    })
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
          if (this.userTutorial) {
            var userTutorialID = this.userTutorial.tutorialUsuarioId;
            this.getQuestionsRemaining(tutorialID, userTutorialID.toString());
          }
          //If no incomplete user tutorial record exists, a new one is create
          if (!this.userTutorial) {
            this.createUserTutorial(this.userID, tutorialID);
            this.getQuestions(this.tutorialID);
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
  getQuestionsRemaining(tutorialID: string, userTutorialID: string) {
    this.tutorialService
      .getQuestionsRemaining(tutorialID, userTutorialID)
      .subscribe(questions => {
        this.questions = questions;
        this.currQuestion = new Pregunta().deserialize(questions[0]);
        console.log(this.currQuestion);
      })
  }


  //Calls the setTitle funtion when the tutorial is retrieved
  getTutorial(tutorialID: string) {
    this.tutorialService.getTutorial(tutorialID).subscribe(tutorial => {
      this.tutorial = tutorial;
      this.returnRoute = '/language-tutorials/' + this.tutorial.lenguajeIdFk1.toString();
      this.setTitle("Tutorial "+ this.tutorial.secuencia + ": "+ this.tutorial.titulo);
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
   * Updates userTutorial Entity
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

  setTitle(title: string) {
    this.titleService.setTitle(title);
  }

  captureVoiceCommand(speechResult: SpeechResults): void {
    let predicate = speechResult.predicate.trim();

    //manages spacing in the useranswer*
    if (speechResult.action === 'write') {
      //replace old answer for the "undo" functionality
      this.oldAnswer = this.userAnswer;
      var voiceCodeResult = this.codeService.select("C#", predicate);
      voiceCodeResult = voiceCodeResult != null ? voiceCodeResult.replace(/\s+/g, ' ').trim() : voiceCodeResult;
      if (this.userAnswer === "") {
        this.userAnswer += voiceCodeResult;
      }
      else { this.userAnswer += ' ' + voiceCodeResult; }
    }

    else if (speechResult.action === 'delete'
      && predicate.match(/.*word[s]?/i)) {
      let iterations: number = 0;
      if (predicate.match(/a word/i))
        iterations = 1;
      else {
        predicate = this.removeHassleWords(predicate);
        iterations = parseInt(predicate.split(" ").slice(0).toString());
        }
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

    //simple "undo"
    else if (speechResult.action === 'delete'
      && predicate.match(/that/i)) {
        this.userAnswer = this.oldAnswer;
      }

    else if (speechResult.action === 'delete'
      && predicate === 'everything') {
      this.userAnswer = "";
    }

    else if (speechResult.action === 'navigate') {

      if (predicate.match(/.*next.*/i)) {
        this.displayNextQuestion();
      }
      else if (predicate.match(/.*check.*answer.*/i)) {
        this.gradeAnswer(this.userAnswer);
      }
      else if (predicate.match(/.*tutorials?/i)) {
        this.navigationService.languagesMenuNavigator(this.language.nombre);
      }
      else if (predicate.match(/.*main content/i)) {
        this.skipToMain3.nativeElement.click();
      }
    }
    else { console.log("Tutorial Component: The voice command was not recognized"); }
  }

  removeHassleWords(predicate: string): string {
    //Removing the words "an", "a", and "the" from the beginning of 
    if (predicate.startsWith("an ")) {
      return predicate = predicate.replace("an ", "").trim();
    }
    else if (predicate.startsWith("a ")) {
      return predicate = predicate.replace("a ", "").trim();
    }
    else if (predicate.startsWith("the ")) {
      return predicate = predicate.replace("the ", "").trim();
    }
    if (predicate.match("one")) {
      if (predicate.startsWith("one "))
        predicate = predicate.replace("one ", "1 ");
      if (predicate.match(" one "))
        predicate = predicate.replace(" one ", " 1 ");
      if (predicate.match(" one"))
        predicate = predicate.replace(" one", " 1");
    }

    if (predicate.match("two")) {
      if (predicate.startsWith("two "))
        predicate = predicate.replace("two ", "2 ");
      if (predicate.match(" two "))
        predicate = predicate.replace(" two ", " 2 ");
      if (predicate.match(" two"))
        predicate = predicate.replace(" two", " 2");
    }

    if (predicate.match("three")) {
      if (predicate.startsWith("three "))
        predicate = predicate.replace("three ", "3 ");
      if (predicate.match(" three "))
        predicate = predicate.replace(" three ", " 3 ");
      if (predicate.match(" three"))
        predicate = predicate.replace(" three", " 3");
    }

    //continues  integers...
    if (predicate.match("four")) {
      if (predicate.startsWith("four "))
        predicate = predicate.replace("four ", "4 ");
      if (predicate.match(" four "))
        predicate = predicate.replace(" four ", " 4 ");
      if (predicate.match(" four"))
        predicate = predicate.replace(" four", " 4");
    }

    if (predicate.match("five")) {
      if (predicate.startsWith("five "))
        predicate = predicate.replace("five ", "5 ");
      if (predicate.match(" five "))
        predicate = predicate.replace(" five ", " 5 ");
      if (predicate.match(" five "))
        predicate = predicate.replace(" five", " 5");
    }

    if (predicate.match("six")) {
      if (predicate.startsWith("six "))
        predicate = predicate.replace("six ", "6 ");
      if (predicate.match(" six "))
        predicate = predicate.replace(" six ", " 6 ");
      if (predicate.match(" six"))
        predicate = predicate.replace(" six", " 6");
    }

    if (predicate.match("seven")) {
      if (predicate.startsWith("seven "))
        predicate = predicate.replace("seven ", "7 ");
      if (predicate.match(" seven "))
        predicate = predicate.replace(" seven ", " 7 ");
      if (predicate.match(" seven"))
        predicate = predicate.replace(" seven", " 7");
    }

    if (predicate.match("eight")) {
      if (predicate.startsWith("eight "))
        predicate = predicate.replace("eight ", "8 ");
      if (predicate.match(" eight "))
        predicate = predicate.replace(" eight ", " 8");
      if (predicate.match(" eight"))
        predicate = predicate.replace(" eight", " 8");
    }

    if (predicate.match("nine")) {
      if (predicate.startsWith("nine "))
        predicate = predicate.replace("nine ", "9 ");
      if (predicate.match(" nine "))
        predicate = predicate.replace(" nine ", " 9 ");
      if (predicate.match(" nine"))
        predicate = predicate.replace(" nine", " 9");
    }
    else return predicate;
  }

  ngOnDestroy() {
    this.voiceSubscription.unsubscribe()
  }
}


