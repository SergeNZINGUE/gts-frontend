import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { MaterialModule } from 'src/app/material.module';
import { MissionsService } from 'src/app/services/apps/missions/missions.service';
import { LocationService } from 'src/app/services/apps/location/location.service';
import { LocationEngin } from '../../locations/location-engin';

@Component({
  selector: 'app-add-mission',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MaterialModule,
    MatNativeDateModule,
    MatDatepickerModule,
  ],
  providers: [DatePipe],
  templateUrl: './add-mission.component.html',
  styleUrl: './add-mission.component.scss',
})
export class AddMissionComponent implements OnInit {
  form: FormGroup;
  isSubmitting = false;

  locations: LocationEngin[] = [];
  locationSearchCtrl = new FormControl('');

  constructor(
    private fb: FormBuilder,
    private missionsService: MissionsService,
    private locationService: LocationService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private datePipe: DatePipe
  ) {
    this.form = this.fb.group({
      codeMission: ['', Validators.required],
      statutMission: ['EN COURS', Validators.required],
      prioriteMission: ['NORMALE', Validators.required],
      responsableMission: [''],

      locationId: ['', Validators.required],
      lieuMission: ['', Validators.required],

      dateDebutMission: [''],
      dateFinMission: [''],
      heureDebutMission: [''],
      heureFinMission: [''],

      kmDbtMission: [null],
      kmFinMission: [null],
      carbtDbtMission: [null],
      carbtFinMission: [null],

      materiauxMission: [''],
      qteMateriauxMission: [null],

      nbHeures: [0, Validators.required],
      tarifHoraireApplique: [0, Validators.required],

      descriptionMission: [''],
      observationMission: [''],
    });
  }

  ngOnInit(): void {
    this.loadLocations();
    this.listenTimeChanges();
  }

  get filteredLocations(): LocationEngin[] {
    const search = (this.locationSearchCtrl.value || '').toLowerCase();
    if (!search) return this.locations;
    return this.locations.filter(loc =>
      (loc.codeLocation || '').toLowerCase().includes(search) ||
      (loc.siteLocation || '').toLowerCase().includes(search)
    );
  }

  get sousTotal(): number {
    const nbHeures = Number(this.form.get('nbHeures')?.value || 0);
    const tarif = Number(this.form.get('tarifHoraireApplique')?.value || 0);
    return nbHeures * tarif;
  }

  get kmParcourus(): number {
    const kmDbt = Number(this.form.value.kmDbtMission || 0);
    const kmFin = Number(this.form.value.kmFinMission || 0);
    return kmFin > kmDbt ? kmFin - kmDbt : 0;
  }

  get litresConsommes(): number {
    const carbtDbt = Number(this.form.value.carbtDbtMission || 0);
    const carbtFin = Number(this.form.value.carbtFinMission || 0);
    return carbtDbt > carbtFin ? carbtDbt - carbtFin : 0;
  }

  get selectedLocationLabel(): string {
    const locationId = this.form.value.locationId;
    const location = this.locations.find((item) => item.id === locationId);

    if (!location) {
      return 'Non sélectionné';
    }

    return `${location.codeLocation || location.id} - ${location.siteLocation || ''}`;
  }

  get formattedDateDebut(): string {
    return this.formatDateForDisplay(this.form.value.dateDebutMission);
  }

  get formattedDateFin(): string {
    return this.formatDateForDisplay(this.form.value.dateFinMission);
  }

  onLocationSelected(location: LocationEngin): void {
    this.form.patchValue({
      locationId: location.id,
      tarifHoraireApplique: location.coutHoraireLocation || 0,
    });
    this.locationSearchCtrl.setValue(
      `${location.codeLocation || location.id} — ${location.siteLocation || ''}`
    );
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const payload = this.buildPayload();

    this.missionsService.createMission(payload).subscribe({
      next: () => {
        this.isSubmitting = false;

        this.snackBar.open('Mission créée avec succès', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });

        this.router.navigate(['/apps/missions']);
      },
      error: () => {
        this.isSubmitting = false;

        this.snackBar.open('Erreur lors de la création de la mission', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
    });
  }

  private listenTimeChanges(): void {
    this.form.get('heureDebutMission')?.valueChanges.subscribe((debut) => {
      this.calculateNbHeures(debut, this.form.get('heureFinMission')?.value);
    });
    this.form.get('heureFinMission')?.valueChanges.subscribe((fin) => {
      this.calculateNbHeures(this.form.get('heureDebutMission')?.value, fin);
    });
  }

  private calculateNbHeures(heureDebut: string, heureFin: string): void {
    if (!heureDebut || !heureFin) {
      this.form.patchValue({ nbHeures: 0 }, { emitEvent: false });
      return;
    }
    const [hD, mD] = heureDebut.split(':').map(Number);
    const [hF, mF] = heureFin.split(':').map(Number);
    const minutesDebut = hD * 60 + mD;
    const minutesFin = hF * 60 + mF;
    if (minutesFin <= minutesDebut) {
      this.form.patchValue({ nbHeures: 0 }, { emitEvent: false });
      return;
    }
    const heures = Math.round((minutesFin - minutesDebut) / 60 * 10) / 10;
    this.form.patchValue({ nbHeures: heures }, { emitEvent: false });
  }

  private loadLocations(): void {
    this.locationService.getLocations().subscribe({
      next: (locations) => {
        this.locations = locations;
        this.prefillFromRoute();
      },
    });
  }

  private prefillFromRoute(): void {
    const qp = this.route.snapshot.queryParamMap;
    const locationId = qp.get('locationId') ? Number(qp.get('locationId')) : null;
    const coutHoraire = qp.get('coutHoraireLoc') ? Number(qp.get('coutHoraireLoc')) : null;

    if (!locationId) return;

    const location = this.locations.find((l) => l.id === locationId);
    if (location) {
      this.form.patchValue({ locationId: location.id }, { emitEvent: false });
      this.locationSearchCtrl.setValue(
        `${location.codeLocation || location.id} — ${location.siteLocation || ''}`
      );
    } else {
      this.form.patchValue({ locationId }, { emitEvent: false });
    }

    if (coutHoraire !== null && coutHoraire > 0) {
      this.form.patchValue({ tarifHoraireApplique: coutHoraire }, { emitEvent: false });
    }
  }

  private buildPayload() {
    return {
      codeMission: Number(this.form.value.codeMission),
      statutMission: this.form.value.statutMission,
      prioriteMission: this.form.value.prioriteMission,
      responsableMission: this.form.value.responsableMission || undefined,

      locationId: this.form.value.locationId,
      lieuMission: this.form.value.lieuMission,

      dateDebutMission: this.form.value.dateDebutMission
        ? this.formatDateForApi(this.form.value.dateDebutMission)
        : undefined,
      dateFinMission: this.form.value.dateFinMission
        ? this.formatDateForApi(this.form.value.dateFinMission)
        : undefined,
      heureDebutMission: this.form.value.heureDebutMission || undefined,
      heureFinMission: this.form.value.heureFinMission || undefined,
      kmDbtMission: this.form.value.kmDbtMission
        ? Number(this.form.value.kmDbtMission)
        : undefined,
      kmFinMission: this.form.value.kmFinMission
        ? Number(this.form.value.kmFinMission)
        : undefined,
      carbtDbtMission: this.form.value.carbtDbtMission
        ? Number(this.form.value.carbtDbtMission)
        : undefined,
      carbtFinMission: this.form.value.carbtFinMission
        ? Number(this.form.value.carbtFinMission)
        : undefined,

      materiauxMission: this.form.value.materiauxMission || undefined,
      qteMateriauxMission: this.form.value.qteMateriauxMission
        ? Number(this.form.value.qteMateriauxMission)
        : undefined,

      nbHeures: Number(this.form.value.nbHeures || 0),
      tarifHoraireApplique: Number(this.form.value.tarifHoraireApplique || 0),

      descriptionMission: this.form.value.descriptionMission || undefined,
      observationMission: this.form.value.observationMission || undefined,
    };
  }

  private formatDateForApi(date: string | Date): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
  }

  private formatDateForDisplay(date: string | Date): string {
    return this.datePipe.transform(date, 'dd/MM/yyyy') || 'Non renseignée';
  }
}
