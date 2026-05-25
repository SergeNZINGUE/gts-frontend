import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CoreService } from '../../core.service';

export interface DashboardDepensesDto {
  annee:                 number;
  depensesCarburant:     number;
  depensesMaintenance:   number;
  totalDepenses:         number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly apiUrl = environment.apiUrl + '/api/gts/dashboard';

  constructor(private http: HttpClient, private coreService: CoreService) {}

  getKpiDepenses(annee?: number): Observable<DashboardDepensesDto> {
    let params = new HttpParams();
    if (annee != null) params = params.set('annee', annee.toString());
    return this.http.get<DashboardDepensesDto>(`${this.apiUrl}/kpi-depenses`, {
      headers: this.coreService.getHeaders(),
      params,
    });
  }
}
