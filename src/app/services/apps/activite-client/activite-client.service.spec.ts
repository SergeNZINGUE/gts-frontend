import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ActiviteClientService } from './activite-client.service';

describe('ActiviteClientService', () => {
  let service: ActiviteClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ActiviteClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
