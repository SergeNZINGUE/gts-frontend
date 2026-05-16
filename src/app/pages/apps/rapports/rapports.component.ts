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
import { ExportService } from 'src/app/services/export/export.service';


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
  hasResultsPer = false;
  readonly colsPer = ['engin', 'client', 'conducteur', 'dateDebut', 'dateFin', 'heures', 'montant', 'statut'];

  // Tab 2 — Locations par client
  clientSearchCtrl = new FormControl('');
  filteredClients: Client[] = [];
  selectedClientId: number | null = null;
  locationsCliDs = new MatTableDataSource<LocationRapportDto>([]);
  loadingCli = false;
  hasResultsCli = false;
  readonly colsCli = ['engin', 'conducteur', 'dateDebut', 'dateFin', 'heures', 'montant', 'statut'];

  // Tab 3 — Missions par conducteur
  conducteurSearchCtrl = new FormControl('');
  filteredConducteurs: Employee[] = [];
  selectedConducteurId: number | null = null;
  selectedConducteur: Employee | null = null;
  misMoisCtrl = new FormControl<number>(new Date().getMonth() + 1);
  misAnneeCtrl = new FormControl<number>(new Date().getFullYear());
  missionsDs = new MatTableDataSource<MissionRapportDto>([]);
  loadingMis = false;
  hasResultsMis = false;
  readonly colsMis = ['mission', 'engin', 'client', 'dateDebut', 'dateFin', 'heures', 'remuneration', 'statut'];
  readonly moisOptions = [
    { value: 1, label: 'Janvier' }, { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },     { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' }, { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },{ value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },{ value: 12, label: 'Décembre' },
  ];

  // Tab 4 — Suivi des impayés
  clientImpSearchCtrl = new FormControl('');
  filteredClientsImp: Client[] = [];
  selectedClientImpId: number | null = null;
  impayesDs = new MatTableDataSource<FactureImpayeeDto>([]);
  loadingImp = false;
  hasResultsImp = false;
  readonly colsImp = ['facture', 'client', 'dateFacture', 'dateEcheance', 'montantTTC', 'montantPaye', 'resteAPayer', 'statut'];

  constructor(
    private fb: FormBuilder,
    private clientsService: ClientsService,
    private employeeService: EmployeeService,
    private reportingService: ReportingService,
    private exportService: ExportService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe,
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
        console.log("clients",clients);
        console.log("conducteurs",conducteurs);
        console.log("this.filteredClients",this.filteredClients);
        console.log("conducteurs",conducteurs);
        console.log("this.filteredConducteurs",this.filteredClients);
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
    console.log("v",v);
    const dateDebut = (v.dateDebut as Date).toISOString().split('T')[0];
    const dateFin   = (v.dateFin   as Date).toISOString().split('T')[0];
    console.log("dateDebut",dateDebut);
    console.log("dateFin",dateFin);
    this.loadingPer = true;
    this.reportingService.getLocationsPeriode(dateDebut, dateFin).subscribe({
      next: (data) => { this.locationsPerDs.data = data; this.hasResultsPer = data.length > 0; this.loadingPer = false; },
      error: () => { this.snack('Erreur de chargement'); this.loadingPer = false; },
    });
  }

  get totalMontantPer(): number {
    return this.locationsPerDs.data.reduce((s, d) => s + (d.montantMissionsHT ?? 0), 0);
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
      next: (data) => { this.locationsCliDs.data = data; this.hasResultsCli = data.length > 0; this.loadingCli = false; },
      error: () => { this.snack('Erreur de chargement'); this.loadingCli = false; },
    });
  }

  get totalMontantCli(): number {
    return this.locationsCliDs.data.reduce((s, d) => s + (d.montantMissionsHT ?? 0), 0);
  }

  // ── Tab 3 ─────────────────────────────────────────────────────────────
  get anneesOptions(): number[] {
    const y = new Date().getFullYear();
    return [y - 3, y - 2, y - 1, y, y + 1];
  }

  get totalHeuresMis(): number {
    return this.missionsDs.data.reduce((s, r) => s + (r.nbHeures ?? 0), 0);
  }

  get totalRemunerationMis(): number {
    const tarif = this.selectedConducteur?.coutHoraireConducteur ?? 0;
    return this.totalHeuresMis * tarif;
  }

  selectConducteur(emp: Employee): void {
    this.selectedConducteurId = emp.id;
    this.selectedConducteur = emp;
    this.conducteurSearchCtrl.setValue(`${emp.nomConducteur} ${emp.prenomsConducteur}`, { emitEvent: false });
  }

  searchMissionsConducteur(): void {
    if (!this.selectedConducteurId) { this.snack('Veuillez sélectionner un conducteur'); return; }
    const mois  = this.misMoisCtrl.value!;
    const annee = this.misAnneeCtrl.value!;
    const dateDebut = `${annee}-${String(mois).padStart(2, '0')}-01`;
    const lastDay   = new Date(annee, mois, 0).getDate();
    const dateFin   = `${annee}-${String(mois).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    this.loadingMis = true;
    this.reportingService.getMissionsConducteur(this.selectedConducteurId, dateDebut, dateFin).subscribe({
      next: (data) => { this.missionsDs.data = data; this.hasResultsMis = data.length > 0; this.loadingMis = false; },
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
      next: (data) => { this.impayesDs.data = data; this.hasResultsImp = data.length > 0; this.loadingImp = false; },
      error: () => { this.snack('Erreur de chargement'); this.loadingImp = false; },
    });
  }

  get totalResteAPayer(): number {
    return this.impayesDs.data.reduce((s, d) => s + (d.resteARegler ?? 0), 0);
  }

  get totalMontantTTC(): number {
    return this.impayesDs.data.reduce((s, d) => s + (d.montantTTC ?? 0), 0);
  }

  // ── Export ────────────────────────────────────────────────────────────
  private fmtDate(d?: string): string {
    return d ? this.datePipe.transform(d, 'dd/MM/yyyy') ?? '' : '';
  }

  exportPdf(tab: 'per' | 'cli' | 'mis' | 'imp'): void {
    const { headers, rows, title, filename, foot } = this.buildExportData(tab);
    this.exportService.exportPdf(title, filename, headers, rows, foot);
  }

  exportExcel(tab: 'per' | 'cli' | 'mis' | 'imp'): void {
    const { headers, rows, filename } = this.buildExportData(tab);
    this.exportService.exportExcel(filename, headers, rows);
  }

  private buildExportData(tab: 'per' | 'cli' | 'mis' | 'imp') {
    switch (tab) {
      case 'per': {
        const headers = ['Location', 'Engin', 'Marque', 'Client', 'Conducteur', 'Début', 'Fin', 'Nb Jours', 'Montant (FCFA)', 'Statut'];
        const rows = this.locationsPerDs.data.map((r: LocationRapportDto) => [
          r.codeLocation ?? '', r.enginModel ?? '', r.enginMarque ?? '', r.clientNom ?? '',
          r.conducteurNomComplet ?? '', this.fmtDate(r.dateDbtLoc), this.fmtDate(r.dateFinLoc),
          r.nbJoursLocation ?? 0, r.montantMissionsHT ?? 0, r.statut ?? '',
        ]);
        const totalJoursPer = this.locationsPerDs.data.reduce((s, r) => s + (r.nbJoursLocation ?? 0), 0);
        const totalMontantPer = this.locationsPerDs.data.reduce((s, r) => s + (r.montantMissionsHT ?? 0), 0);
        const foot: (string | number)[][] = [['TOTAL', '', '', '', '', '', '', totalJoursPer, totalMontantPer, '']];
        const debut = this.fmtDate((this.periodeForm.value.dateDebut as Date)?.toISOString());
        const fin   = this.fmtDate((this.periodeForm.value.dateFin   as Date)?.toISOString());
        return { headers, rows, foot, title: `Locations sur période : ${debut} - ${fin}`, filename: 'locations_periode' };
      }
      case 'cli': {
        const headers = ['Location', 'Engin', 'Marque', 'Conducteur', 'Début', 'Fin', 'Nb Jours', 'Montant (FCFA)', 'Statut'];
        const rows = this.locationsCliDs.data.map((r: LocationRapportDto) => [
          r.codeLocation ?? '', r.enginModel ?? '', r.enginMarque ?? '',
          r.conducteurNomComplet ?? '', this.fmtDate(r.dateDbtLoc), this.fmtDate(r.dateFinLoc),
          r.nbJoursLocation ?? 0, r.montantMissionsHT ?? 0, r.statut ?? '',
        ]);
        const totalJoursCli = this.locationsCliDs.data.reduce((s, r) => s + (r.nbJoursLocation ?? 0), 0);
        const totalMontantCli = this.locationsCliDs.data.reduce((s, r) => s + (r.montantMissionsHT ?? 0), 0);
        const foot: (string | number)[][] = [['TOTAL', '', '', '', '', '', totalJoursCli, totalMontantCli, '']];
        const client = this.clientSearchCtrl.value ?? '';
        return { headers, rows, foot, title: `Locations par client : ${client}`, filename: 'locations_client' };
      }
      case 'mis': {
        const tarif = this.selectedConducteur?.coutHoraireConducteur ?? 0;
        const headers = ['Mission', 'Lieu', 'Location', 'Client', 'Début', 'Fin', 'Heures', 'Rémunération (FCFA)', 'Statut'];
        const rows = this.missionsDs.data.map((r: MissionRapportDto) => [
          r.codeMission ?? r.codeLocation ?? '', r.lieuMission ?? '', r.codeLocation ?? '',
          r.clientNom ?? '', this.fmtDate(r.dateDebutMission), this.fmtDate(r.dateFinMission),
          r.nbHeures ?? 0, (r.nbHeures ?? 0) * tarif, r.statutMission ?? '',
        ]);
        const foot: (string | number)[][] = [['TOTAL', '', '', '', '', '', this.totalHeuresMis, this.totalRemunerationMis, '']];
        const conducteur = this.conducteurSearchCtrl.value ?? '';
        const moisLabel = this.moisOptions.find(m => m.value === this.misMoisCtrl.value)?.label ?? '';
        return { headers, rows, foot, title: `Missions : ${conducteur} — ${moisLabel} ${this.misAnneeCtrl.value}`, filename: 'missions_conducteur' };
      }
      case 'imp': {
        const headers = ['Facture', 'Location', 'Client', 'Site', 'Date émission', 'Jours', 'Montant TTC', 'Versé', 'Reste (FCFA)', 'Statut'];
        const rows = this.impayesDs.data.map((r: FactureImpayeeDto) => [
          `FAC-${r.factureId ?? ''}`, r.codeLocation ?? '', r.clientNom ?? '', r.siteLocation ?? '',
          this.fmtDate(r.dateEmission), r.joursDepuisEmission ?? '',
          r.montantTTC ?? 0, r.montantDejaVerse ?? 0, r.resteARegler ?? 0, r.etatPaiement ?? '',
        ]);
        const clientImp = this.clientImpSearchCtrl.value ? `${this.clientImpSearchCtrl.value}` : 'Tous les clients';
        return { headers, rows, foot: undefined, title: `Suivi des impayés : ${clientImp}`, filename: 'impayes' };
      }
    }
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
