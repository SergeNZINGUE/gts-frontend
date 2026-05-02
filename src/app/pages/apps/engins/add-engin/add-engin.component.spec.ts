import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { TablerIconsModule } from 'angular-tabler-icons';

import { MatNativeDateModule } from '@angular/material/core';

import { AddEnginComponent } from './add-engin.component';
import { EnginService } from 'src/app/services/apps/engin/engin.service';
import { Engin } from '../engin';

const mockEngin: Engin = {
  id: 1,
  codeEngin: 'ENG-001',
  modelEngin: 'CAT 320',
  anneeEngin: '2020',
  immatriculationEngin: 'AA-001-BB',
  typeEngin: 'Excavatrice',
  marqueEngin: 'Caterpillar',
  etatEngin: 1,
  statusEngin: 'ACTIF',
  typCarbtEngin: 'Diesel',
  dateAcqEngin: '2020-01-01',
  coutHorLocEngin: 5000,
  forfaitJournalierEngin: 40000,
  dateCreation: '2020-01-01',
  dateModification: '2020-01-01',
  poidsVide: 22000,
  horametre: 1500,
};

function makeServiceSpy() {
  const spy = jasmine.createSpyObj<EnginService>('EnginService', [
    'getEnginById', 'addEngin', 'updateEngin', 'getEngins',
  ]);
  spy.addEngin.and.returnValue(of(mockEngin));
  spy.updateEngin.and.returnValue(of(mockEngin));
  spy.getEnginById.and.returnValue(of(mockEngin));
  return spy;
}

async function setup(routeId: string | null) {
  const enginSpy = makeServiceSpy();

  await TestBed.configureTestingModule({
    imports: [AddEnginComponent, NoopAnimationsModule, MatNativeDateModule, RouterTestingModule.withRoutes([])],
    providers: [
      { provide: EnginService, useValue: enginSpy },
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => routeId } } } },
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
  })
  .overrideComponent(AddEnginComponent, {
    remove: { imports: [TablerIconsModule] },
    add:    { schemas: [CUSTOM_ELEMENTS_SCHEMA] },
  })
  .compileComponents();

  const fixture   = TestBed.createComponent(AddEnginComponent);
  const component = fixture.componentInstance;
  const routerSpy = spyOn(TestBed.inject(Router), 'navigate').and.returnValue(Promise.resolve(true));
  const snackSpy  = spyOn(component['snackBar'], 'open').and.callThrough();
  fixture.detectChanges();

  return { fixture, component, enginSpy, routerSpy, snackSpy };
}

// ── Mode Add ──────────────────────────────────────────────────────────────
describe('AddEnginComponent – mode Add', () => {
  let comp: AddEnginComponent;
  let enginSpy: jasmine.SpyObj<EnginService>;
  let routerSpy: jasmine.Spy;
  let snackSpy: jasmine.Spy;

  beforeEach(async () => {
    ({ component: comp, enginSpy, routerSpy, snackSpy } = await setup(null));
  });

  it('devrait être créé', () => expect(comp).toBeTruthy());

  it('devrait initialiser action à "Add"', () => {
    expect(comp.action).toBe('Add');
  });

  it('ne devrait PAS appeler getEnginById', () => {
    expect(enginSpy.getEnginById).not.toHaveBeenCalled();
  });

  it('devrait initialiser dateAcqEngin avec une valeur', () => {
    expect(comp.dateAcqEngin.value).toBeTruthy();
  });

  it('doAction() devrait appeler addEngin', () => {
    comp.doAction();
    expect(enginSpy.addEngin).toHaveBeenCalled();
  });

  it('devrait naviguer vers /apps/engins après ajout', () => {
    comp.doAction();
    expect(routerSpy).toHaveBeenCalledWith(['/apps/engins']);
  });

  it('devrait afficher un snack de succès après ajout', () => {
    comp.doAction();
    expect(snackSpy).toHaveBeenCalledWith('Engin ajouté avec succès', 'Close', jasmine.any(Object));
  });

  it('devrait afficher un snack d\'erreur si addEngin échoue', () => {
    enginSpy.addEngin.and.returnValue(throwError(() => new Error('500')));
    comp.doAction();
    expect(snackSpy).toHaveBeenCalledWith('Erreur', 'Close', jasmine.any(Object));
  });

  it('cancel() devrait naviguer vers /apps/engins', () => {
    comp.cancel();
    expect(routerSpy).toHaveBeenCalledWith(['/apps/engins']);
  });
});

// ── Mode Update ───────────────────────────────────────────────────────────
describe('AddEnginComponent – mode Update', () => {
  let comp: AddEnginComponent;
  let enginSpy: jasmine.SpyObj<EnginService>;
  let routerSpy: jasmine.Spy;
  let snackSpy: jasmine.Spy;

  beforeEach(async () => {
    ({ component: comp, enginSpy, routerSpy, snackSpy } = await setup('1'));
  });

  it('devrait initialiser action à "Update"', () => {
    expect(comp.action).toBe('Update');
  });

  it('devrait appeler getEnginById avec l\'id numérique', () => {
    expect(enginSpy.getEnginById).toHaveBeenCalledWith(1);
  });

  it('devrait remplir local_data avec l\'engin chargé', () => {
    expect(comp.local_data.codeEngin).toBe('ENG-001');
  });

  it('doAction() devrait appeler updateEngin avec l\'id et les données', () => {
    comp.doAction();
    expect(enginSpy.updateEngin).toHaveBeenCalledWith(1, jasmine.any(Object));
  });

  it('devrait naviguer vers /apps/engins après modification', () => {
    comp.doAction();
    expect(routerSpy).toHaveBeenCalledWith(['/apps/engins']);
  });

  it('devrait afficher un snack de succès après modification', () => {
    comp.doAction();
    expect(snackSpy).toHaveBeenCalledWith('Engin modifié avec succès !', 'Close', jasmine.any(Object));
  });

  it('devrait afficher un snack d\'erreur si updateEngin échoue', () => {
    enginSpy.updateEngin.and.returnValue(throwError(() => new Error('500')));
    comp.doAction();
    expect(snackSpy).toHaveBeenCalledWith('Erreur lors de la modification', 'Close', jasmine.any(Object));
  });
});
