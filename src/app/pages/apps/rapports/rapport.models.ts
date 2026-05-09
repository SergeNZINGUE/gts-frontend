export interface LocationsPeriodeResponse {
  nbLocationsTotal?: number;
  nbLocationsEnCours?: number;
  nbLocationsTerminees?: number;
  locations: LocationRapportDto[];
}

export interface LocationRapportDto {
  id?: number;
  codeLocation?: string;
  dateDbtLoc?: string;
  dateFinLoc?: string;
  nbJoursLocation?: number;
  nbHeureLocation?: number;
  coutHoraireLocation?: number;
  coutJournalierLocation?: number;
  montantMissionsHT?: number;
  statut?: string;
  siteLocation?: string;
  clientNom?: string;
  enginModel?: string;
  enginMarque?: string;
  conducteurNomComplet?: string;
}

export interface LocationsClientResponse {
  clientId?: number;
  clientNom?: string;
  nbLocationsTotal?: number;
  nbLocationsEnCours?: number;
  nbLocationsTerminees?: number;
  totalMontantMissionsHT?: number;
  locations: LocationRapportDto[];
}

export interface MissionsConducteurResponse {
  conducteurId?: number;
  conducteurNomComplet?: string;
  nbMissionsTotal?: number;
  totalHeures?: number;
  totalKm?: number;
  missions: MissionRapportDto[];
}

export interface MissionRapportDto {
  id?: number;
  codeMission?: string;
  dateDebutMission?: string;
  dateFinMission?: string;
  heureDebutMission?: string;
  heureFinMission?: string;
  lieuMission?: string;
  nbHeures?: number;
  tarifHoraireApplique?: number;
  sousTotal?: number;
  statutMission?: string;
  codeLocation?: string;
  clientNom?: string;
}

export interface ImpayesResponse {
  factures: FactureImpayeeDto[];
}

export interface FactureImpayeeDto {
  factureId?: number;
  dateEmission?: string;
  etatPaiement?: string;
  clientId?: number;
  clientNom?: string;
  codeLocation?: string;
  siteLocation?: string;
  montantHT?: number;
  montantTTC?: number;
  montantDejaVerse?: number;
  resteARegler?: number;
  joursDepuisEmission?: number;
}
