import {ActivatedRouteSnapshot, CanActivate, CanActivateFn, Router, RouterStateSnapshot} from '@angular/router';
import {Injectable} from "@angular/core";
@Injectable(
  {providedIn: 'root'}
)
export class AuthGuard implements CanActivate {
  constructor(private routes: Router) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (localStorage.getItem('username') != null) {
      return true;
    } else {
      this.routes.navigate(['/authentication/login']);
      return false;
    }
  }
}
