import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CoreService } from '../../core.service';
import { Facture } from '../../../pages/apps/factures/facture';

@Injectable({ providedIn: 'root' })
export class FacturesService {
  private apiUrl = environment.apiUrl + '/api/gts/factures';

  constructor(private http: HttpClient, private coreService: CoreService) {}

  getFactures(): Observable<Facture[]> {
    return this.http.get<Facture[]>(`${this.apiUrl}/list`, {
      headers: this.coreService.getHeaders(),
    });
  }

  getFactureById(id: number): Observable<Facture> {
    return this.http.get<Facture>(`${this.apiUrl}/${id}`, {
      headers: this.coreService.getHeaders(),
    });
  }

  createFacture(payload: {
    dateEmission: string;
    tauxTVA: number;
    etatPaiement: string;
    locationId: number;
    missionIds: number[];
  }): Observable<Facture> {
    return this.http.post<Facture>(this.apiUrl, payload, {
      headers: this.coreService.getHeaders(),
    });
  }

  updateEtat(id: number, etatPaiement: string): Observable<Facture> {
    return this.http.patch<Facture>(
      `${this.apiUrl}/${id}/etat`,
      { etatPaiement },
      { headers: this.coreService.getHeaders() }
    );
  }

  deleteFacture(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.coreService.getHeaders(),
    });
  }
}
