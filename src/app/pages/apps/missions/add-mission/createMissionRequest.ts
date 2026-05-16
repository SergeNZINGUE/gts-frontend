import { MissionPriorite } from '../missionPriorite';

export interface CreateMissionRequest {
  codeMission: string;
  prioriteMission: string;
  responsableMission?: string;

  locationId: number;
  lieuMission: string;

  dateDebutMission?: string;
  dateFinMission?: string;
  heureDebutMission?: string;
  heureFinMission?: string;


  kmDbtMission?: number;
  kmFinMission?: number;
  carbtDbtMission?: number;
  carbtFinMission?: number;
  compteurDbtMission?: number;
  compteurFinMission?: number;

  materiauxMission?: string;
  qteMateriauxMission?: number;

  nbHeures: number;
  tarifHoraireApplique: number;

  descriptionMission?: string;
  observationMission?: string;

  conducteurId: number;
}
