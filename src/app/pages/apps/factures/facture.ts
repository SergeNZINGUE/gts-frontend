import { Mission } from '../missions/mission';
import { Reglement } from './reglement';

export interface Facture {
  id?: number;
  dateEmission?: string;
  tauxTVA?: number;
  etatPaiement?: string; // BROUILLON, VALIDEE, PAYEE
  dateCreation?: string;
  dateModification?: string;

  locationId?: number;
  codeLocation?: string;
  siteLocation?: string;
  clientId?: number;
  clientNom?: string;

  montantHT?: number;
  montantTTC?: number;

  missionsFacturees?: Mission[];
  reglements?: Reglement[];
}
