import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
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
import { StatutLabelPipe } from 'src/app/pipe/statut-label.pipe';
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
    StatutLabelPipe,
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
  selectedDate = '';

  allMissions: Mission[] = [];
  missionsDataSource = new MatTableDataSource<Mission>([]);

  constructor(
    private missionsService: MissionsService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private datePipe: DatePipe,
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

  applyDateFilter(date: string): void {
    this.selectedDate = date;
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

      const missionDate =
        (mission.dateTravail || mission.dateDebutMission || '').toString().substring(0, 10);
      const matchDate = !this.selectedDate || missionDate === this.selectedDate;

      return matchSearch && matchStatut && matchPriorite && matchDate;
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
    this.selectedDate = '';
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
      this.doCloturer(mission.id!);
    } else {
      const ref = this.dialog.open(CompleteMissionDialogComponent, {
        width: '560px',
        disableClose: true,
        data: mission,
      });
      ref.afterClosed().subscribe((result) => {
        if (result) {
          this.doTerminer(mission.id!, result);
        }
      });
    }
  }

  private doCloturer(id: number): void {
    this.missionsService.cloturerMission(id).subscribe({
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

  private doTerminer(id: number, extra: object): void {
    this.missionsService.terminerMission(id, extra).subscribe({
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
      case 'EN_ATTENTE':
        return 'bg-yellow-500';
      case 'EN_COURS':
        return 'bg-blue-500';
      case 'TERMINEE':
        return 'bg-green-500';
      case 'VALIDEE':
        return 'bg-teal-500';
      case 'ANNULEE':
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

  exportPdf(): void {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(14);
    doc.text('Liste des missions', 14, 15);
    doc.setFontSize(9);
    doc.text(`Exporté le ${this.datePipe.transform(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 21);

    autoTable(doc, {
      startY: 26,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [33, 150, 243] },
      head: [['Code', 'Location', 'Date', 'Lieu', 'Responsable', 'Statut', 'Priorité', 'Heures', 'Sous-total', 'KM', 'Carburant']],
      body: this.missionsDataSource.data.map(m => [
        m.codeMission || '-',
        m.codeLocation || '-',
        this.datePipe.transform(m.dateDebutMission, 'dd/MM/yyyy') || '-',
        m.lieuMission || '-',
        m.responsableMission || '-',
        m.statutMission || '-',
        m.prioriteMission || '-',
        `${m.nbHeures || 0} h`,
        `${m.sousTotal || 0} FCFA`,
        (m.kmFinMission && m.kmDbtMission) ? `${m.kmFinMission - m.kmDbtMission} km` : '0 km',
        (m.carbtDbtMission && m.carbtFinMission) ? `${m.carbtDbtMission - m.carbtFinMission} L` : '0 L',
      ]),
    });

    doc.save(`missions_${this.datePipe.transform(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
  }

  exportExcel(): void {
    const rows = this.missionsDataSource.data.map(m => ({
      'Code Mission': m.codeMission || '',
      'Location': m.codeLocation || '',
      'Date Mission': this.datePipe.transform(m.dateDebutMission, 'dd/MM/yyyy') || '',
      'Lieu': m.lieuMission || '',
      'Responsable': m.responsableMission || '',
      'Statut': m.statutMission || '',
      'Priorité': m.prioriteMission || '',
      'Heures': m.nbHeures || 0,
      'Sous-total (FCFA)': m.sousTotal || 0,
      'KM parcourus': (m.kmFinMission && m.kmDbtMission) ? m.kmFinMission - m.kmDbtMission : 0,
      'Carburant (L)': (m.carbtDbtMission && m.carbtFinMission) ? m.carbtDbtMission - m.carbtFinMission : 0,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Missions');
    XLSX.writeFile(wb, `missions_${this.datePipe.transform(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
  }

  private loadMissions(): void {
    this.missionsService.getMissions().subscribe({
      next: (response) => {
        const sorted = response.slice().sort((a, b) => {
          const da = a.dateCreation ? new Date(a.dateCreation).getTime() : 0;
          const db = b.dateCreation ? new Date(b.dateCreation).getTime() : 0;
          return db - da;
        });
        this.allMissions = sorted;
        this.missionsDataSource.data = sorted;
        this.totalMissions = response.length;
        this.missionsEnAttente = response.filter((m) => m.statutMission === 'EN_ATTENTE').length;
        this.missionsEnCours = response.filter((m) => m.statutMission === 'EN_COURS').length;
        this.missionsTerminees = response.filter((m) => m.statutMission === 'TERMINEE').length;

        this.missionsDataSource.paginator = this.paginator;
      },
    });
  }
}
