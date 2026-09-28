import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { ApiResponse, AuthResult, LoginRequest, RegisterRequest } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'quiz_token';
  private readonly USER_KEY  = 'quiz_user';

  private _user = signal<AuthResult | null>(this.loadUser());

  readonly currentUser = this._user.asReadonly();
  readonly isLoggedIn  = computed(() => !!this._user());
  readonly isAdmin     = computed(() => this._user()?.role === 'Administrator');

  constructor(private http: HttpClient, private router: Router) {}

  register(req: RegisterRequest) {
    return this.http.post<ApiResponse<AuthResult>>(`${environment.apiUrl}/auth/register`, req)
      .pipe(tap(res => { if (res.success) this.saveSession(res.data); }));
  }

  login(req: LoginRequest) {
    return this.http.post<ApiResponse<AuthResult>>(`${environment.apiUrl}/auth/login`, req)
      .pipe(tap(res => { if (res.success) this.saveSession(res.data); }));
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._user.set(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null { return localStorage.getItem(this.TOKEN_KEY); }

  private saveSession(user: AuthResult) {
    localStorage.setItem(this.TOKEN_KEY, user.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._user.set(user);
  }

  private loadUser(): AuthResult | null {
    try { return JSON.parse(localStorage.getItem(this.USER_KEY) || 'null'); }
    catch { return null; }
  }
}
