import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { PieceRechange } from '../piece-rechange';

export interface AjusterStockResult {
  delta: number;
  motif: string;
}

@Component({
  standalone: true,
  selector: 'app-ajuster-stock-dialog',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './ajuster-stock-dialog.component.html',
})
export class AjusterStockDialogComponent {
  form: FormGroup;

  readonly modeOptions = [
    { value: 'entree', label: 'Entrée (réception)', icon: 'add_circle', color: 'text-success' },
    { value: 'sortie', label: 'Sortie / utilisation',  icon: 'remove_circle', color: 'text-error' },
    { value: 'ajustement', label: 'Ajustement inventaire', icon: 'swap_horiz', color: 'text-primary' },
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AjusterStockDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public piece: PieceRechange,
  ) {
    this.form = this.fb.group({
      mode:     ['entree', Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]],
      motif:    [''],
    });
  }

  get stockApres(): number {
    const v = this.form.value;
    const q = v.quantite ?? 0;
    const actuel = this.piece.quantiteEnStock ?? 0;
    if (v.mode === 'entree')     return actuel + q;
    if (v.mode === 'sortie')     return actuel - q;
    if (v.mode === 'ajustement') return q; // q = valeur absolue cible
    return actuel;
  }

  get deltaReel(): number {
    const v = this.form.value;
    const q = v.quantite ?? 0;
    const actuel = this.piece.quantiteEnStock ?? 0;
    if (v.mode === 'entree')     return +q;
    if (v.mode === 'sortie')     return -q;
    if (v.mode === 'ajustement') return q - actuel;
    return 0;
  }

  get stockApresNegatif(): boolean { return this.stockApres < 0; }

  submit(): void {
    if (this.form.invalid || this.stockApresNegatif) return;
    const v = this.form.value;
    this.dialogRef.close({ delta: this.deltaReel, motif: v.motif });
  }

  cancel(): void { this.dialogRef.close(null); }
}
