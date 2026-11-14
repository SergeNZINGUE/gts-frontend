import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

import { MaterialModule } from 'src/app/material.module';
import { ActiviteClientService } from 'src/app/services/apps/activite-client/activite-client.service';
import { ActiviteClient } from './activite-client';
import {
  AddActiviteComponent,
  AddActiviteDialogData,
  AddActiviteDialogResult,
} from './add-activite/add-activite.component';

@Component({
  standalone: true,
  selector: 'app-activite-client',
  imports: [CommonModule, MaterialModule, RouterLink, DatePipe],
  templateUrl: './activite-client.component.html',
  styleUrl: './activite-client.component.scss',
})
export class ActiviteClientComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isLoading = false;
  isSaving = false;
  searchText = '';
  displayedColumns = ['codeActClt', 'description', 'dateCreation', 'action'];
  dataSource = new MatTableDataSource<ActiviteClient>([]);
  private all: ActiviteClient[] = [];

  get total(): number { return this.all.length; }

  constructor(
    private activiteService: ActiviteClientService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void { this.load(); }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  load(): void {
    this.isLoading = true;
    this.activiteService.getActiviteClient().subscribe({
      next: (list) => {
        this.all = list ?? [];
        this.applyFilter(this.searchText);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snack('Erreur de chargement des activités');
      },
    });
  }

  applyFilter(value: string): void {
    this.searchText = value;
    const s = value.trim().toLowerCase();
    this.dataSource.data = !s
      ? this.all
      : this.all.filter(a =>
          (a.codeActClt ?? '').toLowerCase().includes(s) ||
          (a.description ?? '').toLowerCase().includes(s));
    this.dataSource.paginator?.firstPage();
  }

  openDialog(activite?: ActiviteClient): void {
    const data: AddActiviteDialogData = {
      activite,
      existingCodes: this.all.map(a => a.codeActClt ?? '').filter(Boolean),
    };
    this.dialog
      .open<AddActiviteComponent, AddActiviteDialogData, AddActiviteDialogResult | null>(
        AddActiviteComponent, { width: '480px', data })
      .afterClosed()
      .subscribe(result => {
        if (!result) return;
        this.isSaving = true;
        const call$ = activite
          ? this.activiteService.update(result.codeActivite, result.libelleActivite)
          : this.activiteService.create(result.codeActivite, result.libelleActivite);
        call$.subscribe({
          next: () => {
            this.isSaving = false;
            this.snack(activite ? 'Activité modifiée' : 'Activité créée');
            this.load();
          },
          error: (err: HttpErrorResponse) => {
            this.isSaving = false;
            if (err.status === 403) return; // l'intercepteur affiche déjà « Accès refusé »
            this.snack(err.status === 409
              ? 'Ce code d’activité existe déjà'
              : "Erreur lors de l'enregistrement");
          },
        });
      });
  }

  private snack(msg: string): void {
    this.snackBar.open(msg, 'Fermer', {
      duration: 3000, horizontalPosition: 'center', verticalPosition: 'top',
    });
  }
}
