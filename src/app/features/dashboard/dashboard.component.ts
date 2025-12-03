import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TenantService } from '../../core/services/tenant.service';
import { TenantStats } from '../../models/tenant.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <h1>Dashboard</h1>
        <p class="subtitle">Visão geral do sistema de gestão de tenants</p>
      </div>
      
      <div class="stats-grid" *ngIf="stats">
        <div class="stat-card card clickable" routerLink="/tenants">
          <div class="stat-icon">🏢</div>
          <div class="stat-content">
            <h3>{{ stats.totalTenants }}</h3>
            <p>Total de Tenants</p>
          </div>
          <div class="stat-arrow">→</div>
        </div>

        <div class="stat-card card clickable" routerLink="/tenants" [queryParams]="{status: 'active'}">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <h3>{{ stats.activeTenants }}</h3>
            <p>Tenants Ativos</p>
          </div>
          <div class="stat-arrow">→</div>
        </div>

        <div class="stat-card card clickable" routerLink="/tenants" [queryParams]="{status: 'inactive'}">
          <div class="stat-icon">❌</div>
          <div class="stat-content">
            <h3>{{ stats.inactiveTenants }}</h3>
            <p>Tenants Inativos</p>
          </div>
          <div class="stat-arrow">→</div>
        </div>

        <div class="stat-card card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3>{{ stats.totalUsers }}</h3>
            <p>Total de Usuários</p>
          </div>
        </div>
      </div>

      <div class="spinner" *ngIf="loading"></div>

      <div class="quick-actions">
        <h2>Ações Rápidas</h2>
        <div class="actions-grid">
          <div class="action-card card clickable" routerLink="/tenants">
            <div class="action-icon">📋</div>
            <div class="action-content">
              <h3>Ver Tenants</h3>
              <p>Lista completa de todos os tenants cadastrados</p>
            </div>
          </div>

          <div class="action-card card clickable" (click)="navigateToCreateTenant()">
            <div class="action-icon">➕</div>
            <div class="action-content">
              <h3>Novo Tenant</h3>
              <p>Cadastrar um novo tenant no sistema</p>
            </div>
          </div>

          <div class="action-card card clickable" routerLink="/tenants" [queryParams]="{status: 'active'}">
            <div class="action-icon">🔍</div>
            <div class="action-content">
              <h3>Tenants Ativos</h3>
              <p>Visualizar apenas tenants ativos</p>
            </div>
          </div>

          <div class="action-card card clickable" routerLink="/tenants" [queryParams]="{status: 'inactive'}">
            <div class="action-icon">⚠️</div>
            <div class="action-content">
              <h3>Tenants Inativos</h3>
              <p>Gerenciar tenants inativos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      margin-bottom: 2rem;
    }

    .dashboard-header h1 {
      margin: 0 0 0.5rem 0;
      color: var(--text-primary);
      font-size: 2rem;
    }

    .subtitle {
      color: var(--text-secondary);
      margin: 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      position: relative;
      transition: all 0.3s ease;
    }

    .stat-card.clickable {
      cursor: pointer;
    }

    .stat-card.clickable:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
      font-size: 3rem;
    }

    .stat-content {
      flex: 1;
    }

    .stat-content h3 {
      font-size: 2rem;
      margin: 0;
      color: var(--primary-color);
    }

    .stat-content p {
      margin: 0;
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .stat-arrow {
      font-size: 1.5rem;
      color: var(--primary-color);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .stat-card.clickable:hover .stat-arrow {
      opacity: 1;
    }

    .quick-actions {
      margin-top: 3rem;
    }

    .quick-actions h2 {
      margin-bottom: 1.5rem;
      color: var(--text-primary);
      font-size: 1.5rem;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .action-card {
      display: flex;
      gap: 1.5rem;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .action-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      border-color: var(--primary-color);
    }

    .action-icon {
      font-size: 2.5rem;
      flex-shrink: 0;
    }

    .action-content h3 {
      margin: 0 0 0.5rem 0;
      color: var(--text-primary);
      font-size: 1.125rem;
    }

    .action-content p {
      margin: 0;
      color: var(--text-secondary);
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .clickable {
      cursor: pointer;
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: TenantStats | null = null;
  loading = false;

  constructor(
    private tenantService: TenantService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.tenantService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.loading = false;
      }
    });
  }

  navigateToCreateTenant(): void {
    this.router.navigate(['/tenants'], { 
      queryParams: { create: 'true' } 
    });
  }
}
