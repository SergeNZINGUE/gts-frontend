import { Component } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { BrandingComponent } from '../../../layouts/full/vertical/sidebar/branding.component';
import {AuthService} from "../../../services/auth.service";

@Component({
    selector: 'app-side-login',
    imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, BrandingComponent],
    templateUrl: './side-login.component.html'
})
export class AppSideLoginComponent {
  options = this.settings.getOptions();

  constructor(private settings: CoreService, private router: Router,private authService:AuthService) { }

  form = new FormGroup({
    uname: new FormControl('', [Validators.required, Validators.minLength(5)]),
    password: new FormControl('', [Validators.required]),
  });

  get f() {
    return this.form.controls;
  }

  submit() {
    console.log('form',this.form.value);

    const username:string |null|undefined =this.form.value.uname;
    const password:string |null|undefined = this.form.value.password;

    this.authService.login( username,password)
      .subscribe(data=>{
          console.log('ici',data);
          this.router.navigate(['/dashboards/dashboard1']);
        }
        ,error=>{
          console.log('Erreur connexion',error);
        });


  }
}
