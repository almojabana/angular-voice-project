import { TestBed } from '@angular/core/testing';

import { TutorialsMenuService } from './tutorials-menu.service';

describe('TutorialsMenuService', () => {
  let service: TutorialsMenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TutorialsMenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
