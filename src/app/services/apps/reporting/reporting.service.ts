import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CoreService } from '../../core.service';
import { FactureImpayeeDto, LocationRapportDto, MissionRapportDto } from '../../../pages/apps/rapports/rapport.models';

@Injectable({ providedIn: 'root' })
export class ReportingService {
  private apiUrl = environment.apiUrl + '/api/gts/reporting';

  constructor(private http: HttpClient, private coreService: CoreService) {}

  getLocationsPeriode(dateDebut: string, dateFin: string): Observable<LocationRapportDto[]> {
    const params = new HttpParams().set('dateDebut', dateDebut).set('dateFin', dateFin);
    return this.http.get<LocationRapportDto[]>(`${this.apiUrl}/locations/periode`, {
      headers: this.coreService.getHeaders(),
      params,
    });
  }

  getLocationsClient(clientId: number): Observable<LocationRapportDto[]> {
    return this.http.get<LocationRapportDto[]>(`${this.apiUrl}/locations/client/${clientId}`, {
      headers: this.coreService.getHeaders(),
    });
  }

  getMissionsConducteur(conducteurId: number): Observable<MissionRapportDto[]> {
    return this.http.get<MissionRapportDto[]>(`${this.apiUrl}/missions/conducteur/${conducteurId}`, {
      headers: this.coreService.getHeaders(),
    });
  }

  getImpayes(clientId?: number): Observable<FactureImpayeeDto[]> {
    let params = new HttpParams();
    if (clientId != null) {
      params = params.set('clientId', clientId.toString());
    }
    return this.http.get<FactureImpayeeDto[]>(`${this.apiUrl}/factures/impayes`, {
      headers: this.coreService.getHeaders(),
      params,
    });
  }
}
