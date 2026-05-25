import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';

import { MaintenanceService } from 'src/app/services/apps/maintenance/maintenance.service';
import {
  MaintenanceSummary,
  TypeMaintenance,
  TYPE_MAINTENANCE_LABELS,
  SYSTEME_INTERVENTION_LABELS,
} from '../maintenance.models';

@Component({
  standalone: true,
  selector: 'app-maintenances-list',
  imports: [CommonModule, MaterialModule, FormsModule, TablerIconsModule, RouterLink, DatePipe],
  providers: [DatePipe],
  templateUrl: './maintenances-list.component.html',
})
export class MaintenancesListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  isLoading = false;
  allMaintenances: MaintenanceSummary[] = [];
  dataSource = new MatTableDataSource<MaintenanceSummary>([]);

  searchText = '';
  selectedType = 'ALL';

  displayedColumns = [
    'engin', 'date', 'type', 'technicien', 'horametre',
    'actions', 'pieces', 'cout', 'operationnel', 'action',
  ];

  readonly typeOptions = [
    { value: 'ALL', label: 'Tous les types' },
    { value: TypeMaintenance.PREVENTIVE,             label: 'Préventive' },
    { value: TypeMaintenance.CURATIVE,               label: 'Curative' },
    { value: TypeMaintenance.REVISION,               label: 'Révision' },
    { value: TypeMaintenance.CONTROLE_REGLEMENTAIRE, label: 'Contrôle réglementaire' },
  ];

  readonly TypeMaintenance = TypeMaintenance;
  readonly TYPE_LABELS: Record<string, string>  = TYPE_MAINTENANCE_LABELS;
  readonly SYSTEME_LABELS: Record<string, string> = SYSTEME_INTERVENTION_LABELS;

  // ── KPIs ─────────────────────────────────────────────────────────────────
  get total(): number       { return this.allMaintenances.length; }
  get preventives(): number { return this.count(TypeMaintenance.PREVENTIVE); }
  get curatives(): number   { return this.count(TypeMaintenance.CURATIVE); }
  get revisions(): number   { return this.count(TypeMaintenance.REVISION); }
  private count(t: TypeMaintenance): number {
    return this.allMaintenances.filter(m => m.type === t).length;
  }

  constructor(
    private maintenanceService: MaintenanceService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void { this.load(); }

  ngAfterViewInit(): void { this.dataSource.paginator = this.paginator; }

  load(): void {
    this.isLoading = true;
    this.maintenanceService.getAll().subscribe({
      next: (data) => {
        this.allMaintenances = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; this.snack('Erreur de chargement'); },
    });
  }

  applyFilters(): void {
    const s = this.searchText.trim().toLowerCase();
    this.dataSource.data = this.allMaintenances.filter(m => {
      const matchSearch = !s ||
        m.codeEngin?.toLowerCase().includes(s) ||
        m.modelEngin?.toLowerCase().includes(s) ||
        m.nomTechnicien?.toLowerCase().includes(s) ||
        m.codeMaintenance?.toLowerCase().includes(s) ||
        m.nomConducteur?.toLowerCase().includes(s);
      const matchType = this.selectedType === 'ALL' || m.type === this.selectedType;
      return matchSearch && matchType;
    });
  }

  typeClass(type: TypeMaintenance): string {
    switch (type) {
      case TypeMaintenance.PREVENTIVE:             return 'bg-blue-100 text-blue-800';
      case TypeMaintenance.CURATIVE:               return 'bg-red-100 text-red-800';
      case TypeMaintenance.REVISION:               return 'bg-green-100 text-green-800';
      case TypeMaintenance.CONTROLE_REGLEMENTAIRE: return 'bg-purple-100 text-purple-800';
      default:                                     return 'bg-gray-100 text-gray-700';
    }
  }

  goToDetail(m: MaintenanceSummary): void {
    this.router.navigate(['/apps/engins/maintenance', m.id]);
  }

  goToAdd(): void {
    this.router.navigate(['/apps/engins/maintenance/add']);
  }

  confirmDelete(m: MaintenanceSummary, event: Event): void {
    event.stopPropagation();
    const ref = this.snackBar.open(
      `Supprimer la fiche ${m.codeMaintenance || '#' + m.id} ?`,
      'Confirmer',
      { duration: 5000, horizontalPosition: 'center', verticalPosition: 'top' },
    );
    ref.onAction().subscribe(() => {
      this.maintenanceService.delete(m.id).subscribe({
        next: () => { this.snack('Fiche supprimée'); this.load(); },
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
