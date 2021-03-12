import { TestBed } from '@angular/core/testing';

import { MonkeycrapService } from './monkeycrap.service';

describe('MonkeycrapService', () => {
  let service: MonkeycrapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonkeycrapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
