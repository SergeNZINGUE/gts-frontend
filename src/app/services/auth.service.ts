import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public isLoggedIn: boolean = false;
  public isAdmin: boolean = false;
  public role: string[] = [''];
  public username: string | null | undefined = '';
  private apiUrl = environment.apiUrl + '/api/gts/auth/login';

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService
  ) {}

  public login(username: string | null | undefined, password: string | null | undefined) {
    return this.http.post<any>(this.apiUrl, { username, password }).pipe(
      tap((res: any) => {
        this.isLoggedIn = true;
        this.username = username;

        if (res?.username) {
          localStorage.setItem('username', res.username);
        }
        if (res?.token) {
          localStorage.setItem('token', res.token);
        }
        if (res?.roles) {
          this.role = res.roles;
          this.isAdmin = this.role.includes('ADMIN');
        }
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/api/gts/emails/forgot-password`,
      { email },
      { responseType: 'text'}
    );
  }

  resetPassword(email: string, code: string, newPassword: string): Observable<unknown> {
    return this.http.post(
      `${environment.apiUrl}/api/gts/emails/`,
      { email, code, newPassword },
      { responseType: 'text' as 'json' }
    );
  }

  sessionExpired() {
    this.isLoggedIn = false;
    this.username = '';
    this.role = [];
    this.isAdmin = false;
    localStorage.removeItem('token');
    localStorage.removeItem('username');

    this.toastr.warning(
      'Votre session a expiré. Veuillez vous reconnecter.',
      'Session expirée',
      { timeOut: 5000, progressBar: true }
    );

    void this.router.navigate(['/authentication/login']);
  }

  logout() {
    this.isLoggedIn = false;
    this.username = '';
    this.role = [];
    this.isAdmin = false;
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  }
}
