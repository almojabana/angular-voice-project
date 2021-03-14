import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TutorialsMenuComponent } from './tutorials-menu/tutorials-menu.component';
import { TutorialComponent } from './tutorial/tutorial.component'; 


const routes: Routes = [
  { path: '', redirectTo: '/language-tutorials', pathMatch: 'full' },
  { path: 'language-tutorials', component: TutorialsMenuComponent},
  { path: 'tutorial/:id', component: TutorialComponent }, 

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
