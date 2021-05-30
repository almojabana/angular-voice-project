//Tutorials Menu Component (tutorial.component.ts) Manages the list of tutorials for each language
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Tutorial } from '../shared/models/tutorial';
import { TutorialsMenuService } from '../shared/services//tutorials-menu.service';
import { Language } from '../shared/models/language2';
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

  //lifecycle hook called when the component is initialized
  ngOnInit(): void {
    //gets the skip link's url
    this.mainContentSkipLink2 =
      this.route.snapshot.url
        .toString()
        .replace(",", "/") + "#main-content2";;
    this.getTutorials();
    this.getLanguageName(); 
    //subscribes to the speech service
    this.voiceSubscription = this.speechRecognition.statement.subscribe(command => {
      //captures the speech object to be processed
    this.captureVoiceCommand(command);
    }); 
  }
 //subscribes to the getTutorials function in the retrieval service.
 //It gets the language by its ID
  getTutorials(): void {
    const languageID = this.route.snapshot.paramMap.get('languageID');
    this.tutorialsMenuService.getTutorials(languageID).subscribe(tutorials => {
      this.tutorials = tutorials
    });
  }

  //Gets tha language's name in order to set the title of the page
  getLanguageName(): void {
    const languageID = this.route.snapshot.paramMap.get('languageID');
    this.language = this.tutorialsMenuService.getLanguageName(languageID);
    this.setTitle(this.tutorialsMenuService.getLanguageName(languageID).name + " Tutorials")
    
  }
  //Captures the SpeechResults Object
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

  //Changes the title of the page 
  setTitle(title:string){
    this.titleService.setTitle(title); 
  }

 //Unsuscribes from services when the user leaves the component
  ngOnDestroy() {
    this.voiceSubscription.unsubscribe()
}

}
