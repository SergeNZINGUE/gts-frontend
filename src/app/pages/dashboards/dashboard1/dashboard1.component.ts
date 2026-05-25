import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { ClientsService } from 'src/app/services/apps/clients/clients.service';
import { EnginService } from 'src/app/services/apps/engin/engin.service';
import { MissionsService } from 'src/app/services/apps/missions/missions.service';
import { FacturesService } from 'src/app/services/apps/factures/factures.service';
import { AssurancesService } from 'src/app/services/apps/assurances/assurances.service';
import { ControlesVGPService } from 'src/app/services/apps/controles-vgp/controles-vgp.service';
import { LocationService } from 'src/app/services/apps/location/location.service';
import { DashboardService } from 'src/app/services/apps/dashboard/dashboard.service';
import { Mission } from 'src/app/pages/apps/missions/mission';
import { Facture } from 'src/app/pages/apps/factures/facture';
import { StatutAssurance } from 'src/app/pages/apps/engins/assurances-engins/assurance-engin';
import { forkJoin, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard1',
  standalone: true,
  imports: [CommonModule, MaterialModule, TablerIconsModule, RouterLink, DatePipe, DecimalPipe],
  providers: [DatePipe, DecimalPipe],
  templateUrl: './dashboard1.component.html',
})
export class AppDashboard1Component implements OnInit {
  isLoading = true;

  totalClients = 0;
  totalEngins = 0;
  enginsDisponibles = 0;

  totalMissions = 0;
  missionsEnCours = 0;
  missionsEnAttente = 0;

  // Locations
  totalLocationsAnnee = 0;   // locations démarrées dans l'année en cours
  locationsActives    = 0;   // locations en statut VALIDEE (toutes années)

  totalFactures = 0;
  montantAEncaisser = 0;
  facturesPayees = 0;

  // Assurances
  totalAssurances = 0;
  assurancesValides = 0;
  assurancesExpirees = 0;
  assurancesExpirantBientot = 0;

  // Contrôles VGP
  totalControles = 0;
  controlesConformes = 0;
  controlesEnRetard = 0;
  controlesBientot = 0;

  // ── KPI financiers ────────────────────────────────────────────────────────
  anneeEnCours = new Date().getFullYear();
  caAnneeEnCours      = 0;   // Σ montantTTC factures de l'année (hors brouillons)
  depensesCarburant   = 0;
  depensesMaintenance = 0;
  totalDepenses       = 0;
  kpiFinanciersLoaded = false;

  recentMissions: Mission[] = [];
  recentFactures: Facture[] = [];

  missionColumns = ['codeMission', 'lieuMission', 'dateTravail', 'statutMission'];
  factureColumns = ['id', 'clientNom', 'montantTTC', 'etatPaiement'];

  constructor(
    private clientsService: ClientsService,
    private enginService: EnginService,
    private missionsService: MissionsService,
    private facturesService: FacturesService,
    private assurancesService: AssurancesService,
    private controlesVGPService: ControlesVGPService,
    private locationService: LocationService,
    private dashboardService: DashboardService,
  ) {}

  ngOnInit(): void {
    // ── KPI dépenses (carburant + maintenance) ────────────────────────────
    this.dashboardService.getKpiDepenses(this.anneeEnCours)
      .pipe(
        tap({ error: (err) => console.error('[Dashboard] KPI dépenses — erreur API :', err) }),
        catchError(() => of(null)),
      )
      .subscribe(kpi => {
        if (kpi) {
          this.depensesCarburant   = kpi.depensesCarburant   ?? 0;
          this.depensesMaintenance = kpi.depensesMaintenance ?? 0;
          this.totalDepenses       = kpi.totalDepenses       ?? 0;
        }
        this.kpiFinanciersLoaded = true;
      });

    forkJoin({
      clients:    this.clientsService.getClients().pipe(catchError(() => of([]))),
      engins:     this.enginService.getEngins().pipe(catchError(() => of([]))),
      missions:   this.missionsService.getMissions().pipe(catchError(() => of([]))),
      factures:   this.facturesService.getFactures().pipe(catchError(() => of([]))),
      assurances: this.assurancesService.getAll().pipe(catchError(() => of([]))),
      controles:  this.controlesVGPService.getAll().pipe(catchError(() => of([]))),
      locations:  this.locationService.getLocations().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ clients, engins, missions, factures, assurances, controles, locations }) => {
        this.totalClients = clients.length;

        this.totalEngins = engins.length;
        this.enginsDisponibles = engins.filter(e => e.statusEngin === 'DISPONIBLE').length;

        this.totalMissions = missions.length;
        this.missionsEnCours   = missions.filter(m => m.statutMission === 'EN COURS').length;
        this.missionsEnAttente = missions.filter(m => m.statutMission === 'EN ATTENTE').length;
        this.recentMissions = [...missions]
          .sort((a, b) => new Date(b.dateTravail || 0).getTime() - new Date(a.dateTravail || 0).getTime())
          .slice(0, 6);

        this.totalFactures = factures.length;
        this.facturesPayees = factures.filter(f => f.etatPaiement === 'PAYEE').length;
        this.montantAEncaisser = factures
          .filter(f => f.etatPaiement !== 'PAYEE')
          .reduce((s, f) => s + (f.montantTTC || 0), 0);
        this.recentFactures = [...factures]
          .sort((a, b) => new Date(b.dateEmission || 0).getTime() - new Date(a.dateEmission || 0).getTime())
          .slice(0, 5);

        // CA année en cours = Σ montantTTC des factures non-brouillon émises cette année
        this.caAnneeEnCours = factures
          .filter(f => f.etatPaiement !== 'BROUILLON'
                    && f.dateEmission?.startsWith(String(this.anneeEnCours)))
          .reduce((s, f) => s + (f.montantTTC ?? 0), 0);

        // ── Locations ────────────────────────────────────────────────
        this.totalLocationsAnnee = locations.filter(
          l => l.dateDbtLoc?.toString().startsWith(String(this.anneeEnCours)),
        ).length;
        this.locationsActives = locations.filter(
          l => l.statut === 'VALIDEE',
        ).length;

        // ── Assurances ───────────────────────────────────────────────
        const now = new Date();
        const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
        const in30UTC  = todayUTC + 30 * 864e5;

        this.totalAssurances = assurances.length;
        this.assurancesValides  = assurances.filter(a => a.statut === StatutAssurance.VALIDE).length;
        this.assurancesExpirees = assurances.filter(a => a.statut === StatutAssurance.EXPIRE).length;
        this.assurancesExpirantBientot = assurances.filter(a => {
          if (a.statut !== StatutAssurance.VALIDE || !a.dateFin) return false;
          const [y, mo, d] = a.dateFin.split('-').map(Number);
          const t = Date.UTC(y, mo - 1, d);
          return t >= todayUTC && t <= in30UTC;
        }).length;

        // ── Contrôles VGP ─────────────────────────────────────────────
        this.totalControles    = controles.length;
        this.controlesConformes = controles.filter(c => c.resultat === 'CONFORME').length;
        this.controlesEnRetard  = controles.filter(c => {
          if (!c.estAlerteActive || !c.dateProchaineEcheance) return false;
          const [y, mo, d] = c.dateProchaineEcheance.split('-').map(Number);
          return Date.UTC(y, mo - 1, d) < todayUTC;
        }).length;
        this.controlesBientot = controles.filter(c => {
          if (!c.estAlerteActive || !c.dateProchaineEcheance) return false;
          const [y, mo, d] = c.dateProchaineEcheance.split('-').map(Number);
          const t = Date.UTC(y, mo - 1, d);
          return t >= todayUTC && t <= in30UTC;
        }).length;

        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
  }

  getStatutClass(statut?: string): string {
    switch (statut) {
      case 'EN ATTENTE': return 'bg-yellow-500';
      case 'EN COURS': return 'bg-blue-500';
      case 'TERMINÉE': return 'bg-green-500';
      case 'ANNULÉE': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  }

  getEtatClass(etat?: string): string {
    switch (etat) {
      case 'BROUILLON': return 'bg-gray-400';
      case 'VALIDEE': return 'bg-blue-500';
      case 'PAYEE': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  }
}
