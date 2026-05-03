import { environment } from '../../../environments/environment';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { EmployeeService } from './employee.service';
import { Employee } from 'src/app/pages/apps/employee/employee';

const API_URL = environment.apiUrl + '/api/gts/conducteurs';
const FAKE_TOKEN = 'fake-jwt-token';

const mockEmployee: Employee = {
  id: 1,
  codeConducteur: 'COND-001',
  nomConducteur: 'Diallo',
  prenomsConducteur: 'Amadou',
  typEmpl: 'CDI',
  telephone: '0600000001',
  qualifications: 'Chauffeur PL',
  permisCond: 'B,C',
  statutConducteur: 1,
  dateCreation: new Date('2024-01-01'),
  dateDebutEmp: new Date('2024-01-01'),
  dateFinEmp: new Date('2026-01-01'),
  dateModification: new Date('2024-01-01'),
  imgCni: '',
  imgConducteur: '',
  imgPermis: '',
  cniDateEmi: new Date('2020-01-01'),
  cniDateExp: new Date('2030-01-01'),
  cniLieuEtab: 'Cotonou',
  cniRef: 'CNI-001',
};

describe('EmployeeService', () => {
  let service: EmployeeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service  = TestBed.inject(EmployeeService);
    httpMock = TestBed.inject(HttpTestingController);
    spyOn(localStorage, 'getItem').and.returnValue(FAKE_TOKEN);
  });

  afterEach(() => httpMock.verify());

  it('devrait être créé', () => expect(service).toBeTruthy());

  // ── getEmployees() ────────────────────────────────────────────────────
  describe('getEmployees()', () => {
    it('devrait envoyer GET sur /api/gts/conducteurs/list', () => {
      service.getEmployees().subscribe();
      const req = httpMock.expectOne(`${API_URL}/list`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      req.flush([mockEmployee]);
    });

    it('devrait retourner la liste des conducteurs', () => {
      let result: Employee[] = [];
      service.getEmployees().subscribe(data => (result = data));
      httpMock.expectOne(`${API_URL}/list`).flush([mockEmployee]);
      expect(result.length).toBe(1);
      expect(result[0].codeConducteur).toBe('COND-001');
    });
  });

  // ── getEmployeesById() ────────────────────────────────────────────────
  describe('getEmployeesById()', () => {
    it('devrait envoyer GET sur /api/gts/conducteurs/{id}?page=0&size=10', () => {
      service.getEmployeesById(1, 0, 10).subscribe();
      const req = httpMock.expectOne(`${API_URL}/1?page=0&size=10`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      req.flush(mockEmployee);
    });

    it('devrait retourner le conducteur correspondant', () => {
      let result: any;
      service.getEmployeesById(1, 0, 10).subscribe(data => (result = data));
      httpMock.expectOne(`${API_URL}/1?page=0&size=10`).flush(mockEmployee);
      expect(result?.id).toBe(1);
      expect(result?.nomConducteur).toBe('Diallo');
    });
  });

  // ── createEmployee() ──────────────────────────────────────────────────
  describe('createEmployee()', () => {
    it('devrait envoyer POST sur /api/gts/conducteurs avec le FormData', () => {
      const fd = new FormData();
      fd.append('nomConducteur', 'Diallo');
      service.createEmployee(fd).subscribe();
      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      req.flush(mockEmployee);
    });
  });

  // ── deleteEmployee() ──────────────────────────────────────────────────
  describe('deleteEmployee()', () => {
    it('devrait envoyer DELETE sur /api/gts/conducteurs/{id}', () => {
      service.deleteEmployee(1).subscribe();
      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      req.flush(null);
    });

    it('devrait compléter sans erreur', () => {
      let completed = false;
      service.deleteEmployee(1).subscribe({ complete: () => (completed = true) });
      httpMock.expectOne(`${API_URL}/1`).flush(null);
      expect(completed).toBeTrue();
    });
  });

  // ── getImages() ───────────────────────────────────────────────────────
  describe('getImages()', () => {
    it('devrait envoyer GET sur /api/gts/conducteurs/{id}/images', () => {
      service.getImages(1).subscribe();
      const req = httpMock.expectOne(`${API_URL}/1/images`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      req.flush({ photoUrl: '' });
    });
  });

  // ── Token manquant ────────────────────────────────────────────────────
  describe('token manquant', () => {
    beforeEach(() => (localStorage.getItem as jasmine.Spy).and.returnValue(null));

    it('getEmployees() devrait lancer une erreur',      () => expect(() => service.getEmployees()).toThrowError('Token manquant'));
    it('getEmployeesById() devrait lancer une erreur',  () => expect(() => service.getEmployeesById(1, 0, 10)).toThrowError('Token manquant'));
    it('createEmployee() devrait lancer une erreur',    () => expect(() => service.createEmployee(new FormData())).toThrowError('Token manquant'));
    it('deleteEmployee() devrait lancer une erreur',    () => expect(() => service.deleteEmployee(1)).toThrowError('Token manquant'));
    it('getImages() devrait lancer une erreur',         () => expect(() => service.getImages(1)).toThrowError('Token manquant'));
  });
});
