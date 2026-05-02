import {list} from "postcss";

export class ConducteurDetailsModel {
  constructor(
    public conducteurId :number,
    public codeConducteur :number,
    public nomConducteur: string,
    public prenomsConducteur: string,
    public telephone: string,
    public permisCond: string,
    public qualifications: string,
    public statutConducteur: string,
    public nombreMissions: number,
    public dateDebutEmp: Date,
    public dateFinEmp: Date,
    public dateNaissance: Date,
    public typEmpl:string,
    public page: number,
    public size: number,
    public totalPages: number,
    public missions:any[]

  ) {

  }
}
