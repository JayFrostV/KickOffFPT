import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { QuizService } from '../../../core/services/quiz.service';
import { QuestionBankService } from '../../../core/services/question-bank.service';
import { QuizDetail, QuestionBank, Question } from '../../../core/models/models';

@Component({
  selector: 'app-edit-quiz',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-10">
      <div class="flex items-center gap-4 mb-8">
        <a routerLink="/my-quizzes" class="btn-secondary btn-sm">← Back</a>
        <h1 class="font-display text-2xl font-bold gradient-text">Edit Quiz</h1>
        @if (quiz()) {
          <span class="ml-auto" [class]="quiz()!.visibility === 'Public' ? 'badge-green' : 'badge-gray'">
            {{ quiz()!.visibility }}
          </span>
          @if (quiz()!.visibility === 'Private') {
            <button (click)="publish()" class="btn-success btn-sm">🚀 Publish</button>
          } @else {
            <button (click)="unpublish()" class="btn-sm bg-neon-amber/10 text-neon-amber border border-neon-amber/30 rounded-xl px-3 py-1.5 text-xs font-semibold">Unpublish</button>
          }
        }
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Left: Quiz Info -->
        <div class="glass p-6">
          <h2 class="font-display font-semibold text-white mb-4">Quiz Details</h2>
          <form [formGroup]="form" (ngSubmit)="saveInfo()" class="space-y-4">
            <div>
              <label class="input-label">Title</label>
              <input formControlName="title" class="input" placeholder="Quiz title">
            </div>
            <div>
              <label class="input-label">Description</label>
              <textarea formControlName="description" class="input min-h-[80px] resize-none" placeholder="Optional description"></textarea>
            </div>
            <div>
              <label class="input-label">Duration (minutes)</label>
              <input formControlName="duration" type="number" min="1" max="180" class="input">
            </div>
            <button type="submit" class="btn-primary w-full" [disabled]="saving()">
              {{ saving() ? 'Saving...' : 'Save Changes' }}
            </button>
          </form>
        </div>

        <!-- Right: Questions -->
        <div class="space-y-4">
          <!-- Current Questions -->
          <div class="glass p-6">
            <h2 class="font-display font-semibold text-white mb-4">
              Questions <span class="badge-violet ml-2">{{ quiz()?.questions?.length || 0 }}</span>
            </h2>
            @if (!quiz()?.questions?.length) {
              <p class="text-gray-500 text-sm">No questions added yet. Add from your banks below.</p>
            }
            <div class="space-y-2 max-h-60 overflow-y-auto">
              @for (qq of quiz()?.questions || []; track qq.quizQuestionId) {
                <div class="glass-dark p-3 rounded-xl flex items-center gap-3">
                  <span class="badge-gray">{{ qq.orderIndex }}</span>
                  <span class="flex-1 text-sm text-gray-300 truncate">{{ qq.question.content }}</span>
                  <button (click)="removeQuestion(qq.quizQuestionId)" class="text-red-400 hover:text-red-300 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              }
            </div>
          </div>

          <!-- Add from Bank -->
          <div class="glass p-6">
            <h2 class="font-display font-semibold text-white mb-4">Add from Question Bank</h2>
            <select [(ngModel)]="selectedBankId" (ngModelChange)="loadBankQuestions($event)"
                    class="input mb-4" [ngModel]="selectedBankId">
              <option value="">Select a bank...</option>
              @for (b of banks(); track b.bankId) {
                <option [value]="b.bankId">{{ b.name }} ({{ b.questionCount }} Q)</option>
              }
            </select>
            <div class="space-y-2 max-h-48 overflow-y-auto">
              @for (q of bankQuestions(); track q.questionId) {
                <div class="glass-dark p-3 rounded-xl flex items-center gap-3">
                  <span class="flex-1 text-sm text-gray-300 truncate">{{ q.content }}</span>
                  <button (click)="addQuestion(q)" class="badge-violet cursor-pointer hover:bg-violet-500/30 transition-colors">+ Add</button>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EditQuizComponent implements OnInit {
  @Input() id!: string;
  private quizService = inject(QuizService);
  private bankService = inject(QuestionBankService);
  private fb = inject(FormBuilder);

  quiz = signal<QuizDetail | null>(null);
  banks = signal<QuestionBank[]>([]);
  bankQuestions = signal<Question[]>([]);
  saving = signal(false);
  selectedBankId = '';

  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    duration: [30, [Validators.required, Validators.min(1)]]
  });

  ngOnInit() {
    this.loadQuiz();
    this.bankService.getMine().subscribe(r => this.banks.set(r.data || []));
  }

  loadQuiz() {
    this.quizService.getDetail(+this.id).subscribe(r => {
      this.quiz.set(r.data);
      this.form.patchValue({ title: r.data.title, description: r.data.description || '', duration: r.data.duration });
    });
  }

  saveInfo() {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.quizService.update(+this.id, this.form.value as any).subscribe({
      next: () => this.saving.set(false),
      error: () => this.saving.set(false)
    });
  }

  publish()   { this.quizService.publish(+this.id).subscribe(() => this.loadQuiz()); }
  unpublish() { this.quizService.unpublish(+this.id).subscribe(() => this.loadQuiz()); }

  loadBankQuestions(bankId: string) {
    if (!bankId) { this.bankQuestions.set([]); return; }
    this.bankService.getDetail(+bankId).subscribe(r => this.bankQuestions.set(r.data?.questions || []));
  }

  addQuestion(q: Question) {
    const orderIndex = (this.quiz()?.questions?.length || 0) + 1;
    this.quizService.addQuestion(+this.id, q.questionId, orderIndex).subscribe(r => this.quiz.set(r.data));
  }

  removeQuestion(qqId: number) {
    this.quizService.removeQuestion(qqId).subscribe(() => this.loadQuiz());
  }
}
