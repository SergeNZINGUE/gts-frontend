import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { UsersService } from 'src/app/services/apps/users/users.service';
import { UserResponse } from '../user-response';

@Component({
  standalone: true,
  selector: 'app-details-user',
  imports: [MaterialModule, FormsModule, ReactiveFormsModule, CommonModule, TablerIconsModule],
  templateUrl: './details-user.component.html',
})
export class DetailsUserComponent implements OnInit {
  isLoading = false;
  isSaving = false;
  isSendingCode = false;
  user: UserResponse | null = null;

  readonly roleOptions = ['ADMIN', 'USER'];

  form = new FormGroup({
    username:     new FormControl('', [Validators.required, Validators.minLength(5)]),
    nomUsers:     new FormControl('', [Validators.required]),
    prenomsUsers: new FormControl('', [Validators.required]),
    emailUsers:   new FormControl('', [Validators.required, Validators.email]),
    tel1Users:    new FormControl(''),
    roleCode:     new FormControl('USER', [Validators.required]),
    active:       new FormControl(true),
    cguUsers:     new FormControl(false),
  });

  get f() { return this.form.controls; }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UsersService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) { this.loadUser(id); }
  }

  loadUser(id: number): void {
    this.isLoading = true;
    this.usersService.getUserById(id).subscribe({
      next: (user) => {
        this.user = user;
        this.form.patchValue({
          username:     user.username,
          nomUsers:     user.nomUsers,
          prenomsUsers: user.prenomsUsers,
          emailUsers:   user.emailUsers,
          tel1Users:    user.tel1Users,
          roleCode:     user.roles?.[0] ?? 'USER',
          active:       user.active,
          cguUsers:     user.cguUsers,
        });
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snack('Erreur de chargement de l\'utilisateur');
      },
    });
  }

  submit(): void {
    if (this.form.invalid || !this.user) { return; }
    this.isSaving = true;

    this.usersService.updateUser(this.user.id, {
      username:     this.f['username'].value!,
      nomUsers:     this.f['nomUsers'].value!,
      prenomsUsers: this.f['prenomsUsers'].value!,
      emailUsers:   this.f['emailUsers'].value!,
      tel1Users:    this.f['tel1Users'].value ?? '',
      roleCode:     this.f['roleCode'].value!,
      active:       this.f['active'].value!,
      cguUsers:     this.f['cguUsers'].value!,
    }).subscribe({
      next: () => {
        this.isSaving = false;
        this.snack('Utilisateur mis à jour');
      },
      error: () => {
        this.isSaving = false;
        this.snack('Erreur lors de la mise à jour');
      },
    });
  }

  sendVerificationCode(): void {
    if (!this.user) { return; }
    this.isSendingCode = true;
    this.usersService.sendVerificationCode(this.user.id).subscribe({
      next: () => {
        this.isSendingCode = false;
        this.snack(`Code de vérification envoyé à ${this.user!.emailUsers}`);
      },
      error: () => {
        this.isSendingCode = false;
        this.snack("Erreur lors de l'envoi du code");
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/apps/users']);
  }

  private snack(msg: string): void {
    this.snackBar.open(msg, 'Fermer', {
      duration: 3000, horizontalPosition: 'center', verticalPosition: 'top',
    });
  }
}