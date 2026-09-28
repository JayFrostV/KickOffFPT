import { Component, Input, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QuizService } from '../../../core/services/quiz.service';
import { AttemptService } from '../../../core/services/attempt.service';
import { PublicQuestion, PublicQuizDetail, SubmitAttemptRequest } from '../../../core/models/models';

@Component({
  selector: 'app-take-quiz',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen px-4 py-8">
      @if (loading()) {
        <div class="max-w-2xl mx-auto space-y-4 animate-pulse">
          <div class="h-2 bg-violet-500/30 rounded-full"></div>
          <div class="glass p-8 space-y-4">
            <div class="h-6 bg-white/10 rounded-lg w-3/4"></div>
            <div class="h-12 bg-white/5 rounded-xl"></div>
          </div>
        </div>
      }

      @if (!loading() && quiz()) {
        <div class="max-w-2xl mx-auto">

          <!-- Top bar -->
          <div class="flex items-center justify-between mb-6">
            <div class="flex-1 mr-6">
              <div class="flex items-center justify-between text-sm text-gray-400 mb-2">
                <span>Question {{ currentIdx() + 1 }} of {{ quiz()!.questions.length }}</span>
                <span>{{ progressPct() }}%</span>
              </div>
              <div class="h-2 bg-white/10 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-violet-600 to-neon-cyan rounded-full transition-all duration-500"
                     [style.width]="progressPct() + '%'"></div>
              </div>
            </div>

            <!-- Timer -->
            <div class="flex items-center gap-2 px-4 py-2 rounded-xl glass"
                 [style.borderColor]="timerColor()">
              <svg class="w-4 h-4" [style.color]="timerColor()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span class="font-display font-bold text-sm" [style.color]="timerColor()">{{ formatTime(timeLeft()) }}</span>
            </div>
          </div>

          <!-- Question Card -->
          <div class="glass p-8 mb-6 animate-in">
            <div class="flex items-center gap-2 mb-6">
              <span class="badge-violet">{{ typeLabel(currentQ().questionType) }}</span>
            </div>

            <h2 class="font-display text-xl font-semibold text-white mb-8 leading-relaxed">
              {{ currentQ().content }}
            </h2>

            <div class="space-y-3">
              @for (answer of currentQ().answers; track answer.answerId) {
                <button type="button"
                        (click)="selectAnswer(currentQ(), answer.answerId)"
                        class="quiz-option w-full text-left flex items-center gap-3"
                        [class.selected]="isSelected(currentQ().questionId, answer.answerId)">
                  <div class="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center transition-all"
                       [style.background]="isSelected(currentQ().questionId, answer.answerId) ? '#7c3aed' : 'transparent'"
                       [style.border]="isSelected(currentQ().questionId, answer.answerId) ? 'none' : '2px solid rgba(255,255,255,0.2)'">
                    @if (isSelected(currentQ().questionId, answer.answerId)) {
                      <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                      </svg>
                    }
                  </div>
                  <span class="text-gray-200">{{ answer.content }}</span>
                </button>
              }
            </div>
          </div>

          <!-- Navigation -->
          <div class="flex items-center justify-between">
            <button type="button" (click)="prev()" [disabled]="currentIdx() === 0" class="btn-secondary disabled:opacity-30">
              ← Previous
            </button>

            <span class="text-sm text-gray-500">{{ answeredCount() }} / {{ quiz()!.questions.length }} answered</span>

            @if (currentIdx() < quiz()!.questions.length - 1) {
              <button type="button" (click)="next()" class="btn-primary">Next →</button>
            } @else {
              <button type="button" (click)="submitQuiz()" [disabled]="submitting()" class="btn-primary flex items-center gap-2">
                @if (submitting()) {
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                }
                <span>{{ submitting() ? 'Submitting...' : '✓ Submit' }}</span>
              </button>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class TakeQuizComponent implements OnInit, OnDestroy {
  @Input() id!: string;

  private quizService = inject(QuizService);
  private attemptService = inject(AttemptService);
  private router = inject(Router);

  quiz = signal<PublicQuizDetail | null>(null);
  loading = signal(true);
  submitting = signal(false);
  currentIdx = signal(0);
  timeLeft = signal(0);
  private answers = new Map<number, number[]>();
  private timer?: any;
  private attemptId = 0;
  private _tick = signal(0); // force re-render for answers

  currentQ = computed(() => this.quiz()!.questions[this.currentIdx()]);
  progressPct = computed(() => Math.round(((this.currentIdx() + 1) / (this.quiz()?.questions.length || 1)) * 100));
  answeredCount = computed(() => { this._tick(); return this.answers.size; });

  ngOnInit() {
    this.attemptId = +(localStorage.getItem('current_attempt') || '0');
    this.quizService.getTake(+this.id).subscribe({
      next: (res: any) => {
        this.quiz.set(res.data);
        this.timeLeft.set((res.data.duration || 30) * 60);
        this.loading.set(false);
        this.startTimer();
      },
      error: () => this.router.navigate(['/quizzes', this.id])
    });
  }

  ngOnDestroy() { if (this.timer) clearInterval(this.timer); }

  startTimer() {
    this.timer = setInterval(() => {
      const t = this.timeLeft();
      if (t <= 1) { clearInterval(this.timer); this.timeLeft.set(0); this.submitQuiz(); }
      else { this.timeLeft.set(t - 1); }
    }, 1000);
  }

  formatTime(s: number): string {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  timerColor(): string {
    const t = this.timeLeft();
    if (t < 60) return '#f87171';
    if (t < 180) return '#fbbf24';
    return '#22d3ee';
  }

  typeLabel(type: string): string {
    if (type === 'Multiple') return 'Multiple Choice';
    if (type === 'TrueFalse') return 'True / False';
    return 'Single Choice';
  }

  selectAnswer(q: PublicQuestion, answerId: number) {
    if (q.questionType === 'Multiple') {
      const cur = this.answers.get(q.questionId) || [];
      if (cur.includes(answerId)) { this.answers.set(q.questionId, cur.filter(a => a !== answerId)); }
      else { this.answers.set(q.questionId, [...cur, answerId]); }
    } else {
      this.answers.set(q.questionId, [answerId]);
    }
    this._tick.update(n => n + 1);
  }

  isSelected(qId: number, aId: number): boolean {
    this._tick(); // reactive dependency
    return (this.answers.get(qId) || []).includes(aId);
  }

  prev() { if (this.currentIdx() > 0) this.currentIdx.update(i => i - 1); }
  next() {
    const max = (this.quiz()?.questions.length ?? 0) - 1;
    if (this.currentIdx() < max) this.currentIdx.update(i => i + 1);
  }

  submitQuiz() {
    if (this.submitting()) return;
    this.submitting.set(true);
    if (this.timer) clearInterval(this.timer);

    const answerList: { questionId: number; answerId: number }[] = [];
    this.answers.forEach((aIds, qId) => {
      aIds.forEach(aId => answerList.push({ questionId: qId, answerId: aId }));
    });

    const req: SubmitAttemptRequest = { answers: answerList };
    const guestId = localStorage.getItem('guest_id') || undefined;

    this.attemptService.submit(this.attemptId, req, guestId).subscribe({
      next: (res: any) => {
        localStorage.removeItem('current_attempt');
        this.router.navigate(['/quizzes', this.id, 'result', res.data.attemptId]);
      },
      error: () => { this.submitting.set(false); alert('Submit failed. Please try again.'); }
    });
  }
}
