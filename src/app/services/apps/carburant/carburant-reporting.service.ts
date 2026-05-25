import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CoreService } from '../../core.service';
import {
  RapportCarburantResponse,
  BilanCarburantEnginDto,
  ConsommationMissionDto,
} from '../../../pages/apps/engins/consommation-carburant/carburant.models';

@Injectable({ providedIn: 'root' })
export class CarburantReportingService {
  private readonly apiUrl = environment.apiUrl + '/api/gts/reporting/carburant';

  constructor(private http: HttpClient, private coreService: CoreService) {}

  /** Rapport global flotte (ou engin unique si enginId fourni). */
  getRapport(
    dateDebut: string,
    dateFin: string,
    enginId?: number | null,
  ): Observable<RapportCarburantResponse> {
    let params = new HttpParams()
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);
    if (enginId != null) params = params.set('enginId', enginId.toString());
    return this.http.get<RapportCarburantResponse>(this.apiUrl, {
      headers: this.coreService.getHeaders(),
      params,
    });
  }

  /** Bilan d'un engin précis. */
  getBilanEngin(
    enginId: number,
    dateDebut: string,
    dateFin: string,
  ): Observable<BilanCarburantEnginDto> {
    const params = new HttpParams()
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);
    return this.http.get<BilanCarburantEnginDto>(`${this.apiUrl}/engin/${enginId}`, {
      headers: this.coreService.getHeaders(),
      params,
    });
  }

  /** Liste plate des missions avec détail carburant. */
  getDetailMissions(
    dateDebut: string,
    dateFin: string,
    enginId?: number | null,
  ): Observable<ConsommationMissionDto[]> {
    let params = new HttpParams()
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);
    if (enginId != null) params = params.set('enginId', enginId.toString());
    return this.http.get<ConsommationMissionDto[]>(`${this.apiUrl}/missions`, {
      headers: this.coreService.getHeaders(),
      params,
    });
  }
}
