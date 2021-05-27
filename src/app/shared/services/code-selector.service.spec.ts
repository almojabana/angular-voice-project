import { TestBed } from '@angular/core/testing';

import { CodeSelectorService } from './code-selector.service';

describe('CodeSelectorService', () => {
  let service: CodeSelectorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodeSelectorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
