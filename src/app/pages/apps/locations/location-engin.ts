import {Client} from "../clients/client";
import {EmployeeRequest} from "../employee/employeeRequest";
import {Engin} from "../engins/engin";
import {MissionLocation} from "../missions/missionLocation";
import {FactureLocation} from "../factures/factureLocation";
import {EtatLocation} from "./etatLocation";
import {LocationStatut} from "./locationStatut";

export interface LocationEngin {
  id?: number;

  dateDebut?: string | Date;
  statut?: LocationStatut;

  codeLocation?: string;
  nbJoursLocation?: number;
  siteLocation?: string;

  dateDbtLoc?: string | Date;
  dateFinLoc?: string | Date;

  etatLocation?: EtatLocation;

  enginId?: number;
  enginCode?: string;
  enginMarque?: string;
  enginModel?: string;

  conducteurId?: number;
  conducteurNom?: string;
  conducteurPrenoms?: string;

  clientId?: number;
  clientDescriptionEntreprise?: string;

  nbHeureLocation?: number;

  coutHoraireLocation?: number;
  coutJournalierLocation?: number;

  client?: Client;

  conducteur?: EmployeeRequest;
  engins?: Engin;

  missions?: MissionLocation[];
  factures?: FactureLocation[];

  dateCreation?: string | Date;
  dateModification?: string | Date;

  action?: string;
}
