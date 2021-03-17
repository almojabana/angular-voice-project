import { NgIfContext } from '@angular/common';
import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';
declare var webkitSpeechRecognition: any;
@Injectable({
  providedIn: 'root'
})


export class SpeechRecognitionService {
  recognition = new webkitSpeechRecognition();
  isListening = false;
  statement:  Subject<string> = new Subject<string>();

  constructor(private ngZone: NgZone) { }

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
    this.onResult().subscribe(this.statement);
  }

  stop(): void {
    this.isListening = false;
    this.recognition.stop();
    console.log("Speech recognition stopped");
  }

  onResult(): Observable<string> {
    return new Observable(observer => {
      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        console.log("Speech recognition service onresult", event);
        let words = " ";
        let tempWords = " ";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            words += event.results[i][0].transcript;
            this.ngZone.run(() => observer.next(words));
            //crazyfuntion(words): <SpeechResult>
          }
          else {
            tempWords += event.results[i][0].transcript;
            this.ngZone.run(() => observer.next(tempWords))
          }
        }
        console.log(`words: ${words}`);
        console.log("tempwords", tempWords);
      }
    }
    );
  }

}

