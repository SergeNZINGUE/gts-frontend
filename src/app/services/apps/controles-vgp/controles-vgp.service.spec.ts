import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ControlesVGPService } from './controles-vgp.service';
import { ControleVGP, ControleVGPPayload } from 'src/app/pages/apps/engins/controles-vgp/controle-vgp';

const API_URL = 'http://localhost:8081/api/gts/controles-vgp';
const FAKE_TOKEN = 'fake-jwt-token';

const mockControle: ControleVGP = {
  id: 1,
  dateDernierControle: '2024-01-01',
  dateProchaineEcheance: '2025-01-01',
  organismeControleur: 'Bureau Veritas',
  numeroRapport: 'RPT-001',
  resultat: 'CONFORME',
  estAlerteActive: true,
  enginId: 10,
  enginCode: 'ENG-001',
  enginModel: 'CAT 320',
};

const mockPayload: ControleVGPPayload = {
  enginId: 10,
  dateDernierControle: '2024-06-01',
  dateProchaineEcheance: '2025-06-01',
  organismeControleur: 'Bureau Veritas',
  numeroRapport: 'RPT-002',
  resultat: 'CONFORME',
  estAlerteActive: true,
};

describe('ControlesVGPService', () => {
  let service: ControlesVGPService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service  = TestBed.inject(ControlesVGPService);
    httpMock = TestBed.inject(HttpTestingController);
    spyOn(localStorage, 'getItem').and.returnValue(FAKE_TOKEN);
  });

  afterEach(() => httpMock.verify());

  it('devrait être créé', () => expect(service).toBeTruthy());

  // ── getAll() ──────────────────────────────────────────────────────────
  describe('getAll()', () => {
    it('devrait envoyer GET sur /api/gts/controles-vgp/list', () => {
      service.getAll().subscribe();
      const req = httpMock.expectOne(`${API_URL}/list`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      req.flush([mockControle]);
    });

    it('devrait retourner la liste des contrôles', () => {
      let result: ControleVGP[] = [];
      service.getAll().subscribe(data => (result = data));
      httpMock.expectOne(`${API_URL}/list`).flush([mockControle]);
      expect(result.length).toBe(1);
      expect(result[0].numeroRapport).toBe('RPT-001');
    });
  });

  // ── getByEngin() ──────────────────────────────────────────────────────
  describe('getByEngin()', () => {
    it('devrait envoyer GET sur /api/gts/controles-vgp/engin/{id}', () => {
      service.getByEngin(10).subscribe();
      const req = httpMock.expectOne(`${API_URL}/engin/10`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      req.flush([mockControle]);
    });

    it('devrait retourner les contrôles de l\'engin', () => {
      let result: ControleVGP[] = [];
      service.getByEngin(10).subscribe(data => (result = data));
      httpMock.expectOne(`${API_URL}/engin/10`).flush([mockControle]);
      expect(result[0].enginCode).toBe('ENG-001');
    });
  });

  // ── create() ──────────────────────────────────────────────────────────
  describe('create()', () => {
    it('devrait envoyer POST sur /api/gts/controles-vgp avec le payload', () => {
      service.create(mockPayload).subscribe();
      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      expect(req.request.body).toEqual(mockPayload);
      req.flush({ ...mockControle, ...mockPayload, id: 2 });
    });

    it('devrait retourner le contrôle créé', () => {
      let result: ControleVGP | undefined;
      service.create(mockPayload).subscribe(data => (result = data));
      httpMock.expectOne(API_URL).flush({ ...mockControle, id: 2, numeroRapport: 'RPT-002' });
      expect(result?.id).toBe(2);
      expect(result?.numeroRapport).toBe('RPT-002');
    });
  });

  // ── update() ──────────────────────────────────────────────────────────
  describe('update()', () => {
    it('devrait envoyer PUT sur /api/gts/controles-vgp/{id} avec le payload', () => {
      const partial: Partial<ControleVGPPayload> = { resultat: 'NON_CONFORME' };
      service.update(1, partial).subscribe();
      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      expect(req.request.body).toEqual(partial);
      req.flush({ ...mockControle, ...partial });
    });

    it('devrait retourner le contrôle mis à jour', () => {
      let result: ControleVGP | undefined;
      service.update(1, { resultat: 'NON_CONFORME' }).subscribe(data => (result = data));
      httpMock.expectOne(`${API_URL}/1`).flush({ ...mockControle, resultat: 'NON_CONFORME' });
      expect(result?.resultat).toBe('NON_CONFORME');
    });
  });

  // ── delete() ──────────────────────────────────────────────────────────
  describe('delete()', () => {
    it('devrait envoyer DELETE sur /api/gts/controles-vgp/{id}', () => {
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

    it('getAll() devrait lancer une erreur',     () => expect(() => service.getAll()).toThrowError('Token manquant'));
    it('getByEngin() devrait lancer une erreur', () => expect(() => service.getByEngin(1)).toThrowError('Token manquant'));
    it('create() devrait lancer une erreur',     () => expect(() => service.create(mockPayload)).toThrowError('Token manquant'));
    it('update() devrait lancer une erreur',     () => expect(() => service.update(1, {})).toThrowError('Token manquant'));
    it('delete() devrait lancer une erreur',     () => expect(() => service.delete(1)).toThrowError('Token manquant'));
  });
});
