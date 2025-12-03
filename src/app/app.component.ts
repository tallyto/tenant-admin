import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
  template: `
    <div class="app-container">
      <nav class="navbar" *ngIf="isAuthenticated">
        <div class="navbar-brand">
          <h1>🏢 Tenant Admin</h1>
        </div>
        <div class="navbar-menu">
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
            📊 Dashboard
          </a>
          <a routerLink="/tenants" routerLinkActive="active">
            🏢 Tenants
          </a>
          <div class="dropdown">
            <button class="dropdown-toggle">
              ⚙️ Ações
            </button>
            <div class="dropdown-menu">
              <a routerLink="/tenants" [queryParams]="{create: 'true'}">
                ➕ Novo Tenant
              </a>
              <a routerLink="/tenants" [queryParams]="{status: 'active'}">
                ✅ Tenants Ativos
              </a>
              <a routerLink="/tenants" [queryParams]="{status: 'inactive'}">
                ❌ Tenants Inativos
              </a>
            </div>
          </div>
          <button class="btn btn-secondary" (click)="logout()">
            🚪 Sair
          </button>
        </div>
      </nav>
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

    .navbar {
      background-color: var(--card-bg);
      box-shadow: var(--shadow);
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .navbar-brand h1 {
      font-size: 1.5rem;
      color: var(--primary-color);
      margin: 0;
    }

    .navbar-menu {
      display: flex;
      gap: 1.5rem;
      align-items: center;
    }

    .navbar-menu a,
    .dropdown-toggle {
      text-decoration: none;
      color: var(--text-secondary);
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      transition: all 0.2s;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      font-family: inherit;
    }

    .navbar-menu a:hover,
    .dropdown-toggle:hover {
      background-color: var(--bg-color);
      color: var(--primary-color);
    }

    .navbar-menu a.active {
      color: var(--primary-color);
      background-color: var(--bg-color);
    }

    .dropdown {
      position: relative;
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background-color: var(--card-bg);
      box-shadow: var(--shadow);
      border-radius: 0.5rem;
      margin-top: 0.5rem;
      min-width: 200px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.3s ease;
      z-index: 1001;
    }

    .dropdown:hover .dropdown-menu {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .dropdown-menu a {
      display: block;
      padding: 0.75rem 1rem;
      color: var(--text-primary);
      text-decoration: none;
      border-radius: 0;
      transition: background-color 0.2s;
    }

    .dropdown-menu a:first-child {
      border-radius: 0.5rem 0.5rem 0 0;
    }

    .dropdown-menu a:last-child {
      border-radius: 0 0 0.5rem 0.5rem;
    }

    .dropdown-menu a:hover {
      background-color: var(--bg-color);
      color: var(--primary-color);
    }

    .main-content {
      padding: 2rem;
    }

    @media (max-width: 768px) {
      .navbar {
        flex-direction: column;
        gap: 1rem;
      }

      .navbar-menu {
        flex-wrap: wrap;
        justify-content: center;
      }
    }
  `]
})
export class AppComponent {
  isAuthenticated = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
