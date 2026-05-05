export interface Mission {
  id?: number;
  codeLocation?: string;
  dateTravail?: string;
  nbHeures?: number;
  tarifHoraireApplique?: number;
  dateCreation?: string;
  dateModification?: string;
  locationId?: number;
  factureId?: number | null;
  codeMission?: string;
  dateDebutMission?: string;
  dateFinMission?: string;
  heureDebutMission?: string;
  heureFinMission?: string;
  kmDbtMission?: number;
  kmFinMission?: number;
  carbtDbtMission?: number;
  carbtFinMission?: number;
  materiauxMission?: string;
  qteMateriauxMission?: number;
  statutMission?: string;
  observationMission?: string;
  prioriteMission?: string;
  responsableMission?: string;
  lieuMission?: string;
  descriptionMission?: string;
  sousTotal?: number;
}
