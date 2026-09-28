import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 py-12">
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl"></div>
      </div>

      <div class="relative w-full max-w-md">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 shadow-glow-violet mb-4 text-2xl">⚡</div>
          <h1 class="font-display text-2xl font-bold gradient-text">Welcome back</h1>
          <p class="text-gray-400 text-sm mt-1">Ready to challenge yourself again?</p>
        </div>

        <div class="glass p-8">
          @if (errorMsg()) {
            <div class="mb-5 flex items-start gap-2 rounded-xl px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              ⚠️ {{ errorMsg() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
            <div>
              <label class="input-label">Email</label>
              <input formControlName="email" type="email" placeholder="you@example.com"
                     class="input" [class.border-red-500]="inv('email')">
              @if (inv('email')) {
                <p class="text-xs text-red-400 mt-1">Valid email required</p>
              }
            </div>

            <div>
              <label class="input-label">Password</label>
              <div class="relative">
                <input formControlName="password" [type]="pwdType()"
                       placeholder="••••••••" class="input pr-12"
                       [class.border-red-500]="inv('password')">
                <button type="button" (click)="togglePwd()"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {{ showPwd() ? '🙈' : '👁️' }}
                </button>
              </div>
              @if (inv('password')) {
                <p class="text-xs text-red-400 mt-1">Password required</p>
              }
            </div>

            <button type="submit" class="btn-primary w-full btn-lg flex items-center justify-center gap-2"
                    [disabled]="loading()">
              @if (loading()) {
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Logging in...
              } @else { Login }
            </button>
          </form>

          <p class="text-center text-gray-500 text-sm mt-6">
            Don't have an account?
            <a routerLink="/register" class="text-violet-400 hover:text-violet-300 font-medium ml-1">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  errorMsg = signal('');
  showPwd = signal(false);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  pwdType() { return this.showPwd() ? 'text' : 'password'; }
  togglePwd() { this.showPwd.set(!this.showPwd()); }

  inv(field: string) {
    const c = this.form.get(field);
    return c?.invalid && c?.touched;
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');
    const { email, password } = this.form.value;
    this.auth.login({ email: email!, password: password! }).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err: any) => { this.errorMsg.set(err.error?.message || 'Invalid email or password'); this.loading.set(false); }
    });
  }
}
