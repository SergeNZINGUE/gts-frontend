import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';
import { of, EMPTY, throwError } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';

import { AppEmployeeComponent } from './employee.component';
import { EmployeeService } from 'src/app/services/apps/employee/employee.service';
import { Employee } from './employee';

const empBase: Employee = {
  id: 1,
  codeConducteur: '',
  nomConducteur: '',
  prenomsConducteur: '',
  typEmpl: 'CDI',
  telephone: '',
  qualifications: '',
  permisCond: '',
  statutConducteur: 1,
  dateCreation: new Date('2024-01-01'),
  dateDebutEmp: new Date('2024-01-01'),
  dateFinEmp: new Date('2026-01-01'),
  dateModification: new Date('2024-01-01'),
  imgCni: '', imgConducteur: '', imgPermis: '',
  cniDateEmi: new Date('2020-01-01'), cniDateExp: new Date('2030-01-01'),
  cniLieuEtab: '', cniRef: '',
};

const mockEmployees: Employee[] = [
  { ...empBase, id: 1, codeConducteur: 'COND-001', nomConducteur: 'Diallo', prenomsConducteur: 'Amadou' },
  { ...empBase, id: 2, codeConducteur: 'COND-002', nomConducteur: 'Balde',  prenomsConducteur: 'Ibrahima' },
  { ...empBase, id: 3, codeConducteur: 'COND-003', nomConducteur: 'Koné',   prenomsConducteur: 'Seydou' },
];

describe('AppEmployeeComponent', () => {
  let component: AppEmployeeComponent;
  let fixture: ComponentFixture<AppEmployeeComponent>;
  let employeeServiceSpy: jasmine.SpyObj<EmployeeService>;
  let navigateSpy: jasmine.Spy;
  let snackBarOpenSpy: jasmine.Spy;
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
    employeeServiceSpy = jasmine.createSpyObj<EmployeeService>('EmployeeService', [
      'getEmployees', 'deleteEmployee',
    ]);
    employeeServiceSpy.getEmployees.and.returnValue(of([...mockEmployees]));
    employeeServiceSpy.deleteEmployee.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [AppEmployeeComponent, NoopAnimationsModule, RouterTestingModule.withRoutes([])],
      providers: [{ provide: EmployeeService, useValue: employeeServiceSpy }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .overrideComponent(AppEmployeeComponent, {
      remove: { imports: [TablerIconsModule] },
      add:    { schemas: [CUSTOM_ELEMENTS_SCHEMA] },
    })
    .compileComponents();

    fixture   = TestBed.createComponent(AppEmployeeComponent);
    component = fixture.componentInstance;

    navigateSpy = spyOn(TestBed.inject(Router), 'navigate')
      .and.returnValue(Promise.resolve(true));

    actionSubject   = new Subject<void>();
    snackBarOpenSpy = spyOn(component['snackBar'], 'open')
      .and.returnValue(makeSnackBarRef());

    fixture.detectChanges();
  });

  it('devrait être créé', () => expect(component).toBeTruthy());

  // ── Chargement ────────────────────────────────────────────────────────
  describe('loadEmployees()', () => {
    it('devrait appeler getEmployees() à l\'initialisation', () => {
      expect(employeeServiceSpy.getEmployees).toHaveBeenCalledTimes(1);
    });

    it('devrait remplir le dataSource avec les conducteurs retournés', () => {
      expect(component.dataSource.data.length).toBe(3);
      expect(component.dataSource.data[0].codeConducteur).toBe('COND-001');
    });

    it('devrait passer isLoading à false après succès', () => {
      expect(component.isLoading).toBeFalse();
    });

    it('devrait passer isLoading à false en cas d\'erreur', () => {
      employeeServiceSpy.getEmployees.and.returnValue(throwError(() => new Error('500')));
      component.loadEmployees();
      expect(component.isLoading).toBeFalse();
    });

    it('devrait afficher un snack en cas d\'erreur API', () => {
      employeeServiceSpy.getEmployees.and.returnValue(throwError(() => new Error('500')));
      component.loadEmployees();
      expect(snackBarOpenSpy).toHaveBeenCalledWith(
        'Erreur de chargement des conducteurs', 'Fermer', jasmine.any(Object),
      );
    });
  });

  // ── Getter ────────────────────────────────────────────────────────────
  describe('getters', () => {
    it('total devrait retourner le nombre total de conducteurs', () => {
      expect(component.total).toBe(3);
    });
  });

  // ── Filtre ────────────────────────────────────────────────────────────
  describe('applyFilter()', () => {
    it('devrait transmettre la valeur en minuscules sans espaces', () => {
      component.applyFilter('  DIALLO  ');
      expect(component.dataSource.filter).toBe('diallo');
    });

    it('devrait vider le filtre si la chaîne est vide', () => {
      component.applyFilter('diallo');
      component.applyFilter('');
      expect(component.dataSource.filter).toBe('');
    });
  });

  // ── Navigation ────────────────────────────────────────────────────────
  describe('goToDetails()', () => {
    it('devrait naviguer vers /apps/employee/details-employee/{id}', () => {
      component.goToDetails(5);
      expect(navigateSpy).toHaveBeenCalledWith(['/apps/employee/details-employee', 5]);
    });
  });

  // ── Suppression ───────────────────────────────────────────────────────
  describe('confirmDelete()', () => {
    it('devrait appeler deleteEmployee avec l\'id après confirmation', () => {
      const event = new MouseEvent('click');
      component.confirmDelete(mockEmployees[0], event);
      actionSubject.next();
      expect(employeeServiceSpy.deleteEmployee).toHaveBeenCalledWith(1);
    });

    it('devrait recharger la liste après suppression réussie', () => {
      employeeServiceSpy.getEmployees.calls.reset();
      const event = new MouseEvent('click');
      component.confirmDelete(mockEmployees[0], event);
      actionSubject.next();
      expect(employeeServiceSpy.getEmployees).toHaveBeenCalledTimes(1);
    });

    it('devrait afficher un snack de succès après suppression', () => {
      snackBarOpenSpy.calls.reset();
      const event = new MouseEvent('click');
      component.confirmDelete(mockEmployees[0], event);
      actionSubject.next();
      expect(snackBarOpenSpy).toHaveBeenCalledWith('Conducteur supprimé', 'Fermer', jasmine.any(Object));
    });

    it('ne devrait PAS appeler deleteEmployee si l\'utilisateur annule', () => {
      const event = new MouseEvent('click');
      component.confirmDelete(mockEmployees[0], event);
      expect(employeeServiceSpy.deleteEmployee).not.toHaveBeenCalled();
    });

    it('devrait afficher un snack d\'erreur si deleteEmployee échoue', () => {
      employeeServiceSpy.deleteEmployee.and.returnValue(throwError(() => new Error('500')));
      snackBarOpenSpy.calls.reset();
      const event = new MouseEvent('click');
      component.confirmDelete(mockEmployees[0], event);
      actionSubject.next();
      expect(snackBarOpenSpy).toHaveBeenCalledWith(
        'Erreur lors de la suppression', 'Fermer', jasmine.any(Object),
      );
    });
  });
});
