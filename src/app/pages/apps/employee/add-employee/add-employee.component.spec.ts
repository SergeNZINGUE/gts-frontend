import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

import { AddEmployeeComponent } from './add-employee.component';
import { EmployeeService } from 'src/app/services/apps/employee/employee.service';
import { CoreService } from 'src/app/services/core.service';
import { FileUploadComponent } from 'src/app/utils/file-upload/file-upload.component';

const coreServiceStub = {
  todayOrFutureDateValidator: () => () => null,
  pastDateValidator:          () => () => null,
  futureDateValidator:        () => () => null,
  formatLocalDate: (date: any) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  },
};

const VALID_FORM = {
  codeConducteur:   'COND-001',
  nomConducteur:    'Dupont',
  prenomsConducteur:'Jean',
  dateNaissance:    '',
  telephone:        '0600000000',
  cniRef:           '',
  cniDateEmi:       '',
  cniLieuEtab:      '',
  cniDateExp:       '',
  permisCond:       'B',
  qualifications:   '',
  typEmpl:          'CDI',
  statutConducteur: '1',
  dateDebutEmp:     new Date('2024-01-01'),
};

describe('AddEmployeeComponent', () => {
  let component: AddEmployeeComponent;
  let fixture: ComponentFixture<AddEmployeeComponent>;
  let employeeSpy: jasmine.SpyObj<EmployeeService>;
  let routerSpy: jasmine.Spy;
  let snackSpy: jasmine.Spy;

  beforeEach(async () => {
    employeeSpy = jasmine.createSpyObj<EmployeeService>('EmployeeService', ['createEmployee']);
    employeeSpy.createEmployee.and.returnValue(of({} as any));

    await TestBed.configureTestingModule({
      imports: [AddEmployeeComponent, NoopAnimationsModule, RouterTestingModule.withRoutes([])],
      providers: [
        { provide: EmployeeService, useValue: employeeSpy },
        { provide: CoreService, useValue: coreServiceStub },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .overrideComponent(AddEmployeeComponent, {
      remove: { imports: [FileUploadComponent] },
      add:    { schemas: [CUSTOM_ELEMENTS_SCHEMA] },
    })
    .compileComponents();

    fixture   = TestBed.createComponent(AddEmployeeComponent);
    component = fixture.componentInstance;
    routerSpy = spyOn(TestBed.inject(Router), 'navigate').and.returnValue(Promise.resolve(true));
    snackSpy  = spyOn(component['snackBar'], 'open').and.callThrough();
    fixture.detectChanges();
  });

  it('devrait être créé', () => expect(component).toBeTruthy());

  // ── Formulaire ────────────────────────────────────────────────────────
  describe('form', () => {
    it('devrait être invalide à l\'initialisation (champs requis vides)', () => {
      expect(component.form.invalid).toBeTrue();
    });

    it('devrait être valide après remplissage des champs requis', () => {
      component.form.patchValue(VALID_FORM);
      expect(component.form.valid).toBeTrue();
    });
  });

  // ── submit() ──────────────────────────────────────────────────────────
  describe('submit()', () => {
    it('ne devrait PAS appeler createEmployee si le formulaire est invalide', () => {
      component.submit();
      expect(employeeSpy.createEmployee).not.toHaveBeenCalled();
    });

    it('devrait marquer tous les contrôles comme touchés si le formulaire est invalide', () => {
      component.submit();
      expect(component.form.touched).toBeTrue();
    });

    it('devrait appeler createEmployee avec un FormData si le formulaire est valide', () => {
      component.form.patchValue(VALID_FORM);
      component.submit();
      expect(employeeSpy.createEmployee).toHaveBeenCalledWith(jasmine.any(FormData));
    });

    it('devrait passer isSubmitting à false après succès', () => {
      component.form.patchValue(VALID_FORM);
      component.submit();
      expect(component.isSubmitting).toBeFalse();
    });

    it('devrait afficher un snack de succès après ajout', () => {
      component.form.patchValue(VALID_FORM);
      component.submit();
      expect(snackSpy).toHaveBeenCalledWith('Conducteur ajouté avec succès', 'Close', jasmine.any(Object));
    });

    it('devrait naviguer vers /apps/employee après succès', () => {
      component.form.patchValue(VALID_FORM);
      component.submit();
      expect(routerSpy).toHaveBeenCalledWith(['/apps/employee']);
    });

    it('devrait afficher un snack d\'erreur si createEmployee échoue', () => {
      employeeSpy.createEmployee.and.returnValue(throwError(() => new Error('500')));
      component.form.patchValue(VALID_FORM);
      component.submit();
      expect(snackSpy).toHaveBeenCalledWith(jasmine.stringContaining('Erreur'), jasmine.any(String), jasmine.any(Object));
    });

    it('devrait passer isSubmitting à false en cas d\'erreur', () => {
      employeeSpy.createEmployee.and.returnValue(throwError(() => new Error('500')));
      component.form.patchValue(VALID_FORM);
      component.submit();
      expect(component.isSubmitting).toBeFalse();
    });
  });

  // ── onPhotoSelected() ─────────────────────────────────────────────────
  describe('onPhotoSelected()', () => {
    it('devrait définir photoFile avec un File', () => {
      const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
      component.onPhotoSelected(file);
      expect(component.photoFile).toBe(file);
    });

    it('devrait mettre photoFile à null si null est passé', () => {
      component.onPhotoSelected(null);
      expect(component.photoFile).toBeNull();
    });
  });
});
