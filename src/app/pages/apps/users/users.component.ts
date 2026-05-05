import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { UserResponse } from './user-response';
import { UsersService } from 'src/app/services/apps/users/users.service';

@Component({
  standalone: true,
  selector: 'app-users',
  imports: [MaterialModule, FormsModule, CommonModule, TablerIconsModule, DatePipe, RouterLink],
  providers: [DatePipe],
  templateUrl: './users.component.html',
})
export class UsersComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  isLoading = false;
  displayedColumns = ['fullname', 'username', 'email', 'telephone', 'roles', 'statut', 'dateCreation', 'actions'];
  dataSource = new MatTableDataSource<UserResponse>([]);

  get total(): number { return this.dataSource.data.length; }
  get totalActifs(): number { return this.dataSource.data.filter(u => u.active).length; }
  get totalInactifs(): number { return this.dataSource.data.filter(u => !u.active).length; }

  constructor(
    private usersService: UsersService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.dataSource.filterPredicate = (user, filter) => {
      const search = filter.toLowerCase();
      return (
        (user.nomUsers + ' ' + user.prenomsUsers).toLowerCase().includes(search) ||
        user.username.toLowerCase().includes(search) ||
        user.emailUsers.toLowerCase().includes(search) ||
        (user.tel1Users || '').toLowerCase().includes(search)
      );
    };
    this.loadUsers();
  }

  ngAfterViewInit(): void { this.dataSource.paginator = this.paginator; }

  loadUsers(): void {
    this.isLoading = true;
    this.usersService.getUsers().subscribe({
      next: (users) => {
        this.dataSource.data = users;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snack('Erreur de chargement des utilisateurs');
      },
    });
  }

  applyFilter(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  goToDetails(id: number): void {
    this.router.navigate(['/apps/users/details-user', id]);
  }

  toggleActive(user: UserResponse, event: Event): void {
    event.stopPropagation();
    this.usersService.toggleActive(user.id).subscribe({
      next: (updated) => {
        const index = this.dataSource.data.findIndex(u => u.id === user.id);
        if (index !== -1) {
          const updated_data = [...this.dataSource.data];
          updated_data[index] = updated;
          this.dataSource.data = updated_data;
        }
        this.snack(updated.active ? 'Compte activé' : 'Compte désactivé');
      },
      error: () => this.snack('Erreur lors du changement de statut'),
    });
  }

  sendVerificationCode(user: UserResponse, event: Event): void {
    event.stopPropagation();
    this.usersService.sendVerificationCode(user.id).subscribe({
      next: () => this.snack(`Code de vérification envoyé à ${user.emailUsers}`),
      error: () => this.snack("Erreur lors de l'envoi du code"),
    });
  }

  confirmDelete(user: UserResponse, event: Event): void {
    event.stopPropagation();
    const nom = `${user.nomUsers || ''} ${user.prenomsUsers || ''}`.trim();
    const ref = this.snackBar.open(
      `Supprimer ${nom || user.username} ?`,
      'Confirmer',
      { duration: 5000, horizontalPosition: 'center', verticalPosition: 'top' },
    );
    ref.onAction().subscribe(() => {
      this.usersService.deleteUser(user.id).subscribe({
        next: () => { this.snack('Utilisateur supprimé'); this.loadUsers(); },
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