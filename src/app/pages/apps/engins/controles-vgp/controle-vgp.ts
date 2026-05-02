export interface ControleVGP {
  id?: number;
  dateDernierControle?: string;
  dateProchaineEcheance?: string;
  organismeControleur?: string;
  numeroRapport?: string;
  resultat?: string;      // CONFORME | AVEC_RESERVES | NON_CONFORME
  reserveVGP?: string;
  estAlerteActive?: boolean;
  dateCreation?: string;
  dateModification?: string;
  enginId?: number;
  enginCode?: string;
  enginModel?: string;
}

export interface ControleVGPPayload {
  enginId: number;
  dateDernierControle: string;
  dateProchaineEcheance: string;
  organismeControleur: string;
  numeroRapport?: string;
  resultat: string;
  reserveVGP?: string;
  estAlerteActive: boolean;
}
