import { TestBed } from '@angular/core/testing';

import { VoiceNavigationService } from './voice-navigation.service';

describe('VoiceNavigationService', () => {
  let service: VoiceNavigationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VoiceNavigationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
