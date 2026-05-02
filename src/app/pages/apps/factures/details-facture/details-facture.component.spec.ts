import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatNativeDateModule } from '@angular/material/core';
import { Subject } from 'rxjs';
import { of, EMPTY, throwError } from 'rxjs';

import { DetailsFactureComponent } from './details-facture.component';
import { FacturesService } from 'src/app/services/apps/factures/factures.service';
import { ReglementsService } from 'src/app/services/apps/reglements/reglements.service';
import { PrintService } from 'src/app/services/print/print.service';
import { Facture } from '../facture';
import { Reglement } from '../reglement';

const mockFacture: Facture = {
  id: 1,
  montantHT: 84746,
  montantTTC: 100000,
  tauxTVA: 18,
  etatPaiement: 'VALIDEE',
  dateEmission: '2024-01-15',
  clientNom: 'Acme Corp',
  clientId: 10,
  codeLocation: 'LOC-001',
  siteLocation: 'Cotonou',
  missionsFacturees: [
    { id: 10, codeMission: 'M-001', lieuMission: 'Cotonou', nbHeures: 8, tarifHoraireApplique: 5000, sousTotal: 40000 } as any,
    { id: 11, codeMission: 'M-002', lieuMission: 'Abidjan', nbHeures: 6, tarifHoraireApplique: 5000, sousTotal: 30000 } as any,
  ],
};

const mockReglements: Reglement[] = [
  { id: 1, montantVerse: 40000, dateReglement: '2024-02-01', modePaiement: 'VIREMENT', factureId: 1 },
  { id: 2, montantVerse: 30000, dateReglement: '2024-03-01', modePaiement: 'CHEQUE',   factureId: 1 },
];

describe('DetailsFactureComponent', () => {
  let component: DetailsFactureComponent;
  let fixture: ComponentFixture<DetailsFactureComponent>;
  let facturesSpy:   jasmine.SpyObj<FacturesService>;
  let reglementsSpy: jasmine.SpyObj<ReglementsService>;
  let printSpy:      jasmine.SpyObj<PrintService>;
  let dialogRefSpy:  jasmine.SpyObj<any>;
  let dialogSubject: Subject<any>;
  let dialogOpenSpy: jasmine.Spy;
  let snackSpy:      jasmine.Spy;

  beforeEach(async () => {
    facturesSpy   = jasmine.createSpyObj<FacturesService>('FacturesService', ['getFactureById', 'updateEtat']);
    reglementsSpy = jasmine.createSpyObj<ReglementsService>('ReglementsService', ['createReglement', 'getReglementsByFacture']);
    printSpy      = jasmine.createSpyObj<PrintService>('PrintService', ['printProforma', 'printFacture', 'printRecu']);

    facturesSpy.getFactureById.and.returnValue(of(mockFacture));
    facturesSpy.updateEtat.and.returnValue(of({ ...mockFacture, etatPaiement: 'VALIDEE' }));
    reglementsSpy.getReglementsByFacture.and.returnValue(of(mockReglements));
    reglementsSpy.createReglement.and.returnValue(of({} as Reglement));

    await TestBed.configureTestingModule({
      imports: [DetailsFactureComponent, NoopAnimationsModule, MatNativeDateModule, RouterTestingModule.withRoutes([])],
      providers: [
        { provide: FacturesService,   useValue: facturesSpy   },
        { provide: ReglementsService, useValue: reglementsSpy },
        { provide: PrintService,      useValue: printSpy      },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture   = TestBed.createComponent(DetailsFactureComponent);
    component = fixture.componentInstance;
    snackSpy  = spyOn(component['snackBar'], 'open').and.callThrough();

    dialogSubject = new Subject<any>();
    dialogRefSpy  = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRefSpy.afterClosed.and.returnValue(dialogSubject.asObservable());
    dialogOpenSpy = spyOn(component['dialog'], 'open').and.returnValue(dialogRefSpy);

    fixture.detectChanges();
  });

  it('devrait être créé', () => expect(component).toBeTruthy());

  // ── ngOnInit / chargement ─────────────────────────────────────────────
  describe('ngOnInit()', () => {
    it('devrait appeler getFactureById', () => {
      expect(facturesSpy.getFactureById).toHaveBeenCalledWith(1);
    });

    it('devrait remplir facture', () => {
      expect(component.facture?.codeLocation).toBe('LOC-001');
    });

    it('devrait passer isLoading à false', () => {
      expect(component.isLoading).toBeFalse();
    });

    it('devrait appeler getReglementsByFacture', () => {
      expect(reglementsSpy.getReglementsByFacture).toHaveBeenCalledWith(1);
    });

    it('devrait remplir reglements', () => {
      expect(component.reglements.length).toBe(2);
    });
  });

  // ── Getters ───────────────────────────────────────────────────────────
  describe('montantVerse', () => {
    it('devrait sommer les montantVerse des règlements', () => {
      expect(component.montantVerse).toBe(70000); // 40000 + 30000
    });

    it('devrait retourner 0 si aucun règlement', () => {
      component.reglements = [];
      expect(component.montantVerse).toBe(0);
    });
  });

  describe('resteAPayer', () => {
    it('devrait retourner montantTTC - montantVerse', () => {
      expect(component.resteAPayer).toBe(30000); // 100000 - 70000
    });

    it('ne devrait jamais retourner un montant négatif', () => {
      component.reglements = [{ montantVerse: 120000 }];
      expect(component.resteAPayer).toBe(0);
    });
  });

  describe('isVerrouille', () => {
    it('devrait retourner false si etatPaiement est VALIDEE', () => {
      expect(component.isVerrouille).toBeFalse();
    });

    it('devrait retourner true si etatPaiement est PAYEE', () => {
      component.facture = { ...mockFacture, etatPaiement: 'PAYEE' };
      expect(component.isVerrouille).toBeTrue();
    });
  });

  // ── getEtatClass() ────────────────────────────────────────────────────
  describe('getEtatClass()', () => {
    const cases: [string | undefined, string][] = [
      ['BROUILLON', 'bg-gray-400'],
      ['VALIDEE',   'bg-blue-500'],
      ['PAYEE',     'bg-green-500'],
      [undefined,   'bg-gray-300'],
    ];
    cases.forEach(([etat, expected]) => {
      it(`"${etat}" → "${expected}"`, () => {
        expect(component.getEtatClass(etat)).toBe(expected);
      });
    });
  });

  // ── validerFacture() ──────────────────────────────────────────────────
  describe('validerFacture()', () => {
    it('devrait appeler updateEtat avec "VALIDEE"', () => {
      component.validerFacture();
      expect(facturesSpy.updateEtat).toHaveBeenCalledWith(1, 'VALIDEE');
    });

    it('devrait afficher un snack de succès', () => {
      component.validerFacture();
      expect(snackSpy).toHaveBeenCalledWith('Facture validée', 'Fermer', jasmine.any(Object));
    });
  });

  // ── marquerPayee() ────────────────────────────────────────────────────
  describe('marquerPayee()', () => {
    it('devrait appeler updateEtat avec "PAYEE"', () => {
      component.marquerPayee();
      expect(facturesSpy.updateEtat).toHaveBeenCalledWith(1, 'PAYEE');
    });

    it('devrait afficher un snack de succès', () => {
      component.marquerPayee();
      expect(snackSpy).toHaveBeenCalledWith('Facture marquée comme payée', 'Fermer', jasmine.any(Object));
    });
  });

  // ── openAddReglement() ────────────────────────────────────────────────
  describe('openAddReglement()', () => {
    it('devrait ouvrir le dialogue', () => {
      component.openAddReglement();
      expect(dialogOpenSpy).toHaveBeenCalled();
    });

    it('devrait appeler createReglement après confirmation', () => {
      component.openAddReglement();
      dialogSubject.next({ montantVerse: 30000, dateReglement: '2024-04-01', modePaiement: 'VIREMENT', factureId: 1, clientId: 10 });
      expect(reglementsSpy.createReglement).toHaveBeenCalled();
    });

    it('devrait afficher un snack de succès après ajout', () => {
      component.openAddReglement();
      dialogSubject.next({ montantVerse: 30000 });
      expect(snackSpy).toHaveBeenCalledWith('Règlement enregistré', 'Fermer', jasmine.any(Object));
    });

    it('ne devrait PAS appeler createReglement si le dialogue est annulé', () => {
      component.openAddReglement();
      dialogSubject.next(null);
      expect(reglementsSpy.createReglement).not.toHaveBeenCalled();
    });

    it('ne devrait PAS ouvrir le dialogue si facture est null', () => {
      component.facture = null;
      component.openAddReglement();
      expect(dialogOpenSpy).not.toHaveBeenCalled();
    });

    it('devrait afficher un snack d\'erreur si createReglement échoue', () => {
      reglementsSpy.createReglement.and.returnValue(throwError(() => new Error('500')));
      component.openAddReglement();
      dialogSubject.next({ montantVerse: 30000 });
      expect(snackSpy).toHaveBeenCalledWith(jasmine.stringContaining('Erreur'), jasmine.any(String), jasmine.any(Object));
    });
  });

  // ── Impression ────────────────────────────────────────────────────────
  describe('imprimerProforma()', () => {
    it('devrait appeler printService.printProforma', () => {
      component.imprimerProforma();
      expect(printSpy.printProforma).toHaveBeenCalledWith(mockFacture);
    });

    it('ne devrait PAS appeler printProforma si facture est null', () => {
      component.facture = null;
      component.imprimerProforma();
      expect(printSpy.printProforma).not.toHaveBeenCalled();
    });
  });

  describe('imprimerFacture()', () => {
    it('devrait appeler printService.printFacture avec facture et règlements', () => {
      component.imprimerFacture();
      expect(printSpy.printFacture).toHaveBeenCalledWith(mockFacture, mockReglements);
    });
  });

  describe('imprimerRecu()', () => {
    it('devrait appeler printService.printRecu avec le bon resteApresVersement', () => {
      // règlements : id=1 (40000), id=2 (30000)
      // Pour id=2 : versementsAvant = 40000, reste = 100000 - 40000 - 30000 = 30000
      component.imprimerRecu(mockReglements[1]);
      expect(printSpy.printRecu).toHaveBeenCalledWith(mockReglements[1], mockFacture, 30000);
    });
  });
});
