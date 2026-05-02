import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { CompleteMissionDialogComponent } from '../complete-mission-dialog/complete-mission-dialog.component';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource,
} from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { NgClass } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { MissionsService } from 'src/app/services/apps/missions/missions.service';
import { Mission } from '../mission';

@Component({
  selector: 'app-missions-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  //  RouterLink,
    MaterialModule,
    DatePipe,
    NgClass,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCell,
    MatCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatPaginator,
    MatSort,
  ],
  providers: [DatePipe],
  templateUrl: './missions-list.component.html',
  styleUrl: './missions-list.component.scss',
})
export class MissionsListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  displayedColumns: string[] = [
    'codeMission',
    'codeLocation',
    'dateTravail',
    'lieuMission',
    'responsableMission',
    'statutMission',
    'prioriteMission',
    'nbHeures',
    'sousTotal',
    'kmParcourus',
    'consommation',
    'actions',
  ];

  totalMissions = 0;
  missionsEnAttente = 0;
  missionsEnCours = 0;
  missionsTerminees = 0;

  searchText = '';
  selectedStatut = 'All';
  selectedPriorite = 'All';

  allMissions: Mission[] = [];
  missionsDataSource = new MatTableDataSource<Mission>([]);

  constructor(
    private missionsService: MissionsService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadMissions();
  }

  ngAfterViewInit(): void {
    this.missionsDataSource.paginator = this.paginator;
  }

  applySearch(searchText: string): void {
    this.searchText = searchText;
    this.applyFilters();
  }

  applyStatutFilter(statut: string): void {
    this.selectedStatut = statut;
    this.applyFilters();
  }

  applyPrioriteFilter(priorite: string): void {
    this.selectedPriorite = priorite;
    this.applyFilters();
  }

  applyFilters(): void {
    const search = this.searchText.trim().toLowerCase();

    const filtered = this.allMissions.filter((mission) => {
      const code = mission.codeMission?.toString().toLowerCase() || '';
      const lieu = mission.lieuMission?.toLowerCase() || '';
      const responsable = mission.responsableMission?.toLowerCase() || '';

      const matchSearch =
        !search ||
        code.includes(search) ||
        lieu.includes(search) ||
        responsable.includes(search);

      const matchStatut =
        this.selectedStatut === 'All' || mission.statutMission === this.selectedStatut;

      const matchPriorite =
        this.selectedPriorite === 'All' || mission.prioriteMission === this.selectedPriorite;

      return matchSearch && matchStatut && matchPriorite;
    });

    this.missionsDataSource.data = filtered;

    if (this.missionsDataSource.paginator) {
      this.missionsDataSource.paginator.firstPage();
    }
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedStatut = 'All';
    this.selectedPriorite = 'All';
    this.applyFilters();
  }

  openAddMission(): void {
    this.router.navigate(['/apps/missions/add']);
  }

  openMissionDetail(mission: Mission): void {
    this.router.navigate(['/apps/missions/detail', mission.id]);
  }

  openEditMission(mission: Mission): void {
    this.router.navigate(['/apps/missions/edit', mission.id]);
  }

  termineMission(mission: Mission): void {
    const isComplete =
      !!mission.heureDebutMission && !!mission.heureFinMission &&
      mission.kmDbtMission != null &&
      mission.kmFinMission != null &&
      mission.carbtDbtMission != null &&
      mission.carbtFinMission != null &&
      mission.materiauxMission &&
      mission.qteMateriauxMission != null &&
      mission.responsableMission;

    if (isComplete) {
      this.doTerminate(mission.id!, {});
    } else {
      const ref = this.dialog.open(CompleteMissionDialogComponent, {
        width: '560px',
        disableClose: true,
        data: mission,
      });
      ref.afterClosed().subscribe((result) => {
        if (result) {
          this.doTerminate(mission.id!, result);
        }
      });
    }
  }

  private doTerminate(id: number, extra: object): void {
    this.missionsService.updateMission(id, { ...extra, statutMission: 'TERMINÉE' }).subscribe({
      next: () => {
        this.snackBar.open('Mission terminée avec succès', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.loadMissions();
      },
      error: () => {
        this.snackBar.open('Erreur lors de la clôture de la mission', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
    });
  }

  deleteMission(mission: Mission): void {
    if (!mission.id) {
      return;
    }

    this.missionsService.deleteMission(mission.id).subscribe({
      next: () => {
        this.snackBar.open('Mission supprimée avec succès', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.loadMissions();
      },
      error: () => {
        this.snackBar.open('Erreur lors de la suppression de la mission', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
    });
  }

  getStatutClass(statut?: string): string {
    switch (statut) {
      case 'EN ATTENTE':
        return 'bg-yellow-500';
      case 'EN COURS':
        return 'bg-blue-500';
      case 'TERMINÉE':
        return 'bg-green-500';
      case 'ANNULÉE':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  }

  getPrioriteClass(priorite?: string): string {
    switch (priorite) {
      case 'BASSE':
        return 'bg-gray-400';
      case 'NORMALE':
        return 'bg-blue-400';
      case 'HAUTE':
        return 'bg-yellow-500';
      case 'URGENTE':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  }

  private loadMissions(): void {
    this.missionsService.getMissions().subscribe({
      next: (response) => {
        this.allMissions = response;
        this.missionsDataSource.data = response;

        this.totalMissions = response.length;
        this.missionsEnAttente = response.filter((m) => m.statutMission === 'EN ATTENTE').length;
        this.missionsEnCours = response.filter((m) => m.statutMission === 'EN_COURS').length;
        this.missionsTerminees = response.filter((m) => m.statutMission === 'TERMINÉE').length;

        this.missionsDataSource.paginator = this.paginator;
      },
    });
  }
}
