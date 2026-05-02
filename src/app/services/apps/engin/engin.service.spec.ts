import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { EnginService } from './engin.service';
import { Engin } from 'src/app/pages/apps/engins/engin';

const API_URL = 'http://localhost:8081/api/gts/engins';
const FAKE_TOKEN = 'fake-jwt-token';

const mockEngin: Engin = {
  id: 1,
  codeEngin: 'ENG-001',
  modelEngin: 'CAT 320',
  marqueEngin: 'Caterpillar',
  typeEngin: 'Pelle',
  immatriculationEngin: 'BF-1234',
  statusEngin: 'DISPONIBLE',
  anneeEngin: '2020',
  etatEngin: 1,
  typCarbtEngin: 'DIESEL',
  dateAcqEngin: '2020-01-01',
  coutHorLocEngin: 50000,
  forfaitJournalierEngin: 400000,
  dateCreation: '2020-01-01',
  dateModification: '2020-01-01',
  poidsVide: 20000,
  horametre: 1000,
};

describe('EnginService', () => {
  let service: EnginService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(EnginService);
    httpMock = TestBed.inject(HttpTestingController);
    spyOn(localStorage, 'getItem').and.returnValue(FAKE_TOKEN);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  // ── getEngins() ────────────────────────────────────────────────────
  describe('getEngins()', () => {
    it('devrait envoyer GET sur la bonne URL', () => {
      service.getEngins().subscribe();

      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('GET');
      req.flush([mockEngin]);
    });

    it('devrait inclure le header Authorization', () => {
      service.getEngins().subscribe();

      const req = httpMock.expectOne(API_URL);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      req.flush([]);
    });

    it('devrait retourner la liste des engins', () => {
      let result: Engin[] = [];
      service.getEngins().subscribe(data => (result = data));

      httpMock.expectOne(API_URL).flush([mockEngin]);

      expect(result.length).toBe(1);
      expect(result[0].codeEngin).toBe('ENG-001');
    });
  });

  // ── getEnginById() ─────────────────────────────────────────────────
  describe('getEnginById()', () => {
    it('devrait envoyer GET sur /api/gts/engins/{id}', () => {
      service.getEnginById(1).subscribe();

      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      req.flush(mockEngin);
    });

    it('devrait retourner l\'engin correspondant à l\'id', () => {
      let result: Engin | undefined;
      service.getEnginById(1).subscribe(data => (result = data));

      httpMock.expectOne(`${API_URL}/1`).flush(mockEngin);

      expect(result?.id).toBe(1);
      expect(result?.modelEngin).toBe('CAT 320');
    });
  });

  // ── addEngin() ─────────────────────────────────────────────────────
  describe('addEngin()', () => {
    it('devrait envoyer POST sur /api/gts/engins avec le payload', () => {
      const payload: Partial<Engin> = { codeEngin: 'ENG-002', modelEngin: 'Komatsu PC200' };
      service.addEngin(payload).subscribe();

      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      expect(req.request.body).toEqual(payload);
      req.flush({ ...mockEngin, ...payload, id: 2 });
    });

    it('devrait retourner l\'engin créé', () => {
      const payload: Partial<Engin> = { codeEngin: 'ENG-002' };
      let result: Engin | undefined;
      service.addEngin(payload).subscribe(data => (result = data));

      httpMock.expectOne(API_URL).flush({ ...mockEngin, ...payload, id: 2 });

      expect(result?.id).toBe(2);
      expect(result?.codeEngin).toBe('ENG-002');
    });
  });

  // ── updateEngin() ──────────────────────────────────────────────────
  describe('updateEngin()', () => {
    it('devrait envoyer PUT sur /api/gts/engins/{id} avec le payload', () => {
      const payload: Partial<Engin> = { statusEngin: 'EN MAINTENANCE' };
      service.updateEngin(1, payload).subscribe();

      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      expect(req.request.body).toEqual(payload);
      req.flush({ ...mockEngin, ...payload });
    });

    it('devrait retourner l\'engin mis à jour', () => {
      const payload: Partial<Engin> = { statusEngin: 'EN MAINTENANCE' };
      let result: Engin | undefined;
      service.updateEngin(1, payload).subscribe(data => (result = data));

      httpMock.expectOne(`${API_URL}/1`).flush({ ...mockEngin, ...payload });

      expect(result?.statusEngin).toBe('EN MAINTENANCE');
    });
  });

  // ── deleteEngin() ──────────────────────────────────────────────────
  describe('deleteEngin()', () => {
    it('devrait envoyer DELETE sur /api/gts/engins/{id}', () => {
      service.deleteEngin(1).subscribe();

      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      req.flush(null);
    });

    it('devrait compléter sans erreur après suppression', () => {
      let completed = false;
      service.deleteEngin(1).subscribe({ complete: () => (completed = true) });

      httpMock.expectOne(`${API_URL}/1`).flush(null);

      expect(completed).toBeTrue();
    });
  });

  // ── Token manquant ─────────────────────────────────────────────────
  describe('token manquant', () => {
    beforeEach(() => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(null);
    });

    it('getEngins() devrait lancer une erreur si le token est absent', () => {
      expect(() => service.getEngins()).toThrowError('Token manquant');
    });

    it('getEnginById() devrait lancer une erreur si le token est absent', () => {
      expect(() => service.getEnginById(1)).toThrowError('Token manquant');
    });

    it('addEngin() devrait lancer une erreur si le token est absent', () => {
      expect(() => service.addEngin({})).toThrowError('Token manquant');
    });

    it('updateEngin() devrait lancer une erreur si le token est absent', () => {
      expect(() => service.updateEngin(1, {})).toThrowError('Token manquant');
    });

    it('deleteEngin() devrait lancer une erreur si le token est absent', () => {
      expect(() => service.deleteEngin(1)).toThrowError('Token manquant');
    });
  });
});
