import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';
import { of, EMPTY, throwError } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';

import { ControlesVGPComponent } from './controles-vgp.component';
import { ControlesVGPService } from 'src/app/services/apps/controles-vgp/controles-vgp.service';
import { ControleVGP } from './controle-vgp';

const FUTURE = new Date(Date.now() + 60 * 864e5).toISOString().split('T')[0]; // +60j
const SOON   = new Date(Date.now() + 15 * 864e5).toISOString().split('T')[0]; // +15j (< 30j)
const PAST   = new Date(Date.now() - 2  * 864e5).toISOString().split('T')[0]; // -2j (dépassée)

const base: ControleVGP = {
  id: 1,
  dateDernierControle: '2024-01-01',
  dateProchaineEcheance: FUTURE,
  organismeControleur: 'Bureau Veritas',
  numeroRapport: 'RPT-001',
  resultat: 'CONFORME',
  estAlerteActive: true,
  enginId: 10,
  enginCode: 'ENG-001',
  enginModel: 'CAT 320',
};

const mockControles: ControleVGP[] = [
  { ...base, id: 1, resultat: 'CONFORME',      estAlerteActive: true,  dateProchaineEcheance: FUTURE, enginCode: 'ENG-001', organismeControleur: 'Bureau Veritas' },
  { ...base, id: 2, resultat: 'NON_CONFORME',  estAlerteActive: true,  dateProchaineEcheance: PAST,   enginCode: 'ENG-002', organismeControleur: 'SGS'            },
  { ...base, id: 3, resultat: 'AVEC_RESERVES', estAlerteActive: false, dateProchaineEcheance: FUTURE, enginCode: 'ENG-003', organismeControleur: 'Apave'          },
  { ...base, id: 4, resultat: 'CONFORME',      estAlerteActive: true,  dateProchaineEcheance: SOON,   enginCode: 'ENG-004', organismeControleur: 'Bureau Veritas' },
];

describe('ControlesVGPComponent', () => {
  let component: ControlesVGPComponent;
  let fixture: ComponentFixture<ControlesVGPComponent>;
  let controleServiceSpy: jasmine.SpyObj<ControlesVGPService>;
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
    controleServiceSpy = jasmine.createSpyObj<ControlesVGPService>('ControlesVGPService', [
      'getAll', 'create', 'update', 'delete',
    ]);
    controleServiceSpy.getAll.and.returnValue(of([...mockControles]));
    controleServiceSpy.create.and.returnValue(of({ ...base, id: 99 }));
    controleServiceSpy.update.and.returnValue(of({ ...base }));
    controleServiceSpy.delete.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [ControlesVGPComponent, NoopAnimationsModule, RouterTestingModule.withRoutes([])],
      providers: [{ provide: ControlesVGPService, useValue: controleServiceSpy }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .overrideComponent(ControlesVGPComponent, {
      remove: { imports: [TablerIconsModule] },
      add:    { schemas: [CUSTOM_ELEMENTS_SCHEMA] },
    })
    .compileComponents();

    fixture   = TestBed.createComponent(ControlesVGPComponent);
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
      expect(controleServiceSpy.getAll).toHaveBeenCalledTimes(1);
    });

    it('devrait remplir allControles', () => {
      expect(component.allControles.length).toBe(4);
    });

    it('devrait passer isLoading à false après succès', () => {
      expect(component.isLoading).toBeFalse();
    });

    it('devrait passer isLoading à false en cas d\'erreur', () => {
      controleServiceSpy.getAll.and.returnValue(throwError(() => new Error('500')));
      component.load();
      expect(component.isLoading).toBeFalse();
    });

    it('devrait afficher un snack en cas d\'erreur', () => {
      controleServiceSpy.getAll.and.returnValue(throwError(() => new Error('500')));
      component.load();
      expect(snackBarOpenSpy).toHaveBeenCalledWith('Erreur de chargement', 'Fermer', jasmine.any(Object));
    });
  });

  // ── Getters KPI ───────────────────────────────────────────────────────
  describe('getters', () => {
    it('total devrait retourner le nombre total de contrôles', () => {
      expect(component.total).toBe(4);
    });

    it('conformes devrait compter uniquement les CONFORME', () => {
      expect(component.conformes).toBe(2); // id 1 et 4
    });

    it('avecReserves devrait compter uniquement les AVEC_RESERVES', () => {
      expect(component.avecReserves).toBe(1); // id 3
    });

    it('nonConformes devrait compter uniquement les NON_CONFORME', () => {
      expect(component.nonConformes).toBe(1); // id 2
    });

    it('echeancesBientot devrait retourner les contrôles alerte active avec échéance < 30j', () => {
      // id 4 : estAlerteActive=true, dateProchaineEcheance=SOON (+15j)
      expect(component.echeancesBientot.length).toBe(1);
      expect(component.echeancesBientot[0].id).toBe(4);
    });

    it('echeancesDepassees devrait retourner les contrôles alerte active avec échéance dépassée', () => {
      // id 2 : estAlerteActive=true, dateProchaineEcheance=PAST
      expect(component.echeancesDepassees.length).toBe(1);
      expect(component.echeancesDepassees[0].id).toBe(2);
    });

    it('echeancesBientot ne devrait PAS inclure les contrôles avec alerte inactive', () => {
      // id 3 : estAlerteActive=false → exclu même si dateFin pourrait matcher
      const ids = component.echeancesBientot.map(c => c.id);
      expect(ids).not.toContain(3);
    });
  });

  // ── Filtres ───────────────────────────────────────────────────────────
  describe('applyFilters()', () => {
    it('devrait filtrer par organisme', () => {
      component.searchText = 'SGS';
      component.applyFilters();
      expect(component.dataSource.data.length).toBe(1);
      expect(component.dataSource.data[0].organismeControleur).toBe('SGS');
    });

    it('devrait filtrer par enginCode', () => {
      component.searchText = 'ENG-003';
      component.applyFilters();
      expect(component.dataSource.data.length).toBe(1);
    });

    it('devrait filtrer par numéro de rapport', () => {
      component.searchText = 'RPT-001';
      component.applyFilters();
      expect(component.dataSource.data.length).toBe(4); // tous ont RPT-001
    });

    it('devrait filtrer par résultat', () => {
      component.selectedResultat = 'NON_CONFORME';
      component.applyFilters();
      expect(component.dataSource.data.length).toBe(1);
      expect(component.dataSource.data[0].resultat).toBe('NON_CONFORME');
    });

    it('ALL devrait retourner tous les contrôles', () => {
      component.selectedResultat = 'NON_CONFORME';
      component.applyFilters();
      component.selectedResultat = 'ALL';
      component.applyFilters();
      expect(component.dataSource.data.length).toBe(4);
    });

    it('recherche vide + ALL devrait retourner tout', () => {
      component.searchText = '';
      component.selectedResultat = 'ALL';
      component.applyFilters();
      expect(component.dataSource.data.length).toBe(4);
    });
  });

  // ── getResultatClass() ────────────────────────────────────────────────
  describe('getResultatClass()', () => {
    const cases: [string | undefined, string][] = [
      ['CONFORME',      'bg-green-500' ],
      ['AVEC_RESERVES', 'bg-yellow-500'],
      ['NON_CONFORME',  'bg-red-500'   ],
      [undefined,       'bg-gray-400'  ],
    ];
    cases.forEach(([resultat, expected]) => {
      it(`"${resultat}" → "${expected}"`, () => {
        expect(component.getResultatClass(resultat)).toBe(expected);
      });
    });
  });

  // ── getResultatLabel() ────────────────────────────────────────────────
  describe('getResultatLabel()', () => {
    const cases: [string | undefined, string][] = [
      ['CONFORME',      'Conforme'     ],
      ['AVEC_RESERVES', 'Avec réserves'],
      ['NON_CONFORME',  'Non conforme' ],
      [undefined,       '—'            ],
    ];
    cases.forEach(([resultat, expected]) => {
      it(`"${resultat}" → "${expected}"`, () => {
        expect(component.getResultatLabel(resultat)).toBe(expected);
      });
    });
  });

  // ── isEcheanceProche() et isEcheanceDepassee() ────────────────────────
  describe('isEcheanceProche()', () => {
    it('devrait retourner true si alerte active et échéance dans 15j', () => {
      expect(component.isEcheanceProche({ estAlerteActive: true, dateProchaineEcheance: SOON })).toBeTrue();
    });

    it('devrait retourner false si alerte active et échéance dans 60j', () => {
      expect(component.isEcheanceProche({ estAlerteActive: true, dateProchaineEcheance: FUTURE })).toBeFalse();
    });

    it('devrait retourner false si alerte inactive', () => {
      expect(component.isEcheanceProche({ estAlerteActive: false, dateProchaineEcheance: SOON })).toBeFalse();
    });

    it('devrait retourner false si dateProchaineEcheance est absent', () => {
      expect(component.isEcheanceProche({ estAlerteActive: true })).toBeFalse();
    });
  });

  describe('isEcheanceDepassee()', () => {
    it('devrait retourner true si alerte active et échéance dépassée', () => {
      expect(component.isEcheanceDepassee({ estAlerteActive: true, dateProchaineEcheance: PAST })).toBeTrue();
    });

    it('devrait retourner false si alerte active et échéance future', () => {
      expect(component.isEcheanceDepassee({ estAlerteActive: true, dateProchaineEcheance: FUTURE })).toBeFalse();
    });

    it('devrait retourner false si alerte inactive', () => {
      expect(component.isEcheanceDepassee({ estAlerteActive: false, dateProchaineEcheance: PAST })).toBeFalse();
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

    it('devrait appeler create si aucun contrôle passé', () => {
      component.openDialog();
      dialogSubject.next({ ...mockControles[0] });
      expect(controleServiceSpy.create).toHaveBeenCalled();
    });

    it('devrait appeler update si un contrôle existant est passé', () => {
      component.openDialog(mockControles[0]);
      dialogSubject.next({ resultat: 'NON_CONFORME' });
      expect(controleServiceSpy.update).toHaveBeenCalledWith(1, jasmine.any(Object));
    });

    it('ne devrait PAS appeler le service si le dialogue est annulé', () => {
      component.openDialog();
      dialogSubject.next(null);
      expect(controleServiceSpy.create).not.toHaveBeenCalled();
    });

    it('devrait afficher un snack de succès après création', () => {
      snackBarOpenSpy.calls.reset();
      component.openDialog();
      dialogSubject.next({ ...mockControles[0] });
      expect(snackBarOpenSpy).toHaveBeenCalledWith('Contrôle enregistré', 'Fermer', jasmine.any(Object));
    });

    it('devrait afficher un snack de succès après modification', () => {
      snackBarOpenSpy.calls.reset();
      component.openDialog(mockControles[0]);
      dialogSubject.next({ resultat: 'NON_CONFORME' });
      expect(snackBarOpenSpy).toHaveBeenCalledWith('Contrôle modifié', 'Fermer', jasmine.any(Object));
    });
  });

  // ── confirmDelete() ───────────────────────────────────────────────────
  describe('confirmDelete()', () => {
    it('devrait appeler delete après confirmation', () => {
      const event = new MouseEvent('click');
      component.confirmDelete(mockControles[0], event);
      actionSubject.next();
      expect(controleServiceSpy.delete).toHaveBeenCalledWith(1);
    });

    it('devrait afficher un snack de succès après suppression', () => {
      snackBarOpenSpy.calls.reset();
      const event = new MouseEvent('click');
      component.confirmDelete(mockControles[0], event);
      actionSubject.next();
      expect(snackBarOpenSpy).toHaveBeenCalledWith('Contrôle supprimé', 'Fermer', jasmine.any(Object));
    });

    it('ne devrait PAS appeler delete si non confirmé', () => {
      const event = new MouseEvent('click');
      component.confirmDelete(mockControles[0], event);
      expect(controleServiceSpy.delete).not.toHaveBeenCalled();
    });

    it('ne devrait PAS ouvrir le snack si id absent', () => {
      snackBarOpenSpy.calls.reset();
      const event = new MouseEvent('click');
      component.confirmDelete({ ...base, id: undefined }, event);
      expect(snackBarOpenSpy).not.toHaveBeenCalled();
    });

    it('devrait afficher un snack d\'erreur si delete échoue', () => {
      controleServiceSpy.delete.and.returnValue(throwError(() => new Error('500')));
      snackBarOpenSpy.calls.reset();
      const event = new MouseEvent('click');
      component.confirmDelete(mockControles[0], event);
      actionSubject.next();
      expect(snackBarOpenSpy).toHaveBeenCalledWith('Erreur lors de la suppression', 'Fermer', jasmine.any(Object));
    });
  });
});
