import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LanguagesMenuComponent} from './languages-menu/languages-menu.component'; 
import { TutorialsMenuComponent } from './tutorials-menu/tutorials-menu.component';
import { TutorialComponent } from './tutorial/tutorial.component'; 

 
const routes: Routes = [
  { path: '', redirectTo: '/languages-menu', pathMatch: 'full' },
  { path: 'languages-menu', component: LanguagesMenuComponent},
  { path: 'language-tutorials/:languageID', component: TutorialsMenuComponent},
  { path: 'tutorial-questions/:tutorialID', component: TutorialComponent }, 
  // Brainstorm idea from tutorialService { path: 'tutorial-questions/:tutorialID/question/:questionID', component: QuestionComponent }, 

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
