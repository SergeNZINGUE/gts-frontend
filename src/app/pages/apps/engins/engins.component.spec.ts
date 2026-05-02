import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';
import { of, EMPTY, throwError } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';

import { AppEnginsComponent } from './engins.component';
import { EnginService } from 'src/app/services/apps/engin/engin.service';
import { Engin } from './engin';

// ── Données de test ────────────────────────────────────────────────────
const enginBase: Engin = {
  id: 0,
  codeEngin: '',
  modelEngin: '',
  marqueEngin: '',
  typeEngin: '',
  immatriculationEngin: '',
  statusEngin: 'DISPONIBLE',
  anneeEngin: '2020',
  etatEngin: 1,
  typCarbtEngin: 'DIESEL',
  dateAcqEngin: '2020-01-01',
  coutHorLocEngin: 0,
  forfaitJournalierEngin: 0,
  dateCreation: '2020-01-01',
  dateModification: '2020-01-01',
  poidsVide: 0,
  horametre: 0,
};

const mockEngins: Engin[] = [
  { ...enginBase, id: 1, codeEngin: 'ENG-001', modelEngin: 'CAT 320',  statusEngin: 'DISPONIBLE'     },
  { ...enginBase, id: 2, codeEngin: 'ENG-002', modelEngin: 'JD 644',   statusEngin: 'EN LOCATION'    },
  { ...enginBase, id: 3, codeEngin: 'ENG-003', modelEngin: 'Komatsu',  statusEngin: 'EN MAINTENANCE' },
];

// ──────────────────────────────────────────────────────────────────────
describe('AppEnginsComponent', () => {
  let component: AppEnginsComponent;
  let fixture: ComponentFixture<AppEnginsComponent>;
  let enginServiceSpy: jasmine.SpyObj<EnginService>;
  let navigateSpy: jasmine.Spy;
  let snackBarOpenSpy: jasmine.Spy;
  let actionSubject: Subject<void>; // contrôle le déclenchement de l'action du snackbar

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
    enginServiceSpy = jasmine.createSpyObj<EnginService>('EnginService', [
      'getEngins', 'deleteEngin',
    ]);
    enginServiceSpy.getEngins.and.returnValue(of([...mockEngins]));
    enginServiceSpy.deleteEngin.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [AppEnginsComponent, NoopAnimationsModule, RouterTestingModule.withRoutes([])],
      providers: [
        { provide: EnginService, useValue: enginServiceSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .overrideComponent(AppEnginsComponent, {
      remove: { imports: [TablerIconsModule] },
      add:    { schemas: [CUSTOM_ELEMENTS_SCHEMA] },
    })
    .compileComponents();

    fixture   = TestBed.createComponent(AppEnginsComponent);
    component = fixture.componentInstance;

    navigateSpy = spyOn(TestBed.inject(Router), 'navigate')
      .and.returnValue(Promise.resolve(true));

    // Subject frais à chaque test : actionSubject.next() simule un clic sur "Confirmer"
    actionSubject  = new Subject<void>();
    snackBarOpenSpy = spyOn(component['snackBar'], 'open')
      .and.returnValue(makeSnackBarRef());

    fixture.detectChanges(); // déclenche ngOnInit → loadEngins()
  });

  it('devrait être créé', () => {
    expect(component).toBeTruthy();
  });

  // ── Chargement ─────────────────────────────────────────────────────
  describe('loadEngins()', () => {
    it('devrait appeler getEngins() à l\'initialisation', () => {
      expect(enginServiceSpy.getEngins).toHaveBeenCalledTimes(1);
    });

    it('devrait remplir le dataSource avec les engins retournés', () => {
      expect(component.dataSource.data.length).toBe(3);
      expect(component.dataSource.data[0].codeEngin).toBe('ENG-001');
    });

    it('devrait passer isLoading à false après succès', () => {
      expect(component.isLoading).toBeFalse();
    });

    it('devrait passer isLoading à false même en cas d\'erreur', () => {
      enginServiceSpy.getEngins.and.returnValue(throwError(() => new Error('500')));
      component.loadEngins();
      expect(component.isLoading).toBeFalse();
    });

    it('devrait afficher un snack en cas d\'erreur API', () => {
      enginServiceSpy.getEngins.and.returnValue(throwError(() => new Error('500')));
      component.loadEngins();
      expect(snackBarOpenSpy).toHaveBeenCalledWith(
        'Erreur de chargement des engins', 'Fermer', jasmine.any(Object),
      );
    });
  });

  // ── Getters ─────────────────────────────────────────────────────────
  describe('getters', () => {
    it('total devrait retourner le nombre total d\'engins dans le dataSource', () => {
      expect(component.total).toBe(3);
    });

    it('enActif devrait compter uniquement les engins DISPONIBLE', () => {
      expect(component.enActif).toBe(1);
    });

    it('enActif devrait retourner 0 si aucun engin n\'est DISPONIBLE', () => {
      enginServiceSpy.getEngins.and.returnValue(of([
        { ...enginBase, id: 1, statusEngin: 'EN LOCATION'  },
        { ...enginBase, id: 2, statusEngin: 'HORS SERVICE' },
      ]));
      component.loadEngins();
      expect(component.enActif).toBe(0);
    });
  });

  // ── Filtre ──────────────────────────────────────────────────────────
  describe('applyFilter()', () => {
    it('devrait transmettre la valeur en minuscules sans espaces', () => {
      component.applyFilter('  CAT  ');
      expect(component.dataSource.filter).toBe('cat');
    });

    it('devrait vider le filtre si la chaîne est vide', () => {
      component.applyFilter('cat');
      component.applyFilter('');
      expect(component.dataSource.filter).toBe('');
    });
  });

  // ── Navigation ───────────────────────────────────────────────────────
  describe('goToDetails()', () => {
    it('devrait naviguer vers /apps/engins/details-engins/{id}', () => {
      component.goToDetails(42);
      expect(navigateSpy).toHaveBeenCalledWith(['/apps/engins/details-engins', 42]);
    });
  });

  // ── Suppression ──────────────────────────────────────────────────────
  describe('confirmDelete()', () => {
    it('devrait appeler deleteEngin avec l\'id de l\'engin après confirmation', () => {
      const event = new MouseEvent('click');
      component.confirmDelete(mockEngins[0], event);
      actionSubject.next(); // simule le clic "Confirmer"
      expect(enginServiceSpy.deleteEngin).toHaveBeenCalledWith(1);
    });

    it('devrait recharger la liste après suppression réussie', () => {
      enginServiceSpy.getEngins.calls.reset();
      const event = new MouseEvent('click');
      component.confirmDelete(mockEngins[0], event);
      actionSubject.next();
      expect(enginServiceSpy.getEngins).toHaveBeenCalledTimes(1);
    });

    it('devrait afficher un snack de succès après suppression', () => {
      snackBarOpenSpy.calls.reset();
      const event = new MouseEvent('click');
      component.confirmDelete(mockEngins[0], event);
      actionSubject.next();
      expect(snackBarOpenSpy).toHaveBeenCalledWith('Engin supprimé', 'Fermer', jasmine.any(Object));
    });

    it('ne devrait PAS appeler deleteEngin si l\'utilisateur annule', () => {
      // on ne déclenche pas actionSubject.next() → l'action ne se produit pas
      const event = new MouseEvent('click');
      component.confirmDelete(mockEngins[0], event);
      expect(enginServiceSpy.deleteEngin).not.toHaveBeenCalled();
    });

    it('devrait afficher un snack d\'erreur si deleteEngin échoue', () => {
      enginServiceSpy.deleteEngin.and.returnValue(throwError(() => new Error('500')));
      snackBarOpenSpy.calls.reset();
      const event = new MouseEvent('click');
      component.confirmDelete(mockEngins[0], event);
      actionSubject.next();
      expect(snackBarOpenSpy).toHaveBeenCalledWith(
        'Erreur lors de la suppression', 'Fermer', jasmine.any(Object),
      );
    });
  });

  // ── getStatusClass() ─────────────────────────────────────────────────
  describe('getStatusClass()', () => {
    const cases: [string | undefined, string][] = [
      ['DISPONIBLE',     'bg-green-500' ],
      ['EN LOCATION',    'bg-blue-500'  ],
      ['EN MAINTENANCE', 'bg-yellow-500'],
      ['HORS SERVICE',   'bg-red-500'   ],
      ['INCONNU',        'bg-gray-400'  ],
      [undefined,        'bg-gray-400'  ],
    ];

    cases.forEach(([statut, expected]) => {
      it(`"${statut}" → "${expected}"`, () => {
        expect(component.getStatusClass(statut)).toBe(expected);
      });
    });
  });
});
