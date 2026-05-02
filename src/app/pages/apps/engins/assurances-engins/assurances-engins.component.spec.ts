import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';
import { of, EMPTY, throwError } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';

import { AssurancesEnginsComponent } from './assurances-engins.component';
import { AssurancesService } from 'src/app/services/apps/assurances/assurances.service';
import { AssuranceEngin, StatutAssurance } from './assurance-engin';

// Dates dynamiques pour éviter les faux positifs liés au temps
const FUTURE   = new Date(Date.now() + 60  * 864e5).toISOString().split('T')[0]; // +60j
const SOON     = new Date(Date.now() + 15  * 864e5).toISOString().split('T')[0]; // +15j (< 30j)
const PAST     = new Date(Date.now() - 2   * 864e5).toISOString().split('T')[0]; // -2j (expiré)

const base: AssuranceEngin = {
  id: 1,
  numeroPolice: 'POL-001',
  compagnieAssurance: 'Allianz',
  dateDebut: '2024-01-01',
  dateFin: FUTURE,
  montant: 500000,
  statut: StatutAssurance.VALIDE,
  enginId: 10,
  enginCode: 'ENG-001',
  enginModel: 'CAT 320',
};

// Données sans assurance à expirer automatiquement (toutes EXPIRE/ANNULE ou dateFin future)
const mockAssurances: AssuranceEngin[] = [
  { ...base, id: 1, statut: StatutAssurance.VALIDE,  dateFin: FUTURE, enginCode: 'ENG-001', compagnieAssurance: 'Allianz' },
  { ...base, id: 2, statut: StatutAssurance.EXPIRE,  dateFin: PAST,   enginCode: 'ENG-002', compagnieAssurance: 'AXA'     },
  { ...base, id: 3, statut: StatutAssurance.ANNULE,  dateFin: FUTURE, enginCode: 'ENG-003', compagnieAssurance: 'NSIA'    },
  { ...base, id: 4, statut: StatutAssurance.VALIDE,  dateFin: SOON,   enginCode: 'ENG-004', compagnieAssurance: 'Sanlam'  },
];

describe('AssurancesEnginsComponent', () => {
  let component: AssurancesEnginsComponent;
  let fixture: ComponentFixture<AssurancesEnginsComponent>;
  let assurancesServiceSpy: jasmine.SpyObj<AssurancesService>;
  let snackBarOpenSpy: jasmine.Spy;
  let dialogOpenSpy: jasmine.Spy;
  let dialogRefSpy: jasmine.SpyObj<any>;
  let dialogSubject: Subject<any>;
  let actionSubject: Subject<void>;

  function makeSnackBarRef(actionObs = actionSubject.asObservable()) {
    return {
      onAction:       jasmine.createSpy('onAction').and.returnValue(actionObs),
      dismiss:        jasmine.createSpy('dismiss'),
      afterOpened:    () => EMPTY,
      afterDismissed: () => EMPTY,
      instance:       null,
    } as any;
  }

  beforeEach(async () => {
    assurancesServiceSpy = jasmine.createSpyObj<AssurancesService>('AssurancesService', [
      'getAll', 'create', 'update', 'delete',
    ]);
    assurancesServiceSpy.getAll.and.returnValue(of([...mockAssurances]));
    assurancesServiceSpy.create.and.returnValue(of({ ...base, id: 99 }));
    assurancesServiceSpy.update.and.returnValue(of({ ...base }));
    assurancesServiceSpy.delete.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [AssurancesEnginsComponent, NoopAnimationsModule, RouterTestingModule.withRoutes([])],
      providers: [{ provide: AssurancesService, useValue: assurancesServiceSpy }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .overrideComponent(AssurancesEnginsComponent, {
      remove: { imports: [TablerIconsModule] },
      add:    { schemas: [CUSTOM_ELEMENTS_SCHEMA] },
    })
    .compileComponents();

    fixture   = TestBed.createComponent(AssurancesEnginsComponent);
    component = fixture.componentInstance;

    actionSubject   = new Subject<void>();
    snackBarOpenSpy = spyOn(component['snackBar'], 'open')
      .and.returnValue(makeSnackBarRef());

    dialogSubject = new Subject<any>();
    dialogRefSpy  = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRefSpy.afterClosed.and.returnValue(dialogSubject.asObservable());
    dialogOpenSpy = spyOn(component['dialog'], 'open').and.returnValue(dialogRefSpy);

    fixture.detectChanges();
  });

  it('devrait être créé', () => expect(component).toBeTruthy());

  // ── Chargement ────────────────────────────────────────────────────────
  describe('load()', () => {
    it('devrait appeler getAll() à l\'initialisation', () => {
      expect(assurancesServiceSpy.getAll).toHaveBeenCalledTimes(1);
    });

    it('devrait remplir allAssurances', () => {
      expect(component.allAssurances.length).toBe(4);
    });

    it('devrait passer isLoading à false après succès', () => {
      expect(component.isLoading).toBeFalse();
    });

    it('devrait passer isLoading à false en cas d\'erreur', () => {
      assurancesServiceSpy.getAll.and.returnValue(throwError(() => new Error('500')));
      component.load();
      expect(component.isLoading).toBeFalse();
    });

    it('devrait afficher un snack en cas d\'erreur', () => {
      assurancesServiceSpy.getAll.and.returnValue(throwError(() => new Error('500')));
      component.load();
      expect(snackBarOpenSpy).toHaveBeenCalledWith('Erreur de chargement', 'Fermer', jasmine.any(Object));
    });
  });

  // ── Getters KPI ───────────────────────────────────────────────────────
  describe('getters', () => {
    it('total devrait retourner le nombre total d\'assurances', () => {
      expect(component.total).toBe(4);
    });

    it('enCours devrait compter uniquement les VALIDE', () => {
      expect(component.enCours).toBe(2); // id 1 et 4
    });

    it('expirees devrait compter uniquement les EXPIRE', () => {
      expect(component.expirees).toBe(1); // id 2
    });

    it('expirantBientot devrait compter les VALIDE dont dateFin < 30j', () => {
      expect(component.expirantBientot).toBe(1); // id 4 (SOON = +15j)
    });

    it('alertes devrait retourner les mêmes assurances qu\'expirantBientot', () => {
      expect(component.alertes.length).toBe(component.expirantBientot);
      expect(component.alertes[0].id).toBe(4);
    });
  });

  // ── Filtres ───────────────────────────────────────────────────────────
  describe('applyFilters()', () => {
    it('devrait filtrer par compagnie', () => {
      component.searchText = 'AXA';
      component.applyFilters();
      expect(component.dataSource.data.length).toBe(1);
      expect(component.dataSource.data[0].compagnieAssurance).toBe('AXA');
    });

    it('devrait filtrer par enginCode', () => {
      component.searchText = 'ENG-003';
      component.applyFilters();
      expect(component.dataSource.data.length).toBe(1);
    });

    it('devrait filtrer par statut', () => {
      component.selectedStatut = StatutAssurance.EXPIRE;
      component.applyFilters();
      expect(component.dataSource.data.length).toBe(1);
      expect(component.dataSource.data[0].statut).toBe(StatutAssurance.EXPIRE);
    });

    it('ALL devrait retourner toutes les assurances', () => {
      component.selectedStatut = StatutAssurance.EXPIRE;
      component.applyFilters();
      component.selectedStatut = 'ALL';
      component.applyFilters();
      expect(component.dataSource.data.length).toBe(4);
    });

    it('recherche vide + ALL devrait retourner tout', () => {
      component.searchText = '';
      component.selectedStatut = 'ALL';
      component.applyFilters();
      expect(component.dataSource.data.length).toBe(4);
    });
  });

  // ── getStatutClass() ──────────────────────────────────────────────────
  describe('getStatutClass()', () => {
    const cases: [StatutAssurance | undefined, string][] = [
      [StatutAssurance.VALIDE, 'bg-green-500'],
      [StatutAssurance.EXPIRE, 'bg-red-500'  ],
      [StatutAssurance.ANNULE, 'bg-gray-400' ],
      [undefined,              'bg-gray-300' ],
    ];
    cases.forEach(([statut, expected]) => {
      it(`"${statut}" → "${expected}"`, () => {
        expect(component.getStatutClass(statut)).toBe(expected);
      });
    });
  });

  // ── isExpiringSoon() et daysLeft() ────────────────────────────────────
  describe('isExpiringSoon()', () => {
    it('devrait retourner true pour une assurance VALIDE expirant dans 15j', () => {
      expect(component.isExpiringSoon({ statut: StatutAssurance.VALIDE, dateFin: SOON })).toBeTrue();
    });

    it('devrait retourner false pour une assurance VALIDE expirant dans 60j', () => {
      expect(component.isExpiringSoon({ statut: StatutAssurance.VALIDE, dateFin: FUTURE })).toBeFalse();
    });

    it('devrait retourner false pour une assurance EXPIRE', () => {
      expect(component.isExpiringSoon({ statut: StatutAssurance.EXPIRE, dateFin: SOON })).toBeFalse();
    });

    it('devrait retourner false si dateFin est absent', () => {
      expect(component.isExpiringSoon({ statut: StatutAssurance.VALIDE })).toBeFalse();
    });
  });

  describe('daysLeft()', () => {
    it('devrait retourner 0 si date absente', () => {
      expect(component.daysLeft(undefined)).toBe(0);
    });

    it('devrait retourner une valeur positive pour une date future', () => {
      expect(component.daysLeft(FUTURE)).toBeGreaterThan(0);
    });
  });

  // ── openDialog() ──────────────────────────────────────────────────────
  describe('openDialog()', () => {
    it('devrait ouvrir le dialogue', () => {
      component.openDialog();
      expect(dialogOpenSpy).toHaveBeenCalled();
    });

    it('devrait appeler create si aucune assurance passée', () => {
      component.openDialog();
      dialogSubject.next({ ...mockAssurances[0] });
      expect(assurancesServiceSpy.create).toHaveBeenCalled();
    });

    it('devrait appeler update si une assurance existante est passée', () => {
      component.openDialog(mockAssurances[0]);
      dialogSubject.next({ statut: StatutAssurance.ANNULE });
      expect(assurancesServiceSpy.update).toHaveBeenCalledWith(1, jasmine.any(Object));
    });

    it('ne devrait PAS appeler le service si le dialogue est annulé', () => {
      component.openDialog();
      dialogSubject.next(null);
      expect(assurancesServiceSpy.create).not.toHaveBeenCalled();
    });

    it('devrait afficher un snack de succès après création', () => {
      snackBarOpenSpy.calls.reset();
      component.openDialog();
      dialogSubject.next({ ...mockAssurances[0] });
      expect(snackBarOpenSpy).toHaveBeenCalledWith('Assurance ajoutée', 'Fermer', jasmine.any(Object));
    });

    it('devrait afficher un snack de succès après modification', () => {
      snackBarOpenSpy.calls.reset();
      component.openDialog(mockAssurances[0]);
      dialogSubject.next({ statut: StatutAssurance.ANNULE });
      expect(snackBarOpenSpy).toHaveBeenCalledWith('Assurance modifiée', 'Fermer', jasmine.any(Object));
    });
  });

  // ── confirmDelete() ───────────────────────────────────────────────────
  describe('confirmDelete()', () => {
    it('devrait appeler delete après confirmation', () => {
      const event = new MouseEvent('click');
      component.confirmDelete(mockAssurances[0], event);
      actionSubject.next();
      expect(assurancesServiceSpy.delete).toHaveBeenCalledWith(1);
    });

    it('devrait afficher un snack de succès', () => {
      snackBarOpenSpy.calls.reset();
      const event = new MouseEvent('click');
      component.confirmDelete(mockAssurances[0], event);
      actionSubject.next();
      expect(snackBarOpenSpy).toHaveBeenCalledWith('Assurance supprimée', 'Fermer', jasmine.any(Object));
    });

    it('ne devrait PAS appeler delete si annulé', () => {
      const event = new MouseEvent('click');
      component.confirmDelete(mockAssurances[0], event);
      expect(assurancesServiceSpy.delete).not.toHaveBeenCalled();
    });

    it('ne devrait PAS ouvrir le snack si id absent', () => {
      snackBarOpenSpy.calls.reset();
      const event = new MouseEvent('click');
      component.confirmDelete({ ...base, id: undefined }, event);
      expect(snackBarOpenSpy).not.toHaveBeenCalled();
    });

    it('devrait afficher un snack d\'erreur si delete échoue', () => {
      assurancesServiceSpy.delete.and.returnValue(throwError(() => new Error('500')));
      snackBarOpenSpy.calls.reset();
      const event = new MouseEvent('click');
      component.confirmDelete(mockAssurances[0], event);
      actionSubject.next();
      expect(snackBarOpenSpy).toHaveBeenCalledWith('Erreur lors de la suppression', 'Fermer', jasmine.any(Object));
    });
  });

  // ── syncExpiredStatuts() ──────────────────────────────────────────────
  describe('syncExpiredStatuts()', () => {
    it('devrait appeler update pour les assurances VALIDE dont dateFin est dépassée', () => {
      const expiredAssurance: AssuranceEngin = {
        ...base, id: 99, statut: StatutAssurance.VALIDE, dateFin: PAST,
      };
      // Première réponse : une assurance à expirer ; deuxième : liste propre
      assurancesServiceSpy.getAll.and.returnValues(
        of([expiredAssurance]),
        of([{ ...expiredAssurance, statut: StatutAssurance.EXPIRE }]),
      );
      component.load();
      expect(assurancesServiceSpy.update).toHaveBeenCalledWith(
        99, { statut: StatutAssurance.EXPIRE },
      );
    });

    it('ne devrait PAS appeler update si toutes les assurances ont dateFin future', () => {
      assurancesServiceSpy.getAll.and.returnValue(of([
        { ...base, id: 1, statut: StatutAssurance.VALIDE, dateFin: FUTURE },
      ]));
      component.load();
      expect(assurancesServiceSpy.update).not.toHaveBeenCalled();
    });
  });
});
