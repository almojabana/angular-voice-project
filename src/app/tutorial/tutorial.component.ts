import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs'; 
import { SpeechRecognitionService } from '../shared/services/web-apis/speech-recognition.service';
import { SpeechResults } from '../shared/models/speech-results';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.css']
})

export class TutorialComponent implements OnInit {
  speechResults: SpeechResults;

  constructor(public speechRecognition:SpeechRecognitionService) { }

   ngOnInit(): void {
    this.speechRecognition.statement.subscribe( e => console.log("statement subscription from tutorial " , e))
  //   this.captureText(); 
  //   this.transcript.subscribe(e =>{
  //     console.log("transcript subscription from tutorial " , e)
  //   }); 
   }
  // captureText(): void {
  //   console.log("component initialized"); 
  //   this.transcript = this.speechRecognition.onResult();//.pipe(
  // //    map((notification) => {
  // //      console.log(`notification 1${notification}`);
  // //      return notification;}));
  //   console.log("transcript from tutorial", this.transcript);
  // }
}
