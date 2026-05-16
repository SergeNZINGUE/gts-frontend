import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { MaterialModule } from 'src/app/material.module';
import { ClientsService } from 'src/app/services/apps/clients/clients.service';
import { EnginService } from 'src/app/services/apps/engin/engin.service';
import { LocationService } from 'src/app/services/apps/location/location.service';

import { Client } from '../../clients/client';
import { Engin } from '../../engins/engin';
import { EtatLocation } from '../etatLocation';

@Component({
  selector: 'app-add-location',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MaterialModule,
    MatNativeDateModule,
    MatDatepickerModule,
  ],
  providers: [DatePipe],
  templateUrl: './add-location.component.html',
  styleUrl: './add-location.component.scss',
})
export class AddLocationComponent implements OnInit {
  form: FormGroup;
  isSubmitting = false;

  clients: Client[] = [];
  engins: Engin[] = [];

  tariffMode: 'horaire' | 'journalier' | 'both' | 'none' | null = null;

  clientSearchCtrl = new FormControl('');
  enginSearchCtrl = new FormControl('');

  get filteredClients(): Client[] {
    const s = (this.clientSearchCtrl.value || '').toLowerCase();
    if (!s) return this.clients;
    return this.clients.filter((c) =>
      (c.nameClient || '').toLowerCase().includes(s)
    );
  }

  get filteredEngins(): Engin[] {
    const s = (this.enginSearchCtrl.value || '').toLowerCase();
    if (!s) return this.engins;
    return this.engins.filter((e) =>
      (e.codeEngin || '').toLowerCase().includes(s) ||
      (e.marqueEngin || '').toLowerCase().includes(s) ||
      (e.immatriculationEngin || '').toLowerCase().includes(s)
    );
  }

  onClientSelected(client: Client): void {
    this.form.patchValue({ clientId: client.id });
    this.clientSearchCtrl.setValue(client.nameClient || '');
  }

  onEnginSelected(engin: Engin): void {
    this.form.patchValue({ enginId: engin.id });
    this.enginSearchCtrl.setValue(
      `${engin.codeEngin || engin.id} — ${engin.marqueEngin || engin.immatriculationEngin || ''}`
    );
  }

  constructor(
    private fb: FormBuilder,
    private clientsService: ClientsService,
    private enginService: EnginService,
    private locationService: LocationService,
    private snackBar: MatSnackBar,
    private router: Router,
    private datePipe: DatePipe
  ) {
    this.form = this.fb.group({
      codeLocation: ['', Validators.required],
      statut: ['EN ATTENTE', Validators.required],
      etatLocation: [EtatLocation.ACTIF, Validators.required],

      clientId: ['', Validators.required],
      enginId: ['', Validators.required],

      siteLocation: ['', Validators.required],

      dateDbtLoc: ['', Validators.required],
      dateFinLoc: ['', Validators.required],
      nbJoursLocation: [{ value: 0, disabled: false }],

      coutHoraireLocation: [0],
      nbHeuresLocation: [0],
      coutJournalierLocation: [0],
    });
  }

  ngOnInit(): void {
    this.loadClients();
    this.loadEngins();
    this.listenDateChanges();
    this.listenEnginChange();
    this.generateLocationCode();
  }

  get selectedClientLabel(): string {
    const clientId = this.form.value.clientId;
    const client = this.clients.find((item) => item.id === clientId);

    return client?.nameClient || 'Non sélectionné';
  }

  get selectedEnginLabel(): string {
    const enginId = this.form.value.enginId;
    const engin = this.engins.find((item) => item.id === enginId);

    if (!engin) {
      return 'Non sélectionné';
    }

    return `${engin.codeEngin || engin.id} - ${engin.marqueEngin || engin.immatriculationEngin || ''}`;
  }

  get formattedDateDebut(): string {
    return this.formatDateForDisplay(this.form.value.dateDbtLoc);
  }

  get formattedDateFin(): string {
    return this.formatDateForDisplay(this.form.value.dateFinLoc);
  }

  get totalHeures(): number {
    const nbHeures = Number(this.form.value.nbHeuresLocation || 0);
    const nbJours = Number(this.form.value.nbJoursLocation || 0);
    return nbHeures * nbJours;
  }

  get totalEstime(): number {
    const nbJours = Number(this.form.value.nbJoursLocation || 0);
    const coutHoraire = Number(this.form.value.coutHoraireLocation || 0);
    const nbHeures = Number(this.form.value.nbHeuresLocation || 0);
    const coutJournalier = Number(this.form.value.coutJournalierLocation || 0);

    if (this.tariffMode === 'journalier') {
      return coutJournalier * nbJours;
    }

    if (this.tariffMode === 'horaire' || this.tariffMode === 'none') {
      return coutHoraire * nbHeures * nbJours;
    }

    return 0;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const payload = this.buildPayload();

    this.locationService.createLocation(payload).subscribe({
      next: () => {
        this.isSubmitting = false;

        this.snackBar.open('Location créée avec succès', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });

        this.router.navigate(['/apps/locations']);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Erreur création location:', error);

        this.snackBar.open('Erreur lors de la création de la location', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
    });
  }

  private generateLocationCode(): void {
    const year = new Date().getFullYear();
    const prefix = `LOC-${year}-`;
    this.locationService.getLocations().subscribe({
      next: (locations) => {
        const maxSeq = locations
          .map(l => l.codeLocation ?? '')
          .filter(c => c.startsWith(prefix))
          .map(c => parseInt(c.replace(prefix, ''), 10))
          .filter(n => !isNaN(n))
          .reduce((max, n) => Math.max(max, n), 0);
        const next = String(maxSeq + 1).padStart(3, '0');
        this.form.get('codeLocation')!.setValue(`${prefix}${next}`);
      },
      error: () => {
        this.form.get('codeLocation')!.setValue(`${prefix}001`);
      },
    });
  }

  private loadClients(): void {
    this.clientsService.getClients().subscribe({
      next: (clients) => {
        this.clients = clients;
      },
      error: (error) => {
        console.error('Erreur chargement clients:', error);
      },
    });
  }

  private loadEngins(): void {
    this.enginService.getEngins().subscribe({
      next: (engins) => {
        this.engins = engins.filter(e => e.statusEngin === 'DISPONIBLE');
      },
      error: (error) => {
        console.error('Erreur chargement engins:', error);
      },
    });
  }

  private listenDateChanges(): void {
    this.form.get('dateDbtLoc')?.valueChanges.subscribe((dateDebut) => {
      const dateFin = this.form.get('dateFinLoc')?.value;
      this.calculateNbJoursLocation(dateDebut, dateFin);
    });

    this.form.get('dateFinLoc')?.valueChanges.subscribe((dateFin) => {
      const dateDebut = this.form.get('dateDbtLoc')?.value;
      this.calculateNbJoursLocation(dateDebut, dateFin);
    });
  }

  private listenEnginChange(): void {
    this.form.get('enginId')?.valueChanges.subscribe((enginId) => {
      const engin = this.engins.find((e) => e.id === enginId);
      if (!engin) {
        this.tariffMode = null;
        return;
      }

      const hasHoraire = (engin.coutHorLocEngin ?? 0) > 0;
      const hasJournalier = (engin.forfaitJournalierEngin ?? 0) > 0;

      if (hasHoraire && hasJournalier) {
        this.tariffMode = 'both';
      } else if (hasHoraire) {
        this.tariffMode = 'horaire';
        this.form.patchValue(
          { coutHoraireLocation: engin.coutHorLocEngin, coutJournalierLocation: 0 },
          { emitEvent: false }
        );
      } else if (hasJournalier) {
        this.tariffMode = 'journalier';
        this.form.patchValue(
          { coutJournalierLocation: engin.forfaitJournalierEngin, coutHoraireLocation: 0 },
          { emitEvent: false }
        );
      } else {
        this.tariffMode = 'none';
        this.form.patchValue(
          { coutHoraireLocation: 0, coutJournalierLocation: 0 },
          { emitEvent: false }
        );
      }
    });
  }

  private calculateNbJoursLocation(dateDebut: Date | null, dateFin: Date | null): void {
    if (!dateDebut || !dateFin) {
      this.form.patchValue({ nbJoursLocation: 0 }, { emitEvent: false });
      return;
    }

    const start = new Date(dateDebut);
    const end = new Date(dateFin);

    if (end < start) {
      this.form.patchValue({ nbJoursLocation: 0 }, { emitEvent: false });
      return;
    }

    const utcStart = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const utcEnd = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
    const diffDays = Math.floor((utcEnd - utcStart) / (1000 * 60 * 60 * 24)) + 1;

    this.form.patchValue({ nbJoursLocation: diffDays }, { emitEvent: false });
  }

  private buildPayload() {

    return {

      codeLocation: this.form.value.codeLocation,
      statut: this.form.value.statut,
      etatLocation: this.form.value.etatLocation,

      siteLocation: this.form.value.siteLocation,

      dateDbtLoc: this.formatDateForApi(this.form.value.dateDbtLoc),
      dateFinLoc: this.formatDateForApi(this.form.value.dateFinLoc),
      nbJoursLocation: this.form.value.nbJoursLocation,

      coutHoraireLocation: Number(this.form.value.coutHoraireLocation || 0),
      nbHeuresLocation: Number(this.form.value.nbHeuresLocation || 0),
      coutJournalierLocation: Number(this.form.value.coutJournalierLocation || 0),

      clientId: this.form.value.clientId,
      enginId: this.form.value.enginId,
    };
  }

  private formatDateForApi(date: string | Date): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
  }

  private formatDateForDisplay(date: string | Date): string {
    return this.datePipe.transform(date, 'dd/MM/yyyy') || 'Non renseignée';
  }
}
