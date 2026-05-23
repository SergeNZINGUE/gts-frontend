import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { EnginService } from 'src/app/services/apps/engin/engin.service';
import { Engin } from '../../engin';
import { ControleVGP } from '../controle-vgp';

@Component({
  standalone: true,
  selector: 'app-add-controle-dialog',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './add-controle-dialog.component.html',
})
export class AddControleDialogComponent implements OnInit {
  form: FormGroup;
  engins: Engin[] = [];
  filteredEngins: Engin[] = [];
  enginSearchCtrl = new FormControl('');
  isEdit: boolean;

  readonly resultatOptions = [
    { value: 'CONFORME',       label: 'Conforme' },
    { value: 'AVEC_RESERVES',  label: 'Avec réserves' },
    { value: 'NON_CONFORME',   label: 'Non conforme' },
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddControleDialogComponent>,
    private enginService: EnginService,
    @Inject(MAT_DIALOG_DATA) public data: ControleVGP | null,
  ) {
    this.isEdit = !!data?.id;
    this.form = this.fb.group({
      enginId:               [data?.enginId ?? null,  Validators.required],
      dateDernierControle:   [data?.dateDernierControle   ? new Date(data.dateDernierControle)   : null, Validators.required],
      dateProchaineEcheance: [data?.dateProchaineEcheance ? new Date(data.dateProchaineEcheance) : null, Validators.required],
      organismeControleur:   [data?.organismeControleur   ?? '', Validators.required],
      numeroRapport:         [data?.numeroRapport          ?? ''],
      resultat:              [data?.resultat               ?? 'CONFORME', Validators.required],
      reserveVGP:            [data?.reserveVGP             ?? ''],
      estAlerteActive:       [data?.estAlerteActive        ?? true],
    });

    this.form.get('resultat')?.valueChanges.subscribe((val) => {
      const reserveCtrl = this.form.get('reserveVGP');
      if ( (val === 'NON_CONFORME')|| (val === 'AVEC_RESERVES')) {
        reserveCtrl?.setValidators(Validators.required);
      } else {
        reserveCtrl?.clearValidators();
        reserveCtrl?.setValue('');
      }
      reserveCtrl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.enginService.getEngins().subscribe((engins) => {
      this.engins = engins;
      this.filteredEngins = engins;
      if (this.data?.enginId) {
        const found = engins.find(e => e.id === this.data!.enginId);
        if (found) {
          this.enginSearchCtrl.setValue(`${found.codeEngin} — ${found.modelEngin}`, { emitEvent: false });
        }
      }
    });

    this.enginSearchCtrl.valueChanges.subscribe((val) => {
      const s = (val || '').toLowerCase();
      this.filteredEngins = this.engins.filter(
        e => e.codeEngin?.toLowerCase().includes(s) || e.modelEngin?.toLowerCase().includes(s),
      );
    });
  }

  selectEngin(engin: Engin): void {
    this.form.patchValue({ enginId: engin.id });
    this.enginSearchCtrl.setValue(`${engin.codeEngin} — ${engin.modelEngin}`, { emitEvent: false });
  }

  get showReserve(): boolean {
    return this.form.get('resultat')?.value === 'AVEC_RESERVES' || this.form.get('resultat')?.value === 'NON_CONFORME';
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.value;
    this.dialogRef.close({
      ...v,
      dateDernierControle:   v.dateDernierControle   instanceof Date ? v.dateDernierControle.toISOString().split('T')[0]   : v.dateDernierControle,
      dateProchaineEcheance: v.dateProchaineEcheance instanceof Date ? v.dateProchaineEcheance.toISOString().split('T')[0] : v.dateProchaineEcheance,
    });
  }

  cancel(): void { this.dialogRef.close(null); }
}
