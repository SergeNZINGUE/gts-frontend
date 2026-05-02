import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

import { AddClientComponent } from './add-client.component';
import { ClientsService } from 'src/app/services/apps/clients/clients.service';
import { ActiviteClientService } from 'src/app/services/apps/activite-client/activite-client.service';
import { CoreService } from 'src/app/services/core.service';
import { FileUploadComponent } from 'src/app/utils/file-upload/file-upload.component';
import { ActiviteClient } from '../activite-client/activite-client';

const coreServiceStub = {
  todayOrFutureDateValidator: () => () => null,
  pastDateValidator:          () => () => null,
  futureDateValidator:        () => () => null,
  formatLocalDate: (date: any) => date ? '2024-01-01' : '',
};

const mockActivites: ActiviteClient[] = [
  { id: 1, codeActClt: 'BTP', description: 'BTP' },
  { id: 2, codeActClt: 'MINE', description: 'Mines' },
];

const VALID_FORM = {
  codeClient:              'CLI-001',
  nameClient:              'Acme Corp',
  descriptionEntreprise:   '',
  designationEntreprise:   'SARL',
  paysEntreprise:          'CI',
  email:                   '',
  phoneNumber:             '0600000000',
  personneRessource:       '',
  telPersonneRessource:    '',
  adresseEntreprise:       '',
  rccmClient:              '',
  numeroIFUEntreprise:     '',
  regimeFiscalEntreprise:  '',
  numeroCompteBancaire:    '',
  dateCreation:            '',
  activiteClient:          { id: 1 },
};

describe('AddClientComponent', () => {
  let component: AddClientComponent;
  let fixture: ComponentFixture<AddClientComponent>;
  let clientsSpy: jasmine.SpyObj<ClientsService>;
  let activiteSpy: jasmine.SpyObj<ActiviteClientService>;
  let routerSpy: jasmine.Spy;
  let snackSpy: jasmine.Spy;

  beforeEach(async () => {
    clientsSpy  = jasmine.createSpyObj<ClientsService>('ClientsService', ['createClient']);
    activiteSpy = jasmine.createSpyObj<ActiviteClientService>('ActiviteClientService', ['getActiviteClient']);
    clientsSpy.createClient.and.returnValue(of({} as any));
    activiteSpy.getActiviteClient.and.returnValue(of(mockActivites));

    await TestBed.configureTestingModule({
      imports: [AddClientComponent, NoopAnimationsModule, RouterTestingModule.withRoutes([])],
      providers: [
        { provide: ClientsService,        useValue: clientsSpy  },
        { provide: ActiviteClientService, useValue: activiteSpy },
        { provide: CoreService,           useValue: coreServiceStub },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .overrideComponent(AddClientComponent, {
      remove: { imports: [FileUploadComponent] },
      add:    { schemas: [CUSTOM_ELEMENTS_SCHEMA] },
    })
    .compileComponents();

    fixture   = TestBed.createComponent(AddClientComponent);
    component = fixture.componentInstance;
    routerSpy = spyOn(TestBed.inject(Router), 'navigate').and.returnValue(Promise.resolve(true));
    snackSpy  = spyOn(component['snackBar'], 'open').and.callThrough();
    fixture.detectChanges();
  });

  it('devrait être créé', () => expect(component).toBeTruthy());

  // ── ngOnInit ──────────────────────────────────────────────────────────
  describe('ngOnInit()', () => {
    it('devrait appeler getActiviteClient au chargement', () => {
      expect(activiteSpy.getActiviteClient).toHaveBeenCalledTimes(1);
    });

    it('devrait remplir activiteClient', () => {
      expect(component.activiteClient.length).toBe(2);
    });
  });

  // ── Formulaire ────────────────────────────────────────────────────────
  describe('form', () => {
    it('devrait être invalide à l\'initialisation', () => {
      expect(component.form.invalid).toBeTrue();
    });

    it('devrait être valide après remplissage des champs requis', () => {
      component.form.patchValue(VALID_FORM);
      expect(component.form.valid).toBeTrue();
    });
  });

  // ── submit() ──────────────────────────────────────────────────────────
  describe('submit()', () => {
    it('ne devrait PAS appeler createClient si le formulaire est invalide', () => {
      component.submit();
      expect(clientsSpy.createClient).not.toHaveBeenCalled();
    });

    it('devrait appeler createClient avec un FormData si valide', () => {
      component.form.patchValue(VALID_FORM);
      component.submit();
      expect(clientsSpy.createClient).toHaveBeenCalledWith(jasmine.any(FormData));
    });

    it('devrait afficher un snack de succès après ajout', () => {
      component.form.patchValue(VALID_FORM);
      component.submit();
      expect(snackSpy).toHaveBeenCalledWith('Client ajouté avec succès', 'Close', jasmine.any(Object));
    });

    it('devrait naviguer vers /apps/clients après succès', () => {
      component.form.patchValue(VALID_FORM);
      component.submit();
      expect(routerSpy).toHaveBeenCalledWith(['/apps/clients']);
    });

    it('devrait passer isSubmitting à false après succès', () => {
      component.form.patchValue(VALID_FORM);
      component.submit();
      expect(component.isSubmitting).toBeFalse();
    });

    it('devrait afficher un snack d\'erreur si createClient échoue', () => {
      clientsSpy.createClient.and.returnValue(throwError(() => new Error('500')));
      component.form.patchValue(VALID_FORM);
      component.submit();
      expect(snackSpy).toHaveBeenCalledWith(jasmine.stringContaining('Erreur'), jasmine.any(String), jasmine.any(Object));
    });

    it('devrait passer isSubmitting à false en cas d\'erreur', () => {
      clientsSpy.createClient.and.returnValue(throwError(() => new Error('500')));
      component.form.patchValue(VALID_FORM);
      component.submit();
      expect(component.isSubmitting).toBeFalse();
    });
  });

  // ── onPhotoSelected() ─────────────────────────────────────────────────
  describe('onPhotoSelected()', () => {
    it('devrait définir logoFile avec un File', () => {
      const file = new File(['content'], 'logo.png', { type: 'image/png' });
      component.onPhotoSelected(file);
      expect(component.logoFile).toBe(file);
    });

    it('devrait mettre logoFile à null si null est passé', () => {
      component.onPhotoSelected(null);
      expect(component.logoFile).toBeNull();
    });
  });
});
