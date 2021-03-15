import { Component, OnInit } from '@angular/core';
import { SpeechRecognitionService } from '../shared/services/web-apis/speech-recognition.service';

@Component({
  selector: 'app-speech',
  templateUrl: './speech.component.html',
  styleUrls: ['./speech.component.css']
})
export class SpeechComponent implements OnInit {

  constructor(private speechRecognition: SpeechRecognitionService) { }

  ngOnInit(): void {
    this.speechRecognition.initialize();
  }
  start():void {
    this.speechRecognition.start(); 
  }

  stop():void {
    this.speechRecognition.stop(); 
  }
}

