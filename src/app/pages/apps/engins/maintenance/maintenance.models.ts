// ── Enums ──────────────────────────────────────────────────────────────────

export enum TypeMaintenance {
  PREVENTIVE              = 'PREVENTIVE',
  CURATIVE                = 'CURATIVE',
  REVISION                = 'REVISION',
  CONTROLE_REGLEMENTAIRE  = 'CONTROLE_REGLEMENTAIRE',
}

export enum SystemeIntervention {
  MOTEUR                  = 'MOTEUR',
  HYDRAULIQUE             = 'HYDRAULIQUE',
  FREINAGE                = 'FREINAGE',
  ELECTRICITE             = 'ELECTRICITE',
  TRANSMISSION            = 'TRANSMISSION',
  CHASSIS                 = 'CHASSIS',
  EQUIPEMENT_TRAVAIL      = 'EQUIPEMENT_TRAVAIL',
  PNEUMATIQUES_CHENILLES  = 'PNEUMATIQUES_CHENILLES',
  FILTRATION              = 'FILTRATION',
  FLUIDES                 = 'FLUIDES',
  STRUCTURE               = 'STRUCTURE',
  AUTRE                   = 'AUTRE',
}

// ── Labels ─────────────────────────────────────────────────────────────────

export const TYPE_MAINTENANCE_LABELS: Record<TypeMaintenance, string> = {
  [TypeMaintenance.PREVENTIVE]:             'Préventive',
  [TypeMaintenance.CURATIVE]:               'Curative',
  [TypeMaintenance.REVISION]:               'Révision',
  [TypeMaintenance.CONTROLE_REGLEMENTAIRE]: 'Contrôle réglementaire',
};

export const SYSTEME_INTERVENTION_LABELS: Record<SystemeIntervention, string> = {
  [SystemeIntervention.MOTEUR]:                 'Moteur',
  [SystemeIntervention.HYDRAULIQUE]:            'Hydraulique',
  [SystemeIntervention.FREINAGE]:               'Freinage',
  [SystemeIntervention.ELECTRICITE]:            'Électricité',
  [SystemeIntervention.TRANSMISSION]:           'Transmission',
  [SystemeIntervention.CHASSIS]:                'Châssis',
  [SystemeIntervention.EQUIPEMENT_TRAVAIL]:     'Équipement de travail',
  [SystemeIntervention.PNEUMATIQUES_CHENILLES]: 'Pneumatiques / Chenilles',
  [SystemeIntervention.FILTRATION]:             'Filtration',
  [SystemeIntervention.FLUIDES]:                'Fluides',
  [SystemeIntervention.STRUCTURE]:              'Structure',
  [SystemeIntervention.AUTRE]:                  'Autre',
};

// ── Request DTOs ───────────────────────────────────────────────────────────

export interface ActionInterventionRequest {
  systeme: SystemeIntervention;
  descriptionAction: string;
  resultat?: string;
}

export interface PieceConsommeeRequest {
  pieceRechangeId?: number;
  referencePiece?: string;
  designation: string;
  quantite: number;
  unite: string;
  prixUnitaire?: number;
}

export interface MaintenanceRequest {
  enginId: number;
  conducteurId?: number;
  codeMaintenance?: string;
  libMaintenance?: string;
  dateDbtMaintenance: string;
  horametreIntervention?: number;
  type: TypeMaintenance;
  nomTechnicien?: string;
  heureDebut?: string;
  heureFin?: string;
  descriptionTravaux?: string;
  coutMainOeuvre?: number;
  prochaineEcheanceHeures?: number;
  prochaineMaintenanceDate?: string;
  enginOperationnel?: boolean;
  signatureTechnicien?: string;
  signatureResponsable?: string;
  actions?: ActionInterventionRequest[];
  piecesConsommees?: PieceConsommeeRequest[];
}

// ── Response DTOs ──────────────────────────────────────────────────────────

export interface ActionInterventionResponse {
  id: number;
  systeme: SystemeIntervention;
  descriptionAction: string;
  resultat?: string;
}

export interface PieceConsommeeResponse {
  id: number;
  pieceRechangeId?: number;
  referencePiece?: string;
  designation: string;
  quantite: number;
  unite: string;
  prixUnitaire?: number;
  montantTotal?: number;
}

export interface MaintenanceSummary {
  id: number;
  codeMaintenance?: string;
  libMaintenance?: string;
  dateDbtMaintenance: string;
  horametreIntervention?: number;
  type: TypeMaintenance;
  enginId: number;
  codeEngin: string;
  modelEngin: string;
  conducteurId?: number;
  nomConducteur?: string;
  prenomsConducteur?: string;
  nomTechnicien?: string;
  enginOperationnel?: boolean;
  coutTotal?: number;
  nbActions: number;
  nbPieces: number;
  dateCreation: string;
}

export interface MaintenanceDetail extends MaintenanceSummary {
  heureDebut?: string;
  heureFin?: string;
  descriptionTravaux?: string;
  coutMainOeuvre?: number;
  coutPieces?: number;
  prochaineEcheanceHeures?: number;
  prochaineMaintenanceDate?: string;
  signatureTechnicien?: string;
  signatureResponsable?: string;
  actions: ActionInterventionResponse[];
  piecesConsommees: PieceConsommeeResponse[];
  dateModification?: string;
}

// ── Page wrapper (Spring Page response) ───────────────────────────────────

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
