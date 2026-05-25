import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';

import { PiecesRechangeService } from 'src/app/services/apps/pieces-rechange/pieces-rechange.service';
import { PieceRechange } from './piece-rechange';
import { AddPieceDialogComponent } from './add-piece-dialog/add-piece-dialog.component';
import {
  AjusterStockDialogComponent,
  AjusterStockResult,
} from './ajuster-stock-dialog/ajuster-stock-dialog.component';

@Component({
  standalone: true,
  selector: 'app-pieces-de-rechange',
  imports: [CommonModule, MaterialModule, FormsModule, TablerIconsModule, RouterLink, DatePipe],
  providers: [DatePipe],
  templateUrl: './pieces-de-rechange.component.html',
})
export class PiecesDeRechangeComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isLoading = false;
  allPieces: PieceRechange[] = [];
  dataSource = new MatTableDataSource<PieceRechange>([]);

  searchText = '';
  filtreAlerte = false;

  displayedColumns = [
    'designation', 'reference', 'stock', 'seuil', 'prix', 'valeur', 'alerte', 'action',
  ];

  // ── KPIs ─────────────────────────────────────────────────────────────────
  get total(): number    { return this.allPieces.length; }
  get enAlerte(): number { return this.allPieces.filter(p => p.alerteReapprovisionnement).length; }

  get valeurTotaleStock(): number {
    return this.allPieces.reduce(
      (s, p) => s + (p.quantiteEnStock ?? 0) * (p.prixUnitaireAchat ?? 0), 0,
    );
  }

  get valeurAlerte(): number {
    return this.allPieces
      .filter(p => p.alerteReapprovisionnement)
      .reduce((s, p) => s + (p.seuilAlerteStock ?? 0) * (p.prixUnitaireAchat ?? 0), 0);
  }

  constructor(
    private piecesService: PiecesRechangeService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void { this.load(); }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    // Tri personnalisé sur valeur stock calculée
    this.dataSource.sortingDataAccessor = (item, prop) => {
      if (prop === 'valeur') return (item.quantiteEnStock ?? 0) * (item.prixUnitaireAchat ?? 0);
      return (item as any)[prop] ?? '';
    };
  }

  load(): void {
    this.isLoading = true;
    this.piecesService.getAll().subscribe({
      next: (data) => {
        this.allPieces = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; this.snack('Erreur de chargement'); },
    });
  }

  applyFilters(): void {
    const s = this.searchText.trim().toLowerCase();
    this.dataSource.data = this.allPieces.filter(p => {
      const matchSearch = !s ||
        p.designation?.toLowerCase().includes(s) ||
        p.referenceConstructeur?.toLowerCase().includes(s);
      const matchAlerte = !this.filtreAlerte || p.alerteReapprovisionnement === true;
      return matchSearch && matchAlerte;
    });
  }

  toggleFiltreAlerte(): void {
    this.filtreAlerte = !this.filtreAlerte;
    this.applyFilters();
  }

  valeurStock(p: PieceRechange): number {
    return (p.quantiteEnStock ?? 0) * (p.prixUnitaireAchat ?? 0);
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────

  openDialog(piece?: PieceRechange): void {
    const ref = this.dialog.open(AddPieceDialogComponent, {
      width: '500px',
      disableClose: true,
      data: piece ?? null,
    });
    ref.afterClosed().subscribe((payload) => {
      if (!payload) return;
      const op$ = piece?.id
        ? this.piecesService.update(piece.id, payload)
        : this.piecesService.create(payload);
      op$.subscribe({
        next: () => {
          this.snack(piece?.id ? 'Pièce modifiée' : 'Pièce créée');
          this.load();
        },
        error: () => this.snack('Erreur lors de l\'enregistrement'),
      });
    });
  }

  openAjusterStock(piece: PieceRechange, event: Event): void {
    event.stopPropagation();
    const ref = this.dialog.open(AjusterStockDialogComponent, {
      width: '460px',
      disableClose: true,
      data: piece,
    });
    ref.afterClosed().subscribe((result: AjusterStockResult | null) => {
      if (!result || !piece.id) return;
      this.piecesService.ajusterStock(piece.id, result.delta).subscribe({
        next: () => { this.snack('Stock mis à jour'); this.load(); },
        error: (err) => {
          const msg = err?.error?.message ?? 'Erreur lors de l\'ajustement';
          this.snack(msg);
        },
      });
    });
  }

  confirmDelete(p: PieceRechange, event: Event): void {
    event.stopPropagation();
    if (!p.id) return;
    const ref = this.snackBar.open(
      `Supprimer « ${p.designation} » ?`,
      'Confirmer',
      { duration: 5000, horizontalPosition: 'center', verticalPosition: 'top' },
    );
    ref.onAction().subscribe(() => {
      this.piecesService.delete(p.id!).subscribe({
        next: () => { this.snack('Pièce supprimée'); this.load(); },
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
