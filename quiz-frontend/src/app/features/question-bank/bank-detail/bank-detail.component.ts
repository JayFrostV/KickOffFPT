import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuestionBankService } from '../../../core/services/question-bank.service';
import { QuestionBankDetail, Question, Answer } from '../../../core/models/models';

@Component({
  selector: 'app-bank-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-10">
      <a routerLink="/question-banks" class="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm mb-6 transition-colors">
        ← Back to Banks
      </a>

      @if (bank()) {
        <!-- Header -->
        <div class="glass p-6 mb-6">
          <div class="flex items-center justify-between mb-2">
            <h1 class="font-display text-2xl font-bold text-white">{{ bank()!.name }}</h1>
            <span [class]="bank()!.visibility === 'Public' ? 'badge-green' : 'badge-gray'">{{ bank()!.visibility }}</span>
          </div>
          @if (bank()!.description) {
            <p class="text-gray-400 text-sm">{{ bank()!.description }}</p>
          }
          <div class="mt-3 text-sm text-gray-500">{{ bank()!.questions.length }} question(s)</div>
        </div>

        <!-- Add Question Form -->
        <div class="glass p-6 mb-6">
          <h2 class="font-display font-semibold text-white mb-4 flex items-center gap-2">
            <span class="text-violet-400">➕</span> Add Question
          </h2>
          <form (ngSubmit)="addQuestion()" class="space-y-4">
            <div>
              <label class="input-label">Nội dung câu hỏi <span class="text-red-400">*</span></label>
              <textarea [(ngModel)]="content" name="content" class="input resize-none" rows="2" placeholder="Nhập câu hỏi tại đây..."></textarea>
            </div>

            <!-- Segmented buttons chọn loại câu hỏi -->
            <div>
              <label class="input-label">Loại câu hỏi</label>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button type="button" (click)="selectedType.set(1)"
                        class="py-3 px-4 rounded-xl text-sm font-semibold border transition-all text-center cursor-pointer"
                        [style.backgroundColor]="selectedType() === 1 ? '#7c3aed' : 'rgba(255,255,255,0.05)'"
                        [style.borderColor]="selectedType() === 1 ? '#8b5cf6' : 'rgba(255,255,255,0.1)'"
                        [style.color]="selectedType() === 1 ? '#ffffff' : '#9ca3af'">
                  Single Choice
                </button>
                <button type="button" (click)="selectedType.set(2)"
                        class="py-3 px-4 rounded-xl text-sm font-semibold border transition-all text-center cursor-pointer"
                        [style.backgroundColor]="selectedType() === 2 ? '#7c3aed' : 'rgba(255,255,255,0.05)'"
                        [style.borderColor]="selectedType() === 2 ? '#8b5cf6' : 'rgba(255,255,255,0.1)'"
                        [style.color]="selectedType() === 2 ? '#ffffff' : '#9ca3af'">
                  Multiple Choice
                </button>
                <button type="button" (click)="selectedType.set(3)"
                        class="py-3 px-4 rounded-xl text-sm font-semibold border transition-all text-center cursor-pointer"
                        [style.backgroundColor]="selectedType() === 3 ? '#7c3aed' : 'rgba(255,255,255,0.05)'"
                        [style.borderColor]="selectedType() === 3 ? '#8b5cf6' : 'rgba(255,255,255,0.1)'"
                        [style.color]="selectedType() === 3 ? '#ffffff' : '#9ca3af'">
                  True / False
                </button>
              </div>
            </div>

            <!-- Set đáp án đúng khi là True / False -->
            @if (selectedType() === 3) {
              <div class="p-4 rounded-xl bg-violet-600/10 border border-violet-500/30 space-y-3 animate-in">
                <div class="flex items-center gap-2">
                  <span class="text-base">🎯</span>
                  <span class="text-sm font-bold text-violet-300">Set đáp án ĐÚNG cho câu hỏi này:</span>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <button type="button" (click)="tfAnswer.set(true)"
                          class="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all cursor-pointer"
                          [style.backgroundColor]="tfAnswer() === true ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)'"
                          [style.borderColor]="tfAnswer() === true ? '#22c55e' : 'rgba(255,255,255,0.1)'"
                          [style.color]="tfAnswer() === true ? '#86efac' : '#9ca3af'">
                    <span class="w-4 h-4 rounded-full flex items-center justify-center border text-xs"
                          [style.borderColor]="tfAnswer() === true ? '#22c55e' : '#6b7280'"
                          [style.backgroundColor]="tfAnswer() === true ? '#22c55e' : 'transparent'"
                          [style.color]="tfAnswer() === true ? '#ffffff' : 'transparent'">
                      ✓
                    </span>
                    <span>True (Đúng)</span>
                  </button>

                  <button type="button" (click)="tfAnswer.set(false)"
                          class="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all cursor-pointer"
                          [style.backgroundColor]="tfAnswer() === false ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)'"
                          [style.borderColor]="tfAnswer() === false ? '#ef4444' : 'rgba(255,255,255,0.1)'"
                          [style.color]="tfAnswer() === false ? '#fca5a5' : '#9ca3af'">
                    <span class="w-4 h-4 rounded-full flex items-center justify-center border text-xs"
                          [style.borderColor]="tfAnswer() === false ? '#ef4444' : '#6b7280'"
                          [style.backgroundColor]="tfAnswer() === false ? '#ef4444' : 'transparent'"
                          [style.color]="tfAnswer() === false ? '#ffffff' : 'transparent'">
                      ✓
                    </span>
                    <span>False (Sai)</span>
                  </button>
                </div>
              </div>
            }

            <button type="submit" class="btn-primary btn-sm flex items-center gap-2 cursor-pointer" [disabled]="addingQ() || !content.trim()">
              @if (addingQ()) {
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span>Adding...</span>
              } @else {
                <span>➕ Add Question</span>
              }
            </button>
          </form>
        </div>

        <!-- Questions List -->
        <div class="space-y-4">
          @for (q of bank()!.questions; track q.questionId) {
            <div class="glass p-5">
              <div class="flex items-start gap-3 mb-3">
                <span class="badge-violet flex-shrink-0">{{ formatType(q.questionType) }}</span>
                <p class="text-white font-medium flex-1 text-base">{{ q.content }}</p>
                <button (click)="deleteQuestion(q.questionId)" class="text-red-400 hover:text-red-300 text-sm transition-colors flex-shrink-0 cursor-pointer">Delete</button>
              </div>

              <!-- Answers -->
              <div class="ml-1 space-y-2 mb-3">
                @for (a of q.answers; track a.answerId) {
                  <div class="flex items-center justify-between gap-3 pl-4 pr-3 py-2 rounded-xl border-l-2 transition-all"
                       [style.borderColor]="a.isCorrect ? '#4ade80' : 'rgba(255,255,255,0.1)'"
                       [style.backgroundColor]="a.isCorrect ? 'rgba(74,222,128,0.08)' : 'transparent'">
                    <div class="flex items-center gap-2.5 flex-1">
                      <span class="w-4 h-4 rounded-full flex items-center justify-center border text-xs"
                            [style.borderColor]="a.isCorrect ? '#22c55e' : '#6b7280'"
                            [style.backgroundColor]="a.isCorrect ? '#22c55e' : 'transparent'"
                            [style.color]="a.isCorrect ? '#ffffff' : 'transparent'">
                        ✓
                      </span>
                      <span class="text-sm font-semibold"
                            [class.text-green-300]="a.isCorrect"
                            [class.text-gray-300]="!a.isCorrect">
                        {{ a.content }}
                      </span>
                      @if (a.isCorrect) {
                        <span class="badge-green text-xs">Đáp án đúng</span>
                      }
                    </div>

                    <div class="flex items-center gap-2">
                      <!-- Toggle button for TrueFalse or SingleChoice -->
                      @if (!a.isCorrect && (q.questionType === 'TrueFalse' || q.questionType === 'SingleChoice')) {
                        <button (click)="setAsCorrect(a, q)"
                                class="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-violet-600/40 text-gray-300 hover:text-white border border-white/10 hover:border-violet-500/50 transition-all cursor-pointer">
                          Đặt làm đáp án đúng
                        </button>
                      }

                      @if (q.questionType !== 'TrueFalse') {
                        <button (click)="deleteAnswer(a.answerId, q.questionId)"
                                class="text-red-400 hover:text-red-300 text-xs px-1.5 py-0.5 transition-colors cursor-pointer">×</button>
                      }
                    </div>
                  </div>
                }
              </div>

              <!-- Add Answer (for Single and Multiple choice) -->
              @if (q.questionType !== 'TrueFalse') {
                <div class="flex items-center gap-2 mt-3 pt-2 border-t border-white/5">
                  <input [(ngModel)]="newAnswerContent[q.questionId]" class="input text-sm flex-1 py-2" placeholder="Nhập nội dung đáp án...">
                  <label class="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer whitespace-nowrap px-2">
                    <input type="checkbox" [(ngModel)]="newAnswerCorrect[q.questionId]" class="accent-violet-500 w-4 h-4">
                    Đáp án đúng
                  </label>
                  <button (click)="addAnswer(q.questionId)" class="btn-secondary btn-sm whitespace-nowrap cursor-pointer">+ Thêm đáp án</button>
                </div>
              }
            </div>
          }
        </div>
      }

      @if (loading()) {
        <div class="glass p-10 animate-pulse space-y-4">
          <div class="h-6 bg-white/10 rounded w-1/2"></div>
          <div class="h-24 bg-white/5 rounded-xl"></div>
        </div>
      }
    </div>
  `
})
export class BankDetailComponent implements OnInit {
  @Input() id!: string;
  private bankService = inject(QuestionBankService);

  bank = signal<QuestionBankDetail | null>(null);
  loading = signal(true);
  addingQ = signal(false);

  content = '';
  selectedType = signal<number>(1);
  tfAnswer = signal<boolean>(true);

  newAnswerContent: Record<number, string> = {};
  newAnswerCorrect: Record<number, boolean> = {};

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.bankService.getDetail(+this.id).subscribe({
      next: r => { this.bank.set(r.data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  formatType(type: string): string {
    if (type === 'TrueFalse') return 'True / False';
    if (type === 'Multiple') return 'Multiple Choice';
    return 'Single Choice';
  }

  addQuestion() {
    if (!this.content.trim()) return;
    this.addingQ.set(true);
    this.bankService.addQuestion(+this.id, {
      content: this.content.trim(),
      questionType: this.selectedType(),
      trueFalseAnswer: this.tfAnswer()
    }).subscribe({
      next: () => {
        this.content = '';
        this.selectedType.set(1);
        this.tfAnswer.set(true);
        this.addingQ.set(false);
        this.load();
      },
      error: () => this.addingQ.set(false)
    });
  }

  deleteQuestion(qId: number) {
    if (!confirm('Delete this question?')) return;
    this.bankService.deleteQuestion(qId).subscribe(() => this.load());
  }

  setAsCorrect(answer: Answer, question: Question) {
    this.bankService.updateAnswer(answer.answerId, {
      content: answer.content,
      isCorrect: true
    }).subscribe(() => this.load());
  }

  addAnswer(qId: number) {
    const content = this.newAnswerContent[qId];
    if (!content?.trim()) return;
    const isCorrect = this.newAnswerCorrect[qId] || false;
    this.bankService.addAnswer(qId, { content, isCorrect }).subscribe(() => {
      this.newAnswerContent[qId] = '';
      this.newAnswerCorrect[qId] = false;
      this.load();
    });
  }

  deleteAnswer(aId: number, qId: number) {
    this.bankService.deleteAnswer(aId).subscribe(() => this.load());
  }
}
