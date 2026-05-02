import {ActiviteClient} from "./activite-client/activite-client";
import {LocationEngin} from "../locations/location-engin";
import {Reglement} from "../reglements/reglement";

export interface Client {
  id?: number;

  codeClient?: string;
  nameClient?: string;
  raison_sociale?: string;

  pays?: string;
  ville?: string;
  communeEntreprise?: string;
  email?: string;
  cheminLogoEntreprise?: string;
  phoneNumber?: string;
  personneRessource?: string;
  telPersonneRessource?: string;
  adresseEntreprise?: string;
  rccmClient?: string;
  numeroIFUEntreprise?: string;
  regimeFiscalEntreprise?: string;
  numeroCompteBancaire?: string;

  dateCreation?: string | Date;
  dateModification?: string | Date;

  secteur_activite?: ActiviteClient;
  locations?: LocationEngin[];
  reglements?: Reglement[];

  action?: string;
}
