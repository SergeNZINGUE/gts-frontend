export interface PieceRechange {
  id?: number;
  designation: string;
  referenceConstructeur?: string;
  quantiteEnStock: number;
  seuilAlerteStock: number;
  prixUnitaireAchat: number;
  alerteReapprovisionnement?: boolean;
  messageAlerteStock?: string;
  dateCreation?: string;
  dateModification?: string;
}

export interface PieceRechangePayload {
  designation: string;
  referenceConstructeur?: string;
  quantiteEnStock: number;
  seuilAlerteStock: number;
  prixUnitaireAchat: number;
}
