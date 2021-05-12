import { Component, OnInit } from '@angular/core';
import { SpeechRecognitionService } from '../shared/services/web-apis/speech-recognition.service';
import { SpeechResults } from '../shared/models/speech-results';
import { VoiceNavigationService} from '../shared/services/voice-navigation.service';


@Component({
  selector: 'app-speech',
  templateUrl: './speech.component.html',
  styleUrls: ['./speech.component.css']
})
export class SpeechComponent implements OnInit {

  //Usado para probar el componente con strings (ver branch 1)
  // transcript?: Observable<string>;
  
  userAction: string;
  userPredicate: string; 
  
  constructor(
    public speechRecognition: SpeechRecognitionService,
    private navigationService: VoiceNavigationService,
    ) { }

  ngOnInit(): void {
    this.speechRecognition.initialize();
    this.speechRecognition.statement.subscribe( e =>  { 
       this.captureResult(e);   
    });
  }

  start():void {
    this.speechRecognition.start(); 
  }

  stop():void { 
    this.speechRecognition.stop(); 
  }

  captureResult(results:SpeechResults): void  { 
    this.userAction = results.action; 
    console.log("action: ", this.userAction);

    this.userPredicate = results.predicate.trim(); 
    console.log("predicate: ", this.userPredicate)

    if (this.userAction === 'navigate') {
      this.navigationService.generalNavigator(this.userPredicate); 
    }
    else{;}
  }
} 

