import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { FacturesService } from 'src/app/services/apps/factures/factures.service';
import { ReglementsService } from 'src/app/services/apps/reglements/reglements.service';
import { PrintService } from 'src/app/services/print/print.service';
import { AddReglementDialogComponent } from '../add-reglement-dialog/add-reglement-dialog.component';
import { Facture } from '../facture';
import { Reglement } from '../reglement';

@Component({
  selector: 'app-details-facture',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterLink, DatePipe],
  providers: [DatePipe],
  templateUrl: './details-facture.component.html',
  styleUrl: './details-facture.component.scss',
})
export class DetailsFactureComponent implements OnInit {
  facture: Facture | null = null;
  reglements: Reglement[] = [];
  isLoading = true;

  missionColumns = ['codeMission', 'lieuMission', 'nbHeures', 'tarifHoraireApplique', 'sousTotal'];
  reglementColumns = ['dateReglement', 'modePaiement', 'montantVerse', 'recu'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private facturesService: FacturesService,
    private reglementsService: ReglementsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private printService: PrintService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;
    this.loadFacture(id);
  }

  get montantVerse(): number {
    if (!Array.isArray(this.reglements)) return 0;
    return this.reglements.reduce((s, r) => s + (r.montantVerse || 0), 0);
  }

  get resteAPayer(): number {
    return Math.max(0, (this.facture?.montantTTC || 0) - this.montantVerse);
  }

  get isVerrouille(): boolean {
    return this.facture?.etatPaiement === 'PAYEE';
  }

  openAddReglement(): void {
    if (!this.facture) return;
    const factureAvecReglements = { ...this.facture, reglements: this.reglements };
    const ref = this.dialog.open(AddReglementDialogComponent, {
      width: '480px',
      disableClose: true,
      data: factureAvecReglements,
    });
    ref.afterClosed().subscribe((payload) => {
      if (payload) {
        this.reglementsService.createReglement(payload).subscribe({
          next: () => {
            this.snackBar.open('Règlement enregistré', 'Fermer', { duration: 3000, horizontalPosition: 'center', verticalPosition: 'top' });
            this.loadFacture(this.facture!.id!);
          },
          error: () => {
            this.snackBar.open('Erreur lors de l\'enregistrement', 'Fermer', { duration: 3000, horizontalPosition: 'center', verticalPosition: 'top' });
          },
        });
      }
    });
  }

  validerFacture(): void {
    if (!this.facture?.id) return;
    this.facturesService.updateEtat(this.facture.id, 'VALIDEE').subscribe({
      next: (f) => {
        this.facture = { ...this.facture, etatPaiement: f.etatPaiement };
        this.snackBar.open('Facture validée', 'Fermer', { duration: 3000, horizontalPosition: 'center', verticalPosition: 'top' });
      },
    });
  }

  marquerPayee(): void {
    if (!this.facture?.id) return;
    this.facturesService.updateEtat(this.facture.id, 'PAYEE').subscribe({
      next: (f) => {
        this.facture = { ...this.facture, etatPaiement: f.etatPaiement };
        this.snackBar.open('Facture marquée comme payée', 'Fermer', { duration: 3000, horizontalPosition: 'center', verticalPosition: 'top' });
      },
    });
  }

  imprimerProforma(): void {
    if (this.facture) this.printService.printProforma(this.facture);
  }

  imprimerFacture(): void {
    if (this.facture) this.printService.printFacture(this.facture, this.reglements);
  }

  imprimerRecu(reglement: Reglement): void {
    if (!this.facture) return;
    const versementsAvant = this.reglements
      .filter(r => r.id !== reglement.id)
      .reduce((s, r) => s + (r.montantVerse || 0), 0);
    const resteApresVersement = Math.max(0, (this.facture.montantTTC || 0) - versementsAvant - (reglement.montantVerse || 0));
    this.printService.printRecu(reglement, this.facture, resteApresVersement);
  }

  getEtatClass(etat?: string): string {
    switch (etat) {
      case 'BROUILLON': return 'bg-gray-400';
      case 'VALIDEE': return 'bg-blue-500';
      case 'PAYEE': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  }

  private loadFacture(id: number): void {
    this.isLoading = true;
    this.facturesService.getFactureById(id).subscribe({
      next: (facture) => {
        this.facture = facture;
        console.log('Facture:', this.facture);
        this.isLoading = false;
        this.loadReglements(id);
      },
    });
  }

  private loadReglements(factureId: number): void {
    this.reglementsService.getReglementsByFacture(factureId).subscribe({
      next: (reglements) => { this.reglements = Array.isArray(reglements) ? reglements : []; },
    });
  }
}
