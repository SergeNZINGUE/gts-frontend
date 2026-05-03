import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CoreService } from '../../core.service';
import { ControleVGP, ControleVGPPayload } from '../../../pages/apps/engins/controles-vgp/controle-vgp';

@Injectable({ providedIn: 'root' })
export class ControlesVGPService {
  private apiUrl = environment.apiUrl + '/api/gts/controles-vgp';

  constructor(private http: HttpClient, private coreService: CoreService) {}

  getAll(): Observable<ControleVGP[]> {
    return this.http.get<ControleVGP[]>(`${this.apiUrl}/list`, {
      headers: this.coreService.getHeaders(),
    });
  }

  getByEngin(enginId: number): Observable<ControleVGP[]> {
    return this.http.get<ControleVGP[]>(`${this.apiUrl}/engin/${enginId}`, {
      headers: this.coreService.getHeaders(),
    });
  }

  create(payload: ControleVGPPayload): Observable<ControleVGP> {
    return this.http.post<ControleVGP>(this.apiUrl, payload, {
      headers: this.coreService.getHeaders(),
    });
  }

  update(id: number, payload: Partial<ControleVGPPayload>): Observable<ControleVGP> {
    return this.http.put<ControleVGP>(`${this.apiUrl}/${id}`, payload, {
      headers: this.coreService.getHeaders(),
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.coreService.getHeaders(),
    });
  }
}
