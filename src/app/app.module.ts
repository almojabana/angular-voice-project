import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared/shared.module';
import { WebSpeechModule } from './web-speech/web-speech.module';
import { TutorialsMenuComponent } from './tutorials-menu/tutorials-menu.component';
import { QuestionPageComponent } from './question-page/question-page.component';

@NgModule({
  declarations: [
    AppComponent,
    TutorialsMenuComponent,
    QuestionPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    SharedModule,
    WebSpeechModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
