import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuizService } from '../../core/services/quiz.service';
import { AuthService } from '../../core/services/auth.service';
import { Quiz } from '../../core/models/models';
import { QuizCardComponent } from '../../shared/quiz-card/quiz-card.component';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, QuizCardComponent],
  template: `
    <div class="min-h-screen">

      <!-- Hero -->
      <section class="relative overflow-hidden pt-24 pb-20 px-4">
        <!-- Animated BG -->
        <div class="absolute inset-0 pointer-events-none">
          <div class="absolute top-20 left-1/4 w-72 h-72 bg-violet-600/15 rounded-full blur-3xl animate-pulse-slow"></div>
          <div class="absolute top-32 right-1/4 w-56 h-56 bg-neon-cyan/10 rounded-full blur-3xl animate-pulse-slow" style="animation-delay:1.5s"></div>
          <div class="absolute bottom-0 left-1/2 w-96 h-32 bg-violet-600/10 rounded-full blur-3xl"></div>
        </div>

        <div class="relative max-w-4xl mx-auto text-center">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-sm font-medium mb-6">
            ⚡ The ultimate quiz platform
          </div>
          <h1 class="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Test Your<br>
            <span class="gradient-text">Knowledge</span>
          </h1>
          <p class="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10">
            Challenge yourself with thousands of quizzes on any topic.
            Free to play. No signup required to try.
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a (click)="scrollToQuizzes()" class="btn-primary btn-lg cursor-pointer">
              🎯 Browse Quizzes
            </a>
            @if (auth.isLoggedIn()) {
              <a routerLink="/my-quizzes" class="btn-secondary btn-lg">✏️ Create Quiz</a>
            } @else {
              <a routerLink="/register" class="btn-secondary btn-lg">🚀 Get Started Free</a>
            }
          </div>

          <!-- Stats -->
          <div class="flex items-center justify-center gap-8 mt-12 text-sm text-gray-500">
            <div class="text-center">
              <div class="text-2xl font-bold text-white font-display">{{ quizzes().length }}+</div>
              <div>Public Quizzes</div>
            </div>
            <div class="w-px h-8 bg-white/10"></div>
            <div class="text-center">
              <div class="text-2xl font-bold text-white font-display">3</div>
              <div>Free Trials</div>
            </div>
            <div class="w-px h-8 bg-white/10"></div>
            <div class="text-center">
              <div class="text-2xl font-bold text-white font-display">∞</div>
              <div>After Signup</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Quiz Grid -->
      <section id="quizzes" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <!-- Search -->
        <div class="flex flex-col sm:flex-row items-center gap-4 mb-10">
          <div class="relative flex-1 w-full">
            <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input [(ngModel)]="searchQuery" (ngModelChange)="onSearch($event)"
                   type="text" placeholder="Search quizzes..."
                   class="input pl-12 text-base">
          </div>
          <div class="text-sm text-gray-500 whitespace-nowrap">
            {{ quizzes().length }} {{ quizzes().length === 1 ? 'quiz' : 'quizzes' }} found
          </div>
        </div>

        <!-- Loading Skeleton -->
        @if (loading()) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            @for (i of [1,2,3,4,5,6]; track i) {
              <div class="glass p-5 space-y-3 animate-pulse">
                <div class="h-5 bg-white/10 rounded-lg w-3/4"></div>
                <div class="h-3 bg-white/5 rounded w-1/3"></div>
                <div class="h-10 bg-white/5 rounded-lg"></div>
                <div class="h-3 bg-white/5 rounded w-1/2"></div>
              </div>
            }
          </div>
        }

        <!-- Quiz Grid -->
        @if (!loading()) {
          @if (quizzes().length > 0) {
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              @for (quiz of quizzes(); track quiz.quizId) {
                <app-quiz-card [quiz]="quiz" (cardClick)="openQuiz($event)" />
              }
            </div>
          } @else {
            <div class="text-center py-24">
              <div class="text-6xl mb-4">🔍</div>
              <h3 class="font-display text-xl font-semibold text-white mb-2">No quizzes found</h3>
              <p class="text-gray-500">Try a different search term</p>
            </div>
          }
        }
      </section>
    </div>
  `
})
export class HomeComponent implements OnInit {
  private quizService = inject(QuizService);
  private router = inject(Router);
  auth = inject(AuthService);

  quizzes = signal<Quiz[]>([]);
  loading = signal(true);
  searchQuery = '';
  private search$ = new Subject<string>();

  ngOnInit() {
    this.loadQuizzes();
    this.search$.pipe(debounceTime(400)).subscribe(q => this.loadQuizzes(q));
  }

  loadQuizzes(keyword?: string) {
    this.loading.set(true);
    this.quizService.getPublic(keyword).subscribe({
      next: res => { this.quizzes.set(res.data || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onSearch(q: string) { this.search$.next(q); }

  openQuiz(quiz: Quiz) { this.router.navigate(['/quizzes', quiz.quizId]); }

  scrollToQuizzes() { document.getElementById('quizzes')?.scrollIntoView({ behavior: 'smooth' }); }
}
