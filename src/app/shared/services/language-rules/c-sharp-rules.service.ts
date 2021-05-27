import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CSharpRulesService {
  constructor() { }

  voiceCodeWriter(predicate: string): string {
    //the original predicate is saved for debugging purposes
    let tempPredicate = predicate;
    tempPredicate = this.replaceHassleWords(tempPredicate);

    //command for writing public static method signatures
    //Avoid using method names that contain reserved words like bool, dobule, or integer
    //The matchtype funtion is does not take positioning into account
    tempPredicate = this.checkIfForLoop(tempPredicate);
    if (tempPredicate.match(/a?\s?public.* method name[d]?/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = this.matchType(tempPredicate);
      tempPredicate = tempPredicate.replace(/method name[d]?/i, "pascal case");
      tempPredicate = this.pascalCasing(tempPredicate);
    }
    else if (tempPredicate.match(/a?\s?first.*parameter name[d]?/i)) {
      tempPredicate = tempPredicate.replace(/a?\s?first/, "(");
      tempPredicate = this.matchType(tempPredicate);
      tempPredicate = tempPredicate.replace(/parameter name[d]?/i, "camelcase");
      tempPredicate = this.camelCasing(tempPredicate);
    }
    else if (tempPredicate.match(/a?\s?last.*parameter name[d]?/i)) {
      tempPredicate = this.replaceHassleWords(tempPredicate);
      tempPredicate = tempPredicate.replace(/a?\s?last/, ",");
      tempPredicate = this.matchType(tempPredicate);
      tempPredicate = tempPredicate.replace(/parameter name[d]?/i, "camelcase");
      tempPredicate = this.camelCasing(tempPredicate) + ")";
    }
    else if (tempPredicate.match(/another.*parameter name[d]?/i)) {
      tempPredicate = this.replaceHassleWords(tempPredicate);
      tempPredicate = tempPredicate.replace("another", " , ");
      tempPredicate = this.matchType(tempPredicate);
      tempPredicate = tempPredicate.replace(/parameter name[d]?/i, "camelcase");
      tempPredicate = this.camelCasing(tempPredicate)
    }
    else if (tempPredicate.match(/parameter name[d]?/i)) {
      tempPredicate = this.replaceHassleWords(tempPredicate);
      tempPredicate = this.matchType(tempPredicate);
      tempPredicate = tempPredicate.replace(/parameter name[d]?/i, "camelcase");
      tempPredicate = "(" + this.camelCasing(tempPredicate) + ")"
    }

    //Managing declaration of constants
    else if (tempPredicate.match(/constant integer (?:type )?name[d]?[s]?.*?/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = this.writeConstant(tempPredicate);
      tempPredicate = this.integerType(tempPredicate);
      tempPredicate = tempPredicate.replace(/name[d]?[s?]?/i, "pascal case");
      tempPredicate = this.pascalCasing(tempPredicate);
    }

    else if (tempPredicate.match(/constant double (?:type )?name[d]?[s]?.*?/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = this.writeConstant(tempPredicate);
      tempPredicate = this.doubleType(tempPredicate);
      tempPredicate = tempPredicate.replace(/named[d]?[s]?/i, "pascal case");
      tempPredicate = this.pascalCasing(tempPredicate);
    }

    else if (tempPredicate.match(/constant boolean (?:type )?name[d]?[s]? .*?/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = this.writeConstant(tempPredicate);
      tempPredicate = this.boolType(tempPredicate);
      tempPredicate = tempPredicate.replace(/named[d]?[s]?/i, "pascal case");
      tempPredicate = this.pascalCasing(tempPredicate);
    }

    else if (tempPredicate.match(/constant character (?:type )?name[d]?[s]?.*?/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = this.writeConstant(tempPredicate);
      tempPredicate = this.characterType(tempPredicate);
      tempPredicate = tempPredicate.replace(/named[d]?[s]?/i, "pascal case");
      tempPredicate = this.pascalCasing(tempPredicate);
    }

    else if (tempPredicate.match(/constant keyword/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = this.writeConstant(tempPredicate);
    }

    //Conditions for integer types
    //declares a variable: type + name
    else if (tempPredicate.match(/integer (?:type )?name[d]?[s]?/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = this.integerType(tempPredicate);
      tempPredicate = tempPredicate.replace(/name[d]?[s]?/i, "camelcase");
      tempPredicate = this.camelCasing(tempPredicate);
    }
    //writes out the keyword int
    else if (tempPredicate.match(/integer type/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = tempPredicate.replace("integer type", "int");
    }

    //Conditions for double types
    //delcares a double variable: type + name
    else if (tempPredicate.match(/double (?:type )?name[d]?[s]?/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = this.doubleType(tempPredicate);
      tempPredicate = tempPredicate.replace(/name[d]?[s]?/i, "camelcase");
      tempPredicate = this.camelCasing(tempPredicate);
    }

    //writes the keyword, double
    else if (tempPredicate.match("double type")) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = tempPredicate.replace("double type", "double");
    }

    else if (tempPredicate.match(/string (?:type )?name[d]?[s]?/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = this.stringType(tempPredicate);
      tempPredicate = tempPredicate.replace(/name[d]?[s]?/, "camelcase");
      tempPredicate = this.camelCasing(tempPredicate);
    }

    else if (tempPredicate.match("string type")) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = tempPredicate.replace("string type", "string");
    }

    else if (tempPredicate.match(/boolean (?:type )?name[d]?[s]?/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = this.stringType(tempPredicate);
      tempPredicate = tempPredicate.replace(/name[d]?[s]?/, "camelcase");
      tempPredicate = this.camelCasing(tempPredicate);
    }

    else if (tempPredicate.match("boolean type")) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = tempPredicate.replace("boolean type", "bool");
    }

    else if (tempPredicate.match(/character (?:type )?name[d]?[s]?/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = this.stringType(tempPredicate);
      tempPredicate = tempPredicate.replace(/name[d]?[s]?/, "camelcase");
      tempPredicate = this.camelCasing(tempPredicate);
    }

    else if (tempPredicate.match("character type")) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = tempPredicate.replace("character type", "char");
    }

    //Assigning values
    else if (tempPredicate.match(/ assign /)) {
      tempPredicate = tempPredicate.replace(/ assign /i, " = ") + ";";
      tempPredicate = this.camelCasing(tempPredicate);
      tempPredicate = this.pascalCasing(tempPredicate);  
    }

    //Voice commands for equality operators
    else if (tempPredicate.match(/\s?equal sign/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = this.preCasingForExpressions(tempPredicate, "equal sign");
      tempPredicate = tempPredicate.replace(/an equal sign/i, "=");
    }

    else if (tempPredicate.match(/.* +? (?:plus )?equals?.*/i)) {
      tempPredicate = tempPredicate.replace(/plus equals?/i, "+=");
    }

    else if (tempPredicate.match(/\s?equals/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = this.preCasingForExpressions(tempPredicate, "equals");
      tempPredicate = tempPredicate.replace(/equals/i, "==");
    }

    else if (tempPredicate.match(/not equal to/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = this.preCasingForExpressions(tempPredicate, "not equal to");
      tempPredicate = tempPredicate.replace(/not equal to/i, "!=");
    }

    else if (tempPredicate.match(/not equal/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = this.preCasingForExpressions(tempPredicate, "not equal");
      tempPredicate = tempPredicate.replace(/not equal/i, "!=");
    }

    else if (tempPredicate.match(/equals? sign/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = this.preCasingForExpressions(tempPredicate, "equals");
      tempPredicate = tempPredicate.replace(/equals? sign/i, "=");
    }

    //Voice commands for writing arithmetic operators
    else if (tempPredicate.match(/\s?plus sign/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = tempPredicate.replace(/\s?plus sign/i, "+");

    }

    else if (tempPredicate.match(/.* plus .*/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = this.preCasingForExpressions(tempPredicate, "plus");
      tempPredicate = tempPredicate.replace(/plus/i, "+");
    }

    else if (tempPredicate.match(/\s?minus sign/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = this.preCasingForExpressions(tempPredicate, "minus");
      tempPredicate = tempPredicate.replace(/minus sign/i, " - ");
    }

    else if (tempPredicate.match(/.* minus .*/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = this.preCasingForExpressions(tempPredicate, "minus");
      tempPredicate = tempPredicate.replace(/minus/i, " - ");
    }
    else if (tempPredicate.match(/division sign/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = tempPredicate.replace(/division sign/i, "/");
    }
    else if (tempPredicate.match(/.*\/.*/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = this.preCasingForExpressions(tempPredicate, " / ");
      tempPredicate = tempPredicate.replace(/\//i, " / ");
    }
    else if (tempPredicate.match(/.* times .*/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = this.preCasingForExpressions(tempPredicate, "times");
      tempPredicate = tempPredicate.replace(/times/i, "*");
    }
    else if (tempPredicate.match(/increment/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = tempPredicate.replace(/increment/i, "++");
    }
    else if (tempPredicate.match(/decrement/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = tempPredicate.replace(/decrement/i, "--");
    }
    else if (tempPredicate.match(/\s?percent sign/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = this.preCasingForExpressions(tempPredicate, " mod ");
      tempPredicate = tempPredicate.replace(/ mod /i, "%");
    }
    else if (tempPredicate.match(/.* mod .*/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = this.preCasingForExpressions(tempPredicate, " mod ");
      tempPredicate = tempPredicate.replace(/mod/i, "%");
    }

    //Voice commands for writing comparison operators
    else if (tempPredicate.match(/greater than or equal to/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = this.preCasingForExpressions(tempPredicate, " greater than or equal to ");
      tempPredicate = tempPredicate.replace(/greater than or equal to/i, ">=");
    }
    else if (tempPredicate.match(/greater than/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = this.preCasingForExpressions(tempPredicate, " greater than ");
      tempPredicate = tempPredicate.replace(/greater than/i, ">");
    }
    else if (tempPredicate.match(/less than or equal to/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = this.preCasingForExpressions(tempPredicate, " less than or equal to ");
      tempPredicate = tempPredicate.replace(/less than or equal to/i, "<=");
    }
    else if (tempPredicate.match(/less than/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = this.preCasingForExpressions(tempPredicate, " less than ");
      tempPredicate = tempPredicate.replace(/less than/i, "<");
    }

    //Voice commands for writing logical operators
    else if (tempPredicate.match(/\s?logical and/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = this.preCasingForExpressions(tempPredicate, " logical and ");
      tempPredicate = tempPredicate.replace(/logical and/i, "&&");
    }

    else if (tempPredicate.match(/\s?logical or/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = this.preCasingForExpressions(tempPredicate, " logical or ");
      tempPredicate = tempPredicate.replace(/logical or/i, "||");
    }

    //Voice commands for braces, parenthesis, commas
    else if (tempPredicate.match(/open parenthesis/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = tempPredicate.replace(/open parenthesis/i, "(");
    }
    else if (tempPredicate.match(/close parenthesis/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = tempPredicate.replace(/close parenthesis/i, ")");
    }
    else if (tempPredicate.match(/open curly bracket[s]?/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = tempPredicate.replace(/open curly bracket[s]?/i, "{");
    }
    else if (tempPredicate.match(/close curly bracket[s]?/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = tempPredicate.replace(/close curly bracket[s]?/i, "}");
    }
    else if (tempPredicate.match(/a?\s?comma/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = tempPredicate.replace(/a?\s?comma/i, ", ");
    }
    else if (tempPredicate.match(/a?,/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = tempPredicate.replace(/a?,/i, ", ");
    }
    else if (tempPredicate.match(/a?\s?semicolon/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = tempPredicate.replace(/a?\s?semicolon/i, ";");
    }
    else if (tempPredicate.match(/\s?exclamation mark/i)) {
      tempPredicate = this.replaceHassleWords2(tempPredicate);
      tempPredicate = tempPredicate.replace(/\s?exclamation mark/i, "!");
    }
    else if (tempPredicate.match(/^an!/i)) {
      tempPredicate = tempPredicate.replace(/an!/i, "!");
    }
    else if (tempPredicate.match(/.*between quotes/i)) {
      tempPredicate = "\" " + tempPredicate.replace(/between quotes/i, "\"");
    }
    else if (tempPredicate.match(/quote[s]?/i)) {
      tempPredicate = tempPredicate.replace(/quotes/i, "\"");
    }

    //Naming conventions
    else if (tempPredicate.match(/camelcase/i)) {
      tempPredicate = this.camelCasing(tempPredicate);
    }
    else if (tempPredicate.match(/pascal case/i)) {
      tempPredicate = this.pascalCasing(tempPredicate);
    }
    else if (tempPredicate.match(/\s?uppercase.*/i)) {
      tempPredicate = this.upperCasing(tempPredicate);
    }

    //Checks for if and while conditions MUST STAY AT THE END
    tempPredicate = this.checkIfTestCondition(tempPredicate);
    //Checks for the Console.WriteLine command
    tempPredicate = this.checkDisplayOutput(tempPredicate);

    return tempPredicate;
  }

  checkDisplayOutput(tempPredicate: string): string{
    if(tempPredicate.match(/console.*write.*line.*/)){
      tempPredicate = tempPredicate.replace(/console.*write.*line /, ""); 
      tempPredicate = "Console.WriteLine(" + tempPredicate + ");"; 
    }
    else if(tempPredicate.match(/console.*right.*line.*/)){
      tempPredicate = tempPredicate.replace(/console.*right.*line /, ""); 
      tempPredicate = "Console.WriteLine(" + tempPredicate + ");"; 
    }
    return tempPredicate
  }

  writeConstant(predicate: string): string {
    return predicate = predicate.replace("constant", "const");
  }

  matchType(predicate: string): string {
    if (predicate.match(/double/i))
      predicate = this.doubleType(predicate);
    if (predicate.match(/integer/i))
      predicate = this.integerType(predicate);
    if (predicate.match(/boolean/i))
      predicate = this.boolType(predicate);
    if (predicate.match(/void/i))
      predicate = this.voidType(predicate);
    return predicate;
  }

  integerType(predicate: string): string {
    if (predicate.match(/integer type/i)) {
      return predicate = predicate.replace("integer type", "int");
    }
    else if (predicate.match(/integer/i)) {
      return predicate = predicate.replace("integer", "int");
    }
  }

  doubleType(predicate: string): string {
    if (predicate.match("double type")) {
      return predicate = predicate.replace("double type", "double");
    }
    return predicate;
  }

  boolType(predicate: string): string {
    if (predicate.match("boolean type")) {
      return predicate = predicate.replace("boolean type", "bool");
    }
    else if (predicate.match("boolean")) {
      return predicate = predicate.replace("boolean", "bool");
    }
  }

  voidType(predicate: string): string {
    if (predicate.match("void type")) {
      return predicate = predicate.replace("void type", "void");
    }
    return predicate;
  }

  stringType(predicate: string): string {
    if (predicate.match("string type")) {
      return predicate = predicate.replace("string type", "string");
    }
    return predicate;
  }

  characterType(predicate: string): string {
    if (predicate.match("character type")) {
      return predicate = predicate.replace("character type", "void");
    }
    else if (predicate.match("character")) {
      return predicate = predicate.replace("character", "char");
    }
  }

  //Implements camelcasing and pascal casing functions on operands
  preCasingForExpressions(predicate: string, operator: string): string {
    if (predicate.match(/camelcase/g)) {
      var predicateArr: string[] = predicate.split(operator);
      predicateArr.forEach(substring => {
        if (substring.match(/camelcase/g)) {
          var stringToReplace = this.camelCasing(substring);
          predicate = predicate.replace(substring, stringToReplace);
        }
        console.log("predicate", predicate)
      });
    }
    if (predicate.match(/pascal case/g)) {
      var predicateArr: string[] = predicate.split(operator);
      predicateArr.forEach(substring => {
        console.log("substring", substring);
        if (substring.match(/pascal case/g)) {
          var stringToReplace = this.pascalCasing(substring);
          predicate = predicate.replace(substring, stringToReplace);
        }
        console.log("predicate", predicate)
      });
    }
    return predicate;
  }

  //Returns a string in Pascal Case 
  pascalCasing(predicate: string): string {
    let variableName = '';
    let variableNameArr: string[] = predicate.split(/pascal case/i);
    variableNameArr = variableNameArr[1].split(" ");
    console.log("variable name array here: ", variableNameArr)

    for (let idx = 0; idx < variableNameArr.length; idx++) {
      for (let j = 0; j < variableNameArr[idx].length; j++) {
        if (j === 0) {
          variableName += variableNameArr[idx][0].toUpperCase();
        }
        else { variableName += variableNameArr[idx][j].toLowerCase() }
      }
    }
    return predicate = predicate.replace(/pascal case .*/i, ' ' + variableName.trim());
  }


  upperCasing(predicate: string): string {
    let variableName = '';
    //The space after uppercase is needed! Do not remove it.
    let variableNameArr: string[] = predicate.split(/uppercase/i);
    variableNameArr.forEach(substring => {

      substring[0][0].toUpperCase

    });
    return predicate = predicate.replace(/uppercase.*/i, ' ' + variableName.trim());
  }

  camelCasing(tempPredicate: string) {
    let variableName = '';
    tempPredicate = tempPredicate.trim();
    let variableNameArr: string[] = tempPredicate.split(/camelcase /i);
    variableNameArr = variableNameArr[1].split(" ");
    console.log("variable name array here: ", variableNameArr)
    variableName += variableNameArr[0];

    if (variableNameArr.length > 1) {
      for (let idx = 1; idx < variableNameArr.length; idx++) {
        for (let j = 0; j < variableNameArr[idx].length; j++) {
          if (j === 0) {
            variableName += variableNameArr[idx][0].toUpperCase();
          }
          else { variableName += variableNameArr[idx][j].toLowerCase() }
        }
      }
    }
    return tempPredicate = tempPredicate.replace(/camelcase .*/i, ' ' + variableName.trim());
  }
  
  checkIfTestCondition(predicate: string) : string {
    debugger;
    var wordList = [/while /i, /if /i];

    wordList.forEach(word => {
      if (predicate.match(word)) {
        var splitPredicate = predicate.split(word);

        splitPredicate.forEach(p => {
          // if the separator appears at the beginning or end of a string, 
          //the result is an empty string in the first or last index
          if (p != "") {
            predicate = predicate.replace(p, "(" + p + ")");
          }
        });
        return predicate;
      }
    });
    return predicate;
  }

  checkIfForLoop(predicate: string): string {
    var numberString:string = '0';
    if(predicate.match(/(?:a )?for loop that repeats [0-9]+/i)){
      var splitPredicate:string[] = predicate.split("repeats");      
      for(var i=0;i<splitPredicate[1].length; i++){
        if(splitPredicate[1][i].match(/[0-9]/i))
          numberString += splitPredicate[1][i];
      }
      var n: number = parseInt(numberString)-1; 
      if(predicate.match(/decrement/)){
        predicate = "for(int i="+ n +"; i=>0" +"; i--)";
      } 
      //if(predicate.match(/increment/)){
      else{
        predicate = "for(int i=0; i<="+ n +"; i++)";
      }  
    }
    return predicate; 
  }
  

  /**
   * This function 
   * @param predicate a string value to  
   * @returns 
   */
  replaceHassleWords(predicate: string): string {
    //Forced troubleshooting recongition for the word  "false" 
    if (predicate.match("faults")) {
      predicate = predicate.replace("faults", "false");
    }
    else if (predicate.match("falls")) {
      predicate = predicate.replace("falls", "false");
    }
    else if (predicate.match("spots")) {
      predicate = predicate.replace("spots", "false");
    }
    else if (predicate.match("thougths")) {
      predicate = predicate.replace("thougts", "false");
    }

    //parsing words that represent integers 1 through nine "one", "two"...
    //
    if (predicate.match("one")) {
      if (predicate.startsWith("one "))
        predicate = predicate.replace("one ", "1 ");
      if (predicate.match(" one "))
        predicate = predicate.replace(" one ", " 1 ");
      if (predicate.match(" one"))
        predicate = predicate.replace(" one", " 1");
    }

    if (predicate.match("two")) {
      if (predicate.startsWith("two "))
        predicate = predicate.replace("two ", "2 ");
      if (predicate.match(" two "))
        predicate = predicate.replace(" two ", " 2 ");
      if (predicate.match(" two"))
        predicate = predicate.replace(" two", " 2");
    }

    if (predicate.match("three")) {
      if (predicate.startsWith("three "))
        predicate = predicate.replace("three ", "3 ");
      if (predicate.match(" three "))
        predicate = predicate.replace(" three ", " 3 ");
      if (predicate.match(" three"))
        predicate = predicate.replace(" three", " 3");
    }

    /**condition added to prevent bugs with "for loop" command
     * this phrase must be processed before the word "four" to
     * prevent replacing it with an integer */
    if (predicate.match("four loop")) {
      predicate = predicate.replace("four loop", "for loop");
    }

    //continues parsing integers...
    if (predicate.match("four")) {
      if (predicate.startsWith("four "))
        predicate = predicate.replace("four ", "4 ");
      if (predicate.match(" four "))
        predicate = predicate.replace(" four ", " 4 ");
      if (predicate.match(" four"))
        predicate = predicate.replace(" four", " 4");
    }

    if (predicate.match("five")) {
      if (predicate.startsWith("five "))
        predicate = predicate.replace("five ", "5 ");
      if (predicate.match(" five "))
        predicate = predicate.replace(" five ", " 5 ");
      if (predicate.match(" five "))
        predicate = predicate.replace(" five", " 5");
    }

    if (predicate.match("six")) {
      if (predicate.startsWith("six "))
        predicate = predicate.replace("six ", "6 ");
      if (predicate.match(" six "))
        predicate = predicate.replace(" six ", " 6 ");
      if (predicate.match(" six"))
        predicate = predicate.replace(" six", " 6");
    }

    if (predicate.match("seven")) {
      if (predicate.startsWith("seven "))
        predicate = predicate.replace("seven ", "7 ");
      if (predicate.match(" seven "))
        predicate = predicate.replace(" seven ", " 7 ");
      if (predicate.match(" seven"))
        predicate = predicate.replace(" seven", " 7");
    }

    if (predicate.match("eight")) {
      if (predicate.startsWith("eight "))
        predicate = predicate.replace("eight ", "8 ");
      if (predicate.match(" eight "))
        predicate = predicate.replace(" eight ", " 8");
      if (predicate.match(" eight"))
        predicate = predicate.replace(" eight", " 8");
    }

    if (predicate.match("nine")) {
      if (predicate.startsWith("nine "))
        predicate = predicate.replace("nine ", "9 ");
      if (predicate.match(" nine "))
        predicate = predicate.replace(" nine ", " 9 ");
      if (predicate.match(" nine"))
        predicate = predicate.replace(" nine", " 9");
    }

    //Forced troubleshooting recognition for the word "Main"
    if (predicate.match("the state of maine")) {
      predicate = predicate.replace("the state of maine", "Maine");
    }
    if (predicate.match("maine")) {
      predicate = predicate.replace("maine", "main");
    }

    if (predicate.match(/ x /i)) {
      predicate = predicate.replace(/ x /i, " times ");
    }
    //Forced troubleshooting for recongizing "pascal case"
    if (predicate.match(/past the case/gi)) {
      predicate = predicate.replace(/past the case/gi, "pascal case");
    }
    if (predicate.match(/.*pasco case.*/gi)) {
      predicate = predicate.replace(/pasco case/gi, "pascal case");
    }

    //Forced troubleshooting for recongizing "camel case"
    if (predicate.match(/.*camo case.*/gi)) {
      predicate = predicate.replace(/camo case/gi, "camelcase");
    }
    if (predicate.match(/.*camel case.*/gi)) {
      predicate = predicate.replace(/camel case/gi, "camelcase");
    }
    if (predicate.match(/.*camel tape.*/gi)) {
      predicate = predicate.replace(/camel tape/gi, "camelcase");
    }

    if (predicate.match(/.*-.*/)) {
      if (predicate.match(/ greater-?than.*/)) {
        predicate = predicate.replace(/-/g, " ");
      }
      if (predicate.match(/ less-?than.*/g)) {
        predicate = predicate.replace(/-/g, " ");
      }
      predicate = predicate.replace(/-/g, " minus");
    }
    if (predicate.match(/ with/)) {
      predicate = predicate.replace(/ with/i, " width ");
    }

    return predicate;
  }

  replaceHassleWords2(predicate: string): string {
    //Removing the words "an", "a", and "the" from the beginning of 
    if (predicate.startsWith("an ")) {
      return predicate = predicate.replace("an ", "").trim();
    }
    else if (predicate.startsWith("a ")) {
      return predicate = predicate.replace("a ", "").trim();
    }
    else if (predicate.startsWith("the ")) {
      return predicate = predicate.replace("the ", "").trim();
    }
    else return predicate;
  }
}

