import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { FacturesService } from './factures.service';
import { Facture } from 'src/app/pages/apps/factures/facture';

const API_URL = 'http://localhost:8081/api/gts/factures';
const FAKE_TOKEN = 'fake-jwt-token';

const mockFacture: Facture = {
  id: 1,
  dateEmission: '2024-06-01',
  tauxTVA: 18,
  etatPaiement: 'BROUILLON',
  locationId: 10,
  codeLocation: 'LOC-001',
  clientNom: 'Acme Corp',
  montantHT: 200000,
  montantTTC: 236000,
};

describe('FacturesService', () => {
  let service: FacturesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service  = TestBed.inject(FacturesService);
    httpMock = TestBed.inject(HttpTestingController);
    spyOn(localStorage, 'getItem').and.returnValue(FAKE_TOKEN);
  });

  afterEach(() => httpMock.verify());

  it('devrait être créé', () => expect(service).toBeTruthy());

  // ── getFactures() ─────────────────────────────────────────────────────
  describe('getFactures()', () => {
    it('devrait envoyer GET sur /api/gts/factures/list', () => {
      service.getFactures().subscribe();
      const req = httpMock.expectOne(`${API_URL}/list`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      req.flush([mockFacture]);
    });

    it('devrait retourner la liste des factures', () => {
      let result: Facture[] = [];
      service.getFactures().subscribe(data => (result = data));
      httpMock.expectOne(`${API_URL}/list`).flush([mockFacture]);
      expect(result.length).toBe(1);
      expect(result[0].codeLocation).toBe('LOC-001');
    });
  });

  // ── getFactureById() ──────────────────────────────────────────────────
  describe('getFactureById()', () => {
    it('devrait envoyer GET sur /api/gts/factures/{id}', () => {
      service.getFactureById(1).subscribe();
      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      req.flush(mockFacture);
    });

    it('devrait retourner la facture correspondante', () => {
      let result: Facture | undefined;
      service.getFactureById(1).subscribe(data => (result = data));
      httpMock.expectOne(`${API_URL}/1`).flush(mockFacture);
      expect(result?.id).toBe(1);
      expect(result?.clientNom).toBe('Acme Corp');
    });
  });

  // ── createFacture() ───────────────────────────────────────────────────
  describe('createFacture()', () => {
    it('devrait envoyer POST sur /api/gts/factures avec le payload', () => {
      const payload = {
        dateEmission: '2024-06-01',
        tauxTVA: 18,
        etatPaiement: 'BROUILLON',
        locationId: 10,
        missionIds: [1, 2],
      };
      service.createFacture(payload).subscribe();
      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      expect(req.request.body).toEqual(payload);
      req.flush({ ...mockFacture, id: 2 });
    });

    it('devrait retourner la facture créée', () => {
      let result: Facture | undefined;
      service.createFacture({
        dateEmission: '2024-06-01', tauxTVA: 18,
        etatPaiement: 'BROUILLON', locationId: 10, missionIds: [],
      }).subscribe(data => (result = data));
      httpMock.expectOne(API_URL).flush({ ...mockFacture, id: 2 });
      expect(result?.id).toBe(2);
    });
  });

  // ── updateEtat() ──────────────────────────────────────────────────────
  describe('updateEtat()', () => {
    it('devrait envoyer PATCH sur /api/gts/factures/{id}/etat avec l\'état', () => {
      service.updateEtat(1, 'PAYEE').subscribe();
      const req = httpMock.expectOne(`${API_URL}/1/etat`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      expect(req.request.body).toEqual({ etatPaiement: 'PAYEE' });
      req.flush({ ...mockFacture, etatPaiement: 'PAYEE' });
    });

    it('devrait retourner la facture mise à jour', () => {
      let result: Facture | undefined;
      service.updateEtat(1, 'PAYEE').subscribe(data => (result = data));
      httpMock.expectOne(`${API_URL}/1/etat`).flush({ ...mockFacture, etatPaiement: 'PAYEE' });
      expect(result?.etatPaiement).toBe('PAYEE');
    });
  });

  // ── deleteFacture() ───────────────────────────────────────────────────
  describe('deleteFacture()', () => {
    it('devrait envoyer DELETE sur /api/gts/factures/{id}', () => {
      service.deleteFacture(1).subscribe();
      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      req.flush(null);
    });

    it('devrait compléter sans erreur', () => {
      let completed = false;
      service.deleteFacture(1).subscribe({ complete: () => (completed = true) });
      httpMock.expectOne(`${API_URL}/1`).flush(null);
      expect(completed).toBeTrue();
    });
  });

  // ── Token manquant ────────────────────────────────────────────────────
  describe('token manquant', () => {
    beforeEach(() => (localStorage.getItem as jasmine.Spy).and.returnValue(null));

    it('getFactures() devrait lancer une erreur',    () => expect(() => service.getFactures()).toThrowError('Token manquant'));
    it('getFactureById() devrait lancer une erreur', () => expect(() => service.getFactureById(1)).toThrowError('Token manquant'));
    it('createFacture() devrait lancer une erreur',  () => expect(() => service.createFacture({
      dateEmission: '', tauxTVA: 0, etatPaiement: '', locationId: 0, missionIds: [],
    })).toThrowError('Token manquant'));
    it('updateEtat() devrait lancer une erreur',     () => expect(() => service.updateEtat(1, 'PAYEE')).toThrowError('Token manquant'));
    it('deleteFacture() devrait lancer une erreur',  () => expect(() => service.deleteFacture(1)).toThrowError('Token manquant'));
  });
});
