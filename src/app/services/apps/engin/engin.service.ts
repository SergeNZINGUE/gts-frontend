import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Engin } from 'src/app/pages/apps/engins/engin';

@Injectable({ providedIn: 'root' })
export class EnginService {
  private apiUrl = 'http://localhost:8081/api/gts/engins';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token manquant');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getEngins(): Observable<Engin[]> {
    return this.http.get<Engin[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getEnginById(id: number): Observable<Engin> {
    return this.http.get<Engin>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  addEngin(engin: Partial<Engin>): Observable<Engin> {
    return this.http.post<Engin>(this.apiUrl, engin, { headers: this.getHeaders() });
  }

  updateEngin(id: number, payload: Partial<Engin>): Observable<Engin> {
    return this.http.put<Engin>(`${this.apiUrl}/${id}`, payload, { headers: this.getHeaders() });
  }

  deleteEngin(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
