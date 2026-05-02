import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatNativeDateModule } from '@angular/material/core';
import { of, throwError } from 'rxjs';
import { TablerIconsModule } from 'angular-tabler-icons';

import { DetailsEnginsComponent } from './details-engins.component';
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

async function setup(routeId: string | null) {
  const enginSpy = jasmine.createSpyObj<EnginService>('EnginService', ['getEnginById']);
  enginSpy.getEnginById.and.returnValue(of(mockEngin));

  await TestBed.configureTestingModule({
    imports: [DetailsEnginsComponent, NoopAnimationsModule, MatNativeDateModule, RouterTestingModule.withRoutes([])],
    providers: [
      { provide: EnginService, useValue: enginSpy },
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => routeId } } } },
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
  })
  .overrideComponent(DetailsEnginsComponent, {
    remove: { imports: [TablerIconsModule] },
    add:    { schemas: [CUSTOM_ELEMENTS_SCHEMA] },
  })
  .compileComponents();

  const fixture   = TestBed.createComponent(DetailsEnginsComponent);
  const component = fixture.componentInstance;
  fixture.detectChanges();
  return { fixture, component, enginSpy };
}

describe('DetailsEnginsComponent – avec id en route', () => {
  let component: DetailsEnginsComponent;
  let enginSpy: jasmine.SpyObj<EnginService>;

  beforeEach(async () => {
    ({ component, enginSpy } = await setup('1'));
  });

  it('devrait être créé', () => expect(component).toBeTruthy());

  it('devrait appeler getEnginById avec l\'id numérique', () => {
    expect(enginSpy.getEnginById).toHaveBeenCalledWith(1);
  });

  it('devrait remplir local_data avec les données de l\'engin', () => {
    expect(component.local_data.codeEngin).toBe('ENG-001');
    expect(component.local_data.modelEngin).toBe('CAT 320');
  });

  it('devrait gérer silencieusement une erreur de chargement', () => {
    enginSpy.getEnginById.and.returnValue(throwError(() => new Error('500')));
    expect(() => component.ngOnInit()).not.toThrow();
  });
});

describe('DetailsEnginsComponent – sans id en route', () => {
  let component: DetailsEnginsComponent;
  let enginSpy: jasmine.SpyObj<EnginService>;

  beforeEach(async () => {
    ({ component, enginSpy } = await setup(null));
  });

  it('ne devrait PAS appeler getEnginById', () => {
    expect(enginSpy.getEnginById).not.toHaveBeenCalled();
  });
});
