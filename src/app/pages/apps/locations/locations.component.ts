import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MatCard, MatCardContent} from "@angular/material/card";
import {MatDivider} from "@angular/material/list";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {MatOption, MatSelect} from "@angular/material/select";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef,
  MatRow, MatRowDef,
  MatTable, MatTableDataSource
} from "@angular/material/table";
import {DatePipe, NgClass} from "@angular/common";
import {MatPaginator} from "@angular/material/paginator";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatTooltip} from "@angular/material/tooltip";
import {MatSort} from "@angular/material/sort";
import {LocationEngin} from "./location-engin";
import {CoreService} from "../../../services/core.service";
import {LocationService} from "../../../services/apps/location/location.service";
import {Router} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {CalendarEvent, CalendarModule,CalendarView} from "angular-calendar";
import {MatDialog} from "@angular/material/dialog";
import {
  ValidateLocationDialogComponent, ValidateLocationDialogResult
} from "./details-location/validate-location-dialog/validate-location-dialog.component";

@Component({
  selector: 'app-locations',
  imports: [
    MatIcon,
    MatCardContent,
    MatCard,
    MatDivider,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatTable,
    DatePipe,
    MatPaginator,
    NgClass,
    MatHeaderRow,
    MatRow,
    MatIconButton,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatTooltip,
    MatCellDef,
    MatHeaderCellDef,
    MatSort,
    MatButton,
    MatInput,
    MatRowDef,
    MatHeaderRowDef,
    FormsModule,
    CalendarModule
  ],
  templateUrl: './locations.component.html',
  styleUrl: './locations.component.scss',
})

export class LocationsComponent implements OnInit, AfterViewInit  {
  @ViewChild(MatTable, { static: false }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator = Object.create(null);

  displayedColumns: string[] = [
    'codeLocation',
    'client',
    'engin',
    'conducteur',
    'periode',
    'nbJoursLocation',
    'siteLocation',
    'statut',
    'actions',
  ];

  totalLocations = 0;
  locationsEnCours = 0;
  locationsValidees = 0;
  locationsTerminees = 0;

  searchText = '';
  selectedStatus = 'All';
  selectedClient = 'All';
  selectedEngin = 'All';
  viewMode: 'table' | 'calendar' = 'table';

  CalendarView = CalendarView;
  calendarView: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  calendarEvents: CalendarEvent[] = [];

  clientsOptions: string[] = [];
  enginsOptions: string[] = [];

  locationsDataSource = new MatTableDataSource<LocationEngin>([]);
  allLocations: LocationEngin[] = [];
  private statusLocation: string = 'TERMINEE';

  constructor(
    private locationService: LocationService,
    private router: Router,
    private dialog: MatDialog
  ) {
  }
  ngOnInit() {
    this.loadLocations()
  }

  ngAfterViewInit(): void {
    this.locationsDataSource.paginator = this.paginator;
  }

  applySearch(searchText:string) {
    this.searchText = searchText;
    this.applyFilters();
  }

  applyStatusFilter(status: string) {
    this.selectedStatus = status;
    this.applyFilters();
  }
  applyClientFilter(client: string) {
    this.selectedClient = client;
    this.applyFilters();
  }
  applyEnginFilter(engin: string) {
    this.selectedEngin = engin;
    this.applyFilters();
  }

  changeViewMode(mode: 'table' | 'calendar') {
    this.viewMode = mode;
  }
  openLocationDetails(location: LocationEngin) {
    this.router.navigate(['/apps/locations/details-location', location.id]);
  }

  applyFilters() {

    const search = this.searchText.trim().toLowerCase();

    const filteredLocations = this.allLocations.filter((location) => {
      const codeLocation = location.codeLocation?.toLowerCase() || '';
      const clientName = location.client?.nameClient?.toLowerCase() || '';
      const enginCode = location.engins?.codeEngin?.toLowerCase() || '';
      const conducteurNom = location.conducteur?.nomConducteur?.toLowerCase() || '';

      const matchSearch =
        !search ||
        codeLocation.includes(search) ||
        clientName.includes(search) ||
        enginCode.includes(search) ||
        conducteurNom.includes(search);

      const matchStatus =
        this.selectedStatus === 'All' ||
        location.statut === this.selectedStatus;

      const matchClient =
        this.selectedClient === 'All' ||
        location.client?.nameClient === this.selectedClient;

      const matchEngin =
        this.selectedEngin === 'All' ||
        location.engins?.codeEngin === this.selectedEngin;

      return matchSearch && matchStatus && matchClient && matchEngin;
    });

    this.locationsDataSource.data = filteredLocations;
    this.updateCalendarEvents(filteredLocations);

    if (this.locationsDataSource.paginator) {
      this.locationsDataSource.paginator.firstPage();
    }
  }

  protected clearFilters() {
    this.searchText = '';
    this.selectedStatus = 'All';
    this.selectedClient = 'All';
    this.selectedEngin = 'All';
    this.applyFilters();
  }

  validerLocation(location: LocationEngin) {
    if (!location.id) {
      return;
    }

    const dialogRef = this.dialog.open<
      ValidateLocationDialogComponent,
      {
        codeLocation?: string;
        coutHoraireLocation?: number;
        coutJournalierLocation?: number;
      },
      ValidateLocationDialogResult
    >(ValidateLocationDialogComponent, {
      width: '450px',
      disableClose: true,
      data: {
        codeLocation: location.codeLocation,
        coutHoraireLocation: location.coutHoraireLocation,
        coutJournalierLocation: location.coutJournalierLocation,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      this.locationService.validerLocation(location.id!, {
        coutHoraireLocation: result.coutHoraireLocation,
        coutJournalierLocation: result.coutJournalierLocation,
      }).subscribe({
        next: () => {
          this.loadLocations();
        },
        error: (error) => {
          console.error('Erreur validation location', error);
        }
      });
    });
  }

  terminerLocation(location: LocationEngin) {
    if (!location.id) {
      return;
    }


    this.locationService.terminerLocation(location.id,{
      statusLocation : 'TERMINEE'
    }).subscribe({
      next: () => {
        this.loadLocations();
      },
      error: (error) => {
        console.error('Erreur terminaison location', error);
      }
    });
  }

  private updateCalendarEvents(locations: LocationEngin[]) {
    this.calendarEvents = locations.map((location) => {
      return {
        title: `${location.codeLocation || 'Location'} - ${location.client?.nameClient || ''}`,
        start: location.dateDbtLoc ? new Date(location.dateDbtLoc) : new Date(),
        end: location.dateFinLoc ? new Date(location.dateFinLoc) : undefined,
        color: this.getCalendarColor(location.statut),
        meta: {
          location,
        },
      };
    });
  }

  private getCalendarColor(statut?: string) {
    switch (statut) {
      case 'VALIDEE':
        return {
          primary: '#13deb9',
          secondary: '#e6fffa',
        };
      case 'EN ATTENTE':
        return {
          primary: '#ffae1f',
          secondary: '#fff7e6',
        };
      case 'TERMINEE':
        return {
          primary: '#5d87ff',
          secondary: '#edf2ff',
        };
      case 'ANNULEE':
        return {
          primary: '#fa896b',
          secondary: '#fff0ed',
        };
      default:
        return {
          primary: '#94a3b8',
          secondary: '#f1f5f9',
        };
    }
  }

  onCalendarEventClick(event: CalendarEvent) {
    const location = event.meta?.location as LocationEngin;

    if (location?.id) {
      this.openLocationDetails(location);
    }
  }
  openAddLocation(){
    this.router.navigate(['/apps/locations/add-location']);
  }

  canValiderLocation(location: LocationEngin): boolean {
    const hasCoutHoraire =
      location.coutHoraireLocation !== undefined &&
      location.coutHoraireLocation !== null &&
      location.coutHoraireLocation > 0;

    const hasCoutJournalier =
      location.coutJournalierLocation !== undefined &&
      location.coutJournalierLocation !== null &&
      location.coutJournalierLocation > 0;

    const isStatutValide =
      location.statut !== 'VALIDEE' &&
      location.statut !== 'TERMINEE';

    return isStatutValide && (hasCoutHoraire || hasCoutJournalier);
  }

  getValidationDisabledMessage(location: LocationEngin): string {
    if (location.statut === 'VALIDEE') {
      return 'Cette location est déjà validée';
    }

    if (location.statut === 'TERMINEE') {
      return 'Cette location est déjà terminée';
    }

    if (!this.canValiderLocation(location)) {
      return 'Veuillez renseigner le coût horaire ou le coût journalier avant validation';
    }

    return 'Valider la location';
  }




  private loadLocations() {
    this.locationService.getLocations().subscribe({
      next: (response) => {
        this.allLocations = response;
        this.locationsDataSource.data = response;

        this.totalLocations = response.length;
        this.locationsEnCours = response.filter(location => location.statut === 'EN ATTENTE').length;
        this.locationsValidees = response.filter(location => location.statut === 'VALIDEE').length;
        this.locationsTerminees = response.filter(location => location.statut === 'TERMINEE').length;

        this.clientsOptions = [
          ...new Set(
            response
              .map(location => location.client?.nameClient)
              .filter((client): client is string => !!client)
          )
        ];

        this.enginsOptions = [
          ...new Set(
            response
              .map(location => location.engins?.codeEngin)
              .filter((engin): engin is string => !!engin)
          )
        ];

        this.updateCalendarEvents(response);
        this.locationsDataSource.paginator = this.paginator;
      }
    });
  }
}
