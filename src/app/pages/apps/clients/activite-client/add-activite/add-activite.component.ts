import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { ActiviteClient } from '../activite-client';

export interface AddActiviteDialogData {
  /** Activité à modifier ; absent en création. */
  activite?: ActiviteClient;
  /** Codes déjà utilisés, pour refuser les doublons en création. */
  existingCodes: string[];
}

export interface AddActiviteDialogResult {
  codeActivite: string;
  libelleActivite: string;
}

@Component({
  standalone: true,
  selector: 'app-add-activite',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './add-activite.component.html',
  styleUrl: './add-activite.component.scss',
})
export class AddActiviteComponent {
  form: FormGroup;
  isEdit: boolean;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddActiviteComponent, AddActiviteDialogResult | null>,
    @Inject(MAT_DIALOG_DATA) public data: AddActiviteDialogData,
  ) {
    this.isEdit = !!data.activite?.codeActClt;
    const existing = new Set((data.existingCodes ?? []).map(c => c.toUpperCase()));

    this.form = this.fb.group({
      // Le code sert d'identifiant côté API : non modifiable en édition
      codeActivite: [
        { value: data.activite?.codeActClt ?? '', disabled: this.isEdit },
        this.isEdit
          ? []
          : [
              Validators.required,
              Validators.maxLength(20),
              Validators.pattern(/^[A-Za-z0-9_-]+$/),
              (c: AbstractControl): ValidationErrors | null =>
                existing.has(String(c.value ?? '').trim().toUpperCase()) ? { duplicate: true } : null,
            ],
      ],
      libelleActivite: [
        data.activite?.description ?? '',
        [Validators.required, Validators.maxLength(255)],
      ],
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const raw = this.form.getRawValue();
    this.dialogRef.close({
      codeActivite: String(raw.codeActivite).trim().toUpperCase(),
      libelleActivite: String(raw.libelleActivite).trim(),
    });
  }

  cancel(): void { this.dialogRef.close(null); }
}
