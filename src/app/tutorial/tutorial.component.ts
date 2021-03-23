import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { SpeechRecognitionService } from '../shared/services/web-apis/speech-recognition.service';
import { SpeechResults } from '../shared/models/speech-results';
import { throwMatDuplicatedDrawerError } from '@angular/material/sidenav';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.css']
})

export class TutorialComponent implements OnInit {
  speechResults: SpeechResults;
  userAnswer: string = '';

  constructor(public speechRecognition: SpeechRecognitionService) { }

  ngOnInit(): void {
    this.speechRecognition.statement.subscribe(e => {
      console.log("statement subscription from tutorial ", e);
      this.captureText(e);
    });

    //   this.transcript.subscribe(e =>{
    //     console.log("transcript subscription from tutorial " , e)
    //   }); 
  }

  captureText(speechResult: SpeechResults): void {

    let predicate = speechResult.predicate;

    //takes care of spacing in the predicate
    if (speechResult.action === 'write') {
      if (this.userAnswer === "") {
        this.userAnswer += this.dictateCode(predicate);
      }
      else { this.userAnswer += ' ' + this.dictateCode(predicate); }
    }

    if (speechResult.action === 'delete' && speechResult.predicate === 'word') {

      let tempArray: string[] = this.userAnswer.split(' ');
      this.userAnswer = '';
      for (let idx = 0; idx < tempArray.length - 1; idx++) {
        if (idx === tempArray.length - 2) {
          this.userAnswer += tempArray[idx];
        }
        else {
          this.userAnswer += tempArray[idx] + ' ';
        }
      }
      console.log("temparray", tempArray)

    }

    if (speechResult.action === 'delete' && speechResult.predicate === 'everything') {
      this.userAnswer = '';
    }
  }

  dictateCode(predicate: string): string {
    //consider putting this in another function to include in the next if
    let tempPredicate = predicate;
    if (predicate.match("for Loop")) {
      tempPredicate = tempPredicate.replace("for Loop", "for (");
    }
    //variable declarations
    if (predicate.match("an integer variable")) {
      tempPredicate = tempPredicate.replace("an integer variable", "int");
    }

    if (predicate.match("a double variable")) {
      tempPredicate = tempPredicate.replace("a double variable", "double");
    }

    if (predicate.match("a string variable")) {
      tempPredicate = tempPredicate.replace("a string variable", "string");
    }

    //camelcase notation
    if (predicate.match(/camel case | camelcase/i)) {
      let variableName = '';
      let variableNameArr: string[] = predicate.split(/camelcase |camel case/i);
      variableNameArr = variableNameArr[1].toLowerCase().split(" ");
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
      tempPredicate = tempPredicate.replace(/camel case .* | camelcase .*/i, ' ' + variableName.trim());
    }

    if (predicate.match(/Pascal case/i)) {
      let variableName = '';
      let variableNameArr: string[] = predicate.split(/Pascal case/i);
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

      tempPredicate = tempPredicate.replace(/Pascal case .*/i, ' ' + variableName.trim());
    }

    if (predicate.match(/equal sign/i)) {
      tempPredicate = predicate.replace(/equal sign/i, "=")
    }

    predicate = tempPredicate;
    return predicate;

  }

}
