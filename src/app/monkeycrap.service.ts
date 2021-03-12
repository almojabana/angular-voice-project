import { Injectable } from '@angular/core';
import { AppWindow } from './app-window';
// tslint:disable-next-line:no-any
const { webkitSpeechRecognition }: AppWindow = (window as any) as AppWindow;
//var webkitSpeechRecognition :any; 
@Injectable({
  providedIn: 'root'
})
export class MonkeycrapService {
//defines property of the WebSpeechAPI's SpeechRecognition interface
recognition: SpeechRecognition;
listening : boolean = false; 
constructor() { }

initialize():void {
  this.recognition = new webkitSpeechRecognition(); 
  this.recognition.lang = 'en-US'; 
  this.recognition.interimResults = true; 
  this.recognition.continuous = true;
  console.log("initialized" + this.listening);  
}

speechRecognitionStart() : void {
  if (this.listening){
    this.recognition.stop(); 
    this.listening = false; 
  }
 else { this.recognition.start(); 
  this.listening = true; 
  console.log("started" + this.listening);
 }
}

speechRecognitionStop() : void {
  this.recognition.stop();
  this.listening = false; 
  console.log("stopped" + this.listening);
}
 
}
