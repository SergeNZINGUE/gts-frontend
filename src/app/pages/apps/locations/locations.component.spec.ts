import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CalendarModule } from 'angular-calendar';

import { LocationsComponent } from './locations.component';
import { LocationService } from 'src/app/services/apps/location/location.service';
import { LocationEngin } from './location-engin';

const locBase: LocationEngin = {
  id: 1,
  codeLocation: 'LOC-001',
  statut: 'EN ATTENTE' as any,
  nbJoursLocation: 3,
  siteLocation: 'Cotonou',
  dateDbtLoc: '2024-06-01',
  dateFinLoc: '2024-06-04',
  coutHoraireLocation: 5000,
  coutJournalierLocation: 40000,
  client: { id: 1, nameClient: 'Acme Corp' },
  engins: { id: 1, codeEngin: 'ENG-001' } as any,
};

const mockLocations: LocationEngin[] = [
  { ...locBase, id: 1, statut: 'EN ATTENTE' as any, client: { nameClient: 'Acme Corp' },  engins: { codeEngin: 'ENG-001' } as any },
  { ...locBase, id: 2, statut: 'VALIDEE'    as any, client: { nameClient: 'Beta SARL' },  engins: { codeEngin: 'ENG-002' } as any },
  { ...locBase, id: 3, statut: 'TERMINEE'   as any, client: { nameClient: 'Acme Corp' },  engins: { codeEngin: 'ENG-003' } as any },
  { ...locBase, id: 4, statut: 'ANNULEE'    as any, client: { nameClient: 'Gamma SA'  },  engins: { codeEngin: 'ENG-001' } as any },
];

describe('LocationsComponent', () => {
  let component: LocationsComponent;
  let fixture: ComponentFixture<LocationsComponent>;
  let locationServiceSpy: jasmine.SpyObj<LocationService>;
  let dialogRefSpy: jasmine.SpyObj<any>;
  let dialogSubject: Subject<any>;
  let dialogOpenSpy: jasmine.Spy;
  let navigateSpy: jasmine.Spy;

  beforeEach(async () => {
    locationServiceSpy = jasmine.createSpyObj<LocationService>('LocationService', [
      'getLocations', 'validerLocation', 'terminerLocation',
    ]);
    locationServiceSpy.getLocations.and.returnValue(of([...mockLocations]));
    locationServiceSpy.validerLocation.and.returnValue(of({ ...locBase, statut: 'VALIDEE' as any }));
    locationServiceSpy.terminerLocation.and.returnValue(of({ ...locBase, statut: 'TERMINEE' as any }));

    await TestBed.configureTestingModule({
      imports: [LocationsComponent, NoopAnimationsModule, RouterTestingModule.withRoutes([])],
      providers: [{ provide: LocationService, useValue: locationServiceSpy }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .overrideComponent(LocationsComponent, {
      remove: { imports: [CalendarModule] },
      add:    { schemas: [CUSTOM_ELEMENTS_SCHEMA] },
    })
    .compileComponents();

    fixture   = TestBed.createComponent(LocationsComponent);
    component = fixture.componentInstance;

    navigateSpy = spyOn(TestBed.inject(Router), 'navigate')
      .and.returnValue(Promise.resolve(true));

    dialogSubject = new Subject<any>();
    dialogRefSpy  = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRefSpy.afterClosed.and.returnValue(dialogSubject.asObservable());
    dialogOpenSpy = spyOn(component['dialog'], 'open').and.returnValue(dialogRefSpy);

    fixture.detectChanges();
  });

  it('devrait être créé', () => expect(component).toBeTruthy());

  // ── Chargement ────────────────────────────────────────────────────────
  describe('loadLocations()', () => {
    it('devrait appeler getLocations() à l\'initialisation', () => {
      expect(locationServiceSpy.getLocations).toHaveBeenCalledTimes(1);
    });

    it('devrait remplir le dataSource', () => {
      expect(component.locationsDataSource.data.length).toBe(4);
    });

    it('devrait calculer totalLocations', () => {
      expect(component.totalLocations).toBe(4);
    });

    it('devrait compter les locations EN ATTENTE comme locationsEnCours', () => {
      expect(component.locationsEnCours).toBe(1);
    });

    it('devrait compter les locations VALIDEE', () => {
      expect(component.locationsValidees).toBe(1);
    });

    it('devrait compter les locations TERMINEE', () => {
      expect(component.locationsTerminees).toBe(1);
    });

    it('devrait extraire les noms de clients uniques', () => {
      expect(component.clientsOptions).toContain('Acme Corp');
      expect(component.clientsOptions).toContain('Beta SARL');
      expect(component.clientsOptions).toContain('Gamma SA');
    });

    it('devrait extraire les codes engins uniques', () => {
      expect(component.enginsOptions).toContain('ENG-001');
      expect(component.enginsOptions).toContain('ENG-002');
    });
  });

  // ── Filtres ───────────────────────────────────────────────────────────
  describe('applyFilters()', () => {
    it('devrait filtrer par statut', () => {
      component.applyStatusFilter('VALIDEE');
      expect(component.locationsDataSource.data.length).toBe(1);
      expect((component.locationsDataSource.data[0] as any).statut).toBe('VALIDEE');
    });

    it('devrait filtrer par client', () => {
      component.applyClientFilter('Beta SARL');
      expect(component.locationsDataSource.data.length).toBe(1);
    });

    it('devrait filtrer par engin', () => {
      component.applyEnginFilter('ENG-001');
      expect(component.locationsDataSource.data.length).toBe(2);
    });

    it('devrait filtrer par texte de recherche (codeLocation)', () => {
      component.applySearch('LOC-001');
      expect(component.locationsDataSource.data.length).toBe(4); // toutes ont LOC-001
    });

    it('All devrait retourner toutes les locations', () => {
      component.applyStatusFilter('VALIDEE');
      component.applyStatusFilter('All');
      expect(component.locationsDataSource.data.length).toBe(4);
    });
  });

  describe('clearFilters()', () => {
    it('devrait réinitialiser tous les filtres', () => {
      component.applyStatusFilter('VALIDEE');
      component.applyClientFilter('Acme Corp');
      component['clearFilters']();
      expect(component.locationsDataSource.data.length).toBe(4);
      expect(component.searchText).toBe('');
      expect(component.selectedStatus).toBe('All');
      expect(component.selectedClient).toBe('All');
      expect(component.selectedEngin).toBe('All');
    });
  });

  // ── Navigation ────────────────────────────────────────────────────────
  describe('openLocationDetails()', () => {
    it('devrait naviguer vers /apps/locations/details-location/{id}', () => {
      component.openLocationDetails(mockLocations[0]);
      expect(navigateSpy).toHaveBeenCalledWith(['/apps/locations/details-location', 1]);
    });
  });

  describe('openAddLocation()', () => {
    it('devrait naviguer vers /apps/locations/add-location', () => {
      component.openAddLocation();
      expect(navigateSpy).toHaveBeenCalledWith(['/apps/locations/add-location']);
    });
  });

  describe('changeViewMode()', () => {
    it('devrait passer en mode calendar', () => {
      component.changeViewMode('calendar');
      expect(component.viewMode).toBe('calendar');
    });

    it('devrait revenir en mode table', () => {
      component.changeViewMode('calendar');
      component.changeViewMode('table');
      expect(component.viewMode).toBe('table');
    });
  });

  // ── terminerLocation() ────────────────────────────────────────────────
  describe('terminerLocation()', () => {
    it('devrait appeler terminerLocation du service', () => {
      component.terminerLocation(mockLocations[1]); // id=2
      expect(locationServiceSpy.terminerLocation).toHaveBeenCalledWith(
        2, jasmine.any(Object),
      );
    });

    it('devrait recharger la liste après succès', () => {
      locationServiceSpy.getLocations.calls.reset();
      component.terminerLocation(mockLocations[1]);
      expect(locationServiceSpy.getLocations).toHaveBeenCalledTimes(1);
    });

    it('ne devrait PAS appeler le service si id est absent', () => {
      component.terminerLocation({ ...locBase, id: undefined });
      expect(locationServiceSpy.terminerLocation).not.toHaveBeenCalled();
    });
  });

  // ── validerLocation() ─────────────────────────────────────────────────
  describe('validerLocation()', () => {
    it('ne devrait PAS ouvrir le dialogue si id est absent', () => {
      component.validerLocation({ ...locBase, id: undefined });
      expect(dialogOpenSpy).not.toHaveBeenCalled();
    });

    it('devrait ouvrir le dialogue de validation', () => {
      component.validerLocation(mockLocations[0]);
      expect(dialogOpenSpy).toHaveBeenCalled();
    });

    it('devrait appeler validerLocation du service après confirmation', () => {
      component.validerLocation(mockLocations[0]);
      dialogSubject.next({ coutHoraireLocation: 6000, coutJournalierLocation: 48000 });
      expect(locationServiceSpy.validerLocation).toHaveBeenCalledWith(
        1, { coutHoraireLocation: 6000, coutJournalierLocation: 48000 },
      );
    });

    it('ne devrait PAS appeler le service si le dialogue est annulé', () => {
      component.validerLocation(mockLocations[0]);
      dialogSubject.next(null);
      expect(locationServiceSpy.validerLocation).not.toHaveBeenCalled();
    });
  });

  // ── canValiderLocation() ──────────────────────────────────────────────
  describe('canValiderLocation()', () => {
    it('devrait retourner true si statut EN ATTENTE et coût horaire > 0', () => {
      const loc: LocationEngin = { statut: 'EN ATTENTE' as any, coutHoraireLocation: 5000 };
      expect(component.canValiderLocation(loc)).toBeTrue();
    });

    it('devrait retourner true si statut EN ATTENTE et coût journalier > 0', () => {
      const loc: LocationEngin = { statut: 'EN ATTENTE' as any, coutJournalierLocation: 40000 };
      expect(component.canValiderLocation(loc)).toBeTrue();
    });

    it('devrait retourner false si déjà VALIDEE', () => {
      const loc: LocationEngin = { statut: 'VALIDEE' as any, coutHoraireLocation: 5000 };
      expect(component.canValiderLocation(loc)).toBeFalse();
    });

    it('devrait retourner false si déjà TERMINEE', () => {
      const loc: LocationEngin = { statut: 'TERMINEE' as any, coutJournalierLocation: 40000 };
      expect(component.canValiderLocation(loc)).toBeFalse();
    });

    it('devrait retourner false si aucun coût renseigné', () => {
      const loc: LocationEngin = { statut: 'EN ATTENTE' as any };
      expect(component.canValiderLocation(loc)).toBeFalse();
    });
  });

  // ── getValidationDisabledMessage() ───────────────────────────────────
  describe('getValidationDisabledMessage()', () => {
    it('devrait retourner le message "déjà validée" si VALIDEE', () => {
      expect(component.getValidationDisabledMessage({ statut: 'VALIDEE' as any }))
        .toBe('Cette location est déjà validée');
    });

    it('devrait retourner le message "déjà terminée" si TERMINEE', () => {
      expect(component.getValidationDisabledMessage({ statut: 'TERMINEE' as any }))
        .toBe('Cette location est déjà terminée');
    });

    it('devrait retourner le message "coût requis" si aucun coût', () => {
      expect(component.getValidationDisabledMessage({ statut: 'EN ATTENTE' as any }))
        .toBe('Veuillez renseigner le coût horaire ou le coût journalier avant validation');
    });

    it('devrait retourner "Valider la location" si validable', () => {
      expect(component.getValidationDisabledMessage({ statut: 'EN ATTENTE' as any, coutHoraireLocation: 5000 }))
        .toBe('Valider la location');
    });
  });
});
