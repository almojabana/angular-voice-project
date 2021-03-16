import { findLast } from '@angular/compiler/src/directive_resolver';
import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
declare var webkitSpeechRecognition: any;
// import { AppWindow } from '../../model/app-window';
// tslint:disable-next-line:no-any
// const { webkitSpeechRecognition }: AppWindow = (window as any) as AppWindow;
@Injectable({
  providedIn: 'root'
})


export class SpeechRecognitionService {
  recognition: SpeechRecognition;
  isListening = false;
  constructor(private ngZone: NgZone) { }

  initialize(): void {
    this.recognition = new webkitSpeechRecognition();
    console.log("RECOGNITION:", this.recognition)
    this.recognition.lang = 'en-US';
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    console.log("Speech recognition intialized");
  }

  start(): void {
    this.recognition.start();
    this.isListening = true;
    console.log("Speech recognition started");
  }

  stop(): void {
    this.isListening = false;
    this.recognition.stop();
    console.log("Speech recognition stopped");
  }

  onStart(): Observable<string> {
    if (!this.recognition) {
      this.initialize();
    }

    return new Observable(observer => {

      this.recognition.onstart = () => {
        this.ngZone.run(() => {
          console.log("Speech recognition onstart");
          observer.next("listening");
        });
      };
    });
  }

  onEnd(): Observable<string> {
    return new Observable(observer => {

      this.recognition.onend = () => {
      //  this.ngZone.run(() => {
          console.log("Speech recognition onend");
          observer.next("finish");

          this.isListening = false;
      //  });
      };
    });
  }

  onResult(): Observable<string> {

    return new Observable(observer => {
      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        console.log("Speech recognition onresult", event);

        let interimContent = '';
        let finalContent = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalContent += event.results[i][0].transcript;
            this.ngZone.run(() => {
              observer.next(
               finalContent);
            });
            console.log(`final content:${finalContent}`);
          } 
          else {
            interimContent += event.results[i][0].transcript;
            this.ngZone.run(() => { 
              observer.next(interimContent);
            });
            console.log(`interim content:${interimContent}`);
          }
        }
      };
    });
  }

  onError(): Observable<string> {
    return new Observable(observer => {

      this.recognition.onerror = (event) => {
        const eventError: string = (event as any).error;
        console.log("Speech recognition onerror", eventError);

        // let error: SpeechError;
        // switch (eventError) {
        //   case 'no-speech':
        //     error = SpeechError.NoSpeech;
        //     break;
        //   case 'audio-capture':
        //     error = SpeechError.AudioCapture;
        //     break;
        //   case 'not-allowed':
        //     error = SpeechError.NotAllowed;
        //     break;
        //   default:
        //     error = SpeechError.Unknown;
        //     break;
        // }
        this.ngZone.run(() => {
          observer.next(eventError);
        });
      };
    });
  }

}

// export interface AppWindow extends Window {
//   // tslint:disable-next-line:no-any
//   webkitSpeechRecognition: any;
// }