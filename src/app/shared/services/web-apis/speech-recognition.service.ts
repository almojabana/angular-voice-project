/**
 * SpeechRecognitionService class
 * This class provides a service for accessing the WebSpeech API 
 * and capturing the user's voice transcript.
 */
import { Injectable, NgZone } from '@angular/core';
import { merge, Observable, Subject } from 'rxjs';
import { SpeechResults } from '../../models/speech-results';

//Force Angular to recognize webkitSpeechRecogntion 
//that exists in the browser window
declare var webkitSpeechRecognition: any;
declare var webkitSpeechGrammarList: any;

@Injectable({
  providedIn: 'root'
})

export class SpeechRecognitionService {
  //Class properties
  recognition = new webkitSpeechRecognition();
  grammar = '#JSGF V1.0;grammar keywords; public <keyword> = write | false | true;';
  speechRecognitionList = new webkitSpeechGrammarList();
  isListening = false;
  statement: Subject<SpeechResults> = new Subject<SpeechResults>();

  //Defines three main contexts for the application: 
  //writing, deleting, and navigating
  navigateCommands: string[] = ['navigate to', 'go to', 'press'];
  writeCommands: string[] = ['write ', 'insert ', 'declare', 'initialize', 'answer', 'right', 'great', 'mike', 'rite aid', 'bright', 'wrecked'];
  deleteCommands: string[] = ['delete', 'erase', 'remove', 'undo'];


  constructor(private ngZone: NgZone) { }
  /**
   * Sets up the Speech recognizer's options
   */
  initialize(): void {
    this.speechRecognitionList.addFromString(this.grammar, 1);
    this.recognition.grammars = this.speechRecognitionList;
    this.recognition.lang = 'en-US';
    this.recognition.continuous = true;
    this.recognition.interimResults = false;

    this.onResult().subscribe(this.statement);
    this.onEnd().subscribe();
    //this.recognition.maxAlternatives = 2; 
    console.log("Speech recognition initialized");
  }
  /**
   * Starts the speech recognition service to listen to the user.
   */
  start(): void {
    if (this.isListening) {
      console.log("Speech recognition has been activated.",
        this.isListening)
      // this.stop();
    }
    else {
      this.isListening = true;
      this.recognition.start();
      console.log(this.recognition);
    }
  }

  /**
   * Stops the recognizer from listening
   */
  stop(): void {
    this.isListening = false;
    this.recognition.stop();
    console.log("Speech recognition stopped");
  }

  /**
   * Manages the results array continually received from the speech recognizer
   * The transcript of the final result processed to capture the voice command
   * @returns an observable SpeechResult 
   */
  onResult(): Observable<SpeechResults> {
    return new Observable(observer => {
      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalString = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalString += event.results[i][0].transcript;
            this.ngZone.run(() => observer.next(
              this.captureSpeechResult(finalString.toLowerCase())));
          }
        }
      }
    });
  }
//Event handler for looping the voice service when it shuts down due to timeout
  onEnd(): Observable<boolean> {
    return new Observable(observer => {
      this.recognition.onend = () => {
        console.log("Service ended.");
        // observer.next(false);
        if(this.isListening == true){
          console.log("SPEECH RECOGNITION AUTO SHUT DOWN! Restarting...");
          this.isListening = false;
          this.start();
        }
      }
    });
  }

  /**
   * Captures the voice command and divides it into a main context 
   * (navigate, write, edit) and a predicate.
   * @param finalString 
   * @returns a SpeechResult 
   */
  captureSpeechResult(finalString: string): SpeechResults {
    let action = "no action";
    let predicate = "no predicate";
    let words = finalString.trim();

    console.log("finalstring from service: ", finalString)
    this.navigateCommands.forEach(element => {
      if (words.startsWith(element)) {
        action = "navigate";
        predicate = finalString.split(element)[1].trim();
      }
    });

    this.writeCommands.forEach(element => {
      if (words.startsWith(element)) {
        action = "write";
        predicate = finalString.split(element)[1].trim();
      }
    });

    this.deleteCommands.forEach(element => {
      if (words.startsWith(element)) {
        action = "delete";
        predicate = finalString.split(element)[1].trim();
      }
    });

    return { action, predicate };

  }

}

