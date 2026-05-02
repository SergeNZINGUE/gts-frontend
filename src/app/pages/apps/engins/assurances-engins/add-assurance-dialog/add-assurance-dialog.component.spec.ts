import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatNativeDateModule } from '@angular/material/core';
import { of } from 'rxjs';

import { AddAssuranceDialogComponent } from './add-assurance-dialog.component';
import { EnginService } from 'src/app/services/apps/engin/engin.service';
import { AssuranceEngin, StatutAssurance } from '../assurance-engin';
import { Engin } from '../../engin';

const mockEngins: Engin[] = [
  { id: 1, codeEngin: 'ENG-001', modelEngin: 'CAT 320' } as Engin,
  { id: 2, codeEngin: 'ENG-002', modelEngin: 'Volvo EC220' } as Engin,
];

const mockAssurance: AssuranceEngin = {
  id: 5,
  enginId: 1,
  numeroPolice: 'POL-001',
  compagnieAssurance: 'Allianz',
  dateDebut: '2024-01-01',
  dateFin: '2025-01-01',
  montant: 500000,
  statut: StatutAssurance.VALIDE,
  enginCode: 'ENG-001',
  enginModel: 'CAT 320',
};

function buildTestBed(data: AssuranceEngin | null) {
  const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
  const enginSpy     = jasmine.createSpyObj<EnginService>('EnginService', ['getEngins']);
  enginSpy.getEngins.and.returnValue(of(mockEngins));

  return TestBed.configureTestingModule({
    imports: [AddAssuranceDialogComponent, NoopAnimationsModule, MatNativeDateModule],
    providers: [
      { provide: MatDialogRef,    useValue: dialogRefSpy },
      { provide: MAT_DIALOG_DATA, useValue: data         },
      { provide: EnginService,    useValue: enginSpy     },
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
  }).compileComponents().then(() => ({ dialogRefSpy, enginSpy }));
}

describe('AddAssuranceDialogComponent – mode Ajout', () => {
  let component: AddAssuranceDialogComponent;
  let fixture: ComponentFixture<AddAssuranceDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<any>>;
  let enginSpy: jasmine.SpyObj<EnginService>;

  beforeEach(async () => {
    ({ dialogRefSpy, enginSpy } = await buildTestBed(null));
    fixture   = TestBed.createComponent(AddAssuranceDialogComponent);
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
    component.enginSearchCtrl.setValue('CAT');
    expect(component.filteredEngins.length).toBe(1);
    expect(component.filteredEngins[0].codeEngin).toBe('ENG-001');
  });

  it('selectEngin() devrait patcher enginId et mettre à jour le contrôle de recherche', () => {
    component.selectEngin(mockEngins[0]);
    expect(component.form.value.enginId).toBe(1);
    expect(component.enginSearchCtrl.value).toContain('ENG-001');
  });

  it('devrait être invalide à l\'initialisation', () => {
    expect(component.form.invalid).toBeTrue();
  });

  it('submit() ne devrait PAS fermer si le formulaire est invalide', () => {
    component.submit();
    expect(dialogRefSpy.close).not.toHaveBeenCalled();
  });

  it('submit() devrait fermer avec le payload si le formulaire est valide', () => {
    component.form.patchValue({
      enginId:            1,
      numeroPolice:       'POL-NEW',
      compagnieAssurance: 'AXA',
      dateDebut:          new Date('2024-01-01'),
      dateFin:            new Date('2025-01-01'),
      montant:            400000,
      statut:             StatutAssurance.VALIDE,
    });
    component.submit();
    expect(dialogRefSpy.close).toHaveBeenCalledWith(jasmine.objectContaining({
      enginId: 1,
      numeroPolice: 'POL-NEW',
    }));
  });

  it('cancel() devrait fermer avec null', () => {
    component.cancel();
    expect(dialogRefSpy.close).toHaveBeenCalledWith(null);
  });
});

describe('AddAssuranceDialogComponent – mode Édition', () => {
  let component: AddAssuranceDialogComponent;
  let fixture: ComponentFixture<AddAssuranceDialogComponent>;

  beforeEach(async () => {
    await buildTestBed(mockAssurance);
    fixture   = TestBed.createComponent(AddAssuranceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('isEdit devrait être true avec des données existantes', () => {
    expect(component.isEdit).toBeTrue();
  });

  it('devrait pré-remplir le formulaire avec les données existantes', () => {
    expect(component.form.value.compagnieAssurance).toBe('Allianz');
    expect(component.form.value.montant).toBe(500000);
  });

  it('devrait désactiver le champ numeroPolice en mode édition', () => {
    expect(component.form.get('numeroPolice')?.disabled).toBeTrue();
  });
});
