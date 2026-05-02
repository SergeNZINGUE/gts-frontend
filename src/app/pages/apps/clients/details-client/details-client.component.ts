import {Component, signal, ViewChild} from '@angular/core';
import {MaterialModule} from "../../../../material.module";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TablerIconsModule} from "angular-tabler-icons";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {MatTable, MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {ConducteurImagesResponse} from "../../employee/conducterImagesResponse";
import {ConducteurDetailsModel} from "../../employee/details-employee/conducteurDetailsModel";
import {LogoClientResponse} from "./logoClientResponse";
import {Client} from "../client";
import {ClientsService} from "../../../../services/apps/clients/clients.service";

@Component({
  selector: 'app-details-client',
  imports: [
    MaterialModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TablerIconsModule,
    RouterLink,
  ],
  templateUrl: './details-client.component.html',
  styleUrl: './details-client.component.scss',
})
export class DetailsClientComponent {
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  images: LogoClientResponse | null = null;
  id = signal<number>(0);
  clientLocationDetails = signal<Client | null>(null);
  displayedColumns: string[] = [
    'codeLocation',
    'enginCode',
    'dateDbtLoc',
    'dateFinLoc',
    'statut',
    'conducteurNom',
    'nbJoursLocation',
    'siteLocation'
  ];
 locationsDataSource = new MatTableDataSource<any>([]);
  searchText = '';
  selectedStatus = 'All';
  client: any;

  constructor(
    private activatedRouter: ActivatedRoute,
    private clientService : ClientsService
  ) {
    this.locationsDataSource.filterPredicate = (data: any, filter: string) => {
      const parsedFilter = JSON.parse(filter);
      const search = (parsedFilter.search || '').toString().toLowerCase().trim();
      const status = (parsedFilter.status || 'All').toString();

      const toText = (value: any) =>
        value === null || value === undefined ? '' : String(value).toLowerCase();

      const matchesStatus =
        status === 'All' || toText(data.statut) === toText(status);

      const matchesSearch =
        toText(data.codeLocation).includes(search) ||
        toText(data.enginCode).includes(search) ||
        toText(data.dateDbtLoc).includes(search) ||
        toText(data.dateFinLoc).includes(search) ||
        toText(data.statut).includes(search) ||
        toText(data.conducteurNom).includes(search) ||
        toText(data.enginModel).includes(search) ||
        toText(data.nbJoursLocation).includes(search) ||
        toText(data.siteLocation).includes(search);

      return matchesStatus && matchesSearch;
    };

  }
  ngOnInit() {
    this.id.set(+this.activatedRouter.snapshot.paramMap.get('id')!);
    this.loadLocations(this.id());
    this.loadLogoClient(this.id());
  }

  loadLocations(id: number) {
    this.clientLocationDetails.set(null);
    this.clientService.getClientById(id, 0, 10).subscribe({
      next: (response) => {
        this.clientLocationDetails.set(response);
        this.client = response;
        this.locationsDataSource.data = response.locations || [];
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error fetching employee details:', error);
      },
    });
  }

  private loadLogoClient(number: number) {
    this.clientService.getImages(number).subscribe({
      next: (response) => {
        this.images = response;
        console.log('images:', this.images.cheminLogoEntreprise);
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
    console.log('applyFilters', this.searchText, this.selectedStatus);
    this.locationsDataSource.filter = JSON.stringify({
      search: this.searchText,
      status: this.selectedStatus,
    });
    console.log('missionsDataSource.filter', this.locationsDataSource.filter);

    if (this.locationsDataSource.paginator) {
      this.locationsDataSource.paginator.firstPage();
    }
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedStatus = 'All';
    this.applyFilters();
  }
}
