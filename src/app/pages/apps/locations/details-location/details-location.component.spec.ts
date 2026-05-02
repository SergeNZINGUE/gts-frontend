import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatNativeDateModule } from '@angular/material/core';
import { of } from 'rxjs';

import { DetailsLocationComponent } from './details-location.component';
import { LocationService } from 'src/app/services/apps/location/location.service';
import { MissionsService } from 'src/app/services/apps/missions/missions.service';
import { LocationEnginResponse } from '../locationEnginResponse';
import { Mission } from '../../missions/mission';

const mockLocation: LocationEnginResponse = {
  id: 1,
  codeLocation: 'LOC-001',
  siteLocation: 'Cotonou',
  statut: 'VALIDEE',
};

const mockMissions: Mission[] = [
  { id: 10, locationId: 1, sousTotal: 40000, codeMission: 1, lieuMission: 'Cotonou' } as unknown as Mission,
  { id: 11, locationId: 1, sousTotal: 60000, codeMission: 2, lieuMission: 'Abidjan' } as unknown as Mission,
  { id: 12, locationId: 2, sousTotal: 20000, codeMission: 3, lieuMission: 'Lomé'   } as unknown as Mission,
];

describe('DetailsLocationComponent', () => {
  let component: DetailsLocationComponent;
  let fixture: ComponentFixture<DetailsLocationComponent>;
  let locationSpy: jasmine.SpyObj<LocationService>;
  let missionsSpy: jasmine.SpyObj<MissionsService>;
  let routerSpy: jasmine.Spy;

  beforeEach(async () => {
    locationSpy = jasmine.createSpyObj<LocationService>('LocationService', ['getLocationById']);
    missionsSpy = jasmine.createSpyObj<MissionsService>('MissionsService', ['getMissions']);
    locationSpy.getLocationById.and.returnValue(of(mockLocation as any));
    missionsSpy.getMissions.and.returnValue(of(mockMissions));

    await TestBed.configureTestingModule({
      imports: [DetailsLocationComponent, NoopAnimationsModule, MatNativeDateModule, RouterTestingModule.withRoutes([])],
      providers: [
        { provide: LocationService, useValue: locationSpy },
        { provide: MissionsService, useValue: missionsSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture   = TestBed.createComponent(DetailsLocationComponent);
    component = fixture.componentInstance;
    routerSpy = spyOn(TestBed.inject(Router), 'navigate').and.returnValue(Promise.resolve(true));
    fixture.detectChanges();
  });

  it('devrait être créé', () => expect(component).toBeTruthy());

  // ── ngOnInit ──────────────────────────────────────────────────────────
  describe('ngOnInit()', () => {
    it('devrait appeler getLocationById', () => {
      expect(locationSpy.getLocationById).toHaveBeenCalledWith(1, 0, 100);
    });

    it('devrait remplir location', () => {
      expect(component.location?.codeLocation).toBe('LOC-001');
    });

    it('devrait passer isLoading à false', () => {
      expect(component.isLoading).toBeFalse();
    });

    it('devrait charger uniquement les missions de cette location', () => {
      // missions avec locationId=1 : ids 10 et 11 ; locationId=2 exclu
      expect(component.missions.length).toBe(2);
    });
  });

  // ── totalMissions ─────────────────────────────────────────────────────
  describe('totalMissions', () => {
    it('devrait sommer les sousTotal des missions', () => {
      expect(component.totalMissions).toBe(100000); // 40000 + 60000
    });

    it('devrait retourner 0 si aucune mission', () => {
      component.missions = [];
      expect(component.totalMissions).toBe(0);
    });
  });

  // ── openMissionDetail() ───────────────────────────────────────────────
  describe('openMissionDetail()', () => {
    it('devrait naviguer vers /apps/missions/detail/{id}', () => {
      component.openMissionDetail(mockMissions[0]);
      expect(routerSpy).toHaveBeenCalledWith(['/apps/missions/detail', 10]);
    });
  });
});

// ── Sans id en route ──────────────────────────────────────────────────
describe('DetailsLocationComponent – sans id', () => {
  it('ne devrait PAS appeler getLocationById si id est absent', async () => {
    const locationSpy = jasmine.createSpyObj<LocationService>('LocationService', ['getLocationById']);
    const missionsSpy = jasmine.createSpyObj<MissionsService>('MissionsService', ['getMissions']);
    missionsSpy.getMissions.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [DetailsLocationComponent, NoopAnimationsModule, MatNativeDateModule, RouterTestingModule.withRoutes([])],
      providers: [
        { provide: LocationService, useValue: locationSpy },
        { provide: MissionsService, useValue: missionsSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    const fixture = TestBed.createComponent(DetailsLocationComponent);
    fixture.detectChanges();
    expect(locationSpy.getLocationById).not.toHaveBeenCalled();
  });
});
