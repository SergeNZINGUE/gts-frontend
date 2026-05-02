import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, EMPTY, throwError } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { FacturesListComponent } from './factures-list.component';
import { FacturesService } from 'src/app/services/apps/factures/factures.service';
import { Facture } from '../facture';

const factureBase: Facture = {
  id: 1,
  dateEmission: '2024-06-01',
  tauxTVA: 18,
  etatPaiement: 'BROUILLON',
  codeLocation: 'LOC-001',
  clientNom: 'Acme Corp',
  montantHT: 200000,
  montantTTC: 236000,
};

const mockFactures: Facture[] = [
  { ...factureBase, id: 1, etatPaiement: 'BROUILLON', clientNom: 'Acme Corp',  montantTTC: 236000 },
  { ...factureBase, id: 2, etatPaiement: 'VALIDEE',   clientNom: 'Beta SARL',  montantTTC: 118000 },
  { ...factureBase, id: 3, etatPaiement: 'PAYEE',     clientNom: 'Acme Corp',  montantTTC: 59000  },
  { ...factureBase, id: 4, etatPaiement: 'BROUILLON', clientNom: 'Gamma SA',   montantTTC: 472000, codeLocation: 'LOC-002' },
];

describe('FacturesListComponent', () => {
  let component: FacturesListComponent;
  let fixture: ComponentFixture<FacturesListComponent>;
  let facturesServiceSpy: jasmine.SpyObj<FacturesService>;
  let navigateSpy: jasmine.Spy;
  let snackBarOpenSpy: jasmine.Spy;

  beforeEach(async () => {
    facturesServiceSpy = jasmine.createSpyObj<FacturesService>('FacturesService', [
      'getFactures', 'deleteFacture',
    ]);
    facturesServiceSpy.getFactures.and.returnValue(of([...mockFactures]));
    facturesServiceSpy.deleteFacture.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [FacturesListComponent, NoopAnimationsModule, RouterTestingModule.withRoutes([])],
      providers: [{ provide: FacturesService, useValue: facturesServiceSpy }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();

    fixture   = TestBed.createComponent(FacturesListComponent);
    component = fixture.componentInstance;

    navigateSpy = spyOn(TestBed.inject(Router), 'navigate')
      .and.returnValue(Promise.resolve(true));

    snackBarOpenSpy = spyOn(component['snackBar'], 'open')
      .and.returnValue({ onAction: () => EMPTY, dismiss: () => {}, afterOpened: () => EMPTY, afterDismissed: () => EMPTY, instance: null } as any);

    fixture.detectChanges();
  });

  it('devrait être créé', () => expect(component).toBeTruthy());

  // ── Chargement ────────────────────────────────────────────────────────
  describe('loadFactures()', () => {
    it('devrait appeler getFactures() à l\'initialisation', () => {
      expect(facturesServiceSpy.getFactures).toHaveBeenCalledTimes(1);
    });

    it('devrait remplir le dataSource', () => {
      expect(component.facturesDataSource.data.length).toBe(4);
    });

    it('devrait calculer totalFactures', () => {
      expect(component.totalFactures).toBe(4);
    });

    it('devrait calculer totalTTC (somme de toutes les factures)', () => {
      expect(component.totalTTC).toBe(236000 + 118000 + 59000 + 472000);
    });

    it('devrait compter les factures payées', () => {
      expect(component.facturesPayees).toBe(1);
    });

    it('devrait compter les factures impayées', () => {
      expect(component.facturesImpayees).toBe(3);
    });
  });

  // ── Filtres ───────────────────────────────────────────────────────────
  describe('applySearch()', () => {
    it('devrait filtrer par nom client', () => {
      component.applySearch('Beta SARL');
      expect(component.facturesDataSource.data.length).toBe(1);
      expect(component.facturesDataSource.data[0].clientNom).toBe('Beta SARL');
    });

    it('devrait filtrer par codeLocation', () => {
      component.applySearch('LOC-002');
      expect(component.facturesDataSource.data.length).toBe(1);
    });

    it('devrait retourner tout si la recherche est vide', () => {
      component.applySearch('Acme');
      component.applySearch('');
      expect(component.facturesDataSource.data.length).toBe(4);
    });
  });

  describe('applyEtatFilter()', () => {
    it('devrait filtrer par état PAYEE', () => {
      component.applyEtatFilter('PAYEE');
      expect(component.facturesDataSource.data.length).toBe(1);
      expect(component.facturesDataSource.data[0].etatPaiement).toBe('PAYEE');
    });

    it('All devrait retourner toutes les factures', () => {
      component.applyEtatFilter('PAYEE');
      component.applyEtatFilter('All');
      expect(component.facturesDataSource.data.length).toBe(4);
    });
  });

  describe('clearFilters()', () => {
    it('devrait réinitialiser tous les filtres', () => {
      component.applyEtatFilter('PAYEE');
      component.applySearch('test');
      component.clearFilters();
      expect(component.facturesDataSource.data.length).toBe(4);
      expect(component.searchText).toBe('');
      expect(component.selectedEtat).toBe('All');
    });
  });

  // ── Navigation ────────────────────────────────────────────────────────
  describe('openDetail()', () => {
    it('devrait naviguer vers /apps/factures/detail/{id}', () => {
      component.openDetail(mockFactures[0]);
      expect(navigateSpy).toHaveBeenCalledWith(['/apps/factures/detail', 1]);
    });
  });

  describe('openAddFacture()', () => {
    it('devrait naviguer vers /apps/factures/add', () => {
      component.openAddFacture();
      expect(navigateSpy).toHaveBeenCalledWith(['/apps/factures/add']);
    });
  });

  // ── Suppression ───────────────────────────────────────────────────────
  describe('deleteFacture()', () => {
    it('devrait appeler deleteFacture du service avec l\'id', () => {
      component.deleteFacture(mockFactures[0]);
      expect(facturesServiceSpy.deleteFacture).toHaveBeenCalledWith(1);
    });

    it('devrait afficher un snack de succès', () => {
      component.deleteFacture(mockFactures[0]);
      expect(snackBarOpenSpy).toHaveBeenCalledWith('Facture supprimée', 'Fermer', jasmine.any(Object));
    });

    it('devrait recharger la liste après succès', () => {
      facturesServiceSpy.getFactures.calls.reset();
      component.deleteFacture(mockFactures[0]);
      expect(facturesServiceSpy.getFactures).toHaveBeenCalledTimes(1);
    });

    it('ne devrait PAS appeler le service si id est absent', () => {
      component.deleteFacture({ ...factureBase, id: undefined });
      expect(facturesServiceSpy.deleteFacture).not.toHaveBeenCalled();
    });

    it('devrait afficher un snack d\'erreur si le service échoue', () => {
      facturesServiceSpy.deleteFacture.and.returnValue(throwError(() => new Error('500')));
      component.deleteFacture(mockFactures[0]);
      expect(snackBarOpenSpy).toHaveBeenCalledWith(
        'Erreur lors de la suppression', 'Fermer', jasmine.any(Object),
      );
    });
  });

  // ── getEtatClass() ────────────────────────────────────────────────────
  describe('getEtatClass()', () => {
    const cases: [string | undefined, string][] = [
      ['BROUILLON', 'bg-gray-400'],
      ['VALIDEE',   'bg-blue-500'],
      ['PAYEE',     'bg-green-500'],
      ['INCONNU',   'bg-gray-300'],
      [undefined,   'bg-gray-300'],
    ];

    cases.forEach(([etat, expected]) => {
      it(`"${etat}" → "${expected}"`, () => {
        expect(component.getEtatClass(etat)).toBe(expected);
      });
    });
  });
});
