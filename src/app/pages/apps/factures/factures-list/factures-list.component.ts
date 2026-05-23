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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

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
  selectedMonth = 0;
  selectedYear = 0;

  readonly months = [
    { value: 1,  label: 'Janvier' },
    { value: 2,  label: 'Février' },
    { value: 3,  label: 'Mars' },
    { value: 4,  label: 'Avril' },
    { value: 5,  label: 'Mai' },
    { value: 6,  label: 'Juin' },
    { value: 7,  label: 'Juillet' },
    { value: 8,  label: 'Août' },
    { value: 9,  label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' },
  ];

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

  get availableYears(): number[] {
    const years = new Set<number>();
    this.allFactures.forEach(f => {
      if (f.dateEmission) years.add(new Date(f.dateEmission).getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
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

      let matchPeriod = true;
      if (this.selectedYear !== 0 || this.selectedMonth !== 0) {
        const date = f.dateEmission ? new Date(f.dateEmission) : null;
        if (!date) {
          matchPeriod = false;
        } else {
          if (this.selectedYear !== 0 && date.getFullYear() !== this.selectedYear) matchPeriod = false;
          if (this.selectedMonth !== 0 && (date.getMonth() + 1) !== this.selectedMonth) matchPeriod = false;
        }
      }

      return matchSearch && matchEtat && matchPeriod;
    });
    this.facturesDataSource.data = filtered;
    if (this.facturesDataSource.paginator) {
      this.facturesDataSource.paginator.firstPage();
    }
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedEtat = 'All';
    this.selectedMonth = 0;
    this.selectedYear = 0;
    this.applyFilters();
  }

  exportPDF(): void {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Liste des Factures', 14, 15);

    autoTable(doc, {
      startY: 22,
      head: [['N° Facture', 'Location', 'Client', 'Date émission', 'Montant HT', 'Montant TTC', 'État']],
      body: this.facturesDataSource.data.map(f => [
        `FAC-${f.id}`,
        f.codeLocation || '-',
        f.clientNom || '-',
        f.dateEmission ? new Date(f.dateEmission).toLocaleDateString('fr-FR') : '-',
        `${(f.montantHT || 0).toLocaleString('fr-FR')} FCFA`,
        `${(f.montantTTC || 0).toLocaleString('fr-FR')} FCFA`,
        f.etatPaiement || '-',
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [63, 81, 181] },
    });

    doc.save('factures.pdf');
  }

  exportXLSX(): void {
    const data = this.facturesDataSource.data.map(f => ({
      'N° Facture': `FAC-${f.id}`,
      'Location': f.codeLocation || '-',
      'Client': f.clientNom || '-',
      'Date émission': f.dateEmission ? new Date(f.dateEmission).toLocaleDateString('fr-FR') : '-',
      'Montant HT (FCFA)': f.montantHT || 0,
      'Montant TTC (FCFA)': f.montantTTC || 0,
      'État': f.etatPaiement || '-',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Factures');
    XLSX.writeFile(wb, 'factures.xlsx');
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
      case 'VALIDEE':   return 'bg-blue-500';
      case 'PAYEE':     return 'bg-green-500';
      default:          return 'bg-gray-300';
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