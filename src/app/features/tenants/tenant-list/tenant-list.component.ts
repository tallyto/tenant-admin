import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { TenantService } from '../../../core/services/tenant.service';
import { ToastService } from '../../../core/services/toast.service';
import { Tenant, TenantCadastro } from '../../../models/tenant.model';

@Component({
  selector: 'app-tenant-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
  template: `
    <div class="tenant-list">
      <div class="header">
        <h1>Gerenciar Tenants</h1>
        <div class="header-actions">
          <button class="btn btn-success" (click)="showCreateForm = true">
            ➕ Novo Tenant
          </button>
          <button class="btn btn-primary" (click)="loadTenants()">
            🔄 Atualizar
          </button>
        </div>
      </div>

      <!-- Formulário de Cadastro -->
      <div class="card" *ngIf="showCreateForm" style="margin-bottom: 2rem;">
        <div class="form-header">
          <h3>Cadastrar Novo Tenant</h3>
          <button class="btn btn-secondary" (click)="cancelCreate()">✖ Cancelar</button>
        </div>
        <form [formGroup]="createForm" (ngSubmit)="createTenant()">
          <div class="form-row">
            <div class="form-group">
              <label for="name">Nome da Empresa *</label>
              <input type="text" id="name" formControlName="name" placeholder="Minha Empresa Ltda">
              <div class="error" *ngIf="createForm.get('name')?.invalid && createForm.get('name')?.touched">
                <span *ngIf="createForm.get('name')?.errors?.['required']">Nome é obrigatório</span>
                <span *ngIf="createForm.get('name')?.errors?.['minlength']">Nome deve ter no mínimo 3 caracteres</span>
              </div>
            </div>
            <div class="form-group">
              <label for="domain">Domínio *</label>
              <input type="text" id="domain" formControlName="domain" placeholder="minhaempresa.com.br">
              <small class="form-hint">Ex: minhaempresa.com.br (será usado como identificador único)</small>
              <div class="error" *ngIf="createForm.get('domain')?.invalid && createForm.get('domain')?.touched">
                <span *ngIf="createForm.get('domain')?.errors?.['required']">Domínio é obrigatório</span>
                <span *ngIf="createForm.get('domain')?.errors?.['pattern']">Formato inválido (ex: empresa.com.br)</span>
              </div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="email">Email de Contato *</label>
              <input type="email" id="email" formControlName="email" placeholder="contato@minhaempresa.com.br">
              <small class="form-hint">Um email de confirmação será enviado para este endereço</small>
              <div class="error" *ngIf="createForm.get('email')?.invalid && createForm.get('email')?.touched">
                <span *ngIf="createForm.get('email')?.errors?.['required']">Email é obrigatório</span>
                <span *ngIf="createForm.get('email')?.errors?.['email']">Email inválido</span>
              </div>
            </div>
            <div class="form-group">
              <label for="phoneNumber">Telefone</label>
              <input type="tel" id="phoneNumber" formControlName="phoneNumber" placeholder="(11) 99999-9999">
              <small class="form-hint">Opcional</small>
            </div>
          </div>
          <div class="form-group">
            <label for="address">Endereço</label>
            <input type="text" id="address" formControlName="address" placeholder="Rua Example, 123 - São Paulo/SP">
            <small class="form-hint">Opcional</small>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="creating" (click)="onSubmitClick($event)">
              {{ creating ? '⏳ Cadastrando...' : '✓ Cadastrar Tenant' }}
            </button>
            <button type="button" class="btn btn-secondary" (click)="cancelCreate()" [disabled]="creating">
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <!-- Filtros -->
      <div class="card filters" *ngIf="!showCreateForm">
        <div class="filter-row">
          <div class="form-group">
            <input 
              type="text" 
              [(ngModel)]="searchTerm" 
              (ngModelChange)="applyFilters()"
              placeholder="🔍 Buscar por nome, domínio ou email...">
          </div>
          <div class="form-group">
            <select [(ngModel)]="statusFilter" (ngModelChange)="applyFilters()">
              <option value="">Todos os status</option>
              <option value="active">Apenas Ativos</option>
              <option value="inactive">Apenas Inativos</option>
            </select>
          </div>
          <div class="form-group">
            <select [(ngModel)]="planFilter" (ngModelChange)="applyFilters()">
              <option value="">Todos os planos</option>
              <option value="FREE">Free</option>
              <option value="BASIC">Basic</option>
              <option value="PREMIUM">Premium</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>
          </div>
        </div>
      </div>

      <div class="spinner" *ngIf="loading"></div>

      <div class="card" *ngIf="!loading">
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Domínio</th>
                <th>Email</th>
                <th>Plano</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let tenant of paginatedTenants()">
                <td>
                  <strong>{{ tenant.name }}</strong>
                  <br>
                  <small *ngIf="tenant.displayName">{{ tenant.displayName }}</small>
                </td>
                <td>{{ tenant.domain }}</td>
                <td>
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span>{{ isEmailVisible(tenant.id) ? tenant.email : maskEmail(tenant.email) }}</span>
                    <button 
                      class="btn-icon" 
                      (click)="toggleEmailVisibility(tenant.id)"
                      [title]="isEmailVisible(tenant.id) ? 'Ocultar email' : 'Mostrar email'">
                      {{ isEmailVisible(tenant.id) ? '🙈' : '👁️' }}
                    </button>
                  </div>
                </td>
                <td>
                  <span class="badge" 
                    [ngClass]="{
                      'badge-success': tenant.subscriptionPlan === 'PREMIUM' || tenant.subscriptionPlan === 'ENTERPRISE',
                      'badge-warning': tenant.subscriptionPlan === 'BASIC',
                      'badge-secondary': tenant.subscriptionPlan === 'FREE'
                    }">
                    {{ tenant.subscriptionPlan }}
                  </span>
                </td>
                <td>
                  <span class="badge" 
                    [ngClass]="{
                      'badge-success': tenant.active,
                      'badge-danger': !tenant.active
                    }">
                    {{ tenant.active ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <a [routerLink]="['/tenants', tenant.id]" class="btn btn-sm btn-secondary">
                      👁️ Ver
                    </a>
                    <button 
                      class="btn btn-sm"
                      [ngClass]="tenant.active ? 'btn-warning' : 'btn-success'"
                      (click)="toggleActive(tenant)">
                      {{ tenant.active ? '🔒 Desativar' : '✅ Ativar' }}
                    </button>
                    <button class="btn btn-sm btn-danger" (click)="deleteTenant(tenant)">
                      🗑️ Excluir
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredTenants.length === 0">
                <td colspan="6" style="text-align: center; padding: 2rem;">
                  {{ searchTerm || statusFilter || planFilter ? 'Nenhum tenant encontrado com os filtros aplicados' : 'Nenhum tenant cadastrado' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginação -->
        <div class="pagination" *ngIf="filteredTenants.length > pageSize">
          <button 
            class="btn btn-secondary btn-sm" 
            [disabled]="currentPage === 1"
            (click)="changePage(currentPage - 1)">
            ← Anterior
          </button>
          <span class="page-info">
            Página {{ currentPage }} de {{ totalPages() }} | Total: {{ filteredTenants.length }} tenants
          </span>
          <button 
            class="btn btn-secondary btn-sm" 
            [disabled]="currentPage === totalPages()"
            (click)="changePage(currentPage + 1)">
            Próxima →
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tenant-list {
      max-width: 1400px;
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

    .table-responsive {
      overflow-x: auto;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .btn-sm {
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
    }

    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      padding: 0.25rem;
      opacity: 0.6;
      transition: opacity 0.2s;
    }

    .btn-icon:hover {
      opacity: 1;
    }

    .badge-secondary {
      background-color: #e2e8f0;
      color: #475569;
    }

    td small {
      color: var(--text-secondary);
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

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .form-header h3 {
      margin: 0;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-hint {
      display: block;
      margin-top: 0.25rem;
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .form-actions button {
      flex: 0 0 auto;
    }

    .filters {
      margin-bottom: 1.5rem;
    }

    .filter-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 1rem;
    }

    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color);
    }

    .page-info {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }
  `]
})
export class TenantListComponent implements OnInit {
  tenants: Tenant[] = [];
  filteredTenants: Tenant[] = [];
  loading = false;
  
  // Paginação
  currentPage = 1;
  pageSize = 10;
  
  // Filtros
  searchTerm = '';
  statusFilter = '';
  planFilter = '';
  
  // Formulário de criação
  showCreateForm = false;
  createForm: FormGroup;
  creating = false;
  
  // Controle de visibilidade de emails
  visibleEmails = new Set<string>();

  constructor(
    private tenantService: TenantService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private route: ActivatedRoute
  ) {
    this.createForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      domain: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      address: ['']
    });
  }

  ngOnInit(): void {
    this.loadTenants();
    
    // Verifica se deve abrir o formulário de criação
    this.route.queryParams.subscribe(params => {
      if (params['create'] === 'true') {
        this.showCreateForm = true;
      }
      
      // Aplica filtro de status se fornecido
      if (params['status']) {
        this.statusFilter = params['status'];
        this.applyFilters();
      }
    });
  }

  loadTenants(): void {
    this.loading = true;
    this.tenantService.getAll().subscribe({
      next: (data) => {
        this.tenants = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tenants:', error);
        this.loading = false;
        alert('Erro ao carregar tenants');
      }
    });
  }

  applyFilters(): void {
    this.filteredTenants = this.tenants.filter(tenant => {
      const matchesSearch = !this.searchTerm || 
        tenant.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        tenant.domain.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        tenant.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.statusFilter ||
        (this.statusFilter === 'active' && tenant.active) ||
        (this.statusFilter === 'inactive' && !tenant.active);
      
      const matchesPlan = !this.planFilter || tenant.subscriptionPlan === this.planFilter;
      
      return matchesSearch && matchesStatus && matchesPlan;
    });
    
    this.currentPage = 1;
  }

  paginatedTenants(): Tenant[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredTenants.slice(start, end);
  }

  totalPages(): number {
    return Math.ceil(this.filteredTenants.length / this.pageSize);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage = page;
    }
  }

  onSubmitClick(event: Event): void {
    console.log('Button clicked!');
    console.log('Event:', event);
    // O ngSubmit do form vai chamar createTenant()
  }

  toggleEmailVisibility(tenantId: string): void {
    if (this.visibleEmails.has(tenantId)) {
      this.visibleEmails.delete(tenantId);
    } else {
      this.visibleEmails.add(tenantId);
    }
  }

  isEmailVisible(tenantId: string): boolean {
    return this.visibleEmails.has(tenantId);
  }

  maskEmail(email: string): string {
    const [username, domain] = email.split('@');
    if (!username || !domain) return '***@***';
    
    const visibleChars = Math.min(3, Math.floor(username.length / 3));
    const masked = username.substring(0, visibleChars) + '***';
    return `${masked}@${domain}`;
  }

  createTenant(): void {
    console.log('createTenant() called');
    console.log('Form valid:', this.createForm.valid);
    console.log('Form value:', this.createForm.value);
    console.log('Form errors:', this.getFormValidationErrors());
    
    if (this.createForm.invalid) {
      // Marcar todos os campos como touched para mostrar erros
      Object.keys(this.createForm.controls).forEach(key => {
        this.createForm.get(key)?.markAsTouched();
      });
      
      // Mostrar erros específicos
      const errors = this.getFormValidationErrors();
      const errorMessages = errors.map(err => `${err.control}: ${err.error}`).join('\n');
      
      this.toastService.warning('Por favor, corrija os seguintes erros:\n' + errorMessages, 10000);
      return;
    }

    this.creating = true;
    const tenantData: TenantCadastro = this.createForm.value;
    
    console.log('Sending request with data:', tenantData);

    this.tenantService.create(tenantData).subscribe({
      next: (response) => {
        console.log('Success response:', response);
        const message = response.message || 
          `Tenant cadastrado com sucesso! Um email de confirmação foi enviado para ${tenantData.email}`;
        
        this.toastService.success(message, 8000);
        this.createForm.reset();
        this.showCreateForm = false;
        this.creating = false;
        this.loadTenants();
      },
      error: (error) => {
        console.error('Error creating tenant:', error);
        this.creating = false;
        
        let errorMessage = 'Erro ao cadastrar tenant.';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.status === 400) {
          errorMessage = 'Dados inválidos. Verifique os campos e tente novamente.';
        } else if (error.status === 409) {
          errorMessage = 'Já existe um tenant com este domínio ou email.';
        } else if (error.status === 0) {
          errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
        }
        
        this.toastService.error(errorMessage);
      }
    });
  }

  cancelCreate(): void {
    this.createForm.reset();
    this.showCreateForm = false;
  }


  getFormValidationErrors(): Array<{control: string, error: string}> {
    const errors: Array<{control: string, error: string}> = [];
    Object.keys(this.createForm.controls).forEach(key => {
      const control = this.createForm.get(key);
      if (control && control.invalid && control.errors) {
        Object.keys(control.errors).forEach(errorKey => {
          let errorMessage = '';
          switch(errorKey) {
            case 'required':
              errorMessage = 'Campo obrigatório';
              break;
            case 'email':
              errorMessage = 'Email inválido';
              break;
            case 'minlength':
              errorMessage = `Mínimo ${control.errors![errorKey].requiredLength} caracteres`;
              break;
            case 'pattern':
              errorMessage = 'Formato inválido (use: empresa.com.br, SEM @)';
              break;
            default:
              errorMessage = errorKey;
          }
          errors.push({ control: key, error: errorMessage });
        });
      }
    });
    return errors;
  }

  toggleActive(tenant: Tenant): void {
    const action = tenant.active ? 'desativar' : 'ativar';
    if (!confirm(`Deseja realmente ${action} o tenant "${tenant.name}"?`)) {
      return;
    }

    this.tenantService.toggleActive(tenant).subscribe({
      next: () => {
        this.loadTenants();
        alert(`Tenant ${action === 'ativar' ? 'ativado' : 'desativado'} com sucesso!`);
      },
      error: (error) => {
        console.error('Error toggling tenant:', error);
        alert(`Erro ao ${action} tenant`);
      }
    });
  }

  deleteTenant(tenant: Tenant): void {
    if (!confirm(`Deseja realmente EXCLUIR o tenant "${tenant.name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    this.tenantService.delete(tenant.id).subscribe({
      next: () => {
        this.loadTenants();
        alert('Tenant excluído com sucesso!');
      },
      error: (error) => {
        console.error('Error deleting tenant:', error);
        alert('Erro ao excluir tenant');
      }
    });
  }
}
