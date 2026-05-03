import { environment } from '../../../environments/environment';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ClientsService } from './clients.service';
import { Client } from 'src/app/pages/apps/clients/client';

const API_URL = environment.apiUrl + '/api/gts/clients';
const FAKE_TOKEN = 'fake-jwt-token';

const mockClient: Client = {
  id: 1,
  codeClient: 'CLI-001',
  nameClient: 'Acme Corp',
  email: 'contact@acme.com',
  phoneNumber: '0600000001',
  personneRessource: 'John Doe',
  dateCreation: '2024-01-01',
};

describe('ClientsService', () => {
  let service: ClientsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service  = TestBed.inject(ClientsService);
    httpMock = TestBed.inject(HttpTestingController);
    spyOn(localStorage, 'getItem').and.returnValue(FAKE_TOKEN);
  });

  afterEach(() => httpMock.verify());

  it('devrait être créé', () => expect(service).toBeTruthy());

  // ── getClients() ──────────────────────────────────────────────────────
  describe('getClients()', () => {
    it('devrait envoyer GET sur /api/gts/clients/list', () => {
      service.getClients().subscribe();
      const req = httpMock.expectOne(`${API_URL}/list`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      req.flush([mockClient]);
    });

    it('devrait retourner la liste des clients', () => {
      let result: Client[] = [];
      service.getClients().subscribe(data => (result = data));
      httpMock.expectOne(`${API_URL}/list`).flush([mockClient]);
      expect(result.length).toBe(1);
      expect(result[0].codeClient).toBe('CLI-001');
    });
  });

  // ── getClientById() ───────────────────────────────────────────────────
  describe('getClientById()', () => {
    it('devrait envoyer GET sur /api/gts/clients/{id}/locations?page=0&size=10', () => {
      service.getClientById(1, 0, 10).subscribe();
      const req = httpMock.expectOne(`${API_URL}/1/locations?page=0&size=10`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      req.flush(mockClient);
    });

    it('devrait retourner le client correspondant', () => {
      let result: Client | undefined;
      service.getClientById(1, 0, 10).subscribe(data => (result = data));
      httpMock.expectOne(`${API_URL}/1/locations?page=0&size=10`).flush(mockClient);
      expect(result?.id).toBe(1);
      expect(result?.nameClient).toBe('Acme Corp');
    });
  });

  // ── createClient() ────────────────────────────────────────────────────
  describe('createClient()', () => {
    it('devrait envoyer POST sur /api/gts/clients avec le FormData', () => {
      const fd = new FormData();
      fd.append('nameClient', 'Acme Corp');
      service.createClient(fd).subscribe();
      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      req.flush(mockClient);
    });

    it('devrait retourner le client créé', () => {
      let result: Client | undefined;
      service.createClient(new FormData()).subscribe(data => (result = data));
      httpMock.expectOne(API_URL).flush(mockClient);
      expect(result?.id).toBe(1);
      expect(result?.codeClient).toBe('CLI-001');
    });
  });

  // ── updateClient() ────────────────────────────────────────────────────
  describe('updateClient()', () => {
    it('devrait envoyer PUT sur /api/gts/clients/{id} avec le payload', () => {
      const payload: Partial<Client> = { nameClient: 'New Name' };
      service.updateClient(1, payload).subscribe();
      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      expect(req.request.body).toEqual(payload);
      req.flush({ ...mockClient, ...payload });
    });

    it('devrait retourner le client mis à jour', () => {
      const payload: Partial<Client> = { nameClient: 'Updated' };
      let result: Client | undefined;
      service.updateClient(1, payload).subscribe(data => (result = data));
      httpMock.expectOne(`${API_URL}/1`).flush({ ...mockClient, ...payload });
      expect(result?.nameClient).toBe('Updated');
    });
  });

  // ── deleteClient() ────────────────────────────────────────────────────
  describe('deleteClient()', () => {
    it('devrait envoyer DELETE sur /api/gts/clients/{id}', () => {
      service.deleteClient(1).subscribe();
      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      req.flush(null);
    });

    it('devrait compléter sans erreur', () => {
      let completed = false;
      service.deleteClient(1).subscribe({ complete: () => (completed = true) });
      httpMock.expectOne(`${API_URL}/1`).flush(null);
      expect(completed).toBeTrue();
    });
  });

  // ── getImages() ───────────────────────────────────────────────────────
  describe('getImages()', () => {
    it('devrait envoyer GET sur /api/gts/clients/{id}/images', () => {
      service.getImages(1).subscribe();
      const req = httpMock.expectOne(`${API_URL}/1/images`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
      req.flush({ logoUrl: 'http://example.com/logo.png' });
    });
  });

  // ── Token manquant ────────────────────────────────────────────────────
  describe('token manquant', () => {
    beforeEach(() => (localStorage.getItem as jasmine.Spy).and.returnValue(null));

    it('getClients() devrait lancer une erreur',       () => expect(() => service.getClients()).toThrowError('Token manquant'));
    it('getClientById() devrait lancer une erreur',    () => expect(() => service.getClientById(1, 0, 10)).toThrowError('Token manquant'));
    it('createClient() devrait lancer une erreur',     () => expect(() => service.createClient(new FormData())).toThrowError('Token manquant'));
    it('updateClient() devrait lancer une erreur',     () => expect(() => service.updateClient(1, {})).toThrowError('Token manquant'));
    it('deleteClient() devrait lancer une erreur',     () => expect(() => service.deleteClient(1)).toThrowError('Token manquant'));
    it('getImages() devrait lancer une erreur',        () => expect(() => service.getImages(1)).toThrowError('Token manquant'));
  });
});
