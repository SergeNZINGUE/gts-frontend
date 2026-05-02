import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../../../pages/apps/clients/client';
import { LogoClientResponse } from '../../../pages/apps/clients/details-client/logoClientResponse';

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private apiUrl = 'http://localhost:8081/api/gts/clients';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token manquant');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/list`, { headers: this.getHeaders() });
  }

  getClientById(id: number, page: number, size: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}/locations?page=${page}&size=${size}`, {
      headers: this.getHeaders(),
    });
  }

  createClient(formData: FormData): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, formData, { headers: this.getHeaders() });
  }

  updateClient(id: number, payload: Partial<Client>): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${id}`, payload, { headers: this.getHeaders() });
  }

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getImages(clientId: number): Observable<LogoClientResponse> {
    return this.http.get<LogoClientResponse>(`${this.apiUrl}/${clientId}/images`, {
      headers: this.getHeaders(),
    });
  }
}
