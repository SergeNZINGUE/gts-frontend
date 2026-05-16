import {LocationStatut} from "../locationStatut";
import {EtatLocation} from "../etatLocation";

export interface CreateLocationRequest {
  codeLocation: string;
  statut: LocationStatut;
  etatLocation: EtatLocation;

  siteLocation: string;

  dateDbtLoc: string;
  dateFinLoc: string;
  nbJoursLocation: number;

  coutHoraireLocation?: number;
  coutJournalierLocation?: number;

  clientId: number;
  enginId: number;
  //conducteurId: number;
}
