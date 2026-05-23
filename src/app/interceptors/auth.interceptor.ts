import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
  HttpContextToken,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';

export const BYPASS_403 = new HttpContextToken<boolean>(() => false);

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private toastr: ToastrService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');

    const authReq = token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        const isAuthEndpoint = req.url.includes('/auth/login');

        if (!isAuthEndpoint) {
          const isCorsOrNetworkError = error.status === 0 && !!token;

          if (isCorsOrNetworkError || error.status === 401) {
            this.authService.sessionExpired();
            return throwError(() => error);
          }

          const bypass403 = req.context.get(BYPASS_403);
          if (error.status === 403 && !bypass403) {
            this.toastr.error(
              'Vous n\'avez pas les droits nécessaires pour cette action.',
              'Accès refusé',
              { timeOut: 4000, progressBar: true }
            );
          }
        }

        return throwError(() => error);
      })
    );
  }
}
