export interface Employee {
  id: number;
  codeConducteur: string;
  dateCreation: Date;
  dateDebutEmp: Date;
  dateFinEmp: Date;
  dateModification: Date;
  imgCni: string;
  imgConducteur: string;
  imgPermis: string;
  nomConducteur: string;
  permisCond: string;
  prenomsConducteur: string;
  qualifications: string;
  statutConducteur: number;
  telephone: string;
  typEmpl: string;
  cniDateEmi: Date;
  cniDateExp: Date;
  cniLieuEtab: string;
  cniRef: string;
  action?: string;
}


