import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgClass } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { FacturesService } from 'src/app/services/apps/factures/factures.service';
import { Facture } from '../facture';

@Component({
  selector: 'app-factures-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule, DatePipe, NgClass],
  providers: [DatePipe],
  templateUrl: './factures-list.component.html',
  styleUrl: './factures-list.component.scss',
})
export class FacturesListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator = Object.create(null);

  displayedColumns: string[] = [
    'id',
    'codeLocation',
    'clientNom',
    'dateEmission',
    'montantHT',
    'montantTTC',
    'etatPaiement',
    'actions',
  ];

  allFactures: Facture[] = [];
  facturesDataSource = new MatTableDataSource<Facture>([]);

  totalFactures = 0;
  totalTTC = 0;
  facturesImpayees = 0;
  facturesPayees = 0;

  searchText = '';
  selectedEtat = 'All';

  constructor(
    private facturesService: FacturesService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadFactures();
  }

  ngAfterViewInit(): void {
    this.facturesDataSource.paginator = this.paginator;
  }

  applySearch(text: string): void {
    this.searchText = text;
    this.applyFilters();
  }

  applyEtatFilter(etat: string): void {
    this.selectedEtat = etat;
    this.applyFilters();
  }

  applyFilters(): void {
    const search = this.searchText.trim().toLowerCase();
    const filtered = this.allFactures.filter((f) => {
      const matchSearch =
        !search ||
        (f.codeLocation || '').toLowerCase().includes(search) ||
        (f.clientNom || '').toLowerCase().includes(search) ||
        String(f.id || '').includes(search);
      const matchEtat = this.selectedEtat === 'All' || f.etatPaiement === this.selectedEtat;
      return matchSearch && matchEtat;
    });
    this.facturesDataSource.data = filtered;
    if (this.facturesDataSource.paginator) {
      this.facturesDataSource.paginator.firstPage();
    }
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedEtat = 'All';
    this.applyFilters();
  }

  openAddFacture(): void {
    this.router.navigate(['/apps/factures/add']);
  }

  openDetail(facture: Facture): void {
    this.router.navigate(['/apps/factures/detail', facture.id]);
  }

  deleteFacture(facture: Facture): void {
    if (!facture.id) return;
    this.facturesService.deleteFacture(facture.id).subscribe({
      next: () => {
        this.snackBar.open('Facture supprimée', 'Fermer', { duration: 3000, horizontalPosition: 'center', verticalPosition: 'top' });
        this.loadFactures();
      },
      error: () => {
        this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000, horizontalPosition: 'center', verticalPosition: 'top' });
      },
    });
  }

  getEtatClass(etat?: string): string {
    switch (etat) {
      case 'BROUILLON': return 'bg-gray-400';
      case 'VALIDEE': return 'bg-blue-500';
      case 'PAYEE': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  }

  private loadFactures(): void {
    this.facturesService.getFactures().subscribe({
      next: (factures) => {
        this.allFactures = factures;
        this.facturesDataSource.data = factures;
        this.facturesDataSource.paginator = this.paginator;
        this.totalFactures = factures.length;
        this.totalTTC = factures.reduce((s, f) => s + (f.montantTTC || 0), 0);
        this.facturesImpayees = factures.filter((f) => f.etatPaiement !== 'PAYEE').length;
        this.facturesPayees = factures.filter((f) => f.etatPaiement === 'PAYEE').length;
      },
    });
  }
}
