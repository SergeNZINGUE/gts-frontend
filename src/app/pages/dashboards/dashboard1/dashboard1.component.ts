import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { ClientsService } from 'src/app/services/apps/clients/clients.service';
import { EnginService } from 'src/app/services/apps/engin/engin.service';
import { MissionsService } from 'src/app/services/apps/missions/missions.service';
import { FacturesService } from 'src/app/services/apps/factures/factures.service';
import { AssurancesService } from 'src/app/services/apps/assurances/assurances.service';
import { ControlesVGPService } from 'src/app/services/apps/controles-vgp/controles-vgp.service';
import { Mission } from 'src/app/pages/apps/missions/mission';
import { Facture } from 'src/app/pages/apps/factures/facture';
import { StatutAssurance } from 'src/app/pages/apps/engins/assurances-engins/assurance-engin';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard1',
  standalone: true,
  imports: [CommonModule, MaterialModule, TablerIconsModule, RouterLink, DatePipe],
  providers: [DatePipe],
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
  ) {}

  ngOnInit(): void {
    forkJoin({
      clients:    this.clientsService.getClients(),
      engins:     this.enginService.getEngins(),
      missions:   this.missionsService.getMissions(),
      factures:   this.facturesService.getFactures(),
      assurances: this.assurancesService.getAll(),
      controles:  this.controlesVGPService.getAll(),
    }).subscribe({
      next: ({ clients, engins, missions, factures, assurances, controles }) => {
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
