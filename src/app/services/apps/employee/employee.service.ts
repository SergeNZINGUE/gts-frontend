import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from 'src/app/pages/apps/employee/employee';
import { ConducteurImagesResponse } from '../../../pages/apps/employee/conducterImagesResponse';
import { EmployeeRequest } from '../../../pages/apps/employee/employeeRequest';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private apiUrl = environment.apiUrl + '/api/gts/conducteurs';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token manquant');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/list`, { headers: this.getHeaders() });
  }

  getEmployeesById(id: number, page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}?page=${page}&size=${size}`, {
      headers: this.getHeaders(),
    });
  }

  createEmployee(formData: FormData): Observable<EmployeeRequest> {
    return this.http.post<Employee>(this.apiUrl, formData, { headers: this.getHeaders() });
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getImages(conducteurId: number): Observable<ConducteurImagesResponse> {
    return this.http.get<ConducteurImagesResponse>(`${this.apiUrl}/${conducteurId}/images`, {
      headers: this.getHeaders(),
    });
  }
}
