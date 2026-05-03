import { environment } from '../../../environments/environment';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { MissionsService } from './missions.service';
import { Mission } from 'src/app/pages/apps/missions/mission';
import { CreateMissionRequest } from 'src/app/pages/apps/missions/add-mission/createMissionRequest';

const API_URL = environment.apiUrl + '/api/gts/missions';
const FAKE_TOKEN = 'fake-jwt-token';

const mockMission: Mission = {
  id: 1,
  codeMission: 1001,
  codeLocation: 'LOC-001',
  lieuMission: 'Cotonou',
  dateTravail: '2024-06-01',
  statutMission: 'EN ATTENTE',
  prioriteMission: 'NORMALE',
  responsableMission: 'Diallo',
  nbHeures: 8,
  sousTotal: 400000,
};

describe('MissionsService', () => {
  let service: MissionsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service  = TestBed.inject(MissionsService);
    httpMock = TestBed.inject(HttpTestingController);
    spyOn(localStorage, 'getItem').and.returnValue(FAKE_TOKEN);
  });

  afterEach(() => httpMock.verify());

  it('devrait être créé', () => expect(service).toBeTruthy());

  // ── getMissions() ─────────────────────────────────────────────────────
  describe('getMissions()', () => {
    it('devrait envoyer GET sur /api/gts/missions/list', () => {
      service.getMissions().subscribe();
      const req = httpMock.expectOne(`${API_URL}/list`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      req.flush([mockMission]);
    });

    it('devrait retourner la liste des missions', () => {
      let result: Mission[] = [];
      service.getMissions().subscribe(data => (result = data));
      httpMock.expectOne(`${API_URL}/list`).flush([mockMission]);
      expect(result.length).toBe(1);
      expect(result[0].codeLocation).toBe('LOC-001');
    });
  });

  // ── getMissionById() ──────────────────────────────────────────────────
  describe('getMissionById()', () => {
    it('devrait envoyer GET sur /api/gts/missions/{id}', () => {
      service.getMissionById(1).subscribe();
      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      req.flush(mockMission);
    });

    it('devrait retourner la mission correspondante', () => {
      let result: Mission | undefined;
      service.getMissionById(1).subscribe(data => (result = data));
      httpMock.expectOne(`${API_URL}/1`).flush(mockMission);
      expect(result?.id).toBe(1);
      expect(result?.lieuMission).toBe('Cotonou');
    });
  });

  // ── createMission() ───────────────────────────────────────────────────
  describe('createMission()', () => {
    it('devrait envoyer POST sur /api/gts/missions avec le payload', () => {
      const payload = { lieuMission: 'Cotonou' } as CreateMissionRequest;
      service.createMission(payload).subscribe();
      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      expect(req.request.body).toEqual(payload);
      req.flush({ ...mockMission, ...payload, id: 2 });
    });

    it('devrait retourner la mission créée', () => {
      const payload = { lieuMission: 'Porto-Novo' } as CreateMissionRequest;
      let result: Mission | undefined;
      service.createMission(payload).subscribe(data => (result = data));
      httpMock.expectOne(API_URL).flush({ ...mockMission, ...payload, id: 2 });
      expect(result?.id).toBe(2);
    });
  });

  // ── updateMission() ───────────────────────────────────────────────────
  describe('updateMission()', () => {
    it('devrait envoyer PUT sur /api/gts/missions/{id}/terminer avec le payload', () => {
      const payload = { statutMission: 'TERMINÉE' };
      service.updateMission(1, payload).subscribe();
      const req = httpMock.expectOne(`${API_URL}/1/terminer`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      expect(req.request.body).toEqual(payload);
      req.flush({ ...mockMission, ...payload });
    });

    it('devrait retourner la mission mise à jour', () => {
      const payload = { statutMission: 'TERMINÉE' };
      let result: Mission | undefined;
      service.updateMission(1, payload).subscribe(data => (result = data));
      httpMock.expectOne(`${API_URL}/1/terminer`).flush({ ...mockMission, ...payload });
      expect(result?.statutMission).toBe('TERMINÉE');
    });
  });

  // ── deleteMission() ───────────────────────────────────────────────────
  describe('deleteMission()', () => {
    it('devrait envoyer DELETE sur /api/gts/missions/{id}', () => {
      service.deleteMission(1).subscribe();
      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      req.flush(null);
    });

    it('devrait compléter sans erreur', () => {
      let completed = false;
      service.deleteMission(1).subscribe({ complete: () => (completed = true) });
      httpMock.expectOne(`${API_URL}/1`).flush(null);
      expect(completed).toBeTrue();
    });
  });

  // ── Token manquant ────────────────────────────────────────────────────
  describe('token manquant', () => {
    beforeEach(() => (localStorage.getItem as jasmine.Spy).and.returnValue(null));

    it('getMissions() devrait lancer une erreur',    () => expect(() => service.getMissions()).toThrowError('Token manquant'));
    it('getMissionById() devrait lancer une erreur', () => expect(() => service.getMissionById(1)).toThrowError('Token manquant'));
    it('createMission() devrait lancer une erreur',  () => expect(() => service.createMission({} as any)).toThrowError('Token manquant'));
    it('updateMission() devrait lancer une erreur',  () => expect(() => service.updateMission(1, {})).toThrowError('Token manquant'));
    it('deleteMission() devrait lancer une erreur',  () => expect(() => service.deleteMission(1)).toThrowError('Token manquant'));
  });
});
