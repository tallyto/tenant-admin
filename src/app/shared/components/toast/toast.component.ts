import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toasts" 
           class="toast"
           [ngClass]="'toast-' + toast.type">
        <div class="toast-icon">
          {{ getIcon(toast.type) }}
        </div>
        <div class="toast-message">
          {{ toast.message }}
        </div>
        <button class="toast-close" (click)="removeToast(toast.id)">
          ✖
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 5rem;
      right: 2rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 400px;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 0.5rem;
      background-color: white;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .toast-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .toast-message {
      flex: 1;
      color: #1f2937;
      line-height: 1.5;
    }

    .toast-close {
      background: none;
      border: none;
      cursor: pointer;
      color: #6b7280;
      font-size: 1rem;
      padding: 0.25rem;
      line-height: 1;
      transition: color 0.2s;
    }

    .toast-close:hover {
      color: #1f2937;
    }

    .toast-success {
      border-left: 4px solid #10b981;
    }

    .toast-error {
      border-left: 4px solid #ef4444;
    }

    .toast-warning {
      border-left: 4px solid #f59e0b;
    }

    .toast-info {
      border-left: 4px solid #3b82f6;
    }

    @media (max-width: 768px) {
      .toast-container {
        left: 1rem;
        right: 1rem;
        max-width: none;
      }
    }
  `]
})
export class ToastComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toasts$.subscribe(toast => {
      this.toasts.push(toast);
      
      if (toast.duration && toast.duration > 0) {
        setTimeout(() => {
          this.removeToast(toast.id);
        }, toast.duration);
      }
    });
  }

  removeToast(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }

  getIcon(type: Toast['type']): string {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type];
  }
}
