import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { ControleVGP } from './controle-vgp';
import { ControlesVGPService } from 'src/app/services/apps/controles-vgp/controles-vgp.service';
import { AddControleDialogComponent } from './add-controle-dialog/add-controle-dialog.component';

@Component({
  standalone: true,
  selector: 'app-controles-vgp',
  imports: [CommonModule, MaterialModule, FormsModule, TablerIconsModule, RouterLink, DatePipe],
  providers: [DatePipe],
  templateUrl: './controles-vgp.component.html',
})
export class ControlesVGPComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  isLoading = false;
  allControles: ControleVGP[] = [];
  dataSource = new MatTableDataSource<ControleVGP>([]);
  selectedResultat = 'ALL';
  searchText = '';

  displayedColumns = [
    'engin', 'organisme', 'numeroRapport',
    'dateDernier', 'dateEcheance', 'resultat', 'alerte', 'action',
  ];

  readonly resultatOptions = [
    { value: 'ALL',           label: 'Tous les résultats' },
    { value: 'CONFORME',      label: 'Conforme' },
    { value: 'AVEC_RESERVES', label: 'Avec réserves' },
    { value: 'NON_CONFORME',  label: 'Non conforme' },
  ];

  get total(): number { return this.allControles.length; }
  get conformes(): number { return this.allControles.filter(c => c.resultat === 'CONFORME').length; }
  get avecReserves(): number { return this.allControles.filter(c => c.resultat === 'AVEC_RESERVES').length; }
  get nonConformes(): number { return this.allControles.filter(c => c.resultat === 'NON_CONFORME').length; }

  get echeancesBientot(): ControleVGP[] {
    const now = Date.now();
    const in30 = now + 30 * 864e5;
    return this.allControles.filter(c => {
      if (!c.estAlerteActive || !c.dateProchaineEcheance) return false;
      const d = new Date(c.dateProchaineEcheance).getTime();
      return d >= now && d <= in30;
    });
  }

  get echeancesDepassees(): ControleVGP[] {
    const now = Date.now();
    return this.allControles.filter(c => {
      if (!c.estAlerteActive || !c.dateProchaineEcheance) return false;
      return new Date(c.dateProchaineEcheance).getTime() < now;
    });
  }

  constructor(
    private controleService: ControlesVGPService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void { this.load(); }

  ngAfterViewInit(): void { this.dataSource.paginator = this.paginator; }

  load(): void {
    this.isLoading = true;
    this.controleService.getAll().subscribe({
      next: (data) => {
        this.allControles = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; this.snack('Erreur de chargement'); },
    });
  }

  applyFilters(): void {
    const s = this.searchText.trim().toLowerCase();
    this.dataSource.data = this.allControles.filter(c => {
      const matchSearch = !s ||
        c.enginCode?.toLowerCase().includes(s) ||
        c.enginModel?.toLowerCase().includes(s) ||
        c.organismeControleur?.toLowerCase().includes(s) ||
        c.numeroRapport?.toLowerCase().includes(s);
      const matchResultat = this.selectedResultat === 'ALL' || c.resultat === this.selectedResultat;
      return matchSearch && matchResultat;
    });
  }

  isEcheanceProche(c: ControleVGP): boolean {
    if (!c.estAlerteActive || !c.dateProchaineEcheance) return false;
    const now = Date.now();
    const d = new Date(c.dateProchaineEcheance).getTime();
    return d >= now && d <= now + 30 * 864e5;
  }

  isEcheanceDepassee(c: ControleVGP): boolean {
    if (!c.estAlerteActive || !c.dateProchaineEcheance) return false;
    return new Date(c.dateProchaineEcheance).getTime() < Date.now();
  }

  daysLeft(date?: string): number {
    if (!date) return 0;
    return Math.ceil((new Date(date).getTime() - Date.now()) / 864e5);
  }

  getResultatClass(resultat?: string): string {
    switch (resultat) {
      case 'CONFORME':      return 'bg-green-500';
      case 'AVEC_RESERVES': return 'bg-yellow-500';
      case 'NON_CONFORME':  return 'bg-red-500';
      default:              return 'bg-gray-400';
    }
  }

  getResultatLabel(resultat?: string): string {
    switch (resultat) {
      case 'CONFORME':      return 'Conforme';
      case 'AVEC_RESERVES': return 'Avec réserves';
      case 'NON_CONFORME':  return 'Non conforme';
      default:              return '—';
    }
  }

  openDialog(controle?: ControleVGP): void {
    const ref = this.dialog.open(AddControleDialogComponent, {
      width: '580px',
      disableClose: true,
      data: controle ?? null,
    });
    ref.afterClosed().subscribe((payload) => {
      if (!payload) return;
      const action$ = controle?.id
        ? this.controleService.update(controle.id, payload)
        : this.controleService.create(payload);
      action$.subscribe({
        next: () => {
          this.snack(controle?.id ? 'Contrôle modifié' : 'Contrôle enregistré');
          this.load();
        },
        error: () => this.snack('Erreur lors de l\'enregistrement'),
      });
    });
  }

  confirmDelete(c: ControleVGP, event: Event): void {
    event.stopPropagation();
    if (!c.id) return;
    const ref = this.snackBar.open(
      `Supprimer le contrôle de l'engin ${c.enginCode || ''} ?`,
      'Confirmer',
      { duration: 5000, horizontalPosition: 'center', verticalPosition: 'top' },
    );
    ref.onAction().subscribe(() => {
      this.controleService.delete(c.id!).subscribe({
        next: () => { this.snack('Contrôle supprimé'); this.load(); },
        error: () => this.snack('Erreur lors de la suppression'),
      });
    });
  }

  private snack(msg: string): void {
    this.snackBar.open(msg, 'Fermer', {
      duration: 3000, horizontalPosition: 'center', verticalPosition: 'top',
    });
  }
}
