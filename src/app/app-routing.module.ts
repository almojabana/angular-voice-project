import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LanguagesMenuComponent} from './languages-menu/languages-menu.component'; 
import { TutorialsMenuComponent } from './tutorials-menu/tutorials-menu.component';
import { TutorialComponent } from './tutorial/tutorial.component'; 


const routes: Routes = [
  { path: '', redirectTo: '/languages-menu', pathMatch: 'full' },
  { path: 'languages-menu', component: LanguagesMenuComponent},
  { path: 'language-tutorials/:languageName', component: TutorialsMenuComponent},
  { path: 'tutorial-questions/:tutorialID', component: TutorialComponent }, 

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
