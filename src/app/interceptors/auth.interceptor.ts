import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
  HttpContextToken,
  HttpContext,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const BYPASS_403 = new HttpContextToken<boolean>(() => false);

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

          const bypass403 = req.context.get(BYPASS_403);

          const isAuthError =
            error.status === 401 ||
            (error.status === 403 && !bypass403);

          if (isCorsOrNetworkError || isAuthError) {
            this.authService.sessionExpired();
          }
        }

        return throwError(() => error);
      })
    );
  }
}