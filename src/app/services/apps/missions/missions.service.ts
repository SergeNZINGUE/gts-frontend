import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CoreService } from '../../core.service';
import { Mission } from '../../../pages/apps/missions/mission';
import { CreateMissionRequest } from '../../../pages/apps/missions/add-mission/createMissionRequest';

@Injectable({
  providedIn: 'root',
})
export class MissionsService {
  private apiUrl = 'http://localhost:8081/api/gts/missions';

  constructor(
    private http: HttpClient,
    private coreService: CoreService
  ) {}

  getMissions(): Observable<Mission[]> {
    return this.http.get<Mission[]>(`${this.apiUrl}/list`, {
      headers: this.coreService.getHeaders(),
    });
  }

  getMissionById(id: number): Observable<Mission> {
    return this.http.get<Mission>(`${this.apiUrl}/${id}`, {
      headers: this.coreService.getHeaders(),
    });
  }

  createMission(payload: CreateMissionRequest): Observable<Mission> {
    return this.http.post<Mission>(this.apiUrl, payload, {
      headers: this.coreService.getHeaders(),
    });
  }

  updateMission(id: number, payload: Partial<CreateMissionRequest>): Observable<Mission> {
    return this.http.put<Mission>(`${this.apiUrl}/${id}/terminer`, payload, {
      headers: this.coreService.getHeaders(),
    });
  }

  deleteMission(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.coreService.getHeaders(),
    });
  }
}
