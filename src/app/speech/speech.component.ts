import { Component, OnInit } from '@angular/core';
import { merge, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { SpeechRecognitionService } from '../shared/services/web-apis/speech-recognition.service';

@Component({
  selector: 'app-speech',
  templateUrl: './speech.component.html',
  styleUrls: ['./speech.component.css']
})
export class SpeechComponent implements OnInit {
  textResult: string;
  transcript$?: Observable<string>;
  listening$?: Observable<boolean>;
  errorMessage$?: Observable<string>;
  constructor(private speechRecognition: SpeechRecognitionService) { }

  ngOnInit(): void {
    this.speechRecognition.initialize();
    this.initRecognition();

    this.transcript$.subscribe(evt => {
      console.log(evt)
    });
    this.listening$.subscribe(evt => console.log(evt));
  }
  start(): void {
    this.speechRecognition.start();
  }

  stop(): void {
    this.speechRecognition.stop();
  }

  private initRecognition(): void {
    console.log("initRecognition()");

    // "transcript$" now will receive every text(interim result) from the Speech API.
    // Also, for every "Final Result"(from the speech), the code will append that text to the existing Text Area component.
    this.transcript$ = this.speechRecognition.onResult().pipe(
      map((notification) => {
        console.log(notification);
        this.textResult = notification;
        return notification;
        // if (notification.event === SpeechEvent.FinalContent) {
        //   this.totalTranscript = this.totalTranscript
        //     ? `${this.totalTranscript}\n${notification.content?.trim()}`
        //     : notification.content;
        // }
      })
    );

    // "listening$" will receive 'true' when the Speech API starts and 'false' when it's finished.
    this.listening$ = merge(
      this.speechRecognition.onStart(),
      this.speechRecognition.onEnd()
    ).pipe(
      map((notification) => {
        console.log(notification);
        return true;
      })
    );

    // // "errorMessage$" will receive any error from Speech API and it will map that value to a meaningful message for the user
    this.errorMessage$ = this.speechRecognition.onError().pipe(
      map((data) => {
        console.log(data, "ERROR");
        return data;
      })
    );
  }
}

