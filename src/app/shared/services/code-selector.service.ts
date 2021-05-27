import { Injectable } from '@angular/core';
import { CSharpRulesService } from './language-rules/c-sharp-rules.service';

@Injectable({
  providedIn: 'root'
})
export class CodeSelectorService {

  constructor(
    public cSharp: CSharpRulesService
  ) { }

  select(language: string, predicate: string): string {
    switch(language){
      case("C#"): 
        return this.cSharp.voiceCodeWriter(predicate);
        break;
    }
  }
}
