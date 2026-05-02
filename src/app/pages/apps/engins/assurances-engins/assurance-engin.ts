export enum StatutAssurance {
  VALIDE = 'VALIDE',
  EXPIRE = 'EXPIRE',
  ANNULE = 'ANNULE',
}

export interface AssuranceEngin {
  id?: number;
  numeroPolice?: string;
  compagnieAssurance?: string;
  dateDebut?: string;
  dateFin?: string;
  montant?: number;
  documentUrl?: string;
  statut?: StatutAssurance;
  dateCreation?: string;
  dateModification?: string;
  enginId?: number;
  enginCode?: string;
  enginModel?: string;
}

export interface AssurancePayload {
  numeroPolice: string;
  compagnieAssurance: string;
  dateDebut: string;
  dateFin: string;
  montant: number;
  documentUrl?: string;
  statut: StatutAssurance;
  enginId: number;
}
