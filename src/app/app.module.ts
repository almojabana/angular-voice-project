import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared/shared.module';
import { TutorialsMenuComponent } from './tutorials-menu/tutorials-menu.component';
import { QuestionComponent } from './question/question.component';
import { TopNavigationComponent } from './top-navigation/top-navigation.component';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { SpeechComponent } from './speech/speech.component'; 
import { TutorialComponent } from './tutorial/tutorial.component';
import { LanguagesMenuComponent } from './languages-menu/languages-menu.component';

@NgModule({
  declarations: [
    AppComponent,
    TutorialsMenuComponent,
    QuestionComponent,
    TopNavigationComponent,
    SpeechComponent,
    TutorialComponent,
    LanguagesMenuComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    SharedModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule, 
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
