import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CoreService } from '../../core.service';
import { UserResponse } from '../../../pages/apps/users/user-response';
import { UserRequest, RegisterRequest } from '../../../pages/apps/users/user-request';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private apiUrl = environment.apiUrl + '/api/gts/users';

  constructor(private http: HttpClient, private coreService: CoreService) {}

  getUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiUrl}/list`, {
      headers: this.coreService.getHeaders(),
    });
  }

  getUserById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/${id}`, {
      headers: this.coreService.getHeaders(),
    });
  }

  updateUser(id: number, payload: UserRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/${id}`, payload, {
      headers: this.coreService.getHeaders(),
    });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.coreService.getHeaders(),
    });
  }

  toggleActive(id: number): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.apiUrl}/${id}/toggle-active`, {}, {
      headers: this.coreService.getHeaders(),
    });
  }

  createUser(payload: RegisterRequest): Observable<unknown> {
    return this.http.post(
      `${environment.apiUrl}/api/gts/auth/register`,
      payload,
      { headers: this.coreService.getHeaders(), responseType: 'text' as 'json' }
    );
  }

  sendVerificationCode(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/send-verification`, {}, {
      headers: this.coreService.getHeaders(),
    });
  }
}