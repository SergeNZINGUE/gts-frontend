import { MissionStatut } from '../missionStatut';
import { MissionPriorite } from '../missionPriorite';

export interface CreateMissionRequest {
  codeMission: string;
  statutMission: string;
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

  materiauxMission?: string;
  qteMateriauxMission?: number;

  nbHeures: number;
  tarifHoraireApplique: number;

  descriptionMission?: string;
  observationMission?: string;
}
