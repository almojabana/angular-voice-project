import { Injectable, ValueProvider } from '@angular/core';
import { Observable } from 'rxjs';

var webkitSpeechRecognition:any; 

@Injectable({
  providedIn: 'root'
})

export class SpeechRecognitionService {
  //defines property of the WebSpeechAPI's SpeechRecognition interface
  recognition:SpeechRecognition
  listening : boolean = false; 
  constructor() { }
  
  initialize():void {
    this.recognition = new webkitSpeechRecognition(); 
    this.recognition.lang = 'en-US'; 
    this.recognition.interimResults = true; 
    this.recognition.continuous = true; 
  }

  speechRecognitionStart() : void {
    this.recognition.start(); 
    this.listening = true; 
  }

  speechRecognitionStop() : void {
    this.recognition.stop();
    this.listening = false; 
  }

}
