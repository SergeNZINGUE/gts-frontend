import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {tap} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public user:any= {
    admin1: {password: 1234, role: ['ADMIN', 'USER']},
    users1: {password: 1234, role: ['USER']}
  }
  public isLoggedIn:boolean=false;
  public isAdmin:boolean=false;
  public role:string[]=[''];
  public username:string|null|undefined='';
  private apiUrl = environment.apiUrl + '/api/gts/auth/login';

  constructor (private http:HttpClient)
  {

  }

  public login (username :string|null|undefined,password:string |null|undefined)  {
  return this.http.post <any>(this.apiUrl, {username,password}).pipe(
    tap((res:any) =>
    {
      this.isLoggedIn=true;
      this.username=username;
      console.log('res',res);
      console.log('isLoggedIn',this.isLoggedIn);

      if (res?.username) {
        localStorage.setItem('username', res.username);
      }

      if (res?.token) {
        localStorage.setItem('token', res.token);
      }
      if(res?.roles){
        this.role=res.roles;
        console.log('role',this.role);
        console.log('isAdmin',this.isAdmin);
        this.isAdmin=this.role.includes('ADMIN');
        console.log('isAdmin',this.isAdmin);
      }
    }
  )
  );
  }


  logout() {
    this.isLoggedIn=false;
    this.username = '';
    this.role = [];
    this.isAdmin = false;
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  }
}
