import { environment } from '../../../environments/environment';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { LocationService } from './location.service';
import { LocationEngin } from 'src/app/pages/apps/locations/location-engin';
import { CreateLocationRequest } from 'src/app/pages/apps/locations/add-location/createLocationRequest';

const API_URL = environment.apiUrl + '/api/gts/locations';
const FAKE_TOKEN = 'fake-jwt-token';

const mockLocation: LocationEngin = {
  id: 1,
  codeLocation: 'LOC-001',
  statut: 'EN ATTENTE' as any,
  nbJoursLocation: 5,
  siteLocation: 'Cotonou',
  dateDbtLoc: '2024-06-01',
  dateFinLoc: '2024-06-06',
  coutHoraireLocation: 5000,
  coutJournalierLocation: 40000,
};

describe('LocationService', () => {
  let service: LocationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service  = TestBed.inject(LocationService);
    httpMock = TestBed.inject(HttpTestingController);
    spyOn(localStorage, 'getItem').and.returnValue(FAKE_TOKEN);
  });

  afterEach(() => httpMock.verify());

  it('devrait être créé', () => expect(service).toBeTruthy());

  // ── getLocations() ────────────────────────────────────────────────────
  describe('getLocations()', () => {
    it('devrait envoyer GET sur /api/gts/locations/list', () => {
      service.getLocations().subscribe();
      const req = httpMock.expectOne(`${API_URL}/list`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      req.flush([mockLocation]);
    });

    it('devrait retourner la liste des locations', () => {
      let result: LocationEngin[] = [];
      service.getLocations().subscribe(data => (result = data));
      httpMock.expectOne(`${API_URL}/list`).flush([mockLocation]);
      expect(result.length).toBe(1);
      expect(result[0].codeLocation).toBe('LOC-001');
    });
  });

  // ── getLocationById() ─────────────────────────────────────────────────
  describe('getLocationById()', () => {
    it('devrait envoyer GET sur /api/gts/locations/{id}?page=0&size=10', () => {
      service.getLocationById(1, 0, 10).subscribe();
      const req = httpMock.expectOne(`${API_URL}/1?page=0&size=10`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      req.flush([mockLocation]);
    });
  });

  // ── validerLocation() ─────────────────────────────────────────────────
  describe('validerLocation()', () => {
    it('devrait envoyer PUT sur /api/gts/locations/{id}/valider avec le payload', () => {
      const payload = { coutHoraireLocation: 6000, coutJournalierLocation: 48000 };
      service.validerLocation(1, payload).subscribe();
      const req = httpMock.expectOne(`${API_URL}/1/valider`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      expect(req.request.body).toEqual(payload);
      req.flush({ ...mockLocation, ...payload, statut: 'VALIDEE' });
    });

    it('devrait retourner la location validée', () => {
      let result: LocationEngin | undefined;
      service.validerLocation(1, { coutHoraireLocation: 6000 }).subscribe(data => (result = data));
      httpMock.expectOne(`${API_URL}/1/valider`).flush({ ...mockLocation, statut: 'VALIDEE' });
      expect((result as any)?.statut).toBe('VALIDEE');
    });
  });

  // ── terminerLocation() ────────────────────────────────────────────────
  describe('terminerLocation()', () => {
    it('devrait envoyer PUT sur /api/gts/locations/{id}/terminer avec le payload', () => {
      const payload = { statusLocation: 'TERMINEE' };
      service.terminerLocation(1, payload).subscribe();
      const req = httpMock.expectOne(`${API_URL}/1/terminer`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      expect(req.request.body).toEqual(payload);
      req.flush({ ...mockLocation, statut: 'TERMINEE' });
    });

    it('devrait retourner la location terminée', () => {
      let result: LocationEngin | undefined;
      service.terminerLocation(1, {}).subscribe(data => (result = data));
      httpMock.expectOne(`${API_URL}/1/terminer`).flush({ ...mockLocation, statut: 'TERMINEE' });
      expect((result as any)?.statut).toBe('TERMINEE');
    });
  });

  // ── createLocation() ──────────────────────────────────────────────────
  describe('createLocation()', () => {
    it('devrait envoyer POST sur /api/gts/locations avec le payload', () => {
      const payload = { siteLocation: 'Cotonou' } as CreateLocationRequest;
      service.createLocation(payload).subscribe();
      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      expect(req.request.body).toEqual(payload);
      req.flush({ ...mockLocation, ...payload, id: 2 });
    });

    it('devrait retourner la location créée', () => {
      let result: LocationEngin | undefined;
      service.createLocation({} as CreateLocationRequest).subscribe(data => (result = data));
      httpMock.expectOne(API_URL).flush({ ...mockLocation, id: 2 });
      expect(result?.id).toBe(2);
    });
  });

  // ── Token manquant ────────────────────────────────────────────────────
  describe('token manquant', () => {
    beforeEach(() => (localStorage.getItem as jasmine.Spy).and.returnValue(null));

    it('getLocations() devrait lancer une erreur',     () => expect(() => service.getLocations()).toThrowError('Token manquant'));
    it('getLocationById() devrait lancer une erreur',  () => expect(() => service.getLocationById(1, 0, 10)).toThrowError('Token manquant'));
    it('validerLocation() devrait lancer une erreur',  () => expect(() => service.validerLocation(1, {})).toThrowError('Token manquant'));
    it('terminerLocation() devrait lancer une erreur', () => expect(() => service.terminerLocation(1, {})).toThrowError('Token manquant'));
    it('createLocation() devrait lancer une erreur',   () => expect(() => service.createLocation({} as any)).toThrowError('Token manquant'));
  });
});
