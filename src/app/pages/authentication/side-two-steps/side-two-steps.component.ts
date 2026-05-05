import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MaterialModule } from '../../../material.module';
import { BrandingComponent } from '../../../layouts/full/vertical/sidebar/branding.component';
import { AuthService } from '../../../services/auth.service';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pwd  = group.get('newPassword')?.value;
  const conf = group.get('confirmPassword')?.value;
  return pwd && conf && pwd !== conf ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-side-two-steps',
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, CommonModule, BrandingComponent],
  templateUrl: './side-two-steps.component.html',
})
export class AppSideTwoStepsComponent implements OnInit {
  @ViewChildren('digitInput') digitInputs!: QueryList<ElementRef<HTMLInputElement>>;

  email = '';
  isLoading = false;
  isSending = false;
  authError: string | null = null;
  hidePassword = true;
  hideConfirm  = true;

  digits = new FormGroup({
    d0: new FormControl('', [Validators.required, Validators.pattern(/^\d$/)]),
    d1: new FormControl('', [Validators.required, Validators.pattern(/^\d$/)]),
    d2: new FormControl('', [Validators.required, Validators.pattern(/^\d$/)]),
    d3: new FormControl('', [Validators.required, Validators.pattern(/^\d$/)]),
    d4: new FormControl('', [Validators.required, Validators.pattern(/^\d$/)]),
    d5: new FormControl('', [Validators.required, Validators.pattern(/^\d$/)]),
  });

  passwords = new FormGroup(
    {
      newPassword:     new FormControl('', [Validators.required, Validators.minLength(8)]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: passwordMatchValidator }
  );

  get p() { return this.passwords.controls; }
  get passwordMismatch(): boolean {
    return this.passwords.hasError('passwordMismatch') &&
      (this.p['confirmPassword'].dirty || this.p['confirmPassword'].touched);
  }
  get codeValue(): string {
    return Object.values(this.digits.controls).map(c => c.value ?? '').join('');
  }

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.email = history.state?.email ?? '';
    if (!this.email) {
      void this.router.navigate(['/authentication/side-forgot-pwd']);
    }
  }

  onDigitInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    // garde un seul chiffre
    input.value = input.value.replace(/\D/g, '').slice(-1);
    const key = `d${index}` as 'd0' | 'd1' | 'd2' | 'd3' | 'd4' | 'd5';
    this.digits.controls[key].setValue(input.value);

    if (input.value && index < 5) {
      this.digitInputs.toArray()[index + 1].nativeElement.focus();
    }
  }

  onDigitKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !(event.target as HTMLInputElement).value && index > 0) {
      this.digitInputs.toArray()[index - 1].nativeElement.focus();
    }
  }

  resendCode(): void {
    if (!this.email || this.isSending) return;
    this.isSending = true;
    this.authError = null;
    this.authService.forgotPassword(this.email).subscribe({
      next: () => { this.isSending = false; },
      error: (err) => {
        this.isSending = false;
        if (err?.status >= 200 && err?.status < 300) return;
        this.authError = 'Erreur lors du renvoi du code.';
      },
    });
  }

  submit(): void {
    this.digits.markAllAsTouched();
    this.passwords.markAllAsTouched();
    if (this.digits.invalid || this.passwords.invalid) return;

    this.authError = null;
    this.isLoading = true;

    this.authService.resetPassword(
      this.email,
      this.codeValue,
      this.p['newPassword'].value!
    ).subscribe({
      next: () => {
        this.isLoading = false;
        void this.router.navigate(['/authentication/login'], {
          state: { passwordReset: true },
        });
      },
      error: (err) => {
        this.isLoading = false;
        if (err?.status >= 200 && err?.status < 300) {
          void this.router.navigate(['/authentication/login'], {
            state: { passwordReset: true },
          });
          return;
        }
        this.authError =
          err?.error?.message ?? err?.error ?? 'Code invalide ou expiré.';
      },
    });
  }
}