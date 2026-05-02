export interface LocationEnginResponse {
  id?:number;
  clientId?:number;
  clientDescriptionEntreprise?:string;

  codeLocation?:string;

  conducteurId?:number;

  conducteurNom?:string;

  conducteurPrenoms?:string;

  coutHoraireLocation?:number;

  coutJournalierLocation?:number;

  dateCreation?:string|Date;

  dateDbtLoc?:string|Date;

  dateDebut?:string|Date;

  dateFinLoc?:string|Date;

  dateModification?:string|Date;

  enginId?:number;

  enginCode?:string;

  enginModel?:string
  marqueEngin?:string;

  etatLocation?:number;

  nbHeureLocation?:number;

  nbJoursLocation?:number;

  siteLocation?:string;

  statut?:string;

}
