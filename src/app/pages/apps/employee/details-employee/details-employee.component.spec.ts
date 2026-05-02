import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatNativeDateModule } from '@angular/material/core';
import { of } from 'rxjs';
import { TablerIconsModule } from 'angular-tabler-icons';

import { DetailsEmployeeComponent } from './details-employee.component';
import { EmployeeService } from 'src/app/services/apps/employee/employee.service';
import { ConducteurImagesResponse } from '../conducterImagesResponse';

const mockMissions = [
  { codeMission: 'M-001', statutMission: 'EN_COURS',  lieuMission: 'Cotonou',  nbHeures: 8,  descriptionMission: 'Terrassement' },
  { codeMission: 'M-002', statutMission: 'TERMINEE',  lieuMission: 'Abidjan',  nbHeures: 6,  descriptionMission: 'Déblayage'    },
  { codeMission: 'M-003', statutMission: 'EN_COURS',  lieuMission: 'Lomé',     nbHeures: 10, descriptionMission: 'Transport'    },
];

const mockConducteurDetails = {
  conducteurId: 1,
  codeConducteur: 100,
  nomConducteur: 'Dupont',
  prenomsConducteur: 'Jean',
  telephone: '0600000000',
  permisCond: 'B',
  qualifications: '',
  statutConducteur: 'ACTIF',
  nombreMissions: 3,
  dateDebutEmp: new Date('2022-01-01'),
  dateFinEmp: null,
  dateNaissance: new Date('1985-06-15'),
  typEmpl: 'CDI',
  page: 0,
  size: 10,
  totalPages: 1,
  missions: mockMissions,
};

const mockImages: ConducteurImagesResponse = {
  conducteurId: 1,
  imgCniUrl: '/images/cni.jpg',
  imgConducteurUrl: '/images/photo.jpg',
  imgPermisUrl: '/images/permis.jpg',
};

describe('DetailsEmployeeComponent', () => {
  let component: DetailsEmployeeComponent;
  let fixture: ComponentFixture<DetailsEmployeeComponent>;
  let employeeSpy: jasmine.SpyObj<EmployeeService>;

  beforeEach(async () => {
    employeeSpy = jasmine.createSpyObj<EmployeeService>('EmployeeService', ['getEmployeesById', 'getImages']);
    employeeSpy.getEmployeesById.and.returnValue(of(mockConducteurDetails));
    employeeSpy.getImages.and.returnValue(of(mockImages));

    await TestBed.configureTestingModule({
      imports: [DetailsEmployeeComponent, NoopAnimationsModule, MatNativeDateModule, RouterTestingModule.withRoutes([])],
      providers: [
        { provide: EmployeeService, useValue: employeeSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .overrideComponent(DetailsEmployeeComponent, {
      remove: { imports: [TablerIconsModule] },
      add:    { schemas: [CUSTOM_ELEMENTS_SCHEMA] },
    })
    .compileComponents();

    fixture   = TestBed.createComponent(DetailsEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('devrait être créé', () => expect(component).toBeTruthy());

  // ── ngOnInit ──────────────────────────────────────────────────────────
  describe('ngOnInit()', () => {
    it('devrait définir l\'id depuis les paramètres de route', () => {
      expect(component.id()).toBe(1);
    });

    it('devrait appeler getEmployeesById', () => {
      expect(employeeSpy.getEmployeesById).toHaveBeenCalledWith(1, 0, 10);
    });

    it('devrait charger les missions dans le dataSource', () => {
      expect(component.missionsDataSource.data.length).toBe(3);
    });

    it('devrait appeler getImages', () => {
      expect(employeeSpy.getImages).toHaveBeenCalledWith(1);
    });

    it('devrait définir images après chargement', () => {
      expect(component.images).toEqual(mockImages);
    });
  });

  // ── Filtres ───────────────────────────────────────────────────────────
  describe('applySearch()', () => {
    it('devrait filtrer par codeMission', () => {
      component.applySearch('M-001');
      expect(component.missionsDataSource.filteredData.length).toBe(1);
    });

    it('devrait filtrer par lieuMission', () => {
      component.applySearch('Abidjan');
      expect(component.missionsDataSource.filteredData.length).toBe(1);
    });

    it('devrait retourner toutes les missions si la recherche est vide', () => {
      component.applySearch('');
      expect(component.missionsDataSource.filteredData.length).toBe(3);
    });
  });

  describe('applyStatusFilter()', () => {
    it('devrait filtrer par statut TERMINEE', () => {
      component.applyStatusFilter('TERMINEE');
      expect(component.missionsDataSource.filteredData.length).toBe(1);
      expect((component.missionsDataSource.filteredData[0] as any).statutMission).toBe('TERMINEE');
    });

    it('All devrait retourner toutes les missions', () => {
      component.applyStatusFilter('TERMINEE');
      component.applyStatusFilter('All');
      expect(component.missionsDataSource.filteredData.length).toBe(3);
    });
  });

  describe('clearFilters()', () => {
    it('devrait réinitialiser searchText et selectedStatus', () => {
      component.applySearch('M-001');
      component.applyStatusFilter('TERMINEE');
      component.clearFilters();
      expect(component.searchText).toBe('');
      expect(component.selectedStatus).toBe('All');
      expect(component.missionsDataSource.filteredData.length).toBe(3);
    });
  });
});
