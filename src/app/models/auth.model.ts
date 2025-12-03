export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
}

export interface AuthUser {
  email: string;
  nome: string;
  token: string;
}
