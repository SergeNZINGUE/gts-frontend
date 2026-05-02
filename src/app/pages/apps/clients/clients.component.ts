import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Client } from './client';
import { ClientsService } from '../../../services/apps/clients/clients.service';

@Component({
  standalone: true,
  selector: 'app-clients',
  imports: [MaterialModule, FormsModule, CommonModule, TablerIconsModule, RouterLink, DatePipe],
  providers: [DatePipe],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss',
})
export class ClientsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  isLoading = false;
  displayedColumns = [
    'codeClient', 'nameClient', 'phoneNumber', 'email',
    'personneRessource', 'activiteClient', 'dateCreation', 'action',
  ];
  dataSource = new MatTableDataSource<Client>([]);

  get total(): number { return this.dataSource.data.length; }

  constructor(
    private clientService: ClientsService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void { this.loadClients(); }

  ngAfterViewInit(): void { this.dataSource.paginator = this.paginator; }

  loadClients(): void {
    this.isLoading = true;
    this.clientService.getClients().subscribe({
      next: (clients) => {
        this.dataSource.data = clients;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snack('Erreur de chargement des clients');
      },
    });
  }

  applyFilter(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
  }

  goToDetails(id: number | undefined): void {
    if (id) this.router.navigate(['/apps/clients/details-client', id]);
  }

  confirmDelete(client: Client, event: Event): void {
    event.stopPropagation();
    if (!client.id) return;
    const ref = this.snackBar.open(
      `Supprimer ${client.nameClient || 'ce client'} ?`,
      'Confirmer',
      { duration: 5000, horizontalPosition: 'center', verticalPosition: 'top' },
    );
    ref.onAction().subscribe(() => {
      this.clientService.deleteClient(client.id!).subscribe({
        next: () => { this.snack('Client supprimé'); this.loadClients(); },
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
