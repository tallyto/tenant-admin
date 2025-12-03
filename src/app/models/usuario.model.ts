export interface Usuario {
  id: number;
  email: string;
  nome: string;
  tenantId: string;
  criadoEm?: string;
  ultimoAcesso?: string;
}

export interface UsuarioTenant {
  id: number;
  usuario: Usuario;
  tenant: string;
  role: string;
  joinedAt?: string;
}
