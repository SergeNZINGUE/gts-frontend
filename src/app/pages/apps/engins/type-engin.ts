export type FamilleEngin = 'ENGIN_CHANTIER' | 'CAMION' | 'VEHICULE_LEGER' | 'AUTRE';

export interface TypeEnginResponse {
  id: number;
  code: string;
  libelle: string;
  famille: FamilleEngin;
  description?: string;
  actif: boolean;
}