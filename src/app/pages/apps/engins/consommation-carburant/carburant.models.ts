/**
 * Modèles TypeScript pour le module Reporting Carburant.
 * Miroir exact des DTOs Java :
 *   - ConsommationMissionDto
 *   - BilanCarburantEnginDto
 *   - RapportCarburantResponse
 */

// ── Détail d'une mission ─────────────────────────────────────────────────────

export interface ConsommationMissionDto {
  missionId:             number;
  codeMission:           string;
  dateTravail:           string;           // LocalDate → ISO string

  enginId:               number | null;
  codeEngin:             string | null;
  modelEngin:            string | null;

  // Jauges brutes (litres)
  carbtDbt:              number | null;
  carbtFin:              number | null;

  // Décomposition formule hybride
  deltaReservoir:        number | null;    // carbtDbt − carbtFin
  ravitaillementsLitres: number | null;    // Σ pleins horamètre ∈ [compteurDbt, compteurFin]
  consommationReelle:    number | null;    // deltaReservoir + ravitaillementsLitres

  // Indicateurs normalisés
  nbHeures:              number | null;
  ratioLH:               number | null;   // L/h
  distanceKm:            number | null;
  ratioL100Km:           number | null;   // L/100 km

  donneesCompletes:      boolean;
}

// ── Bilan d'un engin ─────────────────────────────────────────────────────────

export interface BilanCarburantEnginDto {
  enginId:    number;
  codeEngin:  string;
  modelEngin: string;

  // Source 1 : Ravitaillements (ConsommationCarburant)
  totalLitresPleins:    number | null;
  coutTotalPleins:      number | null;
  deltaHorametre:       number | null;
  ratioHorairePleins:   number | null;   // L/h depuis pleins

  // Source 2 : Jauges missions
  nbMissionsTotal:        number;
  nbMissionsAvecCarburant: number;
  tauxCouverture:         number | null;  // %
  consommationMissions:   number | null;  // Σ consommationReelle
  ratioHoraireMissions:   number | null;  // L/h depuis missions

  detailMissions: ConsommationMissionDto[];
}

// ── Rapport global flotte ────────────────────────────────────────────────────

export interface RapportCarburantResponse {
  debut:         string;   // LocalDate → ISO string
  fin:           string;
  enginIdFiltre: number | null;

  // Totaux flotte
  totalLitresConsommes:      number;
  coutTotalCarburant:        number;
  ratioHoraireMoyenFlotte:   number | null;

  // Statistiques de couverture
  nbEnginsActifs:          number;
  nbMissionsTotal:         number;
  nbMissionsAvecCarburant: number;
  tauxCouvertureGlobal:    number;

  bilansParEngin: BilanCarburantEnginDto[];
}
