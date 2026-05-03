import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CoreService } from '../../core.service';
import { AssuranceEngin, AssurancePayload } from '../../../pages/apps/engins/assurances-engins/assurance-engin';

@Injectable({ providedIn: 'root' })
export class AssurancesService {
  private apiUrl = environment.apiUrl + '/api/gts/assurances';

  constructor(private http: HttpClient, private coreService: CoreService) {}

  getAll(): Observable<AssuranceEngin[]> {
    return this.http.get<AssuranceEngin[]>(`${this.apiUrl}/list`, {
      headers: this.coreService.getHeaders(),
    });
  }

  getByEngin(enginId: number): Observable<AssuranceEngin[]> {
    return this.http.get<AssuranceEngin[]>(`${this.apiUrl}/engin/${enginId}`, {
      headers: this.coreService.getHeaders(),
    });
  }

  create(payload: AssurancePayload): Observable<AssuranceEngin> {
    return this.http.post<AssuranceEngin>(this.apiUrl, payload, {
      headers: this.coreService.getHeaders(),
    });
  }

  update(id: number, payload: Partial<AssurancePayload>): Observable<AssuranceEngin> {
    return this.http.put<AssuranceEngin>(`${this.apiUrl}/${id}`, payload, {
      headers: this.coreService.getHeaders(),
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.coreService.getHeaders(),
    });
  }
}
