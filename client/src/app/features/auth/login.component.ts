import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-8">
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-600/20 text-blue-400 mb-3 border border-blue-500/30">
            <span class="text-2xl font-bold">🏛️</span>
          </div>
          <h1 class="text-2xl font-bold text-white tracking-tight">GovBudget AI</h1>
          <p class="text-sm text-slate-400 mt-1">Budget Utilization & Anomaly Monitoring Portal</p>
        </div>

        <div *ngIf="errorMessage" class="mb-4 p-3 bg-red-900/40 border border-red-500/50 rounded-lg text-sm text-red-200">
          {{ errorMessage }}
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">Official Email or Username</label>
            <input
              type="text"
              formControlName="email"
              class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-slate-500"
              placeholder="admin@govbudget.demo or admin"
            />
            <span *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="text-xs text-red-400 mt-1 block">
              Official email or username is required
            </span>
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">Password</label>
            <input
              type="password"
              formControlName="password"
              class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-slate-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            [disabled]="loginForm.invalid || isLoading"
            class="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 font-medium rounded-lg text-white transition duration-150"
          >
            {{ isLoading ? 'Authenticating Credentials...' : 'Secure Sign In' }}
          </button>
        </form>

        <div class="mt-6 pt-6 border-t border-slate-700">
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Quick Evaluation Demo Roles:</p>
          <div class="grid grid-cols-3 gap-2">
            <button
              type="button"
              (click)="fillDemo('admin@govbudget.demo')"
              class="px-2 py-1.5 bg-slate-700 hover:bg-slate-600 text-xs rounded border border-slate-600 font-medium text-blue-300 truncate"
              title="Global Governance Admin"
            >
              ADMIN
            </button>
            <button
              type="button"
              (click)="fillDemo('finance@govbudget.demo')"
              class="px-2 py-1.5 bg-slate-700 hover:bg-slate-600 text-xs rounded border border-slate-600 font-medium text-emerald-300 truncate"
              title="Finance Officer (Health Dept)"
            >
              FINANCE
            </button>
            <button
              type="button"
              (click)="fillDemo('head@govbudget.demo')"
              class="px-2 py-1.5 bg-slate-700 hover:bg-slate-600 text-xs rounded border border-slate-600 font-medium text-amber-300 truncate"
              title="Department Head (Health Dept)"
            >
              DEPT HEAD
            </button>
          </div>
          <p class="text-[11px] text-slate-400 mt-2 text-center">Password: <code class="text-blue-300 bg-slate-900 px-1 py-0.5 rounded">GovBudget&#64;2026</code></p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  fillDemo(email: string) {
    this.loginForm.patchValue({
      email,
      password: 'GovBudget@2026'
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Authentication failed. Please verify credentials.';
      }
    });
  }
}
