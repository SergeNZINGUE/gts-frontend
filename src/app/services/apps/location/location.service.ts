import { environment } from '../../../../environments/environment';
import {Injectable, signal} from '@angular/core';
import {Engin} from "../../../pages/apps/engins/engin";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {LocationEngin} from "../../../pages/apps/locations/location-engin";
import {CoreService} from "../../core.service";
import {Observable} from "rxjs";
import {Employee} from "../../../pages/apps/employee/employee";
import {ConducteurImagesResponse} from "../../../pages/apps/employee/conducterImagesResponse";
import {EmployeeRequest} from "../../../pages/apps/employee/employeeRequest";
import {CreateLocationRequest} from "../../../pages/apps/locations/add-location/createLocationRequest";
import {LocationEnginResponse} from "../../../pages/apps/locations/locationEnginResponse";

@Injectable({
  providedIn: 'root',
})

export class LocationService {
  private locations = signal<LocationEngin[]>([]);
  private apiUrl = environment.apiUrl + '/api/gts/locations';

  constructor(
    private http: HttpClient,
    private coreService: CoreService
  )
  {}
  getLocations(): Observable<LocationEngin[]> {
    console.log("this.getHeaders()", this.coreService.getHeaders())
    return this.http.get<Engin[]>(`${this.apiUrl}/list`, {
      headers: this.coreService.getHeaders(),
    });
  }
  getLocationById(id: number,page:number,size : number):Observable<LocationEnginResponse[]>   {
    return this.http.get<any>( `${this.apiUrl}/${id}?page=${page}&size=${size}`,{
      headers: this.coreService.getHeaders(),
    });
  }
  validerLocation(id: number,   payload: {
    coutHoraireLocation?: number;
    coutJournalierLocation?: number;
  }): Observable<LocationEngin> {
    return this.http.put<LocationEngin>(
      `${this.apiUrl}/${id}/valider`,payload,

      {
        headers: this.coreService.getHeaders(),
      }
    );
  }

  terminerLocation(locationId: number,payload:{}): Observable<LocationEngin> {
    return this.http.put<LocationEngin>(
      `${this.apiUrl}/${locationId}/terminer`,payload,
      {
        headers: this.coreService.getHeaders(),
      }
    );
  }

  updateLocation(updatedLocation: LocationEngin): void {
    this.locations.update((locations) => {
      const index = locations.findIndex((e) => e.id === updatedLocation.id);
      if (index !== -1) {
        locations[index] = updatedLocation;
      }
      return [...locations];
    });
  }

  deleteEmployee(locationId: number): void {
    this.locations.update((locations) =>
      locations.filter((e) => e.id !== locationId)
    );
  }

  createLocation(payload: CreateLocationRequest): Observable<LocationEngin> {
    return this.http.post<LocationEngin>(this.apiUrl, payload, {
      headers: this.coreService.getHeaders(),
    });
  }


}
