import { environment } from '../../../environments/environment';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ReglementsService } from './reglements.service';
import { Reglement } from 'src/app/pages/apps/factures/reglement';

const API_URL = environment.apiUrl + '/api/gts/reglements';
const FAKE_TOKEN = 'fake-jwt-token';

const mockReglement: Reglement = {
  id: 1,
  dateReglement: '2024-06-15',
  montantVerse: 118000,
  modePaiement: 'VIREMENT',
  factureId: 1,
  clientId: 5,
  clientNom: 'Acme Corp',
};

describe('ReglementsService', () => {
  let service: ReglementsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service  = TestBed.inject(ReglementsService);
    httpMock = TestBed.inject(HttpTestingController);
    spyOn(localStorage, 'getItem').and.returnValue(FAKE_TOKEN);
  });

  afterEach(() => httpMock.verify());

  it('devrait être créé', () => expect(service).toBeTruthy());

  // ── createReglement() ─────────────────────────────────────────────────
  describe('createReglement()', () => {
    it('devrait envoyer POST sur /api/gts/reglements avec le payload', () => {
      const payload = {
        dateReglement: '2024-06-15',
        montantVerse: 118000,
        modePaiement: 'VIREMENT',
        factureId: 1,
        clientId: 5,
      };
      service.createReglement(payload).subscribe();
      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      expect(req.request.body).toEqual(payload);
      req.flush(mockReglement);
    });

    it('devrait retourner le règlement créé', () => {
      let result: Reglement | undefined;
      service.createReglement({
        dateReglement: '2024-06-15',
        montantVerse: 118000,
        modePaiement: 'VIREMENT',
        factureId: 1,
        clientId: 5,
      }).subscribe(data => (result = data));
      httpMock.expectOne(API_URL).flush(mockReglement);
      expect(result?.id).toBe(1);
      expect(result?.montantVerse).toBe(118000);
    });
  });

  // ── getReglementsByFacture() ──────────────────────────────────────────
  describe('getReglementsByFacture()', () => {
    it('devrait envoyer GET sur /api/gts/reglements/facture/{factureId}', () => {
      service.getReglementsByFacture(1).subscribe();
      const req = httpMock.expectOne(`${API_URL}/facture/1`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      req.flush([mockReglement]);
    });

    it('devrait retourner les règlements de la facture', () => {
      let result: Reglement[] = [];
      service.getReglementsByFacture(1).subscribe(data => (result = data));
      httpMock.expectOne(`${API_URL}/facture/1`).flush([mockReglement]);
      expect(result.length).toBe(1);
      expect(result[0].modePaiement).toBe('VIREMENT');
    });
  });

  // ── Token manquant ────────────────────────────────────────────────────
  describe('token manquant', () => {
    beforeEach(() => (localStorage.getItem as jasmine.Spy).and.returnValue(null));

    it('createReglement() devrait lancer une erreur', () => {
      expect(() => service.createReglement({
        dateReglement: '', montantVerse: 0,
        modePaiement: '', factureId: 0, clientId: 0,
      })).toThrowError('Token manquant');
    });

    it('getReglementsByFacture() devrait lancer une erreur', () => {
      expect(() => service.getReglementsByFacture(1)).toThrowError('Token manquant');
    });
  });
});
