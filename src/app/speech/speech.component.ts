import { Component, OnInit } from '@angular/core';
import { SpeechRecognitionService } from '../shared/services/web-apis/speech-recognition.service';
import { SpeechResults } from '../shared/models/speech-results'
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-speech',
  templateUrl: './speech.component.html',
  styleUrls: ['./speech.component.css']
})
export class SpeechComponent implements OnInit {

  //Usado para probar el componente con strings (ver branch 1)
  // transcript?: Observable<string>;
  
  userAction: string;
  userPredicate: string; 
  
  constructor(
    public speechRecognition: SpeechRecognitionService,
    private router: Router
    ) { }

  ngOnInit(): void {
    this.speechRecognition.initialize();
    this.speechRecognition.statement.subscribe( e =>  { 
      console.log("statement subscription from speech service " , e);
       this.captureResult(e);   
    });
  }

  start():void {
    this.speechRecognition.start(); 
  }

  stop():void {
    this.speechRecognition.stop(); 
  }

  captureResult(results:SpeechResults): void  { 
    this.userAction = results.action; 
    console.log("action: ", this.userAction);

    this.userPredicate = results.predicate.trim(); 
    console.log("predicate: ", this.userPredicate)

    if (this.userAction === 'navigate') {
      this.navigator(this.userPredicate); 
    }
  }

  navigator(link:string) : void {
    switch (link) {
      case 'languages menu':
        this.router.navigate(['/languages-menu']);
        break;
      case 'see tutorials':
        this.router.navigate(['/language-tutorials/1']); 
        break;
      case 'Java tutorial': 
      case 'Java tutorials': 
        this.router.navigate(['/language-tutorials/6']);
        break;
    }
  }
}

