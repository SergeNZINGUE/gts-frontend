import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

/** Construit un faux JWT avec l'expiration voulue (en secondes depuis l'epoch). */
function fakeJwt(exp: number): string {
  const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, '');
  return `${b64({ alg: 'HS256' })}.${b64({ sub: 'test', exp })}.signature`;
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  const authService = jasmine.createSpyObj<AuthService>('AuthService', ['sessionExpired']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    });
    guard = TestBed.inject(AuthGuard);
  });

  afterEach(() => localStorage.clear());

  it('devrait être créé', () => {
    expect(guard).toBeTruthy();
  });

  it('refuse sans token', () => {
    localStorage.setItem('username', 'serge');
    expect(guard.canActivate({} as any, {} as any)).not.toBeTrue();
  });

  it('accepte un token valide', () => {
    localStorage.setItem('username', 'serge');
    localStorage.setItem('token', fakeJwt(Math.floor(Date.now() / 1000) + 3600));
    expect(guard.canActivate({} as any, {} as any)).toBeTrue();
  });

  it('refuse et expire la session si le token est expiré', () => {
    localStorage.setItem('username', 'serge');
    localStorage.setItem('token', fakeJwt(Math.floor(Date.now() / 1000) - 60));
    expect(guard.canActivate({} as any, {} as any)).toBeFalse();
    expect(authService.sessionExpired).toHaveBeenCalled();
  });
});
