import { Component, OnInit } from '@angular/core';
import { fromEventPattern } from 'rxjs';
import { SpeechRecognitionService } from '../shared/services/web-apis/speech-recognition.service';
import { Observable } from 'rxjs'; 
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-speech',
  templateUrl: './speech.component.html',
  styleUrls: ['./speech.component.css']
})
export class SpeechComponent implements OnInit {

  transcript?: Observable<string>; 

  constructor(public speechRecognition: SpeechRecognitionService) { }

  ngOnInit(): void {
    this.speechRecognition.initialize();
    this.captureText();  
  }
  start():void {
    this.speechRecognition.start(); 
  }

  stop():void {
    this.speechRecognition.stop(); 
  }
  captureText(): void {
    console.log("component initialized"); 
    this.transcript = this.speechRecognition.onResult()//.pipe(
  //    map((notification) => {
  //      console.log(`notification 1${notification}`);
  //      return notification;}));
    console.log("transcript", this.transcript);
  }
}

