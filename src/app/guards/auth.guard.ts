import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Laisse passer seulement si un JWT est présent ET non expiré.
 * (Avant : seul `username` était vérifié, donc une session sans token ou au token
 * expiré affichait les écrans, puis chaque appel API échouait.)
 */
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(_next: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean | UrlTree {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    if (!token || !username) {
      return this.router.parseUrl('/authentication/login');
    }

    if (AuthGuard.isExpired(token)) {
      this.authService.sessionExpired(); // vide le stockage, avertit, redirige vers le login
      return false;
    }

    return true;
  }

  /** Lit `exp` (secondes) dans le payload du JWT. Un token illisible est considéré expiré. */
  static isExpired(token: string): boolean {
    try {
      const payload = token.split('.')[1];
      if (!payload) return true;
      const exp = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))).exp;
      return typeof exp === 'number' ? exp * 1000 <= Date.now() : false;
    } catch {
      return true;
    }
  }
}
