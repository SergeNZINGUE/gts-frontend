export interface UserRequest {
  username: string;
  nomUsers: string;
  prenomsUsers: string;
  emailUsers: string;
  tel1Users: string;
  active: boolean;
  cguUsers: boolean;
  roleCode: string;
}

export interface RegisterRequest extends UserRequest {
  password: string;
}