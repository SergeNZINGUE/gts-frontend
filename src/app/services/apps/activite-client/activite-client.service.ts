
import {Injectable, signal} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Employee} from "../../../pages/apps/employee/employee";
import {ActiviteClient} from "../../../pages/apps/clients/activite-client/activite-client";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root',
})
export class ActiviteClientService {
  private activiteClient = signal<ActiviteClient[]>([]);
  private apiUrl = environment.apiUrl + '/api/gts/activite-client';

  constructor(private http: HttpClient) {}
getActiviteClient() {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token manquant');
  }
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`});
  return this.http.get<ActiviteClient[]>(this.apiUrl+'/list', { headers });

}


}
