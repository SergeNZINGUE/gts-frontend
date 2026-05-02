export interface EmployeeRequest {
  id?: number;
  codeConducteur?: string;
  nomConducteur: string;
  prenomsConducteur: string;
  telephone: string;
  cniRef: string;
  cniDateEmi: Date;
  cniLieuEtab: string;
  cniDateExp: Date;
  permisCond: string;
  qualifications: string;
  dateDebutEmp: Date;
  typEmpl: string;
  //imgCni: string;
  imgConducteur: string;
 // imgPermis: string;
}


