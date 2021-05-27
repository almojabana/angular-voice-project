import { Component, ElementRef, OnInit, setTestabilityGetter, ViewChild } from '@angular/core';
import { Language } from '../shared/models/language'; 
import { LanguagesMenuService } from '../shared/services/languages-menu.service';
import { VoiceNavigationService} from '../shared/services/voice-navigation.service'; 
import { SpeechResults } from '../shared/models/speech-results';
import { SpeechRecognitionService } from '../shared/services/web-apis/speech-recognition.service';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-languages-menu',
  templateUrl: './languages-menu.component.html',
  styleUrls: ['./languages-menu.component.css']
})
export class LanguagesMenuComponent implements OnInit {
  languages: Language[]; 
  userAction: string;
  userPredicate: string;
  mainContentSkipLink: string; 
  @ViewChild('skipToMain1') skipToMain1: ElementRef;
  voiceSubscription: Subscription

  constructor( 
    private languagesMenuService : LanguagesMenuService,
    private speechRecognition: SpeechRecognitionService,
    private navigationService: VoiceNavigationService,
    private titleService: Title, 
    private route: ActivatedRoute
    ) { } 

  ngOnInit(): void {
    this.getLanguages();
    this.voiceSubscription = this.speechRecognition.statement.subscribe( e =>  { 
      console.log("statement subscription from speech service " , e);
       this.captureResult(e); 
    });
    this.mainContentSkipLink =
      this.route.snapshot.url
        .toString()
        .replace(",", "/") + "#main-content1";
    this.setTitle("Languages")
  }

  captureResult(results:SpeechResults): void  { 
    this.userAction = results.action; 
    console.log("action: ", this.userAction);

    this.userPredicate = results.predicate.trim(); 
    console.log("predicate: ", this.userPredicate)

    if (this.userAction === 'navigate') {
      if (this.userPredicate.match(/.*main content/i)) {
        this.skipToMain1.nativeElement.click();
      }
      else this.navigationService.languagesMenuNavigator(this.userPredicate);
    }
  }
 
  getLanguages() {
    console.log( "this is returned from langmenu service: " , 
    this.languagesMenuService.getLanguages().subscribe(languages =>this.languages = languages)); 
    this.languages.sort((a,b) => a.name > b.name ? 1 : -1); 
  } 

  setTitle(title:string){
    this.titleService.setTitle(title); 
  }

  ngOnDestroy() {
    this.voiceSubscription.unsubscribe()
}

}
