export interface Engin {
  id: number;
  codeEngin: string;
  modelEngin: string;
  anneeEngin: string | Date;
  immatriculationEngin: string;
  typeEngin: string;
  marqueEngin: string;
  etatEngin: number;
  statusEngin: string;
  typCarbtEngin: string;
  dateAcqEngin: string | Date;
  coutHorLocEngin: number;
  forfaitJournalierEngin: number;
  dateCreation: string | Date;
  dateModification: string | Date;
  poidsVide: number;
  horametre: number;
  action?: string;
}
