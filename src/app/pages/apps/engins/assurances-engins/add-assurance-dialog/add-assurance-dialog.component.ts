import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { EnginService } from 'src/app/services/apps/engin/engin.service';
import { Engin } from '../../engin';
import { AssuranceEngin, StatutAssurance } from '../assurance-engin';

@Component({
  standalone: true,
  selector: 'app-add-assurance-dialog',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './add-assurance-dialog.component.html',
})
export class AddAssuranceDialogComponent implements OnInit {
  form: FormGroup;
  engins: Engin[] = [];
  filteredEngins: Engin[] = [];
  enginSearchCtrl = new FormControl('');
  isEdit: boolean;

  readonly statutOptions = [
    { value: StatutAssurance.VALIDE,  label: 'En cours' },
    { value: StatutAssurance.EXPIRE,  label: 'Expirée' },
    { value: StatutAssurance.ANNULE,  label: 'Suspendue' },
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddAssuranceDialogComponent>,
    private enginService: EnginService,
    @Inject(MAT_DIALOG_DATA) public data: AssuranceEngin | null,
  ) {
    this.isEdit = !!data?.id;
    this.form = this.fb.group({
      enginId:           [data?.enginId           ?? null,  Validators.required],
      numeroPolice:      [data?.numeroPolice       ?? '',    Validators.required],
      compagnieAssurance:[data?.compagnieAssurance ?? '',    Validators.required],
      dateDebut:         [data?.dateDebut ? new Date(data.dateDebut) : null, Validators.required],
      dateFin:           [data?.dateFin   ? new Date(data.dateFin)   : null, Validators.required],
      montant:           [data?.montant   ?? null, [Validators.required, Validators.min(0)]],
      documentUrl:       [data?.documentUrl ?? ''],
      statut:            [data?.statut ?? StatutAssurance.VALIDE, Validators.required],
    });

    if (this.isEdit) {
      this.form.get('numeroPolice')?.disable();
    }
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

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue();
    this.dialogRef.close({
      ...v,
      dateDebut: v.dateDebut instanceof Date ? v.dateDebut.toISOString().split('T')[0] : v.dateDebut,
      dateFin:   v.dateFin   instanceof Date ? v.dateFin.toISOString().split('T')[0]   : v.dateFin,
    });
  }

  cancel(): void { this.dialogRef.close(null); }
}
