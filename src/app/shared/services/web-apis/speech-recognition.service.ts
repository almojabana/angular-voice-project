import { NgIfContext } from '@angular/common';
import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { SpeechResults } from '../../models/speech-results';

declare var webkitSpeechRecognition: any;
@Injectable({
  providedIn: 'root'
})


export class SpeechRecognitionService {
  recognition = new webkitSpeechRecognition();
  isListening = false;
  statement:  Subject<SpeechResults> = new Subject<SpeechResults>();
  navigateCommands : string[] = ['navigate to', 'go to', 'press']; 
  writeCommands: string [] = ['write', 'insert', 'right'];
  deleteCommands: string[] = [ 'delete', 'erase', 'remove'];  
  

  constructor(private ngZone: NgZone) { }

  initialize(): void {
    this.recognition.lang = 'en-US';
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    //this.recognition.maxAlternatives = 2; 
    console.log("Speech recognition intialized");
  }

  start(): void {
    if (this.isListening){
      console.log("isListening", this.isListening)
      this.stop();
    }
    else {
    this.isListening = true;
    this.recognition.start();
    console.log("Speech recognition started");
    this.onResult().subscribe(this.statement); }
  }

  stop(): void {
    this.isListening = false;
    this.recognition.stop();
    console.log("Speech recognition stopped");
  }

  onResult(): Observable<SpeechResults> {
    return new Observable(observer => {
      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        console.log("Speech recognition service onresult", event);
        let finalString = " ";
        //let tempString = " ";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalString += event.results[i][0].transcript;
            this.ngZone.run(() => observer.next(this.speechResult(finalString)));   
          }

          //returns interim results
          //else {
          //  tempString += event.results[i][0].transcript;
          //  this.ngZone.run(() => observer.next(tempString))
         // }
        }
        console.log(`words from speech service: ${finalString}`);
        //console.log("tempwords", tempString);
      }
    }
    );
  }

  speechResult(finalString:string): SpeechResults {
    let action = "no action";
    let predicate =" no predicate"; 
    let words = finalString.trim();

    console.log("finalstring from service: ", finalString)
    this.navigateCommands.forEach(element => {
      console.log("element from navigate commands array: ", element);
      console.log("element matches in navigate commands array:", words.startsWith(element))
      if(words.startsWith(element)){
        action = "navigate";
        predicate = finalString.split(element)[1];
        }
    });

    this.writeCommands.forEach(element => {
      console.log("element from write commands array: ", element);
      console.log("element matches in write commands array:", words.startsWith(element))
      if(words.startsWith(element)){
        action = "write";
        predicate = finalString.split(`${element} `)[1];
        }
    });

    this.deleteCommands.forEach(element => {
      console.log("element from write commands array: ", element);
      console.log("element matches in write commands array:", words.startsWith(element))
      if(words.startsWith(element)){
        action = "delete";
        predicate = finalString.split(`${element} `)[1];
        }
    });

    return {action, predicate}; 

  }

}

