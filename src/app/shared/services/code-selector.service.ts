/**Code Selector
 * code-selector.service.ts
 * This service chooses the programming language rules for the tutorial component
 */
import { Injectable } from '@angular/core';
import { CSharpRulesService } from './language-rules/c-sharp-rules.service';

@Injectable({
  providedIn: 'root'
})
export class CodeSelectorService {

  constructor(
    public cSharp: CSharpRulesService
  ) { }
//This function recieves the predicate and language name from the tutorial component
  select(language: string, predicate: string): string {
    switch(language){
      case("C#"): 
        return this.cSharp.voiceCodeWriter(predicate);
        break;
    }
  }
}
