import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    MessageModule
  ],
  template: `
    <div class="login-container">
      <p-card styleClass="login-card">
        <ng-template pTemplate="header">
          <div class="card-header">
            <i class="pi pi-shield" style="font-size: 3rem; color: var(--primary-color);"></i>
            <h2>Tenant Admin</h2>
            <p class="subtitle">Faça login para gerenciar os tenants</p>
          </div>
        </ng-template>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="p-field">
            <label for="email">Email</label>
            <span class="p-input-icon-left w-full">
              <i class="pi pi-envelope"></i>
              <input
                pInputText
                type="email"
                id="email"
                formControlName="email"
                placeholder="seu@email.com"
                class="w-full"
              />
            </span>
            <small class="p-error" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
              Email é obrigatório
            </small>
          </div>

          <div class="p-field">
            <label for="senha">Senha</label>
            <span class="p-input-icon-left w-full">
              <i class="pi pi-lock"></i>
              <p-password
                id="senha"
                formControlName="senha"
                placeholder="Digite sua senha"
                [toggleMask]="true"
                [feedback]="false"
                styleClass="w-full"
                inputStyleClass="w-full">
              </p-password>
            </span>
            <small class="p-error" *ngIf="loginForm.get('senha')?.invalid && loginForm.get('senha')?.touched">
              Senha é obrigatória
            </small>
          </div>

          <p-message 
            *ngIf="errorMessage" 
            severity="error" 
            [text]="errorMessage"
            styleClass="w-full">
          </p-message>

          <p-button 
            type="submit" 
            label="Entrar"
            icon="pi pi-sign-in"
            styleClass="w-full"
            [disabled]="loading || loginForm.invalid"
            [loading]="loading">
          </p-button>
        </form>
      </p-card>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    :host ::ng-deep .login-card {
      width: 100%;
      max-width: 400px;
    }

    .card-header {
      text-align: center;
      padding: 2rem 1rem 1rem;
    }

    h2 {
      margin: 1rem 0 0.5rem 0;
    }

    .subtitle {
      margin: 0;
    }

    .p-field {
      margin-bottom: 1.5rem;
    }

    .p-field label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }

    .w-full {
      width: 100%;
    }

    :host ::ng-deep .p-password {
      width: 100%;
    }

    :host ::ng-deep .p-password input {
      width: 100%;
    }

    :host ::ng-deep .p-button {
      margin-top: 1rem;
    }

    :host ::ng-deep .p-message {
      margin-bottom: 1rem;
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
