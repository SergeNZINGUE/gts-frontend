import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { PieceRechange } from '../piece-rechange';

@Component({
  standalone: true,
  selector: 'app-add-piece-dialog',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './add-piece-dialog.component.html',
})
export class AddPieceDialogComponent {
  form: FormGroup;
  isEdit: boolean;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddPieceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PieceRechange | null,
  ) {
    this.isEdit = !!data?.id;
    this.form = this.fb.group({
      designation:          [data?.designation          ?? '', Validators.required],
      referenceConstructeur:[data?.referenceConstructeur ?? ''],
      quantiteEnStock:      [data?.quantiteEnStock       ?? 0,
                             [Validators.required, Validators.min(0)]],
      seuilAlerteStock:     [data?.seuilAlerteStock      ?? 5,
                             [Validators.required, Validators.min(0)]],
      prixUnitaireAchat:    [data?.prixUnitaireAchat     ?? null,
                             [Validators.required, Validators.min(0)]],
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.dialogRef.close(this.form.getRawValue());
  }

  cancel(): void { this.dialogRef.close(null); }
}
