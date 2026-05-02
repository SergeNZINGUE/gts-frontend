import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

import { AddLocationComponent } from './add-location.component';
import { ClientsService } from 'src/app/services/apps/clients/clients.service';
import { EnginService } from 'src/app/services/apps/engin/engin.service';
import { EmployeeService } from 'src/app/services/apps/employee/employee.service';
import { LocationService } from 'src/app/services/apps/location/location.service';
import { Client } from '../../clients/client';
import { Engin } from '../../engins/engin';
import { Employee } from '../../employee/employee';

const mockClients: Client[] = [
  { id: 1, nameClient: 'Acme Corp' } as Client,
  { id: 2, nameClient: 'Beta SARL' } as Client,
];

const mockEngins: Engin[] = [
  { id: 1, codeEngin: 'ENG-001', marqueEngin: 'CAT', modelEngin: 'CAT 320', coutHorLocEngin: 5000, forfaitJournalierEngin: 0 } as Engin,
  { id: 2, codeEngin: 'ENG-002', marqueEngin: 'Volvo', modelEngin: 'Volvo', coutHorLocEngin: 0, forfaitJournalierEngin: 40000 } as Engin,
];

const mockConducteurs: Employee[] = [
  { id: 1, nomConducteur: 'Dupont', prenomsConducteur: 'Jean' } as Employee,
  { id: 2, nomConducteur: 'Martin', prenomsConducteur: 'Paul' } as Employee,
];

const VALID_FORM = {
  codeLocation:          'LOC-001',
  statut:                'EN ATTENTE',
  etatLocation:          1,
  clientId:              1,
  enginId:               1,
  conducteurId:          1,
  siteLocation:          'Cotonou',
  dateDbtLoc:            new Date('2024-01-01'),
  dateFinLoc:            new Date('2024-01-05'),
  nbJoursLocation:       5,
  coutHoraireLocation:   0,
  nbHeuresLocation:      0,
  coutJournalierLocation: 0,
};

describe('AddLocationComponent', () => {
  let component: AddLocationComponent;
  let fixture: ComponentFixture<AddLocationComponent>;
  let clientsSpy:  jasmine.SpyObj<ClientsService>;
  let enginSpy:    jasmine.SpyObj<EnginService>;
  let employeeSpy: jasmine.SpyObj<EmployeeService>;
  let locationSpy: jasmine.SpyObj<LocationService>;
  let routerSpy:   jasmine.Spy;
  let snackSpy:    jasmine.Spy;

  beforeEach(async () => {
    clientsSpy  = jasmine.createSpyObj<ClientsService>('ClientsService',  ['getClients']);
    enginSpy    = jasmine.createSpyObj<EnginService>('EnginService',        ['getEngins']);
    employeeSpy = jasmine.createSpyObj<EmployeeService>('EmployeeService',  ['getEmployees']);
    locationSpy = jasmine.createSpyObj<LocationService>('LocationService',  ['createLocation', 'getLocations']);

    clientsSpy.getClients.and.returnValue(of(mockClients));
    enginSpy.getEngins.and.returnValue(of(mockEngins));
    employeeSpy.getEmployees.and.returnValue(of(mockConducteurs));
    locationSpy.createLocation.and.returnValue(of({} as any));

    await TestBed.configureTestingModule({
      imports: [AddLocationComponent, NoopAnimationsModule, RouterTestingModule.withRoutes([])],
      providers: [
        { provide: ClientsService,  useValue: clientsSpy  },
        { provide: EnginService,    useValue: enginSpy    },
        { provide: EmployeeService, useValue: employeeSpy },
        { provide: LocationService, useValue: locationSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture   = TestBed.createComponent(AddLocationComponent);
    component = fixture.componentInstance;
    routerSpy = spyOn(TestBed.inject(Router), 'navigate').and.returnValue(Promise.resolve(true));
    snackSpy  = spyOn(component['snackBar'], 'open').and.callThrough();
    fixture.detectChanges();
  });

  it('devrait être créé', () => expect(component).toBeTruthy());

  // ── ngOnInit ──────────────────────────────────────────────────────────
  describe('ngOnInit()', () => {
    it('devrait charger les clients', () => {
      expect(clientsSpy.getClients).toHaveBeenCalledTimes(1);
      expect(component.clients.length).toBe(2);
    });

    it('devrait charger les engins', () => {
      expect(enginSpy.getEngins).toHaveBeenCalledTimes(1);
      expect(component.engins.length).toBe(2);
    });

    it('devrait charger les conducteurs', () => {
      expect(employeeSpy.getEmployees).toHaveBeenCalledTimes(1);
      expect(component.conducteurs.length).toBe(2);
    });
  });

  // ── Filtres de recherche ──────────────────────────────────────────────
  describe('filteredClients', () => {
    it('devrait retourner tous les clients si la recherche est vide', () => {
      expect(component.filteredClients.length).toBe(2);
    });

    it('devrait filtrer par nom de client', () => {
      component.clientSearchCtrl.setValue('Acme');
      expect(component.filteredClients.length).toBe(1);
      expect(component.filteredClients[0].nameClient).toBe('Acme Corp');
    });
  });

  describe('filteredEngins', () => {
    it('devrait retourner tous les engins si la recherche est vide', () => {
      expect(component.filteredEngins.length).toBe(2);
    });

    it('devrait filtrer par codeEngin', () => {
      component.enginSearchCtrl.setValue('ENG-001');
      expect(component.filteredEngins.length).toBe(1);
    });
  });

  describe('filteredConducteurs', () => {
    it('devrait retourner tous les conducteurs si la recherche est vide', () => {
      expect(component.filteredConducteurs.length).toBe(2);
    });

    it('devrait filtrer par nom', () => {
      component.conducteurSearchCtrl.setValue('Dupont');
      expect(component.filteredConducteurs.length).toBe(1);
    });
  });

  // ── Sélection ─────────────────────────────────────────────────────────
  describe('onClientSelected()', () => {
    it('devrait patcher clientId dans le formulaire', () => {
      component.onClientSelected(mockClients[0]);
      expect(component.form.value.clientId).toBe(1);
    });
  });

  describe('onEnginSelected()', () => {
    it('devrait patcher enginId dans le formulaire', () => {
      component.onEnginSelected(mockEngins[0]);
      expect(component.form.value.enginId).toBe(1);
    });
  });

  describe('onConducteurSelected()', () => {
    it('devrait patcher conducteurId dans le formulaire', () => {
      component.onConducteurSelected(mockConducteurs[0]);
      expect(component.form.value.conducteurId).toBe(1);
    });
  });

  // ── Calcul nb jours ───────────────────────────────────────────────────
  describe('calcul nbJoursLocation', () => {
    it('devrait calculer nbJoursLocation lors du changement de dates', () => {
      component.form.get('dateDbtLoc')!.setValue(new Date('2024-01-01'));
      component.form.get('dateFinLoc')!.setValue(new Date('2024-01-05'));
      expect(component.form.value.nbJoursLocation).toBe(5);
    });

    it('devrait mettre 0 si la date de fin est avant la date de début', () => {
      component.form.get('dateDbtLoc')!.setValue(new Date('2024-01-10'));
      component.form.get('dateFinLoc')!.setValue(new Date('2024-01-05'));
      expect(component.form.value.nbJoursLocation).toBe(0);
    });
  });

  // ── listenEnginChange / tariffMode ────────────────────────────────────
  describe('tariffMode après sélection engin', () => {
    it('devrait passer tariffMode à "horaire" si seul coutHorLocEngin > 0', () => {
      component.form.get('enginId')!.setValue(1); // ENG-001 : horaire = 5000, journalier = 0
      expect(component.tariffMode).toBe('horaire');
    });

    it('devrait passer tariffMode à "journalier" si seul forfaitJournalierEngin > 0', () => {
      component.form.get('enginId')!.setValue(2); // ENG-002 : horaire = 0, journalier = 40000
      expect(component.tariffMode).toBe('journalier');
    });
  });

  // ── totalEstime ───────────────────────────────────────────────────────
  describe('totalEstime', () => {
    it('devrait calculer le total en mode journalier', () => {
      component.form.get('enginId')!.setValue(2); // tariffMode = journalier, coutJournalier = 40000
      component.form.get('dateDbtLoc')!.setValue(new Date('2024-01-01'));
      component.form.get('dateFinLoc')!.setValue(new Date('2024-01-05')); // 5 jours
      expect(component.totalEstime).toBe(40000 * 5);
    });

    it('devrait calculer le total en mode horaire', () => {
      component.form.get('enginId')!.setValue(1); // tariffMode = horaire, coutHoraire = 5000
      component.form.patchValue({ nbHeuresLocation: 8, nbJoursLocation: 2 });
      expect(component.totalEstime).toBe(5000 * 8 * 2);
    });
  });

  // ── submit() ──────────────────────────────────────────────────────────
  describe('submit()', () => {
    it('ne devrait PAS appeler createLocation si le formulaire est invalide', () => {
      component.submit();
      expect(locationSpy.createLocation).not.toHaveBeenCalled();
    });

    it('devrait appeler createLocation avec le payload si valide', () => {
      component.form.patchValue(VALID_FORM);
      component.submit();
      expect(locationSpy.createLocation).toHaveBeenCalledWith(jasmine.any(Object));
    });

    it('devrait afficher un snack de succès après création', () => {
      component.form.patchValue(VALID_FORM);
      component.submit();
      expect(snackSpy).toHaveBeenCalledWith('Location créée avec succès', 'Fermer', jasmine.any(Object));
    });

    it('devrait naviguer vers /apps/locations après succès', () => {
      component.form.patchValue(VALID_FORM);
      component.submit();
      expect(routerSpy).toHaveBeenCalledWith(['/apps/locations']);
    });

    it('devrait afficher un snack d\'erreur si createLocation échoue', () => {
      locationSpy.createLocation.and.returnValue(throwError(() => new Error('500')));
      component.form.patchValue(VALID_FORM);
      component.submit();
      expect(snackSpy).toHaveBeenCalledWith(jasmine.stringContaining('Erreur'), jasmine.any(String), jasmine.any(Object));
    });

    it('devrait passer isSubmitting à false en cas d\'erreur', () => {
      locationSpy.createLocation.and.returnValue(throwError(() => new Error('500')));
      component.form.patchValue(VALID_FORM);
      component.submit();
      expect(component.isSubmitting).toBeFalse();
    });
  });
});
