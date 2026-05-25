import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  MaintenanceDetail,
  MaintenanceRequest,
  MaintenanceSummary,
  PageResponse,
} from '../../../pages/apps/engins/maintenance/maintenance.models';

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
  private apiUrl = environment.apiUrl + '/api/gts/maintenance';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token manquant');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  /** Toutes les maintenances — charge jusqu'à 1000 pour la vue liste côté client */
  getAll(page = 0, size = 1000): Observable<MaintenanceSummary[]> {
    return this.http
      .get<PageResponse<MaintenanceSummary>>(
        `${this.apiUrl}?page=${page}&size=${size}`,
        { headers: this.getHeaders() },
      )
      .pipe(map((res) => res.content));
  }

  /** Maintenances d'un engin donné */
  getByEngin(enginId: number): Observable<MaintenanceSummary[]> {
    return this.http.get<MaintenanceSummary[]>(
      `${this.apiUrl}/engin/${enginId}`,
      { headers: this.getHeaders() },
    );
  }

  /** Détail complet d'une maintenance */
  getById(id: number): Observable<MaintenanceDetail> {
    return this.http.get<MaintenanceDetail>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  /** Créer une fiche de maintenance */
  create(payload: MaintenanceRequest): Observable<MaintenanceDetail> {
    return this.http.post<MaintenanceDetail>(this.apiUrl, payload, {
      headers: this.getHeaders(),
    });
  }

  /** Mettre à jour une fiche de maintenance */
  update(id: number, payload: MaintenanceRequest): Observable<MaintenanceDetail> {
    return this.http.put<MaintenanceDetail>(`${this.apiUrl}/${id}`, payload, {
      headers: this.getHeaders(),
    });
  }

  /** Supprimer une fiche de maintenance */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }
}
