import { environment } from '../../../../environments/environment';
import { TestBed } from '@angular/core/testing';

import { ActiviteClientService } from './activite-client.service';

describe('ActiviteClientService', () => {
  let service: ActiviteClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActiviteClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
