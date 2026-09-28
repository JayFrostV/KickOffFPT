import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

function passwordMatch(ctrl: AbstractControl): ValidationErrors | null {
  const pw = ctrl.get('password');
  const cp = ctrl.get('confirmPassword');
  return pw && cp && pw.value !== cp.value ? { mismatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 py-12">
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -right-40 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl"></div>
      </div>

      <div class="relative w-full max-w-md">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 shadow-glow-violet mb-4 text-2xl">🚀</div>
          <h1 class="font-display text-2xl font-bold gradient-text">Join the Challenge</h1>
          <p class="text-gray-400 text-sm mt-1">Create your account and start competing</p>
        </div>

        <div class="glass p-8">
          @if (errorMsg()) {
            <div class="mb-5 rounded-xl px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              ⚠️ {{ errorMsg() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
            <div>
              <label class="input-label">Username</label>
              <input formControlName="username" type="text" placeholder="coolquizzer" class="input"
                     [class.border-red-500]="inv('username')">
              @if (inv('username')) { <p class="text-xs text-red-400 mt-1">Min 3 characters</p> }
            </div>

            <div>
              <label class="input-label">Email</label>
              <input formControlName="email" type="email" placeholder="you@example.com" class="input"
                     [class.border-red-500]="inv('email')">
              @if (inv('email')) { <p class="text-xs text-red-400 mt-1">Valid email required</p> }
            </div>

            <div>
              <label class="input-label">Password</label>
              <div class="relative">
                <input formControlName="password" [type]="pwdType()" placeholder="Min 6 characters"
                       class="input pr-12" [class.border-red-500]="inv('password')">
                <button type="button" (click)="togglePwd()"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {{ showPwd() ? '🙈' : '👁️' }}
                </button>
              </div>
              @if (inv('password')) { <p class="text-xs text-red-400 mt-1">Min 6 characters</p> }
            </div>

            <div>
              <label class="input-label">Confirm Password</label>
              <input formControlName="confirmPassword" [type]="pwdType()" placeholder="Repeat password"
                     class="input" [class.border-red-500]="confirmInvalid()">
              @if (confirmInvalid()) { <p class="text-xs text-red-400 mt-1">Passwords do not match</p> }
            </div>

            <button type="submit" [disabled]="loading()"
                    class="btn-primary w-full btn-lg mt-2 flex items-center justify-center gap-2">
              @if (loading()) {
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Creating...
              } @else { Create Account }
            </button>
          </form>

          <p class="text-center text-gray-500 text-sm mt-6">
            Already have an account?
            <a routerLink="/login" class="text-violet-400 hover:text-violet-300 font-medium ml-1">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  errorMsg = signal('');
  showPwd = signal(false);

  form = this.fb.group({
    username:        ['', [Validators.required, Validators.minLength(3)]],
    email:           ['', [Validators.required, Validators.email]],
    password:        ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatch });

  pwdType() { return this.showPwd() ? 'text' : 'password'; }
  togglePwd() { this.showPwd.set(!this.showPwd()); }

  inv(f: string) { const c = this.form.get(f); return c?.invalid && c?.touched; }
  confirmInvalid() {
    const c = this.form.get('confirmPassword');
    return (c?.dirty || c?.touched) && (c?.invalid || !!this.form.errors?.['mismatch']);
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');
    const { username, email, password } = this.form.value;
    this.auth.register({ username: username!, email: email!, password: password! }).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err: any) => { this.errorMsg.set(err.error?.message || 'Registration failed.'); this.loading.set(false); }
    });
  }
}
