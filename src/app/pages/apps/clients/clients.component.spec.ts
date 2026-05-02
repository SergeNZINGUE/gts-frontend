import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';
import { of, EMPTY, throwError } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';

import { ClientsComponent } from './clients.component';
import { ClientsService } from 'src/app/services/apps/clients/clients.service';
import { Client } from './client';

const clientBase: Client = {
  id: 1,
  codeClient: '',
  nameClient: '',
  email: '',
  phoneNumber: '',
};

const mockClients: Client[] = [
  { ...clientBase, id: 1, codeClient: 'CLI-001', nameClient: 'Acme Corp' },
  { ...clientBase, id: 2, codeClient: 'CLI-002', nameClient: 'Beta SARL' },
  { ...clientBase, id: 3, codeClient: 'CLI-003', nameClient: 'Gamma SA' },
];

describe('ClientsComponent', () => {
  let component: ClientsComponent;
  let fixture: ComponentFixture<ClientsComponent>;
  let clientServiceSpy: jasmine.SpyObj<ClientsService>;
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
    clientServiceSpy = jasmine.createSpyObj<ClientsService>('ClientsService', [
      'getClients', 'deleteClient',
    ]);
    clientServiceSpy.getClients.and.returnValue(of([...mockClients]));
    clientServiceSpy.deleteClient.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [ClientsComponent, NoopAnimationsModule, RouterTestingModule.withRoutes([])],
      providers: [{ provide: ClientsService, useValue: clientServiceSpy }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .overrideComponent(ClientsComponent, {
      remove: { imports: [TablerIconsModule] },
      add:    { schemas: [CUSTOM_ELEMENTS_SCHEMA] },
    })
    .compileComponents();

    fixture   = TestBed.createComponent(ClientsComponent);
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
  describe('loadClients()', () => {
    it('devrait appeler getClients() à l\'initialisation', () => {
      expect(clientServiceSpy.getClients).toHaveBeenCalledTimes(1);
    });

    it('devrait remplir le dataSource avec les clients retournés', () => {
      expect(component.dataSource.data.length).toBe(3);
      expect(component.dataSource.data[0].codeClient).toBe('CLI-001');
    });

    it('devrait passer isLoading à false après succès', () => {
      expect(component.isLoading).toBeFalse();
    });

    it('devrait passer isLoading à false en cas d\'erreur', () => {
      clientServiceSpy.getClients.and.returnValue(throwError(() => new Error('500')));
      component.loadClients();
      expect(component.isLoading).toBeFalse();
    });

    it('devrait afficher un snack en cas d\'erreur API', () => {
      clientServiceSpy.getClients.and.returnValue(throwError(() => new Error('500')));
      component.loadClients();
      expect(snackBarOpenSpy).toHaveBeenCalledWith(
        'Erreur de chargement des clients', 'Fermer', jasmine.any(Object),
      );
    });
  });

  // ── Getter ────────────────────────────────────────────────────────────
  describe('getters', () => {
    it('total devrait retourner le nombre total de clients', () => {
      expect(component.total).toBe(3);
    });
  });

  // ── Filtre ────────────────────────────────────────────────────────────
  describe('applyFilter()', () => {
    it('devrait transmettre la valeur en minuscules sans espaces', () => {
      component.applyFilter('  ACME  ');
      expect(component.dataSource.filter).toBe('acme');
    });

    it('devrait vider le filtre si la chaîne est vide', () => {
      component.applyFilter('acme');
      component.applyFilter('');
      expect(component.dataSource.filter).toBe('');
    });
  });

  // ── Navigation ────────────────────────────────────────────────────────
  describe('goToDetails()', () => {
    it('devrait naviguer vers /apps/clients/details-client/{id}', () => {
      component.goToDetails(7);
      expect(navigateSpy).toHaveBeenCalledWith(['/apps/clients/details-client', 7]);
    });

    it('ne devrait PAS naviguer si id est undefined', () => {
      component.goToDetails(undefined);
      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });

  // ── Suppression ───────────────────────────────────────────────────────
  describe('confirmDelete()', () => {
    it('devrait appeler deleteClient avec l\'id après confirmation', () => {
      const event = new MouseEvent('click');
      component.confirmDelete(mockClients[0], event);
      actionSubject.next();
      expect(clientServiceSpy.deleteClient).toHaveBeenCalledWith(1);
    });

    it('devrait recharger la liste après suppression réussie', () => {
      clientServiceSpy.getClients.calls.reset();
      const event = new MouseEvent('click');
      component.confirmDelete(mockClients[0], event);
      actionSubject.next();
      expect(clientServiceSpy.getClients).toHaveBeenCalledTimes(1);
    });

    it('devrait afficher un snack de succès après suppression', () => {
      snackBarOpenSpy.calls.reset();
      const event = new MouseEvent('click');
      component.confirmDelete(mockClients[0], event);
      actionSubject.next();
      expect(snackBarOpenSpy).toHaveBeenCalledWith('Client supprimé', 'Fermer', jasmine.any(Object));
    });

    it('ne devrait PAS appeler deleteClient si l\'utilisateur annule', () => {
      const event = new MouseEvent('click');
      component.confirmDelete(mockClients[0], event);
      expect(clientServiceSpy.deleteClient).not.toHaveBeenCalled();
    });

    it('ne devrait PAS ouvrir le snack si client.id est absent', () => {
      snackBarOpenSpy.calls.reset();
      const event = new MouseEvent('click');
      component.confirmDelete({ ...clientBase, id: undefined }, event);
      expect(snackBarOpenSpy).not.toHaveBeenCalled();
    });

    it('devrait afficher un snack d\'erreur si deleteClient échoue', () => {
      clientServiceSpy.deleteClient.and.returnValue(throwError(() => new Error('500')));
      snackBarOpenSpy.calls.reset();
      const event = new MouseEvent('click');
      component.confirmDelete(mockClients[0], event);
      actionSubject.next();
      expect(snackBarOpenSpy).toHaveBeenCalledWith(
        'Erreur lors de la suppression', 'Fermer', jasmine.any(Object),
      );
    });
  });
});
