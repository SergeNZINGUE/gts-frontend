import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CoreService } from '../../core.service';
import { FactureImpayeeDto, ImpayesResponse, LocationRapportDto, LocationsClientResponse, LocationsPeriodeResponse, MissionRapportDto, MissionsConducteurResponse } from '../../../pages/apps/rapports/rapport.models';

@Injectable({ providedIn: 'root' })
export class ReportingService {
  private apiUrl = environment.apiUrl + '/api/gts/reporting';

  constructor(private http: HttpClient, private coreService: CoreService) {}

  getLocationsPeriode(dateDebut: string, dateFin: string): Observable<LocationRapportDto[]> {
    const params = new HttpParams().set('dateDebut', dateDebut).set('dateFin', dateFin);
    return this.http.get<LocationsPeriodeResponse>(`${this.apiUrl}/locations/periode`, {
      headers: this.coreService.getHeaders(),
      params,
    }).pipe(map(r => r.locations ?? []));
  }

  getLocationsClient(clientId: number): Observable<LocationRapportDto[]> {
    return this.http.get<LocationsClientResponse>(`${this.apiUrl}/locations/client/${clientId}`, {
      headers: this.coreService.getHeaders(),
    }).pipe(map(r => r.locations ?? []));
  }

  getMissionsConducteur(conducteurId: number): Observable<MissionRapportDto[]> {
    return this.http.get<MissionsConducteurResponse>(`${this.apiUrl}/missions/conducteur/${conducteurId}`, {
      headers: this.coreService.getHeaders(),
    }).pipe(map(r => r.missions ?? []));
  }

  getImpayes(clientId?: number): Observable<FactureImpayeeDto[]> {
    let params = new HttpParams();
    if (clientId != null) {
      params = params.set('clientId', clientId.toString());
    }
    return this.http.get<ImpayesResponse>(`${this.apiUrl}/factures/impayes`, {
      headers: this.coreService.getHeaders(),
      params,
    }).pipe(map(r => r.factures ?? []));
  }
}
