import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const isAuthEndpoint = req.url.includes('/auth/login');

        if (!isAuthEndpoint) {
          const isCorsOrNetworkError =
            error.status === 0 && !!localStorage.getItem('token');
          const isAuthError =
            error.status === 401 || error.status === 403;

          if (isCorsOrNetworkError || isAuthError) {
            this.authService.sessionExpired();
          }
        }

        return throwError(() => error);
      })
    );
  }
}
