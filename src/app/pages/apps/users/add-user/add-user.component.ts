import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { UsersService } from 'src/app/services/apps/users/users.service';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm  = group.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  standalone: true,
  selector: 'app-add-user',
  imports: [MaterialModule, FormsModule, ReactiveFormsModule, CommonModule, TablerIconsModule],
  templateUrl: './add-user.component.html',
})
export class AddUserComponent {
  isSaving = false;
  hidePassword = true;
  hideConfirm  = true;

  readonly roleOptions = ['ADMIN', 'MANAGER','OPERATEUR','COMPTABLE'];

  form = new FormGroup(
    {
      username:        new FormControl('', [Validators.required, Validators.minLength(5)]),
      nomUsers:        new FormControl('', [Validators.required]),
      prenomsUsers:    new FormControl('', [Validators.required]),
      emailUsers:      new FormControl('', [Validators.required, Validators.email]),
      tel1Users:       new FormControl(''),
      password:        new FormControl('', [Validators.required, Validators.minLength(8)]),
      confirmPassword: new FormControl('', [Validators.required]),
      roleCode:        new FormControl('USER', [Validators.required]),
      active:          new FormControl(true),
      cguUsers:        new FormControl(false),
    },
    { validators: passwordMatchValidator }
  );

  get f() { return this.form.controls; }
  get passwordMismatch(): boolean {
    return this.form.hasError('passwordMismatch') &&
      (this.f['confirmPassword'].dirty || this.f['confirmPassword'].touched);
  }

  constructor(
    private usersService: UsersService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSaving = true;

    this.usersService.createUser({
      username:     this.f['username'].value!,
      nomUsers:     this.f['nomUsers'].value!,
      prenomsUsers: this.f['prenomsUsers'].value!,
      emailUsers:   this.f['emailUsers'].value!,
      tel1Users:    this.f['tel1Users'].value ?? '',
      password:     this.f['password'].value!,
      roleCode:     this.f['roleCode'].value!,
      active:       this.f['active'].value!,
      cguUsers:     this.f['cguUsers'].value!,
    }).subscribe({
      next: () => {
        this.isSaving = false;
        this.snackBar.open('Utilisateur créé avec succès', 'Fermer', {
          duration: 3000, horizontalPosition: 'center', verticalPosition: 'top',
        });
        void this.router.navigate(['/apps/users']);
      },
      error: (err) => {
        this.isSaving = false;

        // 2xx avec corps non-JSON → parsing échoue mais la création a réussi
        if (err?.status >= 200 && err?.status < 300) {
          this.snackBar.open('Utilisateur créé avec succès', 'Fermer', {
            duration: 3000, horizontalPosition: 'center', verticalPosition: 'top',
          });
          void this.router.navigate(['/apps/users']);
          return;
        }

        const message = this.extractErrorMessage(err);
        this.snackBar.open(message, 'Fermer', {
          duration: 4000, horizontalPosition: 'center', verticalPosition: 'top',
        });
      },
    });
  }

  private extractErrorMessage(err: any): string {
    if (!err?.error) return 'Erreur lors de la création';
    if (typeof err.error === 'string') {
      try {
        const parsed = JSON.parse(err.error);
        return parsed?.message ?? parsed?.error ?? 'Erreur lors de la création';
      } catch {
        return err.error.length < 200 ? err.error : 'Erreur lors de la création';
      }
    }
    return err.error?.message ?? err.error?.error ?? 'Erreur lors de la création';
  }

  goBack(): void {
    void this.router.navigate(['/apps/users']);
  }
}
