import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorialsMenuComponent } from './tutorials-menu.component';

describe('TutorialsMenuComponent', () => {
  let component: TutorialsMenuComponent;
  let fixture: ComponentFixture<TutorialsMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TutorialsMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TutorialsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
