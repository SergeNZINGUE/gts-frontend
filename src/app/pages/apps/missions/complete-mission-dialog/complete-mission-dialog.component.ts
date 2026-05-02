import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { Mission } from '../mission';

@Component({
  selector: 'app-complete-mission-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, MatDialogModule],
  templateUrl: './complete-mission-dialog.component.html',
})
export class CompleteMissionDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CompleteMissionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public mission: Mission
  ) {
    this.form = this.fb.group({
      responsableMission: [mission.responsableMission || '', Validators.required],
      heureDebutMission: [mission.heureDebutMission || '', Validators.required],
      heureFinMission: [mission.heureFinMission || '', Validators.required],
      kmDbtMission: [mission.kmDbtMission ?? null, Validators.required],
      kmFinMission: [mission.kmFinMission ?? null, Validators.required],
      carbtDbtMission: [mission.carbtDbtMission ?? null, Validators.required],
      carbtFinMission: [mission.carbtFinMission ?? null, Validators.required],
      materiauxMission: [mission.materiauxMission || '', Validators.required],
      qteMateriauxMission: [mission.qteMateriauxMission ?? null, Validators.required],
    });
  }

  get nbHeures(): number {
    const debut = this.form.value.heureDebutMission as string;
    const fin = this.form.value.heureFinMission as string;
    if (!debut || !fin) return 0;
    const [hD, mD] = debut.split(':').map(Number);
    const [hF, mF] = fin.split(':').map(Number);
    const diff = (hF * 60 + mF) - (hD * 60 + mD);
    return diff > 0 ? Math.round(diff / 60 * 10) / 10 : 0;
  }

  get kmParcourus(): number {
    const dbt = Number(this.form.value.kmDbtMission || 0);
    const fin = Number(this.form.value.kmFinMission || 0);
    return fin > dbt ? fin - dbt : 0;
  }

  get litresConsommes(): number {
    const dbt = Number(this.form.value.carbtDbtMission || 0);
    const fin = Number(this.form.value.carbtFinMission || 0);
    return dbt > fin ? dbt - fin : 0;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.nbHeures <= 0) {
      return;
    }
    this.dialogRef.close({ ...this.form.value, nbHeures: this.nbHeures });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
