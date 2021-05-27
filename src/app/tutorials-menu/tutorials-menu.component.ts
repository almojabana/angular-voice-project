import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Tutorial } from '../shared/models/tutorial';
import { TutorialsMenuService } from '../shared/services//tutorials-menu.service';
import { Language } from '../shared/models/language';
import { VoiceNavigationService } from '../shared/services/voice-navigation.service';
import { SpeechRecognitionService } from '../shared/services/web-apis/speech-recognition.service';
import { SpeechResults } from '../shared/models/speech-results';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

@Component({ 
  selector: 'app-tutorials-menu',
  templateUrl: './tutorials-menu.component.html',
  styleUrls: ['./tutorials-menu.component.css']
})
export class TutorialsMenuComponent implements OnInit {
  tutorials: Array<Tutorial[]>; 
  language: Language; 
  mainContentSkipLink2: string;
  @ViewChild('skipToMain2') skipToMain2: ElementRef;
  voiceSubscription: Subscription;
  
  constructor(
    private route: ActivatedRoute,
    private tutorialsMenuService: TutorialsMenuService,
    public speechRecognition: SpeechRecognitionService,
    private navigationService: VoiceNavigationService,
    private titleService: Title
  ) { } 

  ngOnInit(): void {
    this.mainContentSkipLink2 =
      this.route.snapshot.url
        .toString()
        .replace(",", "/") + "#main-content2";;
    this.getTutorials();
    this.getLanguageName(); 
    this.voiceSubscription = this.speechRecognition.statement.subscribe(command => {
    this.captureVoiceCommand(command);
    }); 
  }
 
  getTutorials(): void {
    const languageID = this.route.snapshot.paramMap.get('languageID');
    this.tutorialsMenuService.getTutorials(languageID).subscribe(tutorials => {
      this.tutorials = tutorials
    });
  }
  getLanguageName(): void {
    const languageID = this.route.snapshot.paramMap.get('languageID');
    this.language = this.tutorialsMenuService.getLanguageName(languageID);
    this.setTitle(this.tutorialsMenuService.getLanguageName(languageID).name + " Tutorials")
    
  }
  captureVoiceCommand(results:SpeechResults): void  { 
    var userAction = results.action; 
    var userPredicate = results.predicate.trim();
     
    if (userAction === 'navigate') {
      if (userPredicate.match(/.*main content/i)) 
        this.skipToMain2.nativeElement.click();
      else 
        this.navigationService.tutorialsMenuNavigator(results.predicate, this.tutorials); 
    }
    
  } 

  setTitle(title:string){
    this.titleService.setTitle(title); 
  }

  ngOnDestroy() {
    this.voiceSubscription.unsubscribe()
}
  // getTutorialName(predicate : string): String {
  //   this.tutorials.filter(tutorial.)
  //   return n; 

  // }
}
