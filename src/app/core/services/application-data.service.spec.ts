import { TestBed, inject } from '@angular/core/testing';

import { ApplicationDataService } from './application-data.service';

describe('ApplicationDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApplicationDataService]
    });
  });

  it('should ...', inject([ApplicationDataService], (service: ApplicationDataService) => {
    expect(service).toBeTruthy();
  }));
});
