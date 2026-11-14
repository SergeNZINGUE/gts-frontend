import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActiviteClient } from '../../../pages/apps/clients/activite-client/activite-client';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ActiviteClientService {
  private apiUrl = environment.apiUrl + '/api/gts/activite-client';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token manquant');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getActiviteClient(): Observable<ActiviteClient[]> {
    return this.http.get<ActiviteClient[]>(`${this.apiUrl}/list`, { headers: this.getHeaders() });
  }

  /** POST /api/gts/activite-client?codeActivite=…&libelleActivite=… (ADMIN, MANAGER) */
  create(codeActivite: string, libelleActivite: string): Observable<ActiviteClient> {
    const params = new HttpParams()
      .set('codeActivite', codeActivite)
      .set('libelleActivite', libelleActivite);
    return this.http.post<ActiviteClient>(this.apiUrl, null, { headers: this.getHeaders(), params });
  }

  /** PUT /api/gts/activite-client/updateActiviteClients/{code}?libelleActivite=… (ADMIN, MANAGER) */
  update(codeActivite: string, libelleActivite: string): Observable<ActiviteClient> {
    const params = new HttpParams().set('libelleActivite', libelleActivite);
    return this.http.put<ActiviteClient>(
      `${this.apiUrl}/updateActiviteClients/${encodeURIComponent(codeActivite)}`,
      null,
      { headers: this.getHeaders(), params },
    );
  }
}
