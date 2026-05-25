import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PieceRechange, PieceRechangePayload } from '../../../pages/apps/engins/pieces-de-rechange/piece-rechange';

@Injectable({ providedIn: 'root' })
export class PiecesRechangeService {
  private apiUrl = environment.apiUrl + '/api/gts/pieces-rechange';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token manquant');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getAll(): Observable<PieceRechange[]> {
    return this.http.get<PieceRechange[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getEnAlerte(): Observable<PieceRechange[]> {
    return this.http.get<PieceRechange[]>(`${this.apiUrl}/en-alerte`, {
      headers: this.getHeaders(),
    });
  }

  getById(id: number): Observable<PieceRechange> {
    return this.http.get<PieceRechange>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  create(payload: PieceRechangePayload): Observable<PieceRechange> {
    return this.http.post<PieceRechange>(this.apiUrl, payload, {
      headers: this.getHeaders(),
    });
  }

  update(id: number, payload: PieceRechangePayload): Observable<PieceRechange> {
    return this.http.put<PieceRechange>(`${this.apiUrl}/${id}`, payload, {
      headers: this.getHeaders(),
    });
  }

  /** Ajustement rapide du stock (delta positif = entrée, négatif = sortie) */
  ajusterStock(id: number, delta: number): Observable<PieceRechange> {
    return this.http.patch<PieceRechange>(
      `${this.apiUrl}/${id}/stock?delta=${delta}`,
      {},
      { headers: this.getHeaders() },
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }
}
