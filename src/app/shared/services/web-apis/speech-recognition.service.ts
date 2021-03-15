import { Injectable } from '@angular/core';
declare var webkitSpeechRecognition: any;
@Injectable({
  providedIn: 'root'
})


export class SpeechRecognitionService {
  recognition =  new webkitSpeechRecognition();
  isListening = false; 
  constructor() { }

  initialize(): void {
      this.recognition.lang = 'en-US';
      this.recognition.continuous = true; 
      this.recognition.interimResults = true; 
      console.log("Speech recognition intialized");
  }

  start(): void {
    this.isListening = true; 
    this.recognition.start();
    console.log("Speech recognition started");
  }

  stop(): void {
    this.isListening = false; 
    this.recognition.stop();
    console.log("Speech recognition stopped"); 
  }

}

