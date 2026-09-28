import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AttemptService } from '../../../core/services/attempt.service';
import { AttemptResult } from '../../../core/models/models';

@Component({
  selector: 'app-quiz-result',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen max-w-3xl mx-auto px-4 py-12">
      @if (loading()) {
        <div class="glass p-12 animate-pulse text-center space-y-4">
          <div class="w-32 h-32 rounded-full bg-white/10 mx-auto"></div>
          <div class="h-6 bg-white/10 rounded w-1/2 mx-auto"></div>
        </div>
      }

      @if (!loading() && result()) {
        <!-- Score Circle -->
        <div class="glass p-10 text-center mb-6 animate-in">
          <div class="relative inline-flex items-center justify-center mb-6">
            <svg class="w-40 h-40 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" stroke="rgba(255,255,255,0.05)" stroke-width="12" fill="none"/>
              <circle cx="60" cy="60" r="54" [attr.stroke]="scoreColor()" stroke-width="12" fill="none"
                      stroke-linecap="round"
                      [attr.stroke-dasharray]="circumference"
                      [attr.stroke-dashoffset]="dashOffset()"/>
            </svg>
            <div class="absolute text-center">
              <div class="font-display text-4xl font-bold" [style.color]="scoreColor()">
                {{ result()!.score | number:'1.0-0' }}%
              </div>
              <div class="text-xs text-gray-500 mt-1">Score</div>
            </div>
          </div>

          <h1 class="font-display text-3xl font-bold text-white mb-2">{{ resultTitle() }}</h1>
          <p class="text-gray-400 mb-6">{{ result()!.quizTitle }}</p>

          <!-- Stats -->
          <div class="grid grid-cols-3 gap-4">
            <div class="glass-dark rounded-xl p-4">
              <div class="text-2xl font-bold font-display text-neon-green">{{ result()!.correctCount }}</div>
              <div class="text-xs text-gray-500 mt-1">Correct</div>
            </div>
            <div class="glass-dark rounded-xl p-4">
              <div class="text-2xl font-bold font-display text-red-400">{{ result()!.totalCount - result()!.correctCount }}</div>
              <div class="text-xs text-gray-500 mt-1">Wrong</div>
            </div>
            <div class="glass-dark rounded-xl p-4">
              <div class="text-2xl font-bold font-display text-gray-400">{{ result()!.totalCount }}</div>
              <div class="text-xs text-gray-500 mt-1">Total</div>
            </div>
          </div>
        </div>

        <!-- Answer Review -->
        <div class="space-y-3 mb-8">
          <h2 class="font-display text-lg font-semibold text-white px-1">Answer Review</h2>
          @for (a of result()!.answers; track a.questionId) {
            <div class="glass p-4 flex items-start gap-4"
                 [style.borderColor]="a.isCorrect ? 'rgba(74,222,128,0.3)' : 'rgba(239,68,68,0.3)'">
              <div class="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 text-sm font-bold"
                   [style.backgroundColor]="a.isCorrect ? 'rgba(74,222,128,0.2)' : 'rgba(239,68,68,0.2)'"
                   [style.color]="a.isCorrect ? '#4ade80' : '#f87171'">
                {{ a.isCorrect ? '✓' : '✗' }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-white text-sm font-medium mb-1">{{ a.questionContent }}</p>
                <p class="text-sm" [class.text-green-400]="a.isCorrect" [class.text-red-400]="!a.isCorrect">
                  {{ a.answerContent }}
                </p>
              </div>
            </div>
          }
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-4">
          <a [routerLink]="['/quizzes', quizId]" class="btn-secondary flex-1 justify-center">🔄 Try Again</a>
          <a routerLink="/" class="btn-primary flex-1 justify-center">🏠 Go Home</a>
        </div>
      }
    </div>
  `
})
export class QuizResultComponent implements OnInit {
  @Input() quizId!: string;
  @Input() attemptId!: string;

  private attemptService = inject(AttemptService);
  private router = inject(Router);

  result = signal<AttemptResult | null>(null);
  loading = signal(true);
  circumference = 2 * Math.PI * 54;

  ngOnInit() {
    this.attemptService.getResult(+this.attemptId).subscribe({
      next: res => { this.result.set(res.data); this.loading.set(false); },
      error: () => this.router.navigate(['/'])
    });
  }

  scoreColor() {
    const s = this.result()?.score ?? 0;
    if (s >= 70) return '#4ade80';
    if (s >= 40) return '#fbbf24';
    return '#f87171';
  }

  dashOffset() {
    const s = this.result()?.score ?? 0;
    return this.circumference - (s / 100) * this.circumference;
  }

  resultTitle() {
    const s = this.result()?.score ?? 0;
    if (s >= 90) return '🏆 Excellent!';
    if (s >= 70) return '🎉 Great Job!';
    if (s >= 50) return '👍 Not Bad!';
    return '💪 Keep Practicing!';
  }
}
