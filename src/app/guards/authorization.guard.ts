import {ActivatedRouteSnapshot, CanActivate, CanActivateFn, Router, RouterStateSnapshot} from '@angular/router';
import {Injectable} from "@angular/core";
import {AuthService} from "../services/auth.service";
@Injectable(
  {providedIn: 'root'}
)
export class AuthorizationGuard implements CanActivate {
  constructor(private routes: Router, private authService: AuthService) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (localStorage.getItem('username') != null) {
      if (this.authService.role.includes('ADMIN') && next.data["roles"].includes('ADMIN')) {
        return true;
      } else {
        this.routes.navigate(['/authentication/login']);
        return false;
      }
    }
    return false;
  }
}
