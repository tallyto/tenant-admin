import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { ToastComponent } from './shared/components/toast/toast.component';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    ToastComponent,
    MenubarModule,
    ButtonModule
  ],
  template: `
    <div class="app-container">
      <p-menubar *ngIf="isAuthenticated" [model]="menuItems" styleClass="navbar">
        <ng-template pTemplate="start">
          <div class="navbar-brand">
            <h1>🏢 Tenant Admin</h1>
          </div>
        </ng-template>
        <ng-template pTemplate="end">
          <p-button 
            label="Sair" 
            icon="pi pi-sign-out" 
            (onClick)="logout()"
            severity="secondary"
            [text]="true"
          ></p-button>
        </ng-template>
      </p-menubar>
      
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      
      <!-- Toast Notifications -->
      <app-toast></app-toast>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
    }

    .navbar-brand h1 {
      font-size: 1.5rem;
      color: var(--primary-color);
      margin: 0;
    }

    .main-content {
      padding: 2rem;
    }
  `]
})
export class AppComponent {
  isAuthenticated = false;
  menuItems: MenuItem[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
    });

    this.menuItems = [
      {
        label: 'Dashboard',
        icon: 'pi pi-chart-bar',
        routerLink: '/dashboard'
      },
      {
        label: 'Tenants',
        icon: 'pi pi-building',
        routerLink: '/tenants'
      },
      {
        label: 'Ações',
        icon: 'pi pi-cog',
        items: [
          {
            label: 'Novo Tenant',
            icon: 'pi pi-plus',
            command: () => {
              this.router.navigate(['/tenants'], { queryParams: { create: 'true' } });
            }
          },
          {
            separator: true
          },
          {
            label: 'Tenants Ativos',
            icon: 'pi pi-check-circle',
            command: () => {
              this.router.navigate(['/tenants'], { queryParams: { status: 'active' } });
            }
          },
          {
            label: 'Tenants Inativos',
            icon: 'pi pi-times-circle',
            command: () => {
              this.router.navigate(['/tenants'], { queryParams: { status: 'inactive' } });
            }
          }
        ]
      }
    ];
  }

  logout(): void {
    this.authService.logout();
  }
}
