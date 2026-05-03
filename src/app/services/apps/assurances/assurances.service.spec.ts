import { environment } from '../../../environments/environment';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { AssurancesService } from './assurances.service';
import { AssuranceEngin, AssurancePayload, StatutAssurance } from 'src/app/pages/apps/engins/assurances-engins/assurance-engin';

const API_URL = environment.apiUrl + '/api/gts/assurances';
const FAKE_TOKEN = 'fake-jwt-token';

const mockAssurance: AssuranceEngin = {
  id: 1,
  numeroPolice: 'POL-001',
  compagnieAssurance: 'Allianz',
  dateDebut: '2024-01-01',
  dateFin: '2025-01-01',
  montant: 500000,
  statut: StatutAssurance.VALIDE,
  enginId: 10,
  enginCode: 'ENG-001',
  enginModel: 'CAT 320',
};

const mockPayload: AssurancePayload = {
  numeroPolice: 'POL-002',
  compagnieAssurance: 'AXA',
  dateDebut: '2024-06-01',
  dateFin: '2025-06-01',
  montant: 400000,
  statut: StatutAssurance.VALIDE,
  enginId: 10,
};

describe('AssurancesService', () => {
  let service: AssurancesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service  = TestBed.inject(AssurancesService);
    httpMock = TestBed.inject(HttpTestingController);
    spyOn(localStorage, 'getItem').and.returnValue(FAKE_TOKEN);
  });

  afterEach(() => httpMock.verify());

  it('devrait être créé', () => expect(service).toBeTruthy());

  // ── getAll() ──────────────────────────────────────────────────────────
  describe('getAll()', () => {
    it('devrait envoyer GET sur /api/gts/assurances/list', () => {
      service.getAll().subscribe();
      const req = httpMock.expectOne(`${API_URL}/list`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      req.flush([mockAssurance]);
    });

    it('devrait retourner la liste des assurances', () => {
      let result: AssuranceEngin[] = [];
      service.getAll().subscribe(data => (result = data));
      httpMock.expectOne(`${API_URL}/list`).flush([mockAssurance]);
      expect(result.length).toBe(1);
      expect(result[0].numeroPolice).toBe('POL-001');
    });
  });

  // ── getByEngin() ──────────────────────────────────────────────────────
  describe('getByEngin()', () => {
    it('devrait envoyer GET sur /api/gts/assurances/engin/{id}', () => {
      service.getByEngin(10).subscribe();
      const req = httpMock.expectOne(`${API_URL}/engin/10`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      req.flush([mockAssurance]);
    });

    it('devrait retourner les assurances de l\'engin', () => {
      let result: AssuranceEngin[] = [];
      service.getByEngin(10).subscribe(data => (result = data));
      httpMock.expectOne(`${API_URL}/engin/10`).flush([mockAssurance]);
      expect(result[0].enginCode).toBe('ENG-001');
    });
  });

  // ── create() ──────────────────────────────────────────────────────────
  describe('create()', () => {
    it('devrait envoyer POST sur /api/gts/assurances avec le payload', () => {
      service.create(mockPayload).subscribe();
      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      expect(req.request.body).toEqual(mockPayload);
      req.flush({ ...mockAssurance, ...mockPayload, id: 2 });
    });

    it('devrait retourner l\'assurance créée', () => {
      let result: AssuranceEngin | undefined;
      service.create(mockPayload).subscribe(data => (result = data));
      httpMock.expectOne(API_URL).flush({ ...mockAssurance, id: 2, numeroPolice: 'POL-002' });
      expect(result?.id).toBe(2);
      expect(result?.numeroPolice).toBe('POL-002');
    });
  });

  // ── update() ──────────────────────────────────────────────────────────
  describe('update()', () => {
    it('devrait envoyer PUT sur /api/gts/assurances/{id} avec le payload', () => {
      const partial: Partial<AssurancePayload> = { statut: StatutAssurance.EXPIRE };
      service.update(1, partial).subscribe();
      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      expect(req.request.body).toEqual(partial);
      req.flush({ ...mockAssurance, ...partial });
    });

    it('devrait retourner l\'assurance mise à jour', () => {
      let result: AssuranceEngin | undefined;
      service.update(1, { statut: StatutAssurance.EXPIRE }).subscribe(data => (result = data));
      httpMock.expectOne(`${API_URL}/1`).flush({ ...mockAssurance, statut: StatutAssurance.EXPIRE });
      expect(result?.statut).toBe(StatutAssurance.EXPIRE);
    });
  });

  // ── delete() ──────────────────────────────────────────────────────────
  describe('delete()', () => {
    it('devrait envoyer DELETE sur /api/gts/assurances/{id}', () => {
      service.delete(1).subscribe();
      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      req.flush(null);
    });

    it('devrait compléter sans erreur', () => {
      let completed = false;
      service.delete(1).subscribe({ complete: () => (completed = true) });
      httpMock.expectOne(`${API_URL}/1`).flush(null);
      expect(completed).toBeTrue();
    });
  });

  // ── Token manquant ────────────────────────────────────────────────────
  describe('token manquant', () => {
    beforeEach(() => (localStorage.getItem as jasmine.Spy).and.returnValue(null));

    it('getAll() devrait lancer une erreur',        () => expect(() => service.getAll()).toThrowError('Token manquant'));
    it('getByEngin() devrait lancer une erreur',    () => expect(() => service.getByEngin(1)).toThrowError('Token manquant'));
    it('create() devrait lancer une erreur',        () => expect(() => service.create(mockPayload)).toThrowError('Token manquant'));
    it('update() devrait lancer une erreur',        () => expect(() => service.update(1, {})).toThrowError('Token manquant'));
    it('delete() devrait lancer une erreur',        () => expect(() => service.delete(1)).toThrowError('Token manquant'));
  });
});
