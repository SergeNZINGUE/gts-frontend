import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Engin } from './engin';
import { EnginService } from 'src/app/services/apps/engin/engin.service';

@Component({
  standalone: true,
  selector: 'app-engins',
  imports: [MaterialModule, FormsModule, CommonModule, TablerIconsModule, RouterLink],
  templateUrl: './engins.component.html',
  styleUrl: './engins.component.scss',
})
export class AppEnginsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  isLoading = false;
  displayedColumns = [
    'codeEngin', 'modelEngin', 'marqueEngin', 'typeEngin',
    'immatriculationEngin', 'statusEngin', 'action',
  ];
  dataSource = new MatTableDataSource<Engin>([]);

  get total(): number { return this.dataSource.data.length; }
  get enActif(): number { return this.dataSource.data.filter(e => e.statusEngin === 'DISPONIBLE').length; }

  constructor(
    private enginService: EnginService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void { this.loadEngins(); }

  ngAfterViewInit(): void { this.dataSource.paginator = this.paginator; }

  loadEngins(): void {
    this.isLoading = true;
    this.enginService.getEngins().subscribe({
      next: (engins) => {
        this.dataSource.data = engins;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snack('Erreur de chargement des engins');
      },
    });
  }

  applyFilter(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
  }

  goToDetails(id: number): void {
    this.router.navigate(['/apps/engins/details-engins', id]);
  }

  confirmDelete(engin: Engin, event: Event): void {
    event.stopPropagation();
    const ref = this.snackBar.open(
      `Supprimer l'engin ${engin.codeEngin || ''} ?`,
      'Confirmer',
      { duration: 5000, horizontalPosition: 'center', verticalPosition: 'top' },
    );
    ref.onAction().subscribe(() => {
      this.enginService.deleteEngin(engin.id).subscribe({
        next: () => { this.snack('Engin supprimé'); this.loadEngins(); },
        error: () => this.snack('Erreur lors de la suppression'),
      });
    });
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'DISPONIBLE': return 'bg-green-500';
      case 'EN LOCATION': return 'bg-blue-500';
      case 'EN MAINTENANCE': return 'bg-yellow-500';
      case 'HORS SERVICE': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  }

  private snack(msg: string): void {
    this.snackBar.open(msg, 'Fermer', {
      duration: 3000, horizontalPosition: 'center', verticalPosition: 'top',
    });
  }
}
