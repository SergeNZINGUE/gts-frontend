import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatNativeDateModule } from '@angular/material/core';
import { of } from 'rxjs';
import { TablerIconsModule } from 'angular-tabler-icons';

import { DetailsClientComponent } from './details-client.component';
import { ClientsService } from 'src/app/services/apps/clients/clients.service';
import { Client } from '../client';
import { LogoClientResponse } from './logoClientResponse';

const mockLocations = [
  { codeLocation: 'LOC-001', statut: 'VALIDEE',    enginCode: 'ENG-001', siteLocation: 'Cotonou', conducteurNom: 'Dupont' },
  { codeLocation: 'LOC-002', statut: 'EN ATTENTE',  enginCode: 'ENG-002', siteLocation: 'Abidjan', conducteurNom: 'Martin' },
  { codeLocation: 'LOC-003', statut: 'TERMINEE',    enginCode: 'ENG-001', siteLocation: 'Lomé',    conducteurNom: 'Koné'   },
];

const mockClient: Client = {
  id: 1,
  nameClient: 'Acme Corp',
  locations: mockLocations as any,
};

const mockLogo: LogoClientResponse = { id: 1, cheminLogoEntreprise: '/logos/acme.png' };

describe('DetailsClientComponent', () => {
  let component: DetailsClientComponent;
  let fixture: ComponentFixture<DetailsClientComponent>;
  let clientSpy: jasmine.SpyObj<ClientsService>;

  beforeEach(async () => {
    clientSpy = jasmine.createSpyObj<ClientsService>('ClientsService', ['getClientById', 'getImages']);
    clientSpy.getClientById.and.returnValue(of(mockClient));
    clientSpy.getImages.and.returnValue(of(mockLogo));

    await TestBed.configureTestingModule({
      imports: [DetailsClientComponent, NoopAnimationsModule, MatNativeDateModule, RouterTestingModule.withRoutes([])],
      providers: [
        { provide: ClientsService, useValue: clientSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .overrideComponent(DetailsClientComponent, {
      remove: { imports: [TablerIconsModule] },
      add:    { schemas: [CUSTOM_ELEMENTS_SCHEMA] },
    })
    .compileComponents();

    fixture   = TestBed.createComponent(DetailsClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('devrait être créé', () => expect(component).toBeTruthy());

  // ── ngOnInit ──────────────────────────────────────────────────────────
  describe('ngOnInit()', () => {
    it('devrait définir l\'id depuis les paramètres de route', () => {
      expect(component.id()).toBe(1);
    });

    it('devrait appeler getClientById', () => {
      expect(clientSpy.getClientById).toHaveBeenCalledWith(1, 0, 10);
    });

    it('devrait charger les locations dans le dataSource', () => {
      expect(component.locationsDataSource.data.length).toBe(3);
    });

    it('devrait appeler getImages pour le logo', () => {
      expect(clientSpy.getImages).toHaveBeenCalledWith(1);
    });

    it('devrait définir images après chargement du logo', () => {
      expect(component.images).toEqual(mockLogo);
    });
  });

  // ── Filtres ───────────────────────────────────────────────────────────
  describe('applySearch()', () => {
    it('devrait filtrer les locations par codeLocation', () => {
      component.applySearch('LOC-001');
      expect(component.locationsDataSource.filteredData.length).toBe(1);
    });

    it('devrait filtrer par conducteurNom', () => {
      component.applySearch('Dupont');
      expect(component.locationsDataSource.filteredData.length).toBe(1);
    });

    it('devrait retourner toutes les locations si la recherche est vide', () => {
      component.applySearch('');
      expect(component.locationsDataSource.filteredData.length).toBe(3);
    });
  });

  describe('applyStatusFilter()', () => {
    it('devrait filtrer par statut VALIDEE', () => {
      component.applyStatusFilter('VALIDEE');
      expect(component.locationsDataSource.filteredData.length).toBe(1);
      expect((component.locationsDataSource.filteredData[0] as any).statut).toBe('VALIDEE');
    });

    it('All devrait retourner toutes les locations', () => {
      component.applyStatusFilter('VALIDEE');
      component.applyStatusFilter('All');
      expect(component.locationsDataSource.filteredData.length).toBe(3);
    });
  });

  describe('clearFilters()', () => {
    it('devrait réinitialiser searchText et selectedStatus', () => {
      component.applySearch('LOC-001');
      component.applyStatusFilter('VALIDEE');
      component.clearFilters();
      expect(component.searchText).toBe('');
      expect(component.selectedStatus).toBe('All');
      expect(component.locationsDataSource.filteredData.length).toBe(3);
    });
  });
});
