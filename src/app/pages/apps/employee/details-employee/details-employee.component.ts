import { Component, signal, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from '../../../../material.module';

import { EmployeeService } from '../../../../services/apps/employee/employee.service';
import { MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import {ConducteurImagesResponse} from "../conducterImagesResponse";
import {ConducteurDetailsModel} from "./conducteurDetailsModel";

@Component({
  selector: 'app-details-employee',
  imports: [
    MaterialModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TablerIconsModule,
    RouterLink,
  ],
  templateUrl: './details-employee.component.html',
  styleUrl: './details-employee.component.scss',
})
export class DetailsEmployeeComponent implements OnInit, AfterViewInit {

  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  images: ConducteurImagesResponse | null = null;
  id = signal<number>(0);
  conducteurDetail = signal<ConducteurDetailsModel | null>(null);
  displayedColumns: string[] = [
    'codeMission',
    'dateTravail',
    'descriptionMission',
    'lieuMission',
    'statutMission',
    'nbHeures',
  ];
  missionsDataSource = new MatTableDataSource<any>([]);
  searchText = '';
  selectedStatus = 'All';
  conducteur: any;

  constructor(
    private activatedRouter: ActivatedRoute,
    private employeeService: EmployeeService
  ) {
    this.missionsDataSource.filterPredicate = (data: any, filter: string) => {
      const parsedFilter = JSON.parse(filter);
      const search = (parsedFilter.search || '').toString().toLowerCase().trim();
      const status = (parsedFilter.status || 'All').toString();

      const toText = (value: any) =>
        value === null || value === undefined ? '' : String(value).toLowerCase();

      const matchesStatus =
        status === 'All' || toText(data.statutMission) === toText(status);

      const matchesSearch =
        toText(data.codeMission).includes(search) ||
        toText(data.descriptionMission).includes(search) ||
        toText(data.lieuMission).includes(search) ||
        toText(data.statutMission).includes(search) ||
        toText(data.nbHeures).includes(search) ||
        toText(data.dateTravail).includes(search);

      return matchesStatus && matchesSearch;
    };
  }

  ngOnInit(): void {
    this.id.set(+this.activatedRouter.snapshot.paramMap.get('id')!);
    this.loadDetailsEmployee(this.id());
    this.loadImagesEmployee(this.id());
  }

  ngAfterViewInit(): void {
    this.missionsDataSource.paginator = this.paginator;
    this.missionsDataSource.sort = this.sort;
  }

  loadDetailsEmployee(id: number): void {
    this.conducteurDetail.set(null);
    this.employeeService.getEmployeesById(id, 0, 10).subscribe({
      next: (response) => {
        this.conducteurDetail.set(response);
        this.conducteur = response;
        this.missionsDataSource.data = response.missions || [];
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error fetching employee details:', error);
      },
    });
  }
  loadImagesEmployee(id: number): void {
    this.employeeService.getImages(id).subscribe({
      next: (response) => {
        this.images = response;
        console.log('images:', this.images.imgConducteurUrl);
      },
      error: (error) => {
        console.error('erreur images:', error);
      },
    });
  }

  applySearch(value: string): void {
    this.searchText = value;
    this.applyFilters();
  }

  applyStatusFilter(status: string): void {
    this.selectedStatus = status;
    this.applyFilters();
  }

  applyFilters(): void {

    this.missionsDataSource.filter = JSON.stringify({
      search: this.searchText,
      status: this.selectedStatus,
    });

    if (this.missionsDataSource.paginator) {
      this.missionsDataSource.paginator.firstPage();
    }
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedStatus = 'All';
    this.applyFilters();
  }
}
