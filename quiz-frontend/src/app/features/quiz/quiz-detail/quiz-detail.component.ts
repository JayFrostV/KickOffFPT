import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { QuizService } from '../../../core/services/quiz.service';
import { AttemptService } from '../../../core/services/attempt.service';
import { AuthService } from '../../../core/services/auth.service';
import { Quiz, QuizDetail } from '../../../core/models/models';

@Component({
  selector: 'app-quiz-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen max-w-3xl mx-auto px-4 py-12">
      @if (loading()) {
        <div class="glass p-8 animate-pulse space-y-4">
          <div class="h-8 bg-white/10 rounded-lg w-2/3"></div>
          <div class="h-4 bg-white/5 rounded w-1/3"></div>
          <div class="h-16 bg-white/5 rounded-xl"></div>
        </div>
      }

      @if (!loading() && quiz()) {
        <!-- Header -->
        <div class="mb-8">
          <a routerLink="/" class="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm mb-6 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Back to Home
          </a>

          <div class="glass p-8">
            <div class="flex items-start justify-between gap-4 mb-4">
              <h1 class="font-display text-3xl font-bold text-white leading-tight">{{ quiz()!.title }}</h1>
              <span [class]="quiz()!.visibility === 'Public' ? 'badge-green' : 'badge-gray'">
                {{ quiz()!.visibility }}
              </span>
            </div>

            <p class="text-gray-400 text-sm mb-1">by <span class="text-violet-400">{{ quiz()!.creatorName }}</span></p>

            @if (quiz()!.description) {
              <p class="text-gray-300 mt-4 leading-relaxed">{{ quiz()!.description }}</p>
            }

            <!-- Stats -->
            <div class="grid grid-cols-3 gap-4 mt-8">
              <div class="glass-dark rounded-xl p-4 text-center">
                <div class="text-3xl font-bold font-display text-violet-400">{{ quiz()!.questionCount }}</div>
                <div class="text-xs text-gray-500 mt-1">Questions</div>
              </div>
              <div class="glass-dark rounded-xl p-4 text-center">
                <div class="text-3xl font-bold font-display text-neon-cyan">{{ quiz()!.duration }}</div>
                <div class="text-xs text-gray-500 mt-1">Minutes</div>
              </div>
              <div class="glass-dark rounded-xl p-4 text-center">
                <div class="text-3xl font-bold font-display text-neon-green">{{ quiz()!.questionCount > 0 ? 'Ready' : '-' }}</div>
                <div class="text-xs text-gray-500 mt-1">Status</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Guest warning -->
        @if (!auth.isLoggedIn()) {
          <div class="glass border border-neon-amber/30 p-4 rounded-xl mb-6 flex items-start gap-3">
            <span class="text-2xl">⚠️</span>
            <div>
              <p class="text-neon-amber font-semibold text-sm">Guest Mode — Limited Trials</p>
              <p class="text-gray-400 text-sm mt-1">You can try up to 3 quizzes without an account.
                <a routerLink="/register" class="text-violet-400 hover:underline">Sign up</a> for unlimited access!</p>
            </div>
          </div>
        }

        <!-- Error -->
        @if (errorMsg()) {
          <div class="glass border border-red-500/30 p-4 rounded-xl mb-6 text-red-400 text-sm">
            {{ errorMsg() }}
          </div>
        }

        <!-- Start Button -->
        <button (click)="startQuiz()" [disabled]="starting() || quiz()!.questionCount === 0"
                class="btn-primary btn-lg w-full flex items-center justify-center gap-3 shadow-glow-violet">
          @if (starting()) {
            <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Starting...
          } @else {
            <span class="text-xl">🎯</span>
            @if (quiz()!.questionCount === 0) { No questions yet } @else { Start Quiz }
          }
        </button>
      }

      @if (!loading() && !quiz()) {
        <div class="text-center py-24">
          <div class="text-6xl mb-4">😕</div>
          <h2 class="font-display text-xl font-bold text-white mb-2">Quiz not found</h2>
          <a routerLink="/" class="btn-secondary mt-4 inline-flex">Go Home</a>
        </div>
      }
    </div>
  `
})
export class QuizDetailComponent implements OnInit {
  @Input() id!: string;

  private quizService = inject(QuizService);
  private attemptService = inject(AttemptService);
  private router = inject(Router);
  auth = inject(AuthService);

  quiz = signal<QuizDetail | null>(null);
  loading = signal(true);
  starting = signal(false);
  errorMsg = signal('');

  ngOnInit() {
    this.quizService.getDetail(+this.id).subscribe({
      next: res => { this.quiz.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  startQuiz() {
    this.starting.set(true);
    this.errorMsg.set('');
    const guestId = !this.auth.isLoggedIn() ? `guest-${Date.now()}` : undefined;
    this.attemptService.start(+this.id, { guestIdentifier: guestId }).subscribe({
      next: res => {
        if (guestId) localStorage.setItem('guest_id', guestId);
        localStorage.setItem('current_attempt', String(res.data.attemptId));
        this.router.navigate(['/quizzes', this.id, 'take']);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Could not start quiz. You may have exceeded the trial limit.');
        this.starting.set(false);
      }
    });
  }
}
