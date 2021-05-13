import { Component, OnInit } from '@angular/core';
import { Language } from '../shared/models/language'; 
import { LanguagesMenuService } from '../shared/services/languages-menu.service';
import { VoiceNavigationService} from '../shared/services/voice-navigation.service'; 
import { SpeechResults } from '../shared/models/speech-results';
import { SpeechRecognitionService } from '../shared/services/web-apis/speech-recognition.service';

@Component({
  selector: 'app-languages-menu',
  templateUrl: './languages-menu.component.html',
  styleUrls: ['./languages-menu.component.css']
})
export class LanguagesMenuComponent implements OnInit {
  languages: Language[]; 
  userAction: string;
  userPredicate: string;

  constructor( 
    private languagesMenuService : LanguagesMenuService,
    private speechRecognition: SpeechRecognitionService,
    private navigationService: VoiceNavigationService
    ) { }

  ngOnInit(): void {
    this.getLanguages();
    this.speechRecognition.statement.subscribe( e =>  { 
      console.log("statement subscription from speech service " , e);
       this.captureResult(e);   
    });
  }

  captureResult(results:SpeechResults): void  { 
    this.userAction = results.action; 
    console.log("action: ", this.userAction);

    this.userPredicate = results.predicate.trim(); 
    console.log("predicate: ", this.userPredicate)

    if (this.userAction === 'navigate') {
      this.navigationService.languagesMenuNavigator(this.userPredicate); 
    }
  }
 
  getLanguages() {
    console.log( "this is returned from langmenu service: " , 
    this.languagesMenuService.getLanguages().subscribe(languages =>this.languages = languages)); 
    this.languages.sort((a,b) => a.name > b.name ? 1 : -1); 
  } 

}
