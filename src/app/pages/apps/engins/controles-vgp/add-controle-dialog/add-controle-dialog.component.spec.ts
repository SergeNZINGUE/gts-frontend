import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatNativeDateModule } from '@angular/material/core';
import { of } from 'rxjs';

import { AddControleDialogComponent } from './add-controle-dialog.component';
import { EnginService } from 'src/app/services/apps/engin/engin.service';
import { ControleVGP } from '../controle-vgp';
import { Engin } from '../../engin';

const mockEngins: Engin[] = [
  { id: 1, codeEngin: 'ENG-001', modelEngin: 'CAT 320' } as Engin,
  { id: 2, codeEngin: 'ENG-002', modelEngin: 'Volvo EC220' } as Engin,
];

const mockControle: ControleVGP = {
  id: 7,
  enginId: 1,
  enginCode: 'ENG-001',
  enginModel: 'CAT 320',
  dateDernierControle: '2024-01-01',
  dateProchaineEcheance: '2025-01-01',
  organismeControleur: 'Bureau Veritas',
  numeroRapport: 'RPT-001',
  resultat: 'CONFORME',
  estAlerteActive: true,
};

function buildTestBed(data: ControleVGP | null) {
  const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
  const enginSpy     = jasmine.createSpyObj<EnginService>('EnginService', ['getEngins']);
  enginSpy.getEngins.and.returnValue(of(mockEngins));

  return TestBed.configureTestingModule({
    imports: [AddControleDialogComponent, NoopAnimationsModule, MatNativeDateModule],
    providers: [
      { provide: MatDialogRef,    useValue: dialogRefSpy },
      { provide: MAT_DIALOG_DATA, useValue: data         },
      { provide: EnginService,    useValue: enginSpy     },
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
  }).compileComponents().then(() => ({ dialogRefSpy, enginSpy }));
}

describe('AddControleDialogComponent – mode Ajout', () => {
  let component: AddControleDialogComponent;
  let fixture: ComponentFixture<AddControleDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<any>>;
  let enginSpy: jasmine.SpyObj<EnginService>;

  beforeEach(async () => {
    ({ dialogRefSpy, enginSpy } = await buildTestBed(null));
    fixture   = TestBed.createComponent(AddControleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('devrait être créé', () => expect(component).toBeTruthy());

  it('isEdit devrait être false sans données', () => {
    expect(component.isEdit).toBeFalse();
  });

  it('devrait charger les engins au démarrage', () => {
    expect(enginSpy.getEngins).toHaveBeenCalledTimes(1);
    expect(component.engins.length).toBe(2);
  });

  it('enginSearchCtrl devrait filtrer les engins', () => {
    component.enginSearchCtrl.setValue('Volvo');
    expect(component.filteredEngins.length).toBe(1);
    expect(component.filteredEngins[0].codeEngin).toBe('ENG-002');
  });

  it('selectEngin() devrait patcher enginId', () => {
    component.selectEngin(mockEngins[0]);
    expect(component.form.value.enginId).toBe(1);
  });

  it('devrait être invalide à l\'initialisation (enginId et dates manquants)', () => {
    expect(component.form.invalid).toBeTrue();
  });

  // ── Validateur dynamique reserveVGP ───────────────────────────────────
  describe('validateur dynamique reserveVGP', () => {
    it('reserveVGP devrait être requis quand resultat = AVEC_RESERVES', () => {
      component.form.get('resultat')!.setValue('AVEC_RESERVES');
      component.form.get('reserveVGP')!.setValue('');
      expect(component.form.get('reserveVGP')!.invalid).toBeTrue();
    });

    it('reserveVGP ne devrait PAS être requis quand resultat = CONFORME', () => {
      component.form.get('resultat')!.setValue('CONFORME');
      component.form.get('reserveVGP')!.setValue('');
      expect(component.form.get('reserveVGP')!.valid).toBeTrue();
    });

    it('reserveVGP devrait être vidé lors du passage à NON_CONFORME', () => {
      component.form.get('resultat')!.setValue('AVEC_RESERVES');
      component.form.get('reserveVGP')!.setValue('Fissure visible');
      component.form.get('resultat')!.setValue('NON_CONFORME');
      expect(component.form.get('reserveVGP')!.value).toBe('');
    });
  });

  // ── showReserve ───────────────────────────────────────────────────────
  describe('showReserve', () => {
    it('devrait retourner true quand resultat = AVEC_RESERVES', () => {
      component.form.get('resultat')!.setValue('AVEC_RESERVES');
      expect(component.showReserve).toBeTrue();
    });

    it('devrait retourner false pour CONFORME', () => {
      component.form.get('resultat')!.setValue('CONFORME');
      expect(component.showReserve).toBeFalse();
    });
  });

  // ── submit() ──────────────────────────────────────────────────────────
  describe('submit()', () => {
    it('ne devrait PAS fermer si le formulaire est invalide', () => {
      component.submit();
      expect(dialogRefSpy.close).not.toHaveBeenCalled();
    });

    it('devrait fermer avec le payload si le formulaire est valide', () => {
      component.form.patchValue({
        enginId:               1,
        dateDernierControle:   new Date('2024-01-01'),
        dateProchaineEcheance: new Date('2025-01-01'),
        organismeControleur:   'Bureau Veritas',
        resultat:              'CONFORME',
        estAlerteActive:       true,
      });
      component.submit();
      expect(dialogRefSpy.close).toHaveBeenCalledWith(jasmine.objectContaining({
        enginId: 1,
        organismeControleur: 'Bureau Veritas',
        resultat: 'CONFORME',
      }));
    });

    it('devrait formater les dates en yyyy-MM-dd dans le payload', () => {
      component.form.patchValue({
        enginId:               1,
        dateDernierControle:   new Date('2024-06-15'),
        dateProchaineEcheance: new Date('2025-06-15'),
        organismeControleur:   'SGS',
        resultat:              'CONFORME',
      });
      component.submit();
      const payload = dialogRefSpy.close.calls.mostRecent().args[0];
      expect(payload.dateDernierControle).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(payload.dateProchaineEcheance).toMatch(/^\d{4}-\d{2}-\d{2}$/);
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

describe('AddControleDialogComponent – mode Édition', () => {
  let component: AddControleDialogComponent;
  let fixture: ComponentFixture<AddControleDialogComponent>;

  beforeEach(async () => {
    await buildTestBed(mockControle);
    fixture   = TestBed.createComponent(AddControleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('isEdit devrait être true avec des données existantes', () => {
    expect(component.isEdit).toBeTrue();
  });

  it('devrait pré-remplir le formulaire avec les données existantes', () => {
    expect(component.form.value.organismeControleur).toBe('Bureau Veritas');
    expect(component.form.value.resultat).toBe('CONFORME');
    expect(component.form.value.estAlerteActive).toBeTrue();
  });
});
