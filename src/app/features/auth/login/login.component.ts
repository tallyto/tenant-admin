import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card card">
        <h2>🔐 Tenant Admin</h2>
        <p class="subtitle">Faça login para gerenciar os tenants</p>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              placeholder="seu@email.com"
            />
            <div class="error" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
              Email é obrigatório
            </div>
          </div>

          <div class="form-group">
            <label for="senha">Senha</label>
            <input
              type="password"
              id="senha"
              formControlName="senha"
              placeholder="Digite sua senha"
            />
            <div class="error" *ngIf="loginForm.get('senha')?.invalid && loginForm.get('senha')?.touched">
              Senha é obrigatória
            </div>
          </div>

          <div class="error" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="loading || loginForm.invalid">
            {{ loading ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 2rem;
    }

    h2 {
      text-align: center;
      margin-bottom: 0.5rem;
      color: var(--primary-color);
    }

    .subtitle {
      text-align: center;
      color: var(--text-secondary);
      margin-bottom: 2rem;
    }

    .btn-block {
      width: 100%;
      margin-top: 1rem;
    }

    .error {
      color: var(--danger-color);
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Email ou senha inválidos';
        console.error('Login error:', error);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
