import { Component, OnInit } from '@angular/core';
import { fromEventPattern } from 'rxjs';
import { SpeechRecognitionService } from '../shared/services/web-apis/speech-recognition.service';
import { Observable } from 'rxjs';
import { SpeechResults } from '../shared/models/speech-results'
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-speech',
  templateUrl: './speech.component.html',
  styleUrls: ['./speech.component.css']
})
export class SpeechComponent implements OnInit {

  //Usado para probar el componente con strings (ver branch 1)
  // transcript?: Observable<string>;
  
  speechResults: SpeechResults;
  
  constructor(public speechRecognition: SpeechRecognitionService) { }

  ngOnInit(): void {
    this.speechRecognition.initialize();
    //this.captureText();
    this.speechRecognition.statement.subscribe( e => console.log("statement subscription from speech " , e));
    //this.transcript.subscribe(e =>{
   //   console.log("transcript subscription from speech " , e)
   // }); 
  }
  start():void {
    this.speechRecognition.start(); 
  }

  stop():void {
    this.speechRecognition.stop(); 
  }
  //captureText(): void { 
  //   this.speechRecognition.statement.subscribe(this.speechResults);
 
  //   console.log("transcript", this.speechResults);
  // }
}

