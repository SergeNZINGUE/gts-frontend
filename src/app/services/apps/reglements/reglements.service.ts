import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CoreService } from '../../core.service';
import { Reglement } from '../../../pages/apps/factures/reglement';

@Injectable({ providedIn: 'root' })
export class ReglementsService {
  private apiUrl = 'http://localhost:8081/api/gts/reglements';

  constructor(private http: HttpClient, private coreService: CoreService) {}

  createReglement(payload: {
    dateReglement: string;
    montantVerse: number;
    modePaiement: string;
    factureId: number;
    clientId: number;
  }): Observable<Reglement> {
    return this.http.post<Reglement>(this.apiUrl, payload, {
      headers: this.coreService.getHeaders(),
    });
  }

  getReglementsByFacture(factureId: number): Observable<Reglement[]> {
    return this.http.get<Reglement[]>(`${this.apiUrl}/facture/${factureId}`, {
      headers: this.coreService.getHeaders(),
    });
  }
}
