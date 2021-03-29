import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-top-navigation',
  templateUrl: './top-navigation.component.html',
  styleUrls: ['./top-navigation.component.css']
})
export class TopNavigationComponent implements OnInit {
  
  constructor(route: ActivatedRoute) {const url: string = route.snapshot.queryParams.toString();
  console.log( "this url1", url) }

  ngOnInit(): void {
    
  }

}
