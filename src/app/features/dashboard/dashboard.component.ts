import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TenantService } from '../../core/services/tenant.service';
import { TenantStats } from '../../models/tenant.model';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, ProgressSpinnerModule],
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <h1>Dashboard</h1>
        <p class="subtitle">Visão geral do sistema de gestão de tenants</p>
      </div>
      
      <div class="stats-grid" *ngIf="stats">
        <p-card styleClass="stat-card" (click)="router.navigate(['/tenants'])">
          <div class="stat-content">
            <i class="pi pi-building stat-icon"></i>
            <div class="stat-info">
              <h3>{{ stats.totalTenants }}</h3>
              <p>Total de Tenants</p>
            </div>
            <i class="pi pi-arrow-right stat-arrow"></i>
          </div>
        </p-card>

        <p-card styleClass="stat-card" (click)="navigateToActive()">
          <div class="stat-content">
            <i class="pi pi-check-circle stat-icon" style="color: var(--green-500);"></i>
            <div class="stat-info">
              <h3>{{ stats.activeTenants }}</h3>
              <p>Tenants Ativos</p>
            </div>
            <i class="pi pi-arrow-right stat-arrow"></i>
          </div>
        </p-card>

        <p-card styleClass="stat-card" (click)="navigateToInactive()">
          <div class="stat-content">
            <i class="pi pi-times-circle stat-icon" style="color: var(--red-500);"></i>
            <div class="stat-info">
              <h3>{{ stats.inactiveTenants }}</h3>
              <p>Tenants Inativos</p>
            </div>
            <i class="pi pi-arrow-right stat-arrow"></i>
          </div>
        </p-card>

        <p-card styleClass="stat-card">
          <div class="stat-content">
            <i class="pi pi-users stat-icon" style="color: var(--blue-500);"></i>
            <div class="stat-info">
              <h3>{{ stats.totalUsers }}</h3>
              <p>Total de Usuários</p>
            </div>
          </div>
        </p-card>
      </div>

      <div class="loading-container" *ngIf="loading">
        <p-progressSpinner></p-progressSpinner>
      </div>

      <div class="quick-actions" *ngIf="!loading">
        <h2>Ações Rápidas</h2>
        <div class="actions-grid">
          <p-card styleClass="action-card" (click)="router.navigate(['/tenants'])">
            <div class="action-content">
              <i class="pi pi-list action-icon"></i>
              <div class="action-info">
                <h3>Ver Tenants</h3>
                <p>Lista completa de todos os tenants cadastrados</p>
              </div>
            </div>
          </p-card>

          <p-card styleClass="action-card" (click)="navigateToCreateTenant()">
            <div class="action-content">
              <i class="pi pi-plus-circle action-icon"></i>
              <div class="action-info">
                <h3>Novo Tenant</h3>
                <p>Cadastrar um novo tenant no sistema</p>
              </div>
            </div>
          </p-card>

          <p-card styleClass="action-card" (click)="navigateToActive()">
            <div class="action-content">
              <i class="pi pi-search action-icon"></i>
              <div class="action-info">
                <h3>Tenants Ativos</h3>
                <p>Visualizar apenas tenants ativos</p>
              </div>
            </div>
          </p-card>

          <p-card styleClass="action-card" (click)="navigateToInactive()">
            <div class="action-content">
              <i class="pi pi-exclamation-triangle action-icon"></i>
              <div class="action-info">
                <h3>Tenants Inativos</h3>
                <p>Gerenciar tenants inativos</p>
              </div>
            </div>
          </p-card>
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

    :host ::ng-deep .stat-card {
      cursor: pointer;
      transition: all 0.3s ease;
    }

    :host ::ng-deep .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-icon {
      font-size: 3rem;
      color: var(--primary-color);
    }

    .stat-info {
      flex: 1;
    }

    .stat-info h3 {
      font-size: 2rem;
      margin: 0;
      color: var(--text-primary);
    }

    .stat-info p {
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

    :host ::ng-deep .stat-card:hover .stat-arrow {
      opacity: 1;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
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

    :host ::ng-deep .action-card {
      cursor: pointer;
      transition: all 0.3s ease;
    }

    :host ::ng-deep .action-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }

    .action-content {
      display: flex;
      gap: 1.5rem;
      align-items: flex-start;
    }

    .action-icon {
      font-size: 2.5rem;
      color: var(--primary-color);
      flex-shrink: 0;
    }

    .action-info h3 {
      margin: 0 0 0.5rem 0;
      color: var(--text-primary);
      font-size: 1.125rem;
    }

    .action-info p {
      margin: 0;
      color: var(--text-secondary);
      font-size: 0.875rem;
      line-height: 1.5;
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: TenantStats | null = null;
  loading = false;

  constructor(
    private tenantService: TenantService,
    public router: Router
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

  navigateToActive(): void {
    this.router.navigate(['/tenants'], { 
      queryParams: { status: 'active' } 
    });
  }

  navigateToInactive(): void {
    this.router.navigate(['/tenants'], { 
      queryParams: { status: 'inactive' } 
    });
  }
}
