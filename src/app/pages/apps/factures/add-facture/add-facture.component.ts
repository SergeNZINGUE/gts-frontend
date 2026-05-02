import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MaterialModule } from 'src/app/material.module';
import { FacturesService } from 'src/app/services/apps/factures/factures.service';
import { LocationService } from 'src/app/services/apps/location/location.service';
import { MissionsService } from 'src/app/services/apps/missions/missions.service';
import { LocationEngin } from '../../locations/location-engin';
import { Mission } from '../../missions/mission';

@Component({
  selector: 'app-add-facture',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MaterialModule, MatNativeDateModule, MatDatepickerModule],
  providers: [DatePipe],
  templateUrl: './add-facture.component.html',
  styleUrl: './add-facture.component.scss',
})
export class AddFactureComponent implements OnInit {
  form: FormGroup;
  isSubmitting = false;

  locations: LocationEngin[] = [];
  locationSearchCtrl = new FormControl('');
  selectedLocation: LocationEngin | null = null;

  missionsDisponibles: Mission[] = [];
  selectedMissionIds: Set<number> = new Set();

  get filteredLocations(): LocationEngin[] {
    const s = (this.locationSearchCtrl.value || '').toLowerCase();
    if (!s) return this.locations;
    return this.locations.filter(
      (l) =>
        (l.codeLocation || '').toLowerCase().includes(s) ||
        (l.siteLocation || '').toLowerCase().includes(s)
    );
  }

  get montantHT(): number {
    return this.missionsDisponibles
      .filter((m) => m.id != null && this.selectedMissionIds.has(m.id))
      .reduce((sum, m) => sum + (m.sousTotal || 0), 0);
  }

  get montantTTC(): number {
    const tva = Number(this.form.value.tauxTVA || 0);
    return this.montantHT * (1 + tva / 100);
  }

  constructor(
    private fb: FormBuilder,
    private facturesService: FacturesService,
    private locationService: LocationService,
    private missionsService: MissionsService,
    private snackBar: MatSnackBar,
    private router: Router,
    private datePipe: DatePipe
  ) {
    this.form = this.fb.group({
      dateEmission: ['', Validators.required],
      tauxTVA: [18, [Validators.required, Validators.min(0)]],
      etatPaiement: ['BROUILLON', Validators.required],
      locationId: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadLocations();
  }

  onLocationSelected(location: LocationEngin): void {
    this.selectedLocation = location;
    this.form.patchValue({ locationId: location.id });
    this.locationSearchCtrl.setValue(
      `${location.codeLocation || location.id} — ${location.siteLocation || ''}`
    );
    this.selectedMissionIds.clear();
    this.loadMissionsForLocation(location.id!);
  }

  toggleMission(mission: Mission): void {
    if (mission.id == null) return;
    if (this.selectedMissionIds.has(mission.id)) {
      this.selectedMissionIds.delete(mission.id);
    } else {
      this.selectedMissionIds.add(mission.id);
    }
  }

  isMissionSelected(mission: Mission): boolean {
    return mission.id != null && this.selectedMissionIds.has(mission.id);
  }

  selectAllMissions(): void {
    this.missionsDisponibles.forEach((m) => { if (m.id != null) this.selectedMissionIds.add(m.id); });
  }

  deselectAllMissions(): void {
    this.selectedMissionIds.clear();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.selectedMissionIds.size === 0) {
      this.snackBar.open('Sélectionnez au moins une mission', 'Fermer', { duration: 3000, horizontalPosition: 'center', verticalPosition: 'top' });
      return;
    }

    this.isSubmitting = true;
    const payload = {
      dateEmission: this.datePipe.transform(this.form.value.dateEmission, 'yyyy-MM-dd') || '',
      tauxTVA: Number(this.form.value.tauxTVA),
      etatPaiement: this.form.value.etatPaiement,
      locationId: Number(this.form.value.locationId),
      missionIds: Array.from(this.selectedMissionIds),
    };

    this.facturesService.createFacture(payload).subscribe({
      next: (facture) => {
        this.isSubmitting = false;
        this.snackBar.open('Facture créée avec succès', 'Fermer', { duration: 3000, horizontalPosition: 'center', verticalPosition: 'top' });
        this.router.navigate(['/apps/factures/detail', facture.id]);
      },
      error: () => {
        this.isSubmitting = false;
        this.snackBar.open('Erreur lors de la création', 'Fermer', { duration: 3000, horizontalPosition: 'center', verticalPosition: 'top' });
      },
    });
  }

  private loadLocations(): void {
    this.locationService.getLocations().subscribe({
      next: (locations) => { this.locations = locations; },
    });
  }

  private loadMissionsForLocation(locationId: number): void {
    this.missionsService.getMissions().subscribe({
      next: (missions) => {
        // Only missions linked to this location that are not yet invoiced
        this.missionsDisponibles = missions.filter(
          (m) => m.locationId === locationId && !m.factureId
        );
      },
    });
  }
}
