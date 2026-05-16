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
import { EmployeeService } from 'src/app/services/apps/employee/employee.service';
import { LocationEngin } from '../../locations/location-engin';
import { Employee } from '../../employee/employee';

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

  conducteurs: Employee[] = [];
  conducteurSearchCtrl = new FormControl('');

  constructor(
    private fb: FormBuilder,
    private missionsService: MissionsService,
    private locationService: LocationService,
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private datePipe: DatePipe
  ) {
    this.form = this.fb.group({
      codeMission: ['', Validators.required],
      prioriteMission: ['NORMALE', Validators.required],
      responsableMission: [''],

      locationId: ['', Validators.required],
      lieuMission: ['', Validators.required],

      dateDebutMission: [new Date()],
      dateFinMission: [new Date()],
      heureDebutMission: [''],
      heureFinMission: [''],

      kmDbtMission: [null],
      kmFinMission: [null],
      carbtDbtMission: [null],
      carbtFinMission: [null],
      compteurDbtMission: [null],
      compteurFinMission: [null],

      materiauxMission: [''],
      qteMateriauxMission: [null],

      nbHeures: [0, Validators.required],
      tarifHoraireApplique: [0, Validators.required],

      descriptionMission: [''],
      observationMission: [''],

      conducteurId: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadLocations();
    this.loadConducteurs();
    this.listenTimeChanges();
    this.generateMissionCode();
  }

  get filteredConducteurs(): Employee[] {
    const search = (this.conducteurSearchCtrl.value || '').toLowerCase();
    if (!search) return this.conducteurs;
    return this.conducteurs.filter(c =>
      (c.codeConducteur || '').toLowerCase().includes(search) ||
      (c.nomConducteur || '').toLowerCase().includes(search) ||
      (c.prenomsConducteur || '').toLowerCase().includes(search)
    );
  }

  get selectedConducteurLabel(): string {
    const id = this.form.value.conducteurId;
    const c = this.conducteurs.find(x => x.id === id);
    if (!c) return 'Non sélectionné';
    return `${c.prenomsConducteur} ${c.nomConducteur}`;
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

  onConducteurSelected(conducteur: Employee): void {
    this.form.patchValue({ conducteurId: conducteur.id });
    this.conducteurSearchCtrl.setValue(
      `${conducteur.codeConducteur} — ${conducteur.prenomsConducteur} ${conducteur.nomConducteur}`
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
      error: (err: any) => {
        this.isSubmitting = false;

        console.log('[DEBUG 403] status:', err?.status);
        console.log('[DEBUG 403] err.error:', err?.error);
        console.log('[DEBUG 403] typeof err.error:', typeof err?.error);
        console.log('[DEBUG 403] err.statusText:', err?.statusText);
        console.log('[DEBUG 403] err.message:', err?.message);
        console.log('[DEBUG 403] err.headers content-type:', err?.headers?.get('content-type'));

        const message =
          err?.error?.message ||
          err?.error?.error ||
          (typeof err?.error === 'string' ? err.error : null) ||
          'Erreur lors de la création de la mission';

        this.snackBar.open(message, 'Fermer', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
    });
  }

  private generateMissionCode(): void {
    const year = new Date().getFullYear();
    const prefix = `MI-${year}-`;
    this.missionsService.getMissions().subscribe({
      next: (missions) => {
        const maxSeq = missions
          .map(m => m.codeMission ?? '')
          .filter(c => c.startsWith(prefix))
          .map(c => parseInt(c.replace(prefix, ''), 10))
          .filter(n => !isNaN(n))
          .reduce((max, n) => Math.max(max, n), 0);
        const next = String(maxSeq + 1).padStart(3, '0');
        this.form.get('codeMission')!.setValue(`${prefix}${next}`);
      },
      error: () => {
        this.form.get('codeMission')!.setValue(`${prefix}001`);
      },
    });
  }

  private listenTimeChanges(): void {
    const fields = ['heureDebutMission', 'heureFinMission', 'compteurDbtMission', 'compteurFinMission'];
    fields.forEach(f => {
      this.form.get(f)?.valueChanges.subscribe(() => this.recalculateNbHeures());
    });
  }

  private recalculateNbHeures(): void {
    const compteurDbt = Number(this.form.get('compteurDbtMission')?.value || 0);
    const compteurFin = Number(this.form.get('compteurFinMission')?.value || 0);
    const diff = compteurFin - compteurDbt;

    if (diff > 0) {
      this.form.patchValue({ nbHeures: diff }, { emitEvent: false });
      return;
    }

    const heureDebut = this.form.get('heureDebutMission')?.value as string;
    const heureFin = this.form.get('heureFinMission')?.value as string;

    if (!heureDebut || !heureFin) {
      this.form.patchValue({ nbHeures: 0 }, { emitEvent: false });
      return;
    }
    const [hD, mD] = heureDebut.split(':').map(Number);
    const [hF, mF] = heureFin.split(':').map(Number);
    const minutesDiff = (hF * 60 + mF) - (hD * 60 + mD);
    const heures = minutesDiff > 0 ? Math.round(minutesDiff / 60 * 10) / 10 : 0;
    this.form.patchValue({ nbHeures: heures }, { emitEvent: false });
  }

  private loadConducteurs(): void {
    this.employeeService.getEmployees().subscribe({
      next: (conducteurs) => { this.conducteurs = conducteurs; },
    });
  }

  private loadLocations(): void {
    this.locationService.getLocations().subscribe({
      next: (locations) => {
        this.locations = locations.filter(l => l.statut === 'VALIDEE');
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
      codeMission: this.form.value.codeMission,
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
      compteurDbtMission: this.form.value.compteurDbtMission
        ? Number(this.form.value.compteurDbtMission)
        : undefined,
      compteurFinMission: this.form.value.compteurFinMission
        ? Number(this.form.value.compteurFinMission)
        : undefined,

      materiauxMission: this.form.value.materiauxMission || undefined,
      qteMateriauxMission: this.form.value.qteMateriauxMission
        ? Number(this.form.value.qteMateriauxMission)
        : undefined,

      nbHeures: Number(this.form.value.nbHeures || 0),
      tarifHoraireApplique: Number(this.form.value.tarifHoraireApplique || 0),

      descriptionMission: this.form.value.descriptionMission || undefined,
      observationMission: this.form.value.observationMission || undefined,

      conducteurId: Number(this.form.value.conducteurId),
      statutMission: 'EN_COURS'
    };
  }

  private formatDateForApi(date: string | Date): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
  }

  private formatDateForDisplay(date: string | Date): string {
    return this.datePipe.transform(date, 'dd-MM-yyyy') || 'Non renseignée';
  }
}
