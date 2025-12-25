import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Tenant, TenantCadastro, TenantStats } from '../../models/tenant.model';

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private apiUrl = `${environment.apiUrl}/tenants`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Tenant[]> {
    return this.http.get<Tenant[]>(this.apiUrl);
  }

  getById(id: string): Observable<Tenant> {
    return this.http.get<Tenant>(`${this.apiUrl}/${id}`);
  }

  create(tenant: TenantCadastro): Observable<any> {
    return this.http.post(`${this.apiUrl}/cadastro`, tenant);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleActive(tenant: Tenant): Observable<Tenant> {
    // Aqui você precisará criar um endpoint no backend para ativar/desativar
    // Por enquanto, vou simular com um PUT
    const updatedTenant = { ...tenant, active: !tenant.active };
    return this.http.put<Tenant>(`${this.apiUrl}/${tenant.id}`, updatedTenant);
  }

  getStats(): Observable<TenantStats> {
    // Endpoint customizado para estatísticas (você precisará criar no backend)
    return this.http.get<TenantStats>(`${this.apiUrl}/stats`);
  }

  confirmTenant(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/confirmar`, { token });
  }

  verificarToken(token: string): Observable<any> {
    const params = new HttpParams().set('token', token);
    return this.http.get(`${this.apiUrl}/verificar`, { params });
  }

  getUsuarios(tenantId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${tenantId}/usuarios`);
  }
  
  // Método para reenviar email de ativação da conta
  reenviarTokenCriarUsuario(tenantId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${tenantId}/reenviar-token-usuario`, {});
  }

  toggleStatus(tenantId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${tenantId}/toggle-status`, {});
  }

  toggleUsuarioStatus(tenantId: number, usuarioId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${tenantId}/usuarios/${usuarioId}/toggle-status`, {});
  }

  // Método para exportar dados do tenant se necessário
  exportarDados(tenantId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${tenantId}/exportar`, {});
  }
}
