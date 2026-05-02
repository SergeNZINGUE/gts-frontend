import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Employee } from 'src/app/pages/apps/employee/employee';
import { EmployeeService } from 'src/app/services/apps/employee/employee.service';

@Component({
  standalone: true,
  selector: 'app-employee',
  imports: [MaterialModule, FormsModule, CommonModule, TablerIconsModule, RouterLink, DatePipe],
  providers: [DatePipe],
  templateUrl: './employee.component.html',

})
export class AppEmployeeComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  isLoading = false;
  displayedColumns = ['name', 'contrat', 'mobile', 'dateEmbauche', 'qualifications', 'permis', 'action'];
  dataSource = new MatTableDataSource<Employee>([]);

  get total(): number { return this.dataSource.data.length; }

  constructor(
    private employeeService: EmployeeService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void { this.loadEmployees(); }

  ngAfterViewInit(): void { this.dataSource.paginator = this.paginator; }

  loadEmployees(): void {
    this.isLoading = true;
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.dataSource.data = employees;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snack('Erreur de chargement des conducteurs');
      },
    });
  }

  applyFilter(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
  }

  goToDetails(id: number): void {
    this.router.navigate(['/apps/employee/details-employee', id]);
  }

  confirmDelete(employee: Employee, event: Event): void {
    event.stopPropagation();
    const nom = `${employee.nomConducteur || ''} ${employee.prenomsConducteur || ''}`.trim();
    const ref = this.snackBar.open(
      `Supprimer ${nom || 'ce conducteur'} ?`,
      'Confirmer',
      { duration: 5000, horizontalPosition: 'center', verticalPosition: 'top' },
    );
    ref.onAction().subscribe(() => {
      this.employeeService.deleteEmployee(employee.id).subscribe({
        next: () => { this.snack('Conducteur supprimé'); this.loadEmployees(); },
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
