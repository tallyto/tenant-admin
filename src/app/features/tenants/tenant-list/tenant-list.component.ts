import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { TenantService } from '../../../core/services/tenant.service';
import { ToastService } from '../../../core/services/toast.service';
import { Tenant, TenantCadastro } from '../../../models/tenant.model';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-tenant-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    ReactiveFormsModule, 
    FormsModule,
    TableModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    DialogModule,
    ProgressSpinnerModule,
    TooltipModule
  ],
  template: `
    <div class="tenant-list">
      <div class="header">
        <h1>Gerenciar Tenants</h1>
        <div class="header-actions">
          <p-button 
            label="Novo Tenant" 
            icon="pi pi-plus" 
            (onClick)="showCreateForm = true"
            severity="success">
          </p-button>
          <p-button 
            label="Atualizar" 
            icon="pi pi-refresh" 
            (onClick)="loadTenants()"
            [outlined]="true">
          </p-button>
        </div>
      </div>

      <!-- Dialog de Cadastro -->
      <p-dialog 
        header="Cadastrar Novo Tenant" 
        [(visible)]="showCreateForm" 
        [modal]="true"
        [style]="{width: '50vw'}"
        [draggable]="false"
        [resizable]="false">
        <form [formGroup]="createForm" (ngSubmit)="createTenant()">
          <div class="form-grid">
            <div class="p-field">
              <label for="name">Nome da Empresa *</label>
              <input 
                pInputText 
                id="name" 
                formControlName="name" 
                placeholder="Minha Empresa Ltda"
                class="w-full">
              <small class="p-error" *ngIf="createForm.get('name')?.invalid && createForm.get('name')?.touched">
                <span *ngIf="createForm.get('name')?.errors?.['required']">Nome é obrigatório</span>
                <span *ngIf="createForm.get('name')?.errors?.['minlength']">Nome deve ter no mínimo 3 caracteres</span>
              </small>
            </div>
            <div class="p-field">
              <label for="domain">Domínio *</label>
              <input 
                pInputText 
                id="domain" 
                formControlName="domain" 
                placeholder="minhaempresa.com.br"
                class="w-full">
              <small class="form-hint">Ex: minhaempresa.com.br (será usado como identificador único)</small>
              <small class="p-error" *ngIf="createForm.get('domain')?.invalid && createForm.get('domain')?.touched">
                <span *ngIf="createForm.get('domain')?.errors?.['required']">Domínio é obrigatório</span>
                <span *ngIf="createForm.get('domain')?.errors?.['pattern']">Formato inválido (ex: empresa.com.br)</span>
              </small>
            </div>
          </div>
          <div class="form-grid">
            <div class="p-field">
              <label for="email">Email de Contato *</label>
              <input 
                pInputText 
                type="email" 
                id="email" 
                formControlName="email" 
                placeholder="contato@minhaempresa.com.br"
                class="w-full">
              <small class="form-hint">Um email de confirmação será enviado para este endereço</small>
              <small class="p-error" *ngIf="createForm.get('email')?.invalid && createForm.get('email')?.touched">
                <span *ngIf="createForm.get('email')?.errors?.['required']">Email é obrigatório</span>
                <span *ngIf="createForm.get('email')?.errors?.['email']">Email inválido</span>
              </small>
            </div>
            <div class="p-field">
              <label for="phoneNumber">Telefone</label>
              <input 
                pInputText 
                type="tel" 
                id="phoneNumber" 
                formControlName="phoneNumber" 
                placeholder="(11) 99999-9999"
                class="w-full">
              <small class="form-hint">Opcional</small>
            </div>
          </div>
          <div class="p-field">
            <label for="address">Endereço</label>
            <input 
              pInputText 
              id="address" 
              formControlName="address" 
              placeholder="Rua Example, 123 - São Paulo/SP"
              class="w-full">
            <small class="form-hint">Opcional</small>
          </div>
        </form>
        <ng-template pTemplate="footer">
          <p-button 
            label="Cancelar" 
            icon="pi pi-times" 
            (onClick)="cancelCreate()" 
            [text]="true"
            [disabled]="creating">
          </p-button>
          <p-button 
            [label]="creating ? 'Cadastrando...' : 'Cadastrar Tenant'" 
            icon="pi pi-check" 
            (onClick)="createTenant()"
            [disabled]="creating"
            [loading]="creating">
          </p-button>
        </ng-template>
      </p-dialog>

      <!-- Filtros -->
      <p-card *ngIf="!loading" styleClass="filters-card">
        <div class="filters-grid">
          <span class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <input 
              pInputText 
              type="text" 
              [(ngModel)]="searchTerm" 
              (ngModelChange)="applyFilters()"
              placeholder="Buscar por nome, domínio ou email..."
              class="w-full">
          </span>
          <p-dropdown 
            [(ngModel)]="statusFilter" 
            [options]="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Todos os status"
            (onChange)="applyFilters()"
            [showClear]="true"
            class="w-full">
          </p-dropdown>
          <p-dropdown 
            [(ngModel)]="planFilter" 
            [options]="planOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Todos os planos"
            (onChange)="applyFilters()"
            [showClear]="true"
            class="w-full">
          </p-dropdown>
        </div>
      </p-card>

      <div class="loading-container" *ngIf="loading">
        <p-progressSpinner></p-progressSpinner>
      </div>

      <p-card *ngIf="!loading" styleClass="table-card">
        <p-table 
          [value]="filteredTenants" 
          [paginator]="true" 
          [rows]="10"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Exibindo {first} a {last} de {totalRecords} tenants"
          [rowsPerPageOptions]="[10, 25, 50]"
          [globalFilterFields]="['name', 'domain', 'email']"
          responsiveLayout="scroll">
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="name">
                Nome <p-sortIcon field="name"></p-sortIcon>
              </th>
              <th pSortableColumn="domain">
                Domínio <p-sortIcon field="domain"></p-sortIcon>
              </th>
              <th>Email</th>
              <th pSortableColumn="subscriptionPlan">
                Plano <p-sortIcon field="subscriptionPlan"></p-sortIcon>
              </th>
              <th>Status</th>
              <th style="width: 300px;">Ações</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-tenant>
            <tr>
              <td>
                <strong>{{ tenant.name }}</strong>
                <div *ngIf="tenant.displayName" class="text-secondary">
                  {{ tenant.displayName }}
                </div>
              </td>
              <td>{{ tenant.domain }}</td>
              <td>
                <div class="email-cell">
                  <span>{{ isEmailVisible(tenant.id) ? tenant.email : maskEmail(tenant.email) }}</span>
                  <p-button 
                    [icon]="isEmailVisible(tenant.id) ? 'pi pi-eye-slash' : 'pi pi-eye'"
                    (onClick)="toggleEmailVisibility(tenant.id)"
                    [rounded]="true"
                    [text]="true"
                    severity="secondary"
                    size="small"
                    [pTooltip]="isEmailVisible(tenant.id) ? 'Ocultar email' : 'Mostrar email'">
                  </p-button>
                </div>
              </td>
              <td>
                <p-tag 
                  [value]="tenant.subscriptionPlan"
                  [severity]="getPlanSeverity(tenant.subscriptionPlan)">
                </p-tag>
              </td>
              <td>
                <p-tag 
                  [value]="tenant.active ? 'Ativo' : 'Inativo'"
                  [severity]="tenant.active ? 'success' : 'danger'">
                </p-tag>
              </td>
              <td>
                <div class="action-buttons">
                  <p-button 
                    icon="pi pi-eye" 
                    [routerLink]="['/tenants', tenant.id]"
                    severity="info"
                    [text]="true"
                    size="small"
                    pTooltip="Ver detalhes">
                  </p-button>
                  <p-button 
                    icon="pi pi-envelope" 
                    (onClick)="enviarLembreteUsuario(tenant)"
                    severity="warning"
                    [text]="true"
                    size="small"
                    [disabled]="!tenant.active"
                    pTooltip="Enviar lembrete para criar usuário">
                  </p-button>
                  <p-button 
                    [icon]="tenant.active ? 'pi pi-lock' : 'pi pi-check'"
                    (onClick)="toggleActive(tenant)"
                    severity="secondary"
                    [text]="true"
                    size="small"
                    [pTooltip]="tenant.active ? 'Desativar' : 'Ativar'">
                  </p-button>
                  <p-button 
                    icon="pi pi-trash" 
                    (onClick)="deleteTenant(tenant)"
                    severity="danger"
                    [text]="true"
                    size="small"
                    pTooltip="Excluir">
                  </p-button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" style="text-align: center; padding: 2rem;">
                {{ searchTerm || statusFilter || planFilter ? 'Nenhum tenant encontrado com os filtros aplicados' : 'Nenhum tenant cadastrado' }}
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
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

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    :host ::ng-deep .filters-card {
      margin-bottom: 1.5rem;
    }

    .filters-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 1rem;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    :host ::ng-deep .table-card .p-card-body {
      padding: 0;
    }

    .action-buttons {
      display: flex;
      gap: 0.25rem;
    }

    .email-cell {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .text-secondary {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .p-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .p-field label {
      font-weight: 600;
      color: var(--text-primary);
    }

    .form-hint {
      display: block;
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-top: 0.25rem;
    }

    .w-full {
      width: 100%;
    }

    :host ::ng-deep .p-dialog .p-dialog-content {
      padding: 1.5rem;
    }
  `]
})
export class TenantListComponent implements OnInit {
  tenants: Tenant[] = [];
  filteredTenants: Tenant[] = [];
  loading = false;
  
  // Filtros
  searchTerm = '';
  statusFilter = '';
  planFilter = '';
  
  // Opções de filtros
  statusOptions = [
    { label: 'Todos os status', value: '' },
    { label: 'Apenas Ativos', value: 'active' },
    { label: 'Apenas Inativos', value: 'inactive' }
  ];
  
  planOptions = [
    { label: 'Todos os planos', value: '' },
    { label: 'Free', value: 'FREE' },
    { label: 'Basic', value: 'BASIC' },
    { label: 'Premium', value: 'PREMIUM' },
    { label: 'Enterprise', value: 'ENTERPRISE' }
  ];
  
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
    private route: ActivatedRoute,
    private router: Router
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
  }

  getPlanSeverity(plan: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' {
    switch (plan) {
      case 'ENTERPRISE':
      case 'PREMIUM':
        return 'success';
      case 'BASIC':
        return 'warning';
      case 'FREE':
        return 'secondary';
      default:
        return 'info';
    }
  }

  paginatedTenants(): Tenant[] {
    return this.filteredTenants;
  }

  totalPages(): number {
    return 1;
  }

  changePage(page: number): void {
    // Não mais necessário, PrimeNG Table gerencia
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
        this.toastService.success('Tenant excluído com sucesso!');
      },
      error: (error) => {
        console.error('Error deleting tenant:', error);
        this.toastService.error('Erro ao excluir tenant');
      }
    });
  }
  
  enviarLembreteUsuario(tenant: Tenant): void {
    if (!confirm(`Enviar email para "${tenant.name}" lembrando de criar o primeiro usuário?`)) {
      return;
    }

    this.tenantService.enviarLembreteCriarUsuario(tenant.id).subscribe({
      next: (response) => {
        this.toastService.success(response.message || 'Email enviado com sucesso!');
      },
      error: (error) => {
        console.error('Error sending reminder:', error);
        const errorMessage = error.error?.message || error.error?.error || 'Erro ao enviar email de lembrete';
        this.toastService.error(errorMessage);
      }
    });
  }
}
