import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';

import { MaintenanceService } from 'src/app/services/apps/maintenance/maintenance.service';
import {
  MaintenanceDetail,
  TypeMaintenance,
  TYPE_MAINTENANCE_LABELS,
  SYSTEME_INTERVENTION_LABELS,
} from '../maintenance.models';

@Component({
  standalone: true,
  selector: 'app-details-maintenance',
  imports: [CommonModule, MaterialModule, TablerIconsModule, RouterLink, DatePipe],
  providers: [DatePipe],
  templateUrl: './details-maintenance.component.html',
})
export class DetailsMaintenanceComponent implements OnInit {
  maintenance?: MaintenanceDetail;
  isLoading = false;

  readonly TYPE_LABELS: Record<string, string>    = TYPE_MAINTENANCE_LABELS;
  readonly SYSTEME_LABELS: Record<string, string> = SYSTEME_INTERVENTION_LABELS;
  readonly TypeMaintenance = TypeMaintenance;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private maintenanceService: MaintenanceService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) { this.load(+id); }
  }

  load(id: number): void {
    this.isLoading = true;
    this.maintenanceService.getById(id).subscribe({
      next: (data) => { this.maintenance = data; this.isLoading = false; },
      error: () => { this.isLoading = false; this.snack('Erreur de chargement'); },
    });
  }

  goToEdit(): void {
    this.router.navigate(['/apps/engins/maintenance/edit', this.maintenance!.id]);
  }

  confirmDelete(): void {
    if (!this.maintenance) return;
    const ref = this.snackBar.open(
      `Supprimer cette fiche de maintenance ?`,
      'Confirmer',
      { duration: 5000, horizontalPosition: 'center', verticalPosition: 'top' },
    );
    ref.onAction().subscribe(() => {
      this.maintenanceService.delete(this.maintenance!.id).subscribe({
        next: () => { this.router.navigate(['/apps/engins/maintenance']); },
        error: () => this.snack('Erreur lors de la suppression'),
      });
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

  private snack(msg: string): void {
    this.snackBar.open(msg, 'Fermer', {
      duration: 3000, horizontalPosition: 'center', verticalPosition: 'top',
    });
  }
}
