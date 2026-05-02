import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { AssuranceEngin, StatutAssurance } from './assurance-engin';
import { AssurancesService } from 'src/app/services/apps/assurances/assurances.service';
import { AddAssuranceDialogComponent } from './add-assurance-dialog/add-assurance-dialog.component';

@Component({
  standalone: true,
  selector: 'app-assurances-engins',
  imports: [CommonModule, MaterialModule, FormsModule, TablerIconsModule, RouterLink, DatePipe],
  providers: [DatePipe],
  templateUrl: './assurances-engins.component.html',
})
export class AssurancesEnginsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  isLoading = false;
  allAssurances: AssuranceEngin[] = [];
  dataSource = new MatTableDataSource<AssuranceEngin>([]);
  selectedStatut = 'ALL';
  searchText = '';

  displayedColumns = [
    'engin', 'compagnie', 'numeroPolice', 'dateDebut', 'dateFin', 'montant', 'statut', 'action',
  ];

  readonly statutOptions = [
    { value: 'ALL',                      label: 'Tous les statuts' },
    { value: StatutAssurance.VALIDE,     label: 'En cours' },
    { value: StatutAssurance.EXPIRE,     label: 'Expirées' },
    { value: StatutAssurance.ANNULE,     label: 'Suspendues' },
  ];

  get total(): number { return this.allAssurances.length; }
  get enCours(): number { return this.allAssurances.filter(a => a.statut === StatutAssurance.VALIDE).length; }
  get expirees(): number { return this.allAssurances.filter(a => a.statut === StatutAssurance.EXPIRE).length; }

  get expirantBientot(): number {
    const now = Date.now();
    const in30 = now + 30 * 864e5;
    return this.allAssurances.filter(a => {
      if (a.statut !== StatutAssurance.VALIDE || !a.dateFin) return false;
      const fin = new Date(a.dateFin).getTime();
      return fin >= now && fin <= in30;
    }).length;
  }

  get alertes(): AssuranceEngin[] {
    const now = Date.now();
    const in30 = now + 30 * 864e5;
    return this.allAssurances.filter(a => {
      if (a.statut !== StatutAssurance.VALIDE || !a.dateFin) return false;
      const fin = new Date(a.dateFin).getTime();
      return fin >= now && fin <= in30;
    });
  }

  constructor(
    private assurancesService: AssurancesService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void { this.load(); }

  ngAfterViewInit(): void { this.dataSource.paginator = this.paginator; }

  load(): void {
    this.isLoading = true;
    this.assurancesService.getAll().subscribe({
      next: (data) => {
        this.syncExpiredStatuts(data);
        this.allAssurances = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; this.snack('Erreur de chargement'); },
    });
  }

  private syncExpiredStatuts(assurances: AssuranceEngin[]): void {
    const now = new Date();
    const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

    const toExpire = assurances.filter(a => {
      if (a.statut === StatutAssurance.EXPIRE || a.statut === StatutAssurance.ANNULE || !a.dateFin || !a.id) return false;
      const [y, m, d] = a.dateFin.split('-').map(Number);
      return Date.UTC(y, m - 1, d) <= today;
    });

    if (toExpire.length === 0) return;

    // mise à jour locale immédiate pour un affichage correct sans attendre le serveur
    toExpire.forEach(a => { a.statut = StatutAssurance.EXPIRE; });

    forkJoin(toExpire.map(a => this.assurancesService.update(a.id!, { statut: StatutAssurance.EXPIRE }))).subscribe({
      next: () => this.load(),
      error: () => this.load(),
    });
  }

  applyFilters(): void {
    const s = this.searchText.trim().toLowerCase();
    this.dataSource.data = this.allAssurances.filter(a => {
      const matchSearch = !s ||
        a.enginCode?.toLowerCase().includes(s) ||
        a.enginModel?.toLowerCase().includes(s) ||
        a.compagnieAssurance?.toLowerCase().includes(s) ||
        a.numeroPolice?.toLowerCase().includes(s);
      const matchStatut = this.selectedStatut === 'ALL' || a.statut === this.selectedStatut;
      return matchSearch && matchStatut;
    });
  }

  isExpiringSoon(a: AssuranceEngin): boolean {
    if (a.statut !== StatutAssurance.VALIDE || !a.dateFin) return false;
    const now = Date.now();
    const fin = new Date(a.dateFin).getTime();
    return fin >= now && fin <= now + 30 * 864e5;
  }

  daysLeft(dateFin?: string): number {
    if (!dateFin) return 0;
    return Math.ceil((new Date(dateFin).getTime() - Date.now()) / 864e5);
  }

  getStatutClass(statut?: StatutAssurance): string {
    switch (statut) {
      case StatutAssurance.VALIDE:  return 'bg-green-500';
      case StatutAssurance.EXPIRE:  return 'bg-red-500';
      case StatutAssurance.ANNULE:  return 'bg-gray-400';
      default:                       return 'bg-gray-300';
    }
  }

  openDialog(assurance?: AssuranceEngin): void {
    const ref = this.dialog.open(AddAssuranceDialogComponent, {
      width: '560px',
      disableClose: true,
      data: assurance ?? null,
    });
    ref.afterClosed().subscribe((payload) => {
      if (!payload) return;
      const action$ = assurance?.id
        ? this.assurancesService.update(assurance.id, payload)
        : this.assurancesService.create(payload);
      action$.subscribe({
        next: () => { this.snack(assurance?.id ? 'Assurance modifiée' : 'Assurance ajoutée'); this.load();console.log(payload) },
        error: () => this.snack('Erreur lors de l\'enregistrement'),
      });
    });
  }

  confirmDelete(a: AssuranceEngin, event: Event): void {
    event.stopPropagation();
    if (!a.id) return;
    const ref = this.snackBar.open(
      `Supprimer la police ${a.numeroPolice || ''} ?`,
      'Confirmer',
      { duration: 5000, horizontalPosition: 'center', verticalPosition: 'top' },
    );
    ref.onAction().subscribe(() => {
      this.assurancesService.delete(a.id!).subscribe({
        next: () => { this.snack('Assurance supprimée'); this.load(); },
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
