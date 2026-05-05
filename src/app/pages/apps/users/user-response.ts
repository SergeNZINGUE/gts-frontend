export interface UserResponse {
  id: number;
  username: string;
  active: boolean;
  nomUsers: string;
  prenomsUsers: string;
  emailUsers: string;
  tel1Users: string;
  cguUsers: boolean;
  dateCreation: string;
  dateModification: string;
  roles: string[];
}