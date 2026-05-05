import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Client } from '../clients/client';
import { Employee } from '../employee/employee';
import { ClientsService } from 'src/app/services/apps/clients/clients.service';
import { EmployeeService } from 'src/app/services/apps/employee/employee.service';
import { ReportingService } from 'src/app/services/apps/reporting/reporting.service';
import { FactureImpayeeDto, LocationRapportDto, MissionRapportDto } from './rapport.models';

@Component({
  standalone: true,
  selector: 'app-rapports',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, TablerIconsModule, DatePipe, DecimalPipe],
  providers: [DatePipe, DecimalPipe],
  templateUrl: './rapports.component.html',
})
export class RapportsComponent implements OnInit, AfterViewInit {
  @ViewChild('paginatorPer') paginatorPer!: MatPaginator;
  @ViewChild('paginatorCli') paginatorCli!: MatPaginator;
  @ViewChild('paginatorMis') paginatorMis!: MatPaginator;
  @ViewChild('paginatorImp') paginatorImp!: MatPaginator;

  clients: Client[] = [];
  conducteurs: Employee[] = [];

  // Tab 1 — Locations sur période
  periodeForm: FormGroup;
  locationsPerDs = new MatTableDataSource<LocationRapportDto>([]);
  loadingPer = false;
  readonly colsPer = ['engin', 'client', 'conducteur', 'dateDebut', 'dateFin', 'heures', 'montant', 'statut'];

  // Tab 2 — Locations par client
  clientSearchCtrl = new FormControl('');
  filteredClients: Client[] = [];
  selectedClientId: number | null = null;
  locationsCliDs = new MatTableDataSource<LocationRapportDto>([]);
  loadingCli = false;
  readonly colsCli = ['engin', 'conducteur', 'dateDebut', 'dateFin', 'heures', 'montant', 'statut'];

  // Tab 3 — Missions par conducteur
  conducteurSearchCtrl = new FormControl('');
  filteredConducteurs: Employee[] = [];
  selectedConducteurId: number | null = null;
  missionsDs = new MatTableDataSource<MissionRapportDto>([]);
  loadingMis = false;
  readonly colsMis = ['mission', 'engin', 'client', 'dateDebut', 'dateFin', 'statut'];

  // Tab 4 — Suivi des impayés
  clientImpSearchCtrl = new FormControl('');
  filteredClientsImp: Client[] = [];
  selectedClientImpId: number | null = null;
  impayesDs = new MatTableDataSource<FactureImpayeeDto>([]);
  loadingImp = false;
  readonly colsImp = ['facture', 'client', 'dateFacture', 'dateEcheance', 'montantTTC', 'montantPaye', 'resteAPayer', 'statut'];

  constructor(
    private fb: FormBuilder,
    private clientsService: ClientsService,
    private employeeService: EmployeeService,
    private reportingService: ReportingService,
    private snackBar: MatSnackBar,
  ) {
    this.periodeForm = this.fb.group({
      dateDebut: [null, Validators.required],
      dateFin:   [null, Validators.required],
    });
  }

  ngOnInit(): void {
    forkJoin({
      clients:     this.clientsService.getClients(),
      conducteurs: this.employeeService.getEmployees(),
    }).subscribe({
      next: ({ clients, conducteurs }) => {
        this.clients = clients;
        this.conducteurs = conducteurs;
        this.filteredClients = clients;
        this.filteredClientsImp = clients;
        this.filteredConducteurs = conducteurs;
      },
      error: () => this.snack('Erreur de chargement des données'),
    });

    this.clientSearchCtrl.valueChanges.subscribe(val => {
      const s = (val || '').toLowerCase();
      this.filteredClients = this.clients.filter(
        c => c.nameClient?.toLowerCase().includes(s) || c.codeClient?.toLowerCase().includes(s),
      );
    });

    this.conducteurSearchCtrl.valueChanges.subscribe(val => {
      const s = (val || '').toLowerCase();
      this.filteredConducteurs = this.conducteurs.filter(
        e => e.nomConducteur?.toLowerCase().includes(s) || e.prenomsConducteur?.toLowerCase().includes(s),
      );
    });

    this.clientImpSearchCtrl.valueChanges.subscribe(val => {
      const s = (val || '').toLowerCase();
      this.filteredClientsImp = this.clients.filter(
        c => c.nameClient?.toLowerCase().includes(s) || c.codeClient?.toLowerCase().includes(s),
      );
    });
  }

  ngAfterViewInit(): void {
    this.locationsPerDs.paginator = this.paginatorPer;
    this.locationsCliDs.paginator = this.paginatorCli;
    this.missionsDs.paginator     = this.paginatorMis;
    this.impayesDs.paginator      = this.paginatorImp;
  }

  // ── Tab 1 ─────────────────────────────────────────────────────────────
  searchLocationsPeriode(): void {
    if (this.periodeForm.invalid) { this.periodeForm.markAllAsTouched(); return; }
    const v = this.periodeForm.value;
    const dateDebut = (v.dateDebut as Date).toISOString().split('T')[0];
    const dateFin   = (v.dateFin   as Date).toISOString().split('T')[0];
    this.loadingPer = true;
    this.reportingService.getLocationsPeriode(dateDebut, dateFin).subscribe({
      next: (data) => { this.locationsPerDs.data = data; this.loadingPer = false; },
      error: () => { this.snack('Erreur de chargement'); this.loadingPer = false; },
    });
  }

  get totalMontantPer(): number {
    return this.locationsPerDs.data.reduce((s, d) => s + (d.montantTotal ?? 0), 0);
  }

  // ── Tab 2 ─────────────────────────────────────────────────────────────
  selectClient(client: Client): void {
    this.selectedClientId = client.id ?? null;
    this.clientSearchCtrl.setValue(`${client.codeClient} — ${client.nameClient}`, { emitEvent: false });
  }

  searchLocationsClient(): void {
    if (!this.selectedClientId) { this.snack('Veuillez sélectionner un client'); return; }
    this.loadingCli = true;
    this.reportingService.getLocationsClient(this.selectedClientId).subscribe({
      next: (data) => { this.locationsCliDs.data = data; this.loadingCli = false; },
      error: () => { this.snack('Erreur de chargement'); this.loadingCli = false; },
    });
  }

  get totalMontantCli(): number {
    return this.locationsCliDs.data.reduce((s, d) => s + (d.montantTotal ?? 0), 0);
  }

  // ── Tab 3 ─────────────────────────────────────────────────────────────
  selectConducteur(emp: Employee): void {
    this.selectedConducteurId = emp.id;
    this.conducteurSearchCtrl.setValue(`${emp.nomConducteur} ${emp.prenomsConducteur}`, { emitEvent: false });
  }

  searchMissionsConducteur(): void {
    if (!this.selectedConducteurId) { this.snack('Veuillez sélectionner un conducteur'); return; }
    this.loadingMis = true;
    this.reportingService.getMissionsConducteur(this.selectedConducteurId).subscribe({
      next: (data) => { this.missionsDs.data = data; this.loadingMis = false; },
      error: () => { this.snack('Erreur de chargement'); this.loadingMis = false; },
    });
  }

  // ── Tab 4 ─────────────────────────────────────────────────────────────
  selectClientImp(client: Client): void {
    this.selectedClientImpId = client.id ?? null;
    this.clientImpSearchCtrl.setValue(`${client.codeClient} — ${client.nameClient}`, { emitEvent: false });
  }

  clearClientImp(): void {
    this.selectedClientImpId = null;
    this.clientImpSearchCtrl.setValue('', { emitEvent: false });
    this.filteredClientsImp = this.clients;
  }

  searchImpayes(): void {
    this.loadingImp = true;
    this.reportingService.getImpayes(this.selectedClientImpId ?? undefined).subscribe({
      next: (data) => { this.impayesDs.data = data; this.loadingImp = false; },
      error: () => { this.snack('Erreur de chargement'); this.loadingImp = false; },
    });
  }

  get totalResteAPayer(): number {
    return this.impayesDs.data.reduce((s, d) => s + (d.resteAPayer ?? 0), 0);
  }

  get totalMontantTTC(): number {
    return this.impayesDs.data.reduce((s, d) => s + (d.montantTTC ?? 0), 0);
  }

  // ── Helpers ───────────────────────────────────────────────────────────
  getStatutLocationClass(statut?: string): string {
    switch (statut) {
      case 'EN_COURS':  return 'bg-blue-500';
      case 'TERMINEE':  return 'bg-green-500';
      case 'ANNULEE':   return 'bg-red-500';
      default:          return 'bg-gray-400';
    }
  }

  getStatutMissionClass(statut?: string): string {
    switch (statut) {
      case 'EN_COURS':   return 'bg-blue-500';
      case 'TERMINEE':   return 'bg-green-500';
      case 'EN_ATTENTE': return 'bg-yellow-500';
      case 'ANNULEE':    return 'bg-red-500';
      default:           return 'bg-gray-400';
    }
  }

  getStatutFactureClass(statut?: string): string {
    switch (statut) {
      case 'PAYEE':                return 'bg-green-500';
      case 'PARTIELLEMENT_PAYEE':  return 'bg-yellow-500';
      case 'NON_PAYEE':            return 'bg-red-500';
      default:                     return 'bg-gray-400';
    }
  }

  private snack(msg: string): void {
    this.snackBar.open(msg, 'Fermer', {
      duration: 3000, horizontalPosition: 'center', verticalPosition: 'top',
    });
  }
}
