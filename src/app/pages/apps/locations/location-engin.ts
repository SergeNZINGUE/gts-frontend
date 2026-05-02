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
  enginCode?:string;

  coutHoraireLocation? : number;
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
