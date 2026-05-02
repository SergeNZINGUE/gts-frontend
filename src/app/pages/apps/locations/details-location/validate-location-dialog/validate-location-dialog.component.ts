import {Component, Inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';

export interface ValidateLocationDialogData {
  codeLocation?: string;
  coutHoraireLocation?: number;
  coutJournalierLocation?: number;
}

export interface ValidateLocationDialogResult {
  coutHoraireLocation?: number;
  coutJournalierLocation?: number;
}

@Component({
  selector: 'app-validate-location-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatFormField,
    MatLabel,
    MatInput,
  ],
  template: `
    <h2 mat-dialog-title>Valider la location</h2>

    <mat-dialog-content>
      <p class="mb-4">
        Location :
        <strong>{{ data.codeLocation || '-' }}</strong>
      </p>

      <p class="text-sm text-gray-500 mb-4">
        Veuillez saisir au moins un coût : coût horaire ou coût journalier.
      </p>

      <mat-form-field appearance="outline" class="w-full mb-3">
        <mat-label>Coût horaire</mat-label>
        <input
          matInput
          type="number"
          min="0"
          [(ngModel)]="coutHoraireLocation"
          placeholder="Ex: 15000"
        />
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Coût journalier</mat-label>
        <input
          matInput
          type="number"
          min="0"
          [(ngModel)]="coutJournalierLocation"
          placeholder="Ex: 100000"
        />
      </mat-form-field>

      @if (errorMessage) {
        <p class="text-red-500 text-sm mt-2">
          {{ errorMessage }}
        </p>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="close()">
        Annuler
      </button>

      <button mat-flat-button color="primary" type="button" (click)="confirm()">
        Confirmer
      </button>
    </mat-dialog-actions>
  `,
})
export class ValidateLocationDialogComponent {
  coutHoraireLocation?: number;
  coutJournalierLocation?: number;
  errorMessage = '';

  constructor(
    private dialogRef: MatDialogRef<ValidateLocationDialogComponent, ValidateLocationDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: ValidateLocationDialogData
  ) {
    this.coutHoraireLocation = data.coutHoraireLocation;
    this.coutJournalierLocation = data.coutJournalierLocation;
  }

  close(): void {
    this.dialogRef.close();
  }

  confirm(): void {
    const hasCoutHoraire =
      this.coutHoraireLocation !== undefined &&
      this.coutHoraireLocation !== null &&
      this.coutHoraireLocation > 0;

    const hasCoutJournalier =
      this.coutJournalierLocation !== undefined &&
      this.coutJournalierLocation !== null &&
      this.coutJournalierLocation > 0;

    if (!hasCoutHoraire && !hasCoutJournalier) {
      this.errorMessage = 'Veuillez saisir le coût horaire ou le coût journalier.';
      return;
    }else if (hasCoutHoraire && hasCoutJournalier) {
      this.errorMessage = 'Veuillez une seule valeur le coût horaire ou le coût journalier.';
      return;
    }

    this.dialogRef.close({
      coutHoraireLocation: this.coutHoraireLocation,
      coutJournalierLocation: this.coutJournalierLocation,
    });
  }
}
