export interface Reglement {
  id?: number;
  dateReglement?: string;
  montantVerse?: number;
  modePaiement?: string; // VIREMENT, CHEQUE, ESPECES
  dateCreation?: string;
  dateModification?: string;
  factureId?: number;
  clientId?: number;
  clientNom?: string;
}
