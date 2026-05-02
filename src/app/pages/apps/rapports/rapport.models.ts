export interface LocationRapportDto {
  id?: number;
  codeLocation?: string;
  dateDebutLocation?: string;
  dateFinLocation?: string;
  nbrHeureLocation?: number;
  coutHoraireLocation?: number;
  montantTotal?: number;
  statutLocation?: string;
  clientNom?: string;
  codeClient?: string;
  enginCode?: string;
  modelEngin?: string;
  conducteurNom?: string;
}

export interface MissionRapportDto {
  id?: number;
  codeMission?: string;
  dateDebutMission?: string;
  dateFinMission?: string;
  statutMission?: string;
  description?: string;
  enginCode?: string;
  modelEngin?: string;
  clientNom?: string;
}

export interface FactureImpayeeDto {
  id?: number;
  numeroFacture?: string;
  clientNom?: string;
  codeClient?: string;
  dateFacture?: string;
  dateEcheance?: string;
  montantHT?: number;
  tva?: number;
  montantTTC?: number;
  montantPaye?: number;
  resteAPayer?: number;
  statutFacture?: string;
}
