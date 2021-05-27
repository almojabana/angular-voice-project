import { TestBed } from '@angular/core/testing';

import { CSharpRulesService } from './c-sharp-rules.service';

describe('CSharpRulesService', () => {
  let service: CSharpRulesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CSharpRulesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
