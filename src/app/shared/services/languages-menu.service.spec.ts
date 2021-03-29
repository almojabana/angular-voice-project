import { TestBed } from '@angular/core/testing';

import { LanguagesMenuService } from './languages-menu.service';

describe('LanguagesMenuService', () => {
  let service: LanguagesMenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LanguagesMenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
