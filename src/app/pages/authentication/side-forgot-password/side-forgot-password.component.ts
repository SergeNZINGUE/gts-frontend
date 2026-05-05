import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { BrandingComponent } from '../../../layouts/full/vertical/sidebar/branding.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-side-forgot-password',
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, BrandingComponent],
  templateUrl: './side-forgot-password.component.html',
})
export class AppSideForgotPasswordComponent {
  isLoading = false;
  authError: string | null = null;
  codeSent = false;

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  get f() { return this.form.controls; }

  constructor(private authService: AuthService, private router: Router) {}

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.authError = null;
    this.isLoading = true;

    const email = this.f['email'].value!;

    this.authService.forgotPassword(email).subscribe({
      next:(response)  => {
        console.log("[DEBUG] RESPONSE",response);
        this.isLoading = false;
        void this.router.navigate(
          ['/authentication/side-two-steps'],
          { state: { email } }
        );
      },
      error: (err) => {
        console.log("[DEBUG] RESPONSE",err);
        this.isLoading = false;
        if (err?.status >= 200 && err?.status < 300) {
          void this.router.navigate(
            ['/authentication/side-two-steps'],
            { state: { email } }
          );
          return;
        }
        this.authError =
          err?.error?.message ??
          err?.error ??
          'Aucun compte associé à cet email.';
      },
    });
  }
}
