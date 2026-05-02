import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { AddReglementDialogComponent } from './add-reglement-dialog.component';
import { Facture } from '../facture';
import { Reglement } from '../reglement';

const mockFacture: Facture = {
  id: 1,
  montantTTC: 100000,
  clientId: 10,
  reglements: [
    { montantVerse: 30000 } as Reglement,
  ],
};

const factureVierge: Facture = {
  id: 2,
  montantTTC: 50000,
  clientId: 10,
  reglements: [],
};

function buildTestBed(facture: Facture) {
  const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
  return TestBed.configureTestingModule({
    imports: [AddReglementDialogComponent, NoopAnimationsModule],
    providers: [
      { provide: MatDialogRef,    useValue: dialogRefSpy },
      { provide: MAT_DIALOG_DATA, useValue: facture      },
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
  }).compileComponents().then(() => dialogRefSpy);
}

describe('AddReglementDialogComponent', () => {
  let component: AddReglementDialogComponent;
  let fixture: ComponentFixture<AddReglementDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<any>>;

  beforeEach(async () => {
    dialogRefSpy = await buildTestBed(mockFacture);
    fixture   = TestBed.createComponent(AddReglementDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('devrait être créé', () => expect(component).toBeTruthy());

  // ── resteAPayer ───────────────────────────────────────────────────────
  describe('resteAPayer', () => {
    it('devrait déduire les versements existants du montantTTC', () => {
      // montantTTC=100000, versements=[30000] → restant=70000
      expect(component.resteAPayer).toBe(70000);
    });
  });

  // ── Initialisation du formulaire ──────────────────────────────────────
  describe('form', () => {
    it('devrait pré-remplir montantVerse avec le reste à payer', () => {
      expect(component.form.value.montantVerse).toBe(70000);
    });

    it('devrait pré-sélectionner modePaiement à "VIREMENT"', () => {
      expect(component.form.value.modePaiement).toBe('VIREMENT');
    });

    it('devrait être invalide sans dateReglement', () => {
      expect(component.form.invalid).toBeTrue();
    });

    it('devrait être valide après remplissage', () => {
      component.form.patchValue({ dateReglement: new Date('2024-01-15'), montantVerse: 70000, modePaiement: 'VIREMENT' });
      expect(component.form.valid).toBeTrue();
    });
  });

  // ── submit() ──────────────────────────────────────────────────────────
  describe('submit()', () => {
    it('ne devrait PAS fermer le dialogue si le formulaire est invalide', () => {
      component.submit();
      expect(dialogRefSpy.close).not.toHaveBeenCalled();
    });

    it('devrait fermer le dialogue avec le payload si valide', () => {
      component.form.patchValue({ dateReglement: new Date('2024-01-15'), montantVerse: 70000, modePaiement: 'VIREMENT' });
      component.submit();
      expect(dialogRefSpy.close).toHaveBeenCalledWith(jasmine.objectContaining({
        montantVerse:  70000,
        modePaiement:  'VIREMENT',
        factureId:     1,
        clientId:      10,
      }));
    });

    it('devrait inclure dateReglement formatée en yyyy-MM-dd', () => {
      component.form.patchValue({ dateReglement: new Date('2024-01-15'), montantVerse: 70000, modePaiement: 'VIREMENT' });
      component.submit();
      const payload = dialogRefSpy.close.calls.mostRecent().args[0];
      expect(payload.dateReglement).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  // ── cancel() ──────────────────────────────────────────────────────────
  describe('cancel()', () => {
    it('devrait fermer le dialogue avec null', () => {
      component.cancel();
      expect(dialogRefSpy.close).toHaveBeenCalledWith(null);
    });
  });
});

// ── Facture sans versements ────────────────────────────────────────────
describe('AddReglementDialogComponent – facture sans versements', () => {
  it('devrait pré-remplir montantVerse avec le montantTTC complet', async () => {
    await buildTestBed(factureVierge);
    const fixture   = TestBed.createComponent(AddReglementDialogComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.resteAPayer).toBe(50000);
    expect(component.form.value.montantVerse).toBe(50000);
  });
});
