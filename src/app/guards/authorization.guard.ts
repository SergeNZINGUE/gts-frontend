import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class AuthorizationGuard implements CanActivate {

  constructor(private router: Router, private toastr: ToastrService) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = localStorage.getItem('token');

    if (!token) {
      void this.router.navigate(['/authentication/login']);
      return false;
    }

    const requiredRoles: string[] = next.data['roles'] ?? [];
    if (requiredRoles.length === 0) return true;

    const userRoles: string[] = JSON.parse(localStorage.getItem('roles') || '[]');
    const hasRole = requiredRoles.some(r => userRoles.includes(r));

    if (!hasRole) {
      this.toastr.error(
        'Vous n\'avez pas les droits nécessaires pour accéder à cette page.',
        'Accès refusé',
        { timeOut: 4000, progressBar: true }
      );
      void this.router.navigate(['/dashboards/dashboard1']);
      return false;
    }

    return true;
  }
}
