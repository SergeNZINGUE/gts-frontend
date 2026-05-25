import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { EnginService } from 'src/app/services/apps/engin/engin.service';
import { CarburantReportingService } from 'src/app/services/apps/carburant/carburant-reporting.service';
import { Engin } from '../engin';
import {
  BilanCarburantEnginDto,
  ConsommationMissionDto,
  RapportCarburantResponse,
} from './carburant.models';

@Component({
  standalone: true,
  selector: 'app-consommation-carburant',
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    TablerIconsModule,
    DatePipe,
    DecimalPipe,
  ],
  providers: [DatePipe, DecimalPipe],
  templateUrl: './consommation-carburant.component.html',
})
export class ConsommationCarburantComponent implements OnInit, AfterViewInit {

  // ── Paginators / Sorts ────────────────────────────────────────────────────
  @ViewChild('paginatorBilans') paginatorBilans!: MatPaginator;
  @ViewChild('sortBilans')      sortBilans!: MatSort;
  @ViewChild('paginatorMis')    paginatorMis!: MatPaginator;
  @ViewChild('sortMis')         sortMis!: MatSort;

  // ── Formulaire filtre ─────────────────────────────────────────────────────
  filterForm: FormGroup;
  enginSearchCtrl = new FormControl('');
  engins: Engin[] = [];
  filteredEngins: Engin[] = [];
  selectedEnginId: number | null = null;

  // ── État ──────────────────────────────────────────────────────────────────
  loading  = false;
  rapport: RapportCarburantResponse | null = null;

  // ── Tables ────────────────────────────────────────────────────────────────
  bilansDs = new MatTableDataSource<BilanCarburantEnginDto>([]);
  misDs    = new MatTableDataSource<ConsommationMissionDto>([]);

  readonly colsBilans = [
    'codeEngin', 'modelEngin',
    'totalLitresPleins', 'coutTotalPleins', 'deltaHorametre', 'ratioHorairePleins',
    'nbMissionsTotal', 'tauxCouverture', 'consommationMissions', 'ratioHoraireMissions',
  ];

  readonly colsMis = [
    'dateTravail', 'codeMission', 'codeEngin',
    'carbtDbt', 'carbtFin', 'deltaReservoir', 'ravitaillementsLitres', 'consommationReelle',
    'nbHeures', 'ratioLH', 'statut',
  ];

  // ── Onglet missions : filtre complet / partiel ────────────────────────────
  misFilterCtrl  = new FormControl<'TOUS' | 'COMPLETS' | 'INCOMPLETS'>('TOUS');
  allMissions: ConsommationMissionDto[] = [];

  constructor(
    private fb: FormBuilder,
    private enginService: EnginService,
    private carburantService: CarburantReportingService,
    private snackBar: MatSnackBar,
  ) {
    const today    = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    this.filterForm = this.fb.group({
      dateDebut: [firstDay, Validators.required],
      dateFin:   [today,    Validators.required],
    });
  }

  ngOnInit(): void {
    this.enginService.getEngins().subscribe({
      next: (list) => { this.engins = list; this.filteredEngins = list; },
      error: () => this.snack('Impossible de charger la liste des engins'),
    });

    this.enginSearchCtrl.valueChanges.subscribe((val) => {
      const s = (val ?? '').toLowerCase();
      this.filteredEngins = this.engins.filter(
        (e) =>
          e.codeEngin?.toLowerCase().includes(s) ||
          e.modelEngin?.toLowerCase().includes(s),
      );
      if (!val) { this.selectedEnginId = null; }
    });

    this.misFilterCtrl.valueChanges.subscribe(() => this._applyMisFilter());
  }

  ngAfterViewInit(): void {
    this.bilansDs.paginator = this.paginatorBilans;
    this.bilansDs.sort      = this.sortBilans;
    this.misDs.paginator    = this.paginatorMis;
    this.misDs.sort         = this.sortMis;
  }

  // ── Sélection engin ───────────────────────────────────────────────────────
  selectEngin(e: Engin): void {
    this.selectedEnginId = e.id;
    this.enginSearchCtrl.setValue(`${e.codeEngin} — ${e.modelEngin}`, { emitEvent: false });
  }

  clearEngin(): void {
    this.selectedEnginId = null;
    this.enginSearchCtrl.setValue('', { emitEvent: false });
    this.filteredEngins = this.engins;
  }

  // ── Lancement de la recherche ─────────────────────────────────────────────
  search(): void {
    if (this.filterForm.invalid) { this.filterForm.markAllAsTouched(); return; }
    const v = this.filterForm.value;
    const dateDebut = (v.dateDebut as Date).toISOString().split('T')[0];
    const dateFin   = (v.dateFin   as Date).toISOString().split('T')[0];

    this.loading = true;
    this.carburantService.getRapport(dateDebut, dateFin, this.selectedEnginId).subscribe({
      next: (r) => {
        this.rapport = r;
        this.bilansDs.data = r.bilansParEngin;
        this.allMissions  = r.bilansParEngin.flatMap((b) => b.detailMissions);
        this._applyMisFilter();
        this.loading = false;
      },
      error: () => {
        this.snack('Erreur lors du chargement du rapport');
        this.loading = false;
      },
    });
  }

  private _applyMisFilter(): void {
    const f = this.misFilterCtrl.value;
    this.misDs.data = f === 'COMPLETS'
      ? this.allMissions.filter((m) => m.donneesCompletes)
      : f === 'INCOMPLETS'
        ? this.allMissions.filter((m) => !m.donneesCompletes)
        : this.allMissions;
  }

  // ── Totaux bilans ─────────────────────────────────────────────────────────
  get totalLitresBilans(): number {
    return this.bilansDs.data.reduce((s, b) => s + (b.totalLitresPleins ?? 0), 0);
  }
  get totalCoutBilans(): number {
    return this.bilansDs.data.reduce((s, b) => s + (b.coutTotalPleins ?? 0), 0);
  }
  get totalConsoMissions(): number {
    return this.bilansDs.data.reduce((s, b) => s + (b.consommationMissions ?? 0), 0);
  }

  // ── Totaux missions ───────────────────────────────────────────────────────
  get totalConsoMis(): number {
    return this.misDs.data
      .filter((m) => m.donneesCompletes)
      .reduce((s, m) => s + (m.consommationReelle ?? 0), 0);
  }
  get totalHeuresMis(): number {
    return this.misDs.data.reduce((s, m) => s + (m.nbHeures ?? 0), 0);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  private snack(msg: string): void {
    this.snackBar.open(msg, 'Fermer', {
      duration: 3500,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
