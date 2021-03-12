import { Component, OnInit } from '@angular/core';
import { MonkeycrapService} from '../monkeycrap.service'; 

@Component({
  selector: 'app-web-speech',
  templateUrl: './web-speech.component.html',
  styleUrls: ['./web-speech.component.css']
})
export class WebSpeechComponent implements OnInit {
   
  constructor(private speechservice : MonkeycrapService) { }

  ngOnInit(): void {
    this.speechservice.initialize(); 
  }

  start() : void {
    this.speechservice.speechRecognitionStart(); 
  }

  stop() : void { 
    this.speechservice.speechRecognitionStop(); 
  }
}
