export interface LoginDTO {
  email: string;
  password: string;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  fullName: string;
  role: string;
}

export interface UpdateUserDTO {
  phoneNumber?: string;
  locations?: [string];
}
