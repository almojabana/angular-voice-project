import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Tutorial } from '../shared/models/tutorial';
import { TutorialsMenuService } from '../shared/services//tutorials-menu.service';
import { Language } from '../shared/models/language';
import { VoiceNavigationService } from '../shared/services/voice-navigation.service';
import { SpeechRecognitionService } from '../shared/services/web-apis/speech-recognition.service';
import { SpeechResults } from '../shared/models/speech-results';

@Component({
  selector: 'app-tutorials-menu',
  templateUrl: './tutorials-menu.component.html',
  styleUrls: ['./tutorials-menu.component.css']
})
export class TutorialsMenuComponent implements OnInit {
  tutorials: Array<Tutorial[]>;
  language: Language; 
  skipLink: string; 
  userAction: string;
  userPredicate: string; 
  
  constructor(
    private route: ActivatedRoute,
    private tutorialsMenuService: TutorialsMenuService,
    public speechRecognition: SpeechRecognitionService,
    private navigationService: VoiceNavigationService,
  ) { } 

  ngOnInit(): void {
    this.skipLink = this.route.url.toString()+"#main-content";
    this.getTutorials();
    this.getLanguageName(); 
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
    
  }

  captureResult(results:SpeechResults): void  { 
    this.userAction = results.action; 
    console.log("action: ", this.userAction);

    this.userPredicate = results.predicate.trim(); 
    console.log("predicate: ", this.userPredicate)

    // if (this.userAction === 'navigate') {
    //   this.navigationService.tutorialsMenuNavigator(this.getTutorialName(this.userPredicate)); 
    //}
  }

  // getTutorialName(predicate : string): String {
  //   this.tutorials.filter(tutorial.)
  //   return n; 

  // }
}
