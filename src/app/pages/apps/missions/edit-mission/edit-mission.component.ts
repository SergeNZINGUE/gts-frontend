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
import { forkJoin } from 'rxjs';

import { MaterialModule } from 'src/app/material.module';
import { MissionsService } from 'src/app/services/apps/missions/missions.service';
import { LocationService } from 'src/app/services/apps/location/location.service';
import { EmployeeService } from 'src/app/services/apps/employee/employee.service';
import { LocationEngin } from '../../locations/location-engin';
import { Employee } from '../../employee/employee';
import { Mission } from '../mission';

@Component({
  selector: 'app-edit-mission',
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
  templateUrl: './edit-mission.component.html',
  styleUrl: './edit-mission.component.scss',
})
export class EditMissionComponent implements OnInit {
  form: FormGroup;
  isSubmitting = false;
  isLoading = true;
  missionId!: number;

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

      conducteurId: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.missionId = Number(this.route.snapshot.paramMap.get('id'));
    this.listenTimeChanges();

    forkJoin({
      locations: this.locationService.getLocations(),
      conducteurs: this.employeeService.getEmployees(),
      mission: this.missionsService.getMissionById(this.missionId),
    }).subscribe({
      next: ({ locations, conducteurs, mission }) => {
        this.locations = locations;
        this.conducteurs = conducteurs;
        this.prefillForm(mission);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Erreur lors du chargement de la mission', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
    });
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
    const location = this.locations.find(item => item.id === locationId);
    if (!location) return 'Non sélectionné';
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

    this.missionsService.editMission(this.missionId, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.snackBar.open('Mission modifiée avec succès', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.router.navigate(['/apps/missions']);
      },
      error: () => {
        this.isSubmitting = false;
        this.snackBar.open('Erreur lors de la modification de la mission', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
    });
  }

  private prefillForm(mission: Mission): void {
    const conducteurId = mission.conducteurId ?? mission.conducteur?.id ?? null;

    this.form.patchValue({
      codeMission: mission.codeMission || '',
      statutMission: mission.statutMission || 'EN COURS',
      prioriteMission: mission.prioriteMission || 'NORMALE',
      responsableMission: mission.responsableMission || '',
      locationId: mission.locationId || null,
      lieuMission: mission.lieuMission || '',
      dateDebutMission: mission.dateDebutMission ? new Date(mission.dateDebutMission) : null,
      dateFinMission: mission.dateFinMission ? new Date(mission.dateFinMission) : null,
      heureDebutMission: mission.heureDebutMission || '',
      heureFinMission: mission.heureFinMission || '',
      kmDbtMission: mission.kmDbtMission ?? null,
      kmFinMission: mission.kmFinMission ?? null,
      carbtDbtMission: mission.carbtDbtMission ?? null,
      carbtFinMission: mission.carbtFinMission ?? null,
      materiauxMission: mission.materiauxMission || '',
      qteMateriauxMission: mission.qteMateriauxMission ?? null,
      nbHeures: mission.nbHeures || 0,
      tarifHoraireApplique: mission.tarifHoraireApplique || 0,
      descriptionMission: mission.descriptionMission || '',
      observationMission: mission.observationMission || '',
      conducteurId,
    }, { emitEvent: false });

    const loc = this.locations.find(l => l.id === mission.locationId);
    if (loc) {
      this.locationSearchCtrl.setValue(
        `${loc.codeLocation || loc.id} — ${loc.siteLocation || ''}`
      );
    }

    if (conducteurId) {
      const cond = this.conducteurs.find(c => c.id === conducteurId);
      if (cond) {
        this.conducteurSearchCtrl.setValue(
          `${cond.codeConducteur} — ${cond.prenomsConducteur} ${cond.nomConducteur}`
        );
      }
    }
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

  private buildPayload(): Partial<any> {
    return {
      codeMission: this.form.value.codeMission,
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
      kmDbtMission: this.form.value.kmDbtMission ? Number(this.form.value.kmDbtMission) : undefined,
      kmFinMission: this.form.value.kmFinMission ? Number(this.form.value.kmFinMission) : undefined,
      carbtDbtMission: this.form.value.carbtDbtMission ? Number(this.form.value.carbtDbtMission) : undefined,
      carbtFinMission: this.form.value.carbtFinMission ? Number(this.form.value.carbtFinMission) : undefined,

      materiauxMission: this.form.value.materiauxMission || undefined,
      qteMateriauxMission: this.form.value.qteMateriauxMission
        ? Number(this.form.value.qteMateriauxMission)
        : undefined,

      nbHeures: Number(this.form.value.nbHeures || 0),
      tarifHoraireApplique: Number(this.form.value.tarifHoraireApplique || 0),

      descriptionMission: this.form.value.descriptionMission || undefined,
      observationMission: this.form.value.observationMission || undefined,

      conducteurId: Number(this.form.value.conducteurId),
    };
  }

  private formatDateForApi(date: string | Date): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
  }

  private formatDateForDisplay(date: string | Date): string {
    return this.datePipe.transform(date, 'dd/MM/yyyy') || 'Non renseignée';
  }
}