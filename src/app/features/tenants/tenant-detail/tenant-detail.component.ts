import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TabViewModule } from 'primeng/tabview';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';
import { TenantService } from '../../../core/services/tenant.service';
import { ToastService } from '../../../core/services/toast.service';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  ativo: boolean;
  ultimoAcesso?: string;
  dataCriacao: string;
}

@Component({
  selector: 'app-tenant-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    TabViewModule,
    ConfirmDialogModule,
    TooltipModule
  ],
  providers: [ConfirmationService],
  template: `
    <div class="p-4">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-content-between align-items-center p-3">
            <div>
              <h2 class="m-0">{{ tenant?.nome }}</h2>
              <small class="text-color-secondary">{{ tenant?.dominio }}</small>
            </div>
            <div class="flex gap-2">
              <p-button 
                icon="pi pi-arrow-left" 
                [outlined]="true"
                (click)="voltar()"
                label="Voltar">
              </p-button>
            </div>
          </div>
        </ng-template>

        <p-tabView>
          <!-- Tab: Informações -->
          <p-tabPanel header="Informações" leftIcon="pi pi-info-circle">
            <div class="grid">
              <div class="col-12 md:col-6">
                <h3>Detalhes do Tenant</h3>
                <div class="field grid">
                  <label class="col-12 mb-2 md:col-4 md:mb-0 font-bold">ID:</label>
                  <div class="col-12 md:col-8">{{ tenant?.id }}</div>
                </div>
                <div class="field grid">
                  <label class="col-12 mb-2 md:col-4 md:mb-0 font-bold">Nome:</label>
                  <div class="col-12 md:col-8">{{ tenant?.nome }}</div>
                </div>
                <div class="field grid">
                  <label class="col-12 mb-2 md:col-4 md:mb-0 font-bold">Domínio:</label>
                  <div class="col-12 md:col-8">{{ tenant?.dominio }}</div>
                </div>
                <div class="field grid">
                  <label class="col-12 mb-2 md:col-4 md:mb-0 font-bold">Email:</label>
                  <div class="col-12 md:col-8">{{ tenant?.email }}</div>
                </div>
                <div class="field grid">
                  <label class="col-12 mb-2 md:col-4 md:mb-0 font-bold">Status:</label>
                  <div class="col-12 md:col-8">
                    <p-tag 
                      [value]="tenant?.ativo ? 'Ativo' : 'Inativo'" 
                      [severity]="tenant?.ativo ? 'success' : 'danger'">
                    </p-tag>
                  </div>
                </div>
                <div class="field grid">
                  <label class="col-12 mb-2 md:col-4 md:mb-0 font-bold">Data de Criação:</label>
                  <div class="col-12 md:col-8">{{ tenant?.dataCriacao | date: 'dd/MM/yyyy HH:mm' }}</div>
                </div>
              </div>

              <div class="col-12 md:col-6">
                <h3>Ações Administrativas</h3>
                <div class="flex flex-column gap-2">
                  <p-button 
                    [label]="tenant?.ativo ? 'Desativar Tenant' : 'Ativar Tenant'"
                    [icon]="tenant?.ativo ? 'pi pi-ban' : 'pi pi-check-circle'"
                    [severity]="tenant?.ativo ? 'warn' : 'success'"
                    (click)="toggleTenantStatus()"
                    styleClass="w-full">
                  </p-button>
                  
                  <p-button 
                    label="Excluir Tenant"
                    icon="pi pi-trash"
                    severity="danger"
                    (click)="confirmarExclusao()"
                    styleClass="w-full">
                  </p-button>
                </div>
              </div>
            </div>
          </p-tabPanel>

          <!-- Tab: Usuários -->
          <p-tabPanel header="Usuários" leftIcon="pi pi-users">
            <div class="mb-3 flex justify-content-between align-items-center">
              <h3 class="m-0">Gerenciamento de Usuários</h3>
              <p-button 
                icon="pi pi-refresh" 
                [outlined]="true"
                (click)="carregarUsuarios()"
                pTooltip="Atualizar lista">
              </p-button>
            </div>

            <p-table 
              [value]="usuarios" 
              [paginator]="true" 
              [rows]="10"
              [loading]="loading"
              [rowsPerPageOptions]="[10, 25, 50]"
              styleClass="p-datatable-sm">
              <ng-template pTemplate="header">
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Último Acesso</th>
                  <th>Criado Em</th>
                  <th style="width: 200px">Ações</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-usuario>
                <tr>
                  <td>{{ usuario.id }}</td>
                  <td>{{ usuario.nome }}</td>
                  <td>{{ usuario.email }}</td>
                  <td>
                    <p-tag 
                      [value]="usuario.ativo ? 'Ativo' : 'Inativo'" 
                      [severity]="usuario.ativo ? 'success' : 'danger'">
                    </p-tag>
                  </td>
                  <td>{{ usuario.ultimoAcesso ? (usuario.ultimoAcesso | date: 'dd/MM/yyyy HH:mm') : 'Nunca' }}</td>
                  <td>{{ usuario.dataCriacao | date: 'dd/MM/yyyy' }}</td>
                  <td>
                    <div class="flex gap-1">
                      <p-button 
                        [icon]="usuario.ativo ? 'pi pi-ban' : 'pi pi-check'"
                        [severity]="usuario.ativo ? 'warn' : 'success'"
                        [outlined]="true"
                        size="small"
                        [pTooltip]="usuario.ativo ? 'Desativar' : 'Ativar'"
                        (click)="toggleUsuarioStatus(usuario)">
                      </p-button>

                    </div>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="7" class="text-center">Nenhum usuário encontrado</td>
                </tr>
              </ng-template>
            </p-table>
          </p-tabPanel>

          <!-- Tab: Ações Rápidas -->
          <p-tabPanel header="Ações" leftIcon="pi pi-bolt">
            <div class="grid">
              <div class="col-12 md:col-6 lg:col-4">
                <p-card>
                  <ng-template pTemplate="header">
                    <div class="p-3">
                      <i class="pi pi-refresh text-4xl text-orange-500"></i>
                    </div>
                  </ng-template>
                  <h4>Reenviar Email de Ativação</h4>
                  <p class="text-color-secondary">Reenvia o email de ativação da conta com novo token</p>
                  <ng-template pTemplate="footer">
                    <p-button 
                      label="Reenviar Ativação"
                      icon="pi pi-envelope"
                      severity="info"
                      (click)="reenviarToken()"
                      styleClass="w-full">
                    </p-button>
                  </ng-template>
                </p-card>
              </div>
            </div>
          </p-tabPanel>

          <!-- Tab: Estatísticas -->
          <p-tabPanel header="Estatísticas" leftIcon="pi pi-chart-bar">
            <div class="grid">
              <div class="col-12 md:col-6 lg:col-3">
                <p-card styleClass="bg-blue-50">
                  <div class="flex align-items-center justify-content-between">
                    <div>
                      <div class="text-500 font-medium mb-2">Total de Usuários</div>
                      <div class="text-4xl font-bold text-blue-500">{{ usuarios.length }}</div>
                    </div>
                    <i class="pi pi-users text-5xl text-blue-300"></i>
                  </div>
                </p-card>
              </div>

              <div class="col-12 md:col-6 lg:col-3">
                <p-card styleClass="bg-green-50">
                  <div class="flex align-items-center justify-content-between">
                    <div>
                      <div class="text-500 font-medium mb-2">Usuários Ativos</div>
                      <div class="text-4xl font-bold text-green-500">{{ usuariosAtivos }}</div>
                    </div>
                    <i class="pi pi-check-circle text-5xl text-green-300"></i>
                  </div>
                </p-card>
              </div>

              <div class="col-12 md:col-6 lg:col-3">
                <p-card styleClass="bg-orange-50">
                  <div class="flex align-items-center justify-content-between">
                    <div>
                      <div class="text-500 font-medium mb-2">Usuários Inativos</div>
                      <div class="text-4xl font-bold text-orange-500">{{ usuariosInativos }}</div>
                    </div>
                    <i class="pi pi-ban text-5xl text-orange-300"></i>
                  </div>
                </p-card>
              </div>

              <div class="col-12 md:col-6 lg:col-3">
                <p-card [styleClass]="tenant?.ativo ? 'bg-teal-50' : 'bg-red-50'">
                  <div class="flex align-items-center justify-content-between">
                    <div>
                      <div class="text-500 font-medium mb-2">Status Tenant</div>
                      <div [class]="'text-4xl font-bold ' + (tenant?.ativo ? 'text-teal-500' : 'text-red-500')">
                        {{ tenant?.ativo ? 'Ativo' : 'Inativo' }}
                      </div>
                    </div>
                    <i [class]="'pi text-5xl ' + (tenant?.ativo ? 'pi-check-circle text-teal-300' : 'pi-times-circle text-red-300')"></i>
                  </div>
                </p-card>
              </div>

              <div class="col-12 md:col-6">
                <p-card>
                  <h4>Informações Adicionais</h4>
                  <div class="field grid">
                    <label class="col-12 mb-2 md:col-6 md:mb-0 font-bold">Plano:</label>
                    <div class="col-12 md:col-6">{{ tenant?.plano || 'Básico' }}</div>
                  </div>
                  <div class="field grid">
                    <label class="col-12 mb-2 md:col-6 md:mb-0 font-bold">Dias Desde Criação:</label>
                    <div class="col-12 md:col-6">{{ calcularDiasDesdeCriacao() }}</div>
                  </div>
                  <div class="field grid">
                    <label class="col-12 mb-2 md:col-6 md:mb-0 font-bold">Último Acesso (Admin):</label>
                    <div class="col-12 md:col-6">{{ ultimoAcessoAdmin | date: 'dd/MM/yyyy HH:mm' }}</div>
                  </div>
                </p-card>
              </div>

              <div class="col-12 md:col-6">
                <p-card>
                  <h4>Atividade Recente</h4>
                  <ul class="list-none p-0 m-0">
                    <li class="flex align-items-center py-2 border-bottom-1 surface-border">
                      <i class="pi pi-user-plus mr-2 text-primary"></i>
                      <span class="text-color-secondary">Último usuário criado: </span>
                      <span class="ml-auto">{{ dataUltimoUsuarioCriado | date: 'dd/MM/yyyy' }}</span>
                    </li>
                    <li class="flex align-items-center py-2 border-bottom-1 surface-border">
                      <i class="pi pi-envelope mr-2 text-primary"></i>
                      <span class="text-color-secondary">Último email enviado: </span>
                      <span class="ml-auto">{{ dataUltimoEmail | date: 'dd/MM/yyyy' }}</span>
                    </li>
                    <li class="flex align-items-center py-2">
                      <i class="pi pi-sign-in mr-2 text-primary"></i>
                      <span class="text-color-secondary">Último login: </span>
                      <span class="ml-auto">{{ dataUltimoLogin | date: 'dd/MM/yyyy HH:mm' }}</span>
                    </li>
                  </ul>
                </p-card>
              </div>
            </div>
          </p-tabPanel>
        </p-tabView>
      </p-card>

      <p-confirmDialog></p-confirmDialog>
    </div>
  `,
  styles: [`
    :host ::ng-deep {
      .p-card {
        box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
      }

      .p-tabview .p-tabview-nav li.p-highlight .p-tabview-nav-link {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .p-datatable .p-datatable-tbody > tr > td {
        padding: 0.5rem;
      }

      .p-datatable .p-button.p-button-sm {
        padding: 0.375rem 0.625rem;
        font-size: 0.875rem;
      }

      .p-datatable .p-button.p-button-icon-only {
        width: 2rem;
        height: 2rem;
        padding: 0.375rem;
      }

      .flex.gap-1 {
        gap: 0.25rem;
      }

      .action-buttons {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
    }
  `]
})
export class TenantDetailComponent implements OnInit {
  tenant: any = null;
  usuarios: Usuario[] = [];
  loading = false;
  
  // Estatísticas
  usuariosAtivos = 0;
  usuariosInativos = 0;
  ultimoAcessoAdmin: Date = new Date();
  dataUltimoUsuarioCriado: Date = new Date();
  dataUltimoEmail: Date = new Date();
  dataUltimoLogin: Date = new Date();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tenantService: TenantService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.carregarTenant(id);
      this.carregarUsuarios();
    }
  }

  carregarTenant(id: string): void {
    this.loading = true;
    this.tenantService.getById(id).subscribe({
      next: (tenant) => {
        this.tenant = tenant;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar tenant:', error);
        this.toastService.error('Erro ao carregar tenant');
        this.loading = false;
      }
    });
  }

  carregarUsuarios(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.loading = true;
    this.tenantService.getUsuarios(id).subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.calcularEstatisticas();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar usuários:', error);
        this.toastService.error('Erro ao carregar usuários');
        this.loading = false;
      }
    });
  }

  calcularEstatisticas(): void {
    this.usuariosAtivos = this.usuarios.filter(u => u.ativo).length;
    this.usuariosInativos = this.usuarios.filter(u => !u.ativo).length;
    
    // Encontrar o usuário criado mais recentemente
    if (this.usuarios.length > 0) {
      const usuariosOrdenados = [...this.usuarios].sort((a, b) => 
        new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()
      );
      this.dataUltimoUsuarioCriado = new Date(usuariosOrdenados[0].dataCriacao);
    }
  }

  toggleTenantStatus(): void {
    if (!this.tenant) return;

    const acao = this.tenant.ativo ? 'desativar' : 'ativar';
    this.confirmationService.confirm({
      message: `Tem certeza que deseja ${acao} este tenant?`,
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.tenantService.toggleStatus(this.tenant.id).subscribe({
          next: () => {
            this.tenant.ativo = !this.tenant.ativo;
            this.toastService.success(`Tenant ${acao === 'desativar' ? 'desativado' : 'ativado'} com sucesso`);
          },
          error: (error) => {
            console.error('Erro ao alterar status:', error);
            this.toastService.error('Erro ao alterar status do tenant');
          }
        });
      }
    });
  }

  toggleUsuarioStatus(usuario: Usuario): void {
    const acao = usuario.ativo ? 'desativar' : 'ativar';
    this.confirmationService.confirm({
      message: `Tem certeza que deseja ${acao} o usuário ${usuario.nome}?`,
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.tenantService.toggleUsuarioStatus(this.tenant.id, usuario.id).subscribe({
          next: () => {
            usuario.ativo = !usuario.ativo;
            this.calcularEstatisticas();
            this.toastService.success(`Usuário ${acao === 'desativar' ? 'desativado' : 'ativado'} com sucesso`);
          },
          error: (error) => {
            console.error('Erro ao alterar status do usuário:', error);
            this.toastService.error('Erro ao alterar status do usuário');
          }
        });
      }
    });
  }

  reenviarToken(): void {
    if (!this.tenant) return;

    this.confirmationService.confirm({
      message: 'Reenviar email de ativação da conta com novo token?',
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.tenantService.reenviarTokenCriarUsuario(this.tenant.id).subscribe({
          next: (response) => {
            this.toastService.success(response.message || 'Email de ativação reenviado com sucesso');
            this.dataUltimoEmail = new Date();
          },
          error: (error) => {
            console.error('Erro ao reenviar email de ativação:', error);
            const errorMessage = error.error?.message || 'Erro ao reenviar email de ativação';
            this.toastService.error(errorMessage);
          }
        });
      }
    });
  }

  confirmarExclusao(): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja EXCLUIR este tenant? Esta ação não pode ser desfeita!',
      header: 'ATENÇÃO - Exclusão Permanente',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.excluirTenant();
      }
    });
  }

  excluirTenant(): void {
    if (!this.tenant) return;

    this.tenantService.delete(this.tenant.id).subscribe({
      next: () => {
        this.toastService.success('Tenant excluído com sucesso');
        this.router.navigate(['/tenants']);
      },
      error: (error) => {
        console.error('Erro ao excluir tenant:', error);
        this.toastService.error('Erro ao excluir tenant');
      }
    });
  }

  calcularDiasDesdeCriacao(): number {
    if (!this.tenant?.dataCriacao) return 0;
    const agora = new Date();
    const criacao = new Date(this.tenant.dataCriacao);
    const diff = agora.getTime() - criacao.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  voltar(): void {
    this.router.navigate(['/tenants']);
  }
}
