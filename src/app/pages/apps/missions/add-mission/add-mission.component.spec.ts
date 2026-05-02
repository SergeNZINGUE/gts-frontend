import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

import { AddMissionComponent } from './add-mission.component';
import { MissionsService } from 'src/app/services/apps/missions/missions.service';
import { LocationService } from 'src/app/services/apps/location/location.service';
import { LocationEngin } from '../../locations/location-engin';

const mockLocations: LocationEngin[] = [
  { id: 1, codeLocation: 'LOC-001', siteLocation: 'Cotonou', coutHoraireLocation: 5000 } as LocationEngin,
  { id: 2, codeLocation: 'LOC-002', siteLocation: 'Abidjan', coutHoraireLocation: 0 } as LocationEngin,
];

const VALID_FORM = {
  codeMission:          '001',
  statutMission:        'EN COURS',
  prioriteMission:      'NORMALE',
  responsableMission:   '',
  locationId:           1,
  lieuMission:          'Cotonou',
  dateDebutMission:     '',
  dateFinMission:       '',
  heureDebutMission:    '',
  heureFinMission:      '',
  kmDbtMission:         null,
  kmFinMission:         null,
  carbtDbtMission:      null,
  carbtFinMission:      null,
  materiauxMission:     '',
  qteMateriauxMission:  null,
  nbHeures:             8,
  tarifHoraireApplique: 5000,
  descriptionMission:   '',
  observationMission:   '',
};

async function createTestBed(queryParams: Record<string, string> = {}) {
  const missionSpy  = jasmine.createSpyObj<MissionsService>('MissionsService',  ['createMission']);
  const locationSpy = jasmine.createSpyObj<LocationService>('LocationService',  ['getLocations']);

  missionSpy.createMission.and.returnValue(of({} as any));
  locationSpy.getLocations.and.returnValue(of(mockLocations));

  await TestBed.configureTestingModule({
    imports: [AddMissionComponent, NoopAnimationsModule, RouterTestingModule.withRoutes([])],
    providers: [
      { provide: MissionsService,  useValue: missionSpy  },
      { provide: LocationService,  useValue: locationSpy },
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { queryParamMap: convertToParamMap(queryParams) } },
      },
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
  }).compileComponents();

  return { missionSpy, locationSpy };
}

describe('AddMissionComponent', () => {
  let component: AddMissionComponent;
  let fixture: ComponentFixture<AddMissionComponent>;
  let missionSpy:  jasmine.SpyObj<MissionsService>;
  let locationSpy: jasmine.SpyObj<LocationService>;
  let routerSpy: jasmine.Spy;
  let snackSpy:  jasmine.Spy;

  beforeEach(async () => {
    ({ missionSpy, locationSpy } = await createTestBed());
    fixture   = TestBed.createComponent(AddMissionComponent);
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
      expect(component.filteredLocations[0].codeLocation).toBe('LOC-001');
    });

    it('devrait filtrer par siteLocation', () => {
      component.locationSearchCtrl.setValue('Abidjan');
      expect(component.filteredLocations.length).toBe(1);
    });
  });

  // ── Getters calculés ──────────────────────────────────────────────────
  describe('sousTotal', () => {
    it('devrait calculer nbHeures * tarifHoraireApplique', () => {
      component.form.patchValue({ nbHeures: 8, tarifHoraireApplique: 5000 });
      expect(component.sousTotal).toBe(40000);
    });
  });

  describe('kmParcourus', () => {
    it('devrait retourner la différence si kmFin > kmDbt', () => {
      component.form.patchValue({ kmDbtMission: 100, kmFinMission: 250 });
      expect(component.kmParcourus).toBe(150);
    });

    it('devrait retourner 0 si kmFin <= kmDbt', () => {
      component.form.patchValue({ kmDbtMission: 250, kmFinMission: 100 });
      expect(component.kmParcourus).toBe(0);
    });
  });

  describe('litresConsommes', () => {
    it('devrait retourner la différence si carbtDbt > carbtFin', () => {
      component.form.patchValue({ carbtDbtMission: 200, carbtFinMission: 50 });
      expect(component.litresConsommes).toBe(150);
    });

    it('devrait retourner 0 si carbtDbt <= carbtFin', () => {
      component.form.patchValue({ carbtDbtMission: 50, carbtFinMission: 200 });
      expect(component.litresConsommes).toBe(0);
    });
  });

  // ── onLocationSelected() ──────────────────────────────────────────────
  describe('onLocationSelected()', () => {
    it('devrait patcher locationId dans le formulaire', () => {
      component.onLocationSelected(mockLocations[0]);
      expect(component.form.value.locationId).toBe(1);
    });

    it('devrait patcher tarifHoraireApplique avec le coût horaire de la location', () => {
      component.onLocationSelected(mockLocations[0]);
      expect(component.form.value.tarifHoraireApplique).toBe(5000);
    });
  });

  // ── calculateNbHeures via valueChanges ────────────────────────────────
  describe('calcul nbHeures', () => {
    it('devrait calculer nbHeures si heureFin > heureDebut', () => {
      component.form.get('heureDebutMission')!.setValue('08:00');
      component.form.get('heureFinMission')!.setValue('10:30');
      expect(component.form.value.nbHeures).toBe(2.5);
    });

    it('devrait mettre 0 si heureFin <= heureDebut', () => {
      component.form.get('heureDebutMission')!.setValue('10:00');
      component.form.get('heureFinMission')!.setValue('08:00');
      expect(component.form.value.nbHeures).toBe(0);
    });
  });

  // ── submit() ──────────────────────────────────────────────────────────
  describe('submit()', () => {
    it('ne devrait PAS appeler createMission si le formulaire est invalide', () => {
      component.submit();
      expect(missionSpy.createMission).not.toHaveBeenCalled();
    });

    it('devrait appeler createMission avec le payload si valide', () => {
      component.form.patchValue(VALID_FORM);
      component.submit();
      expect(missionSpy.createMission).toHaveBeenCalledWith(jasmine.any(Object));
    });

    it('devrait afficher un snack de succès après création', () => {
      component.form.patchValue(VALID_FORM);
      component.submit();
      expect(snackSpy).toHaveBeenCalledWith('Mission créée avec succès', 'Fermer', jasmine.any(Object));
    });

    it('devrait naviguer vers /apps/missions après succès', () => {
      component.form.patchValue(VALID_FORM);
      component.submit();
      expect(routerSpy).toHaveBeenCalledWith(['/apps/missions']);
    });

    it('devrait afficher un snack d\'erreur si createMission échoue', () => {
      missionSpy.createMission.and.returnValue(throwError(() => new Error('500')));
      component.form.patchValue(VALID_FORM);
      component.submit();
      expect(snackSpy).toHaveBeenCalledWith(jasmine.stringContaining('Erreur'), jasmine.any(String), jasmine.any(Object));
    });
  });
});

// ── Pré-remplissage depuis les query params ────────────────────────────
describe('AddMissionComponent – prefillFromRoute', () => {
  it('devrait pré-remplir locationId et tarifHoraireApplique depuis les query params', async () => {
    await createTestBed({ locationId: '1', coutHoraireLoc: '7000' });
    const fixture   = TestBed.createComponent(AddMissionComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.form.value.locationId).toBe(1);
    expect(component.form.value.tarifHoraireApplique).toBe(7000);
  });
});
