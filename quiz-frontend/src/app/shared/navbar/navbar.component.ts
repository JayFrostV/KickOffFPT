import { Component, computed, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="fixed top-0 left-0 right-0 z-50 bg-space-900/80 backdrop-blur-lg border-b border-white/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">

          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-2 group">
            <span class="text-2xl">⚡</span>
            <span class="font-display font-bold text-xl text-white group-hover:text-violet-400 transition-colors">
              Quiz<span class="text-violet-400">App</span>
            </span>
          </a>

          <!-- Desktop Nav -->
          <div class="hidden md:flex items-center gap-6">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-link">Home</a>
            @if (auth.isLoggedIn()) {
              <a routerLink="/my-quizzes" routerLinkActive="active" class="nav-link">My Quizzes</a>
              <a routerLink="/question-banks" routerLinkActive="active" class="nav-link">Banks</a>
              <a routerLink="/attempts" routerLinkActive="active" class="nav-link">History</a>
              @if (auth.isAdmin()) {
                <a routerLink="/admin" routerLinkActive="active" class="nav-link text-violet-400">Admin</a>
              }
            }
          </div>

          <!-- Right side -->
          <div class="hidden md:flex items-center gap-3">
            @if (auth.isLoggedIn()) {
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-400">{{ auth.currentUser()?.username }}</span>
                @if (auth.isAdmin()) {
                  <span class="badge-violet text-xs">Admin</span>
                }
              </div>
              <button (click)="logout()" class="btn-secondary btn-sm">Logout</button>
            } @else {
              <a routerLink="/login" class="btn-secondary btn-sm">Login</a>
              <a routerLink="/register" class="btn-primary btn-sm">Get Started</a>
            }
          </div>

          <!-- Mobile hamburger -->
          <button (click)="toggleMobile()" class="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            @if (mobileOpen()) {
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            } @else {
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            }
          </button>
        </div>

        <!-- Mobile menu -->
        @if (mobileOpen()) {
          <div class="md:hidden border-t border-white/10 py-4 space-y-2 animate-in">
            <a routerLink="/" (click)="toggleMobile()" class="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg">Home</a>
            @if (auth.isLoggedIn()) {
              <a routerLink="/my-quizzes" (click)="toggleMobile()" class="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg">My Quizzes</a>
              <a routerLink="/question-banks" (click)="toggleMobile()" class="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg">Question Banks</a>
              <a routerLink="/attempts" (click)="toggleMobile()" class="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg">History</a>
              <div class="px-4 pt-2 border-t border-white/10 flex items-center justify-between">
                <span class="text-sm text-gray-400">{{ auth.currentUser()?.username }}</span>
                <button (click)="logout()" class="btn-danger btn-sm">Logout</button>
              </div>
            } @else {
              <a routerLink="/login" (click)="toggleMobile()" class="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg">Login</a>
              <a routerLink="/register" (click)="toggleMobile()" class="btn-primary mx-4 block text-center">Get Started</a>
            }
          </div>
        }
      </div>
    </nav>
  `
})
export class NavbarComponent {
  mobileOpen = signal(false);
  constructor(public auth: AuthService, private router: Router) {}
  toggleMobile() { this.mobileOpen.update(v => !v); }
  logout() { this.auth.logout(); this.mobileOpen.set(false); }
}
