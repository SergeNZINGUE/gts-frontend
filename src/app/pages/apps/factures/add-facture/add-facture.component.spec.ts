import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

import { AddFactureComponent } from './add-facture.component';
import { FacturesService } from 'src/app/services/apps/factures/factures.service';
import { LocationService } from 'src/app/services/apps/location/location.service';
import { MissionsService } from 'src/app/services/apps/missions/missions.service';
import { LocationEngin } from '../../locations/location-engin';
import { Mission } from '../../missions/mission';
import { Facture } from '../facture';

const mockLocations: LocationEngin[] = [
  { id: 1, codeLocation: 'LOC-001', siteLocation: 'Cotonou' } as LocationEngin,
  { id: 2, codeLocation: 'LOC-002', siteLocation: 'Abidjan' } as LocationEngin,
];

const mockMissions: Mission[] = [
  { id: 10, locationId: 1, sousTotal: 40000, factureId: undefined } as Mission,
  { id: 11, locationId: 1, sousTotal: 60000, factureId: undefined } as Mission,
  { id: 12, locationId: 1, sousTotal: 20000, factureId: 5 } as Mission, // déjà facturée
];

describe('AddFactureComponent', () => {
  let component: AddFactureComponent;
  let fixture: ComponentFixture<AddFactureComponent>;
  let facturesSpy:  jasmine.SpyObj<FacturesService>;
  let locationSpy:  jasmine.SpyObj<LocationService>;
  let missionsSpy:  jasmine.SpyObj<MissionsService>;
  let routerSpy: jasmine.Spy;
  let snackSpy:  jasmine.Spy;

  beforeEach(async () => {
    facturesSpy  = jasmine.createSpyObj<FacturesService>('FacturesService',   ['createFacture']);
    locationSpy  = jasmine.createSpyObj<LocationService>('LocationService',   ['getLocations']);
    missionsSpy  = jasmine.createSpyObj<MissionsService>('MissionsService',   ['getMissions']);

    facturesSpy.createFacture.and.returnValue(of({ id: 99 } as Facture));
    locationSpy.getLocations.and.returnValue(of(mockLocations));
    missionsSpy.getMissions.and.returnValue(of(mockMissions));

    await TestBed.configureTestingModule({
      imports: [AddFactureComponent, NoopAnimationsModule, RouterTestingModule.withRoutes([])],
      providers: [
        { provide: FacturesService, useValue: facturesSpy },
        { provide: LocationService, useValue: locationSpy },
        { provide: MissionsService, useValue: missionsSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture   = TestBed.createComponent(AddFactureComponent);
    component = fixture.componentInstance;
    routerSpy = spyOn(TestBed.inject(Router), 'navigate').and.returnValue(Promise.resolve(true));
    snackSpy  = spyOn(component['snackBar'], 'open').and.callThrough();
    fixture.detectChanges();
  });

  it('devrait être créé', () => expect(component).toBeTruthy());

  // ── ngOnInit ──────────────────────────────────────────────────────────
  describe('ngOnInit()', () => {
    it('devrait charger les locations', () => {
      expect(locationSpy.getLocations).toHaveBeenCalledTimes(1);
      expect(component.locations.length).toBe(2);
    });
  });

  // ── filteredLocations ─────────────────────────────────────────────────
  describe('filteredLocations', () => {
    it('devrait retourner toutes les locations si la recherche est vide', () => {
      expect(component.filteredLocations.length).toBe(2);
    });

    it('devrait filtrer par codeLocation', () => {
      component.locationSearchCtrl.setValue('LOC-001');
      expect(component.filteredLocations.length).toBe(1);
    });

    it('devrait filtrer par siteLocation', () => {
      component.locationSearchCtrl.setValue('Abidjan');
      expect(component.filteredLocations.length).toBe(1);
    });
  });

  // ── onLocationSelected() ──────────────────────────────────────────────
  describe('onLocationSelected()', () => {
    it('devrait patcher locationId', () => {
      component.onLocationSelected(mockLocations[0]);
      expect(component.form.value.locationId).toBe(1);
    });

    it('devrait appeler getMissions pour la location', () => {
      component.onLocationSelected(mockLocations[0]);
      expect(missionsSpy.getMissions).toHaveBeenCalled();
    });

    it('devrait charger uniquement les missions non facturées de cette location', () => {
      component.onLocationSelected(mockLocations[0]);
      // ids 10 et 11 : locationId=1 et factureId=undefined ; id 12 : déjà facturée
      expect(component.missionsDisponibles.length).toBe(2);
    });
  });

  // ── montantHT / montantTTC ────────────────────────────────────────────
  describe('montantHT / montantTTC', () => {
    beforeEach(() => {
      component.onLocationSelected(mockLocations[0]);
    });

    it('montantHT devrait sommer les missions sélectionnées', () => {
      component.selectedMissionIds.add(10);
      component.selectedMissionIds.add(11);
      expect(component.montantHT).toBe(100000);
    });

    it('montantTTC devrait appliquer le taux TVA', () => {
      component.selectedMissionIds.add(10); // 40 000
      component.form.patchValue({ tauxTVA: 18 });
      expect(component.montantTTC).toBeCloseTo(40000 * 1.18, 0);
    });
  });

  // ── toggleMission / isMissionSelected ────────────────────────────────
  describe('toggleMission()', () => {
    beforeEach(() => component.onLocationSelected(mockLocations[0]));

    it('devrait ajouter une mission à la sélection', () => {
      component.toggleMission(mockMissions[0]);
      expect(component.isMissionSelected(mockMissions[0])).toBeTrue();
    });

    it('devrait retirer une mission déjà sélectionnée', () => {
      component.toggleMission(mockMissions[0]);
      component.toggleMission(mockMissions[0]);
      expect(component.isMissionSelected(mockMissions[0])).toBeFalse();
    });
  });

  describe('selectAllMissions() / deselectAllMissions()', () => {
    beforeEach(() => component.onLocationSelected(mockLocations[0]));

    it('selectAllMissions() devrait sélectionner toutes les missions disponibles', () => {
      component.selectAllMissions();
      expect(component.selectedMissionIds.size).toBe(2);
    });

    it('deselectAllMissions() devrait vider la sélection', () => {
      component.selectAllMissions();
      component.deselectAllMissions();
      expect(component.selectedMissionIds.size).toBe(0);
    });
  });

  // ── submit() ──────────────────────────────────────────────────────────
  describe('submit()', () => {
    it('ne devrait PAS appeler createFacture si le formulaire est invalide', () => {
      component.submit();
      expect(facturesSpy.createFacture).not.toHaveBeenCalled();
    });

    it('devrait afficher un snack si aucune mission sélectionnée', () => {
      component.form.patchValue({ dateEmission: new Date('2024-01-01'), tauxTVA: 18, etatPaiement: 'BROUILLON', locationId: 1 });
      component.submit();
      expect(snackSpy).toHaveBeenCalledWith('Sélectionnez au moins une mission', 'Fermer', jasmine.any(Object));
      expect(facturesSpy.createFacture).not.toHaveBeenCalled();
    });

    it('devrait appeler createFacture avec le payload si valide', () => {
      component.onLocationSelected(mockLocations[0]);
      component.selectedMissionIds.add(10);
      component.form.patchValue({ dateEmission: new Date('2024-01-01'), tauxTVA: 18, etatPaiement: 'BROUILLON' });
      component.submit();
      expect(facturesSpy.createFacture).toHaveBeenCalledWith(jasmine.objectContaining({
        locationId: 1,
        missionIds: [10],
      }));
    });

    it('devrait naviguer vers le détail de la facture après succès', () => {
      component.onLocationSelected(mockLocations[0]);
      component.selectedMissionIds.add(10);
      component.form.patchValue({ dateEmission: new Date('2024-01-01'), tauxTVA: 18, etatPaiement: 'BROUILLON' });
      component.submit();
      expect(routerSpy).toHaveBeenCalledWith(['/apps/factures/detail', 99]);
    });

    it('devrait afficher un snack d\'erreur si createFacture échoue', () => {
      facturesSpy.createFacture.and.returnValue(throwError(() => new Error('500')));
      component.onLocationSelected(mockLocations[0]);
      component.selectedMissionIds.add(10);
      component.form.patchValue({ dateEmission: new Date('2024-01-01'), tauxTVA: 18, etatPaiement: 'BROUILLON' });
      component.submit();
      expect(snackSpy).toHaveBeenCalledWith('Erreur lors de la création', 'Fermer', jasmine.any(Object));
    });
  });
});
