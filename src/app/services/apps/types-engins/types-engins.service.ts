import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TypeEnginResponse } from '../../../pages/apps/engins/type-engin';

@Injectable({ providedIn: 'root' })
export class TypesEnginsService {
  private apiUrl = environment.apiUrl + '/api/gts/types-engins';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token manquant');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getActifs(): Observable<TypeEnginResponse[]> {
    return this.http.get<TypeEnginResponse[]>(`${this.apiUrl}/actifs`, {
      headers: this.getHeaders(),
    });
  }
}