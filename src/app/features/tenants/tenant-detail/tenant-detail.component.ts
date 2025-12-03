import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TenantService } from '../../../core/services/tenant.service';
import { Tenant } from '../../../models/tenant.model';
import { Usuario } from '../../../models/usuario.model';

@Component({
  selector: 'app-tenant-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="tenant-detail">
      <div class="header">
        <h1>Detalhes do Tenant</h1>
        <a routerLink="/tenants" class="btn btn-secondary">← Voltar</a>
      </div>

      <div class="spinner" *ngIf="loading"></div>

      <div *ngIf="!loading && tenant">
        <div class="card">
          <h2>{{ tenant.name }}</h2>
          <p class="domain">{{ tenant.domain }}</p>
          
          <div class="status-badge">
            <span class="badge" 
              [ngClass]="{
                'badge-success': tenant.active,
                'badge-danger': !tenant.active
              }">
              {{ tenant.active ? '✅ Ativo' : '❌ Inativo' }}
            </span>
            <span class="badge badge-secondary">
              {{ tenant.subscriptionPlan }}
            </span>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <strong>Email:</strong>
              <span>{{ tenant.email }}</span>
            </div>

            <div class="info-item" *ngIf="tenant.phoneNumber">
              <strong>Telefone:</strong>
              <span>{{ tenant.phoneNumber }}</span>
            </div>

            <div class="info-item" *ngIf="tenant.address">
              <strong>Endereço:</strong>
              <span>{{ tenant.address }}</span>
            </div>

            <div class="info-item" *ngIf="tenant.displayName">
              <strong>Nome de Exibição:</strong>
              <span>{{ tenant.displayName }}</span>
            </div>

            <div class="info-item" *ngIf="tenant.maxUsers">
              <strong>Máx. Usuários:</strong>
              <span>{{ tenant.maxUsers }}</span>
            </div>

            <div class="info-item" *ngIf="tenant.timezone">
              <strong>Timezone:</strong>
              <span>{{ tenant.timezone }}</span>
            </div>

            <div class="info-item" *ngIf="tenant.locale">
              <strong>Localização:</strong>
              <span>{{ tenant.locale }}</span>
            </div>

            <div class="info-item" *ngIf="tenant.currencyCode">
              <strong>Moeda:</strong>
              <span>{{ tenant.currencyCode }}</span>
            </div>

            <div class="info-item" *ngIf="tenant.createdAt">
              <strong>Criado em:</strong>
              <span>{{ tenant.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>

            <div class="info-item" *ngIf="tenant.updatedAt">
              <strong>Atualizado em:</strong>
              <span>{{ tenant.updatedAt | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
          </div>

          <div class="actions">
            <button 
              class="btn"
              [ngClass]="tenant.active ? 'btn-warning' : 'btn-success'"
              (click)="toggleActive()">
              {{ tenant.active ? '🔒 Desativar Tenant' : '✅ Ativar Tenant' }}
            </button>
            <button class="btn btn-danger" (click)="deleteTenant()">
              🗑️ Excluir Tenant
            </button>
          </div>
        </div>

        <div class="card" style="margin-top: 2rem;">
          <h3>👥 Usuários do Tenant</h3>
          
          <div class="spinner" *ngIf="loadingUsuarios"></div>
          
          <div *ngIf="!loadingUsuarios && usuarios.length > 0" class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Criado em</th>
                  <th>Último Acesso</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let usuario of usuarios">
                  <td>{{ usuario.nome }}</td>
                  <td>{{ usuario.email }}</td>
                  <td>{{ usuario.criadoEm | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td>{{ usuario.ultimoAcesso ? (usuario.ultimoAcesso | date:'dd/MM/yyyy HH:mm') : 'Nunca acessou' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <p class="text-secondary" *ngIf="!loadingUsuarios && usuarios.length === 0">
            Nenhum usuário cadastrado neste tenant ainda.
          </p>
        </div>

        <div class="card" style="margin-top: 2rem;">
          <h3>Atividades Recentes</h3>
          <p class="text-secondary">Em desenvolvimento - aqui serão exibidas as atividades dos usuários deste tenant.</p>
        </div>
      </div>

      <div class="card" *ngIf="!loading && !tenant">
        <p>Tenant não encontrado.</p>
      </div>
    </div>
  `,
  styles: [`
    .tenant-detail {
      max-width: 1000px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    h1 {
      margin: 0;
    }

    h2 {
      margin: 0 0 0.5rem 0;
      color: var(--primary-color);
    }

    .domain {
      color: var(--text-secondary);
      margin-bottom: 1rem;
      font-size: 1.1rem;
    }

    .status-badge {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 2rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin: 2rem 0;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .info-item strong {
      color: var(--text-secondary);
      font-size: 0.875rem;
      text-transform: uppercase;
    }

    .actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid var(--border-color);
    }

    .text-secondary {
      color: var(--text-secondary);
    }

    .badge-secondary {
      background-color: #e2e8f0;
      color: #475569;
    }

    .btn-success {
      background-color: var(--success-color);
      color: white;
    }

    .btn-success:hover {
      background-color: #059669;
    }

    .btn-warning {
      background-color: var(--warning-color);
      color: white;
    }

    .btn-warning:hover {
      background-color: #d97706;
    }
  `]
})
export class TenantDetailComponent implements OnInit {
  tenant: Tenant | null = null;
  usuarios: Usuario[] = [];
  loading = false;
  loadingUsuarios = false;
  tenantId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tenantService: TenantService
  ) {}

  ngOnInit(): void {
    this.tenantId = this.route.snapshot.paramMap.get('id') || '';
    if (this.tenantId) {
      this.loadTenant();
    }
  }

  loadTenant(): void {
    this.loading = true;
    this.tenantService.getById(this.tenantId).subscribe({
      next: (data) => {
        this.tenant = data;
        this.loading = false;
        this.loadUsuarios();
      },
      error: (error) => {
        console.error('Error loading tenant:', error);
        this.loading = false;
        alert('Erro ao carregar tenant');
      }
    });
  }

  loadUsuarios(): void {
    this.loadingUsuarios = true;
    this.tenantService.getUsuarios(this.tenantId).subscribe({
      next: (data) => {
        this.usuarios = data;
        this.loadingUsuarios = false;
      },
      error: (error) => {
        console.error('Error loading usuarios:', error);
        this.loadingUsuarios = false;
      }
    });
  }

  toggleActive(): void {
    if (!this.tenant) return;

    const action = this.tenant.active ? 'desativar' : 'ativar';
    if (!confirm(`Deseja realmente ${action} o tenant "${this.tenant.name}"?`)) {
      return;
    }

    this.tenantService.toggleActive(this.tenant).subscribe({
      next: () => {
        this.loadTenant();
        alert(`Tenant ${action === 'ativar' ? 'ativado' : 'desativado'} com sucesso!`);
      },
      error: (error) => {
        console.error('Error toggling tenant:', error);
        alert(`Erro ao ${action} tenant`);
      }
    });
  }

  deleteTenant(): void {
    if (!this.tenant) return;

    if (!confirm(`Deseja realmente EXCLUIR o tenant "${this.tenant.name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    this.tenantService.delete(this.tenant.id).subscribe({
      next: () => {
        alert('Tenant excluído com sucesso!');
        this.router.navigate(['/tenants']);
      },
      error: (error) => {
        console.error('Error deleting tenant:', error);
        alert('Erro ao excluir tenant');
      }
    });
  }
}
