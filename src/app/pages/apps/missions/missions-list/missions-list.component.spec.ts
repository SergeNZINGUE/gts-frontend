import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';
import { of, EMPTY, throwError } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { MissionsListComponent } from './missions-list.component';
import { MissionsService } from 'src/app/services/apps/missions/missions.service';
import { Mission } from '../mission';

const missionBase: Mission = {
  id: 1,
  codeMission: 1001,
  codeLocation: 'LOC-001',
  lieuMission: 'Cotonou',
  dateTravail: '2024-06-01',
  statutMission: 'EN ATTENTE',
  prioriteMission: 'NORMALE',
  responsableMission: 'Diallo',
  nbHeures: 8,
  sousTotal: 400000,
};

const completeMission: Mission = {
  ...missionBase,
  id: 10,
  heureDebutMission: '08:00',
  heureFinMission: '16:00',
  kmDbtMission: 0,
  kmFinMission: 100,
  carbtDbtMission: 50,
  carbtFinMission: 30,
  materiauxMission: 'Sable',
  qteMateriauxMission: 5,
  responsableMission: 'Diallo',
};

const mockMissions: Mission[] = [
  { ...missionBase, id: 1, statutMission: 'EN ATTENTE',  prioriteMission: 'NORMALE' },
  { ...missionBase, id: 2, statutMission: 'EN COURS',    prioriteMission: 'HAUTE',   lieuMission: 'Porto-Novo' },
  { ...missionBase, id: 3, statutMission: 'TERMINÉE',    prioriteMission: 'BASSE',   responsableMission: 'Koné' },
  { ...missionBase, id: 4, statutMission: 'ANNULÉE',     prioriteMission: 'URGENTE' },
];

describe('MissionsListComponent', () => {
  let component: MissionsListComponent;
  let fixture: ComponentFixture<MissionsListComponent>;
  let missionsServiceSpy: jasmine.SpyObj<MissionsService>;
  let dialogRefSpy: jasmine.SpyObj<any>;
  let dialogSubject: Subject<any>;
  let dialogOpenSpy: jasmine.Spy;
  let navigateSpy: jasmine.Spy;
  let snackBarOpenSpy: jasmine.Spy;

  beforeEach(async () => {
    missionsServiceSpy = jasmine.createSpyObj<MissionsService>('MissionsService', [
      'getMissions', 'updateMission', 'deleteMission',
    ]);
    missionsServiceSpy.getMissions.and.returnValue(of([...mockMissions]));
    missionsServiceSpy.updateMission.and.returnValue(of({ ...completeMission, statutMission: 'TERMINÉE' }));
    missionsServiceSpy.deleteMission.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [MissionsListComponent, NoopAnimationsModule, RouterTestingModule.withRoutes([])],
      providers: [{ provide: MissionsService, useValue: missionsServiceSpy }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();

    fixture   = TestBed.createComponent(MissionsListComponent);
    component = fixture.componentInstance;

    navigateSpy = spyOn(TestBed.inject(Router), 'navigate')
      .and.returnValue(Promise.resolve(true));

    snackBarOpenSpy = spyOn(component['snackBar'], 'open')
      .and.returnValue({ onAction: () => EMPTY, dismiss: () => {}, afterOpened: () => EMPTY, afterDismissed: () => EMPTY, instance: null } as any);

    dialogSubject = new Subject<any>();
    dialogRefSpy  = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRefSpy.afterClosed.and.returnValue(dialogSubject.asObservable());
    dialogOpenSpy = spyOn(component['dialog'], 'open').and.returnValue(dialogRefSpy);

    fixture.detectChanges();
  });

  it('devrait être créé', () => expect(component).toBeTruthy());

  // ── Chargement ────────────────────────────────────────────────────────
  describe('loadMissions()', () => {
    it('devrait appeler getMissions() à l\'initialisation', () => {
      expect(missionsServiceSpy.getMissions).toHaveBeenCalledTimes(1);
    });

    it('devrait remplir le dataSource avec les missions retournées', () => {
      expect(component.missionsDataSource.data.length).toBe(4);
    });

    it('devrait calculer totalMissions correctement', () => {
      expect(component.totalMissions).toBe(4);
    });

    it('devrait compter les missions EN ATTENTE', () => {
      expect(component.missionsEnAttente).toBe(1);
    });

    it('devrait compter les missions TERMINÉE', () => {
      expect(component.missionsTerminees).toBe(1);
    });
  });

  // ── Filtres ───────────────────────────────────────────────────────────
  describe('applySearch()', () => {
    it('devrait filtrer par lieu', () => {
      component.applySearch('Porto-Novo');
      expect(component.missionsDataSource.data.length).toBe(1);
      expect(component.missionsDataSource.data[0].lieuMission).toBe('Porto-Novo');
    });

    it('devrait filtrer par responsable', () => {
      component.applySearch('Koné');
      expect(component.missionsDataSource.data.length).toBe(1);
    });

    it('devrait retourner tout si la recherche est vide', () => {
      component.applySearch('Cotonou');
      component.applySearch('');
      expect(component.missionsDataSource.data.length).toBe(4);
    });
  });

  describe('applyStatutFilter()', () => {
    it('devrait filtrer par statut EN ATTENTE', () => {
      component.applyStatutFilter('EN ATTENTE');
      expect(component.missionsDataSource.data.length).toBe(1);
      expect(component.missionsDataSource.data[0].statutMission).toBe('EN ATTENTE');
    });

    it('All devrait retourner toutes les missions', () => {
      component.applyStatutFilter('EN ATTENTE');
      component.applyStatutFilter('All');
      expect(component.missionsDataSource.data.length).toBe(4);
    });
  });

  describe('applyPrioriteFilter()', () => {
    it('devrait filtrer par priorité URGENTE', () => {
      component.applyPrioriteFilter('URGENTE');
      expect(component.missionsDataSource.data.length).toBe(1);
      expect(component.missionsDataSource.data[0].prioriteMission).toBe('URGENTE');
    });
  });

  describe('clearFilters()', () => {
    it('devrait réinitialiser tous les filtres', () => {
      component.applySearch('Porto-Novo');
      component.applyStatutFilter('EN ATTENTE');
      component.clearFilters();
      expect(component.missionsDataSource.data.length).toBe(4);
      expect(component.searchText).toBe('');
      expect(component.selectedStatut).toBe('All');
      expect(component.selectedPriorite).toBe('All');
    });
  });

  // ── Navigation ────────────────────────────────────────────────────────
  describe('openAddMission()', () => {
    it('devrait naviguer vers /apps/missions/add', () => {
      component.openAddMission();
      expect(navigateSpy).toHaveBeenCalledWith(['/apps/missions/add']);
    });
  });

  describe('openMissionDetail()', () => {
    it('devrait naviguer vers /apps/missions/detail/{id}', () => {
      component.openMissionDetail(mockMissions[0]);
      expect(navigateSpy).toHaveBeenCalledWith(['/apps/missions/detail', 1]);
    });
  });

  describe('openEditMission()', () => {
    it('devrait naviguer vers /apps/missions/edit/{id}', () => {
      component.openEditMission(mockMissions[0]);
      expect(navigateSpy).toHaveBeenCalledWith(['/apps/missions/edit', 1]);
    });
  });

  // ── deleteMission() ───────────────────────────────────────────────────
  describe('deleteMission()', () => {
    it('devrait appeler deleteMission du service avec l\'id', () => {
      component.deleteMission(mockMissions[0]);
      expect(missionsServiceSpy.deleteMission).toHaveBeenCalledWith(1);
    });

    it('devrait afficher un snack de succès', () => {
      component.deleteMission(mockMissions[0]);
      expect(snackBarOpenSpy).toHaveBeenCalledWith(
        'Mission supprimée avec succès', 'Fermer', jasmine.any(Object),
      );
    });

    it('devrait recharger la liste après succès', () => {
      missionsServiceSpy.getMissions.calls.reset();
      component.deleteMission(mockMissions[0]);
      expect(missionsServiceSpy.getMissions).toHaveBeenCalledTimes(1);
    });

    it('ne devrait PAS appeler le service si id est absent', () => {
      component.deleteMission({ ...missionBase, id: undefined });
      expect(missionsServiceSpy.deleteMission).not.toHaveBeenCalled();
    });

    it('devrait afficher un snack d\'erreur si le service échoue', () => {
      missionsServiceSpy.deleteMission.and.returnValue(throwError(() => new Error('500')));
      component.deleteMission(mockMissions[0]);
      expect(snackBarOpenSpy).toHaveBeenCalledWith(
        'Erreur lors de la suppression de la mission', 'Fermer', jasmine.any(Object),
      );
    });
  });

  // ── termineMission() ──────────────────────────────────────────────────
  describe('termineMission()', () => {
    it('devrait appeler updateMission directement si la mission est complète', () => {
      component.termineMission(completeMission);
      expect(missionsServiceSpy.updateMission).toHaveBeenCalledWith(
        10, jasmine.objectContaining({ statutMission: 'TERMINÉE' }),
      );
    });

    it('devrait ouvrir le dialogue si la mission est incomplète', () => {
      component.termineMission(mockMissions[0]);
      expect(dialogOpenSpy).toHaveBeenCalled();
    });

    it('devrait appeler updateMission après confirmation du dialogue', () => {
      component.termineMission(mockMissions[0]);
      dialogSubject.next({ heureDebutMission: '08:00' });
      expect(missionsServiceSpy.updateMission).toHaveBeenCalledWith(
        1, jasmine.objectContaining({ statutMission: 'TERMINÉE' }),
      );
    });

    it('ne devrait PAS appeler updateMission si le dialogue est annulé', () => {
      component.termineMission(mockMissions[0]);
      dialogSubject.next(null);
      expect(missionsServiceSpy.updateMission).not.toHaveBeenCalled();
    });

    it('devrait afficher un snack de succès après terminaison', () => {
      component.termineMission(completeMission);
      expect(snackBarOpenSpy).toHaveBeenCalledWith(
        'Mission terminée avec succès', 'Fermer', jasmine.any(Object),
      );
    });
  });

  // ── getStatutClass() ──────────────────────────────────────────────────
  describe('getStatutClass()', () => {
    const cases: [string | undefined, string][] = [
      ['EN ATTENTE', 'bg-yellow-500'],
      ['EN COURS',   'bg-blue-500'  ],
      ['TERMINÉE',   'bg-green-500' ],
      ['ANNULÉE',    'bg-red-500'   ],
      ['INCONNU',    'bg-gray-400'  ],
      [undefined,    'bg-gray-400'  ],
    ];

    cases.forEach(([statut, expected]) => {
      it(`"${statut}" → "${expected}"`, () => {
        expect(component.getStatutClass(statut)).toBe(expected);
      });
    });
  });

  // ── getPrioriteClass() ────────────────────────────────────────────────
  describe('getPrioriteClass()', () => {
    const cases: [string | undefined, string][] = [
      ['BASSE',   'bg-gray-400' ],
      ['NORMALE', 'bg-blue-400' ],
      ['HAUTE',   'bg-yellow-500'],
      ['URGENTE', 'bg-red-500'  ],
      [undefined, 'bg-gray-300' ],
    ];

    cases.forEach(([priorite, expected]) => {
      it(`"${priorite}" → "${expected}"`, () => {
        expect(component.getPrioriteClass(priorite)).toBe(expected);
      });
    });
  });
});
