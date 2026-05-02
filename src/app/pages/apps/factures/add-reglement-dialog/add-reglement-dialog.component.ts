import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MaterialModule } from 'src/app/material.module';
import { DatePipe } from '@angular/common';
import { Facture } from '../facture';

@Component({
  selector: 'app-add-reglement-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, MatDialogModule, MatNativeDateModule, MatDatepickerModule],
  providers: [DatePipe],
  templateUrl: './add-reglement-dialog.component.html',
})
export class AddReglementDialogComponent {
  form: FormGroup;

  get resteAPayer(): number {
    const versements = (this.facture.reglements || []).reduce((s, r) => s + (r.montantVerse || 0), 0);
    return (this.facture.montantTTC || 0) - versements;
  }

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    public dialogRef: MatDialogRef<AddReglementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public facture: Facture
  ) {
    this.form = this.fb.group({
      dateReglement: ['', Validators.required],
      montantVerse: [this.resteAPayer > 0 ? this.resteAPayer : null, [Validators.required, Validators.min(0.01)]],
      modePaiement: ['VIREMENT', Validators.required],
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close({
      dateReglement: this.datePipe.transform(this.form.value.dateReglement, 'yyyy-MM-dd') || '',
      montantVerse: Number(this.form.value.montantVerse),
      modePaiement: this.form.value.modePaiement,
      factureId: this.facture.id,
      clientId: this.facture.clientId,
    });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
