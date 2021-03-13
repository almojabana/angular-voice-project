import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared/shared.module';
import { SpeechModule} from './speech/speech.module';
import { TutorialsMenuComponent } from './tutorials-menu/tutorials-menu.component';
import { QuestionComponent } from './question/question.component';
import { TopNavigationComponent } from './top-navigation/top-navigation.component'; 

@NgModule({
  declarations: [
    AppComponent,
    TutorialsMenuComponent,
    QuestionComponent,
    TopNavigationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    SharedModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
