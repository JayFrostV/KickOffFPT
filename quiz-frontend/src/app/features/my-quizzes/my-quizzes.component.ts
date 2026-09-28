import {
  Component, inject, OnInit, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  ReactiveFormsModule, FormBuilder, FormGroup, Validators
} from '@angular/forms';
import { QuizService } from '../../core/services/quiz.service';
import { Quiz, CreateQuizRequest } from '../../core/models/models';

// ── Minimal toast ─────────────────────────────────────────────────────────────
interface Toast { id: number; message: string; type: 'success' | 'error'; }

@Component({
  selector: 'app-my-quizzes',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="min-h-screen py-10 px-4">
      <div class="max-w-6xl mx-auto space-y-8 animate-in">

        <!-- ── Header ──────────────────────────────────────────────────── -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-3xl font-display font-bold gradient-text">My Quizzes</h1>
            <p class="text-gray-400 text-sm mt-1">Create and manage your quizzes</p>
          </div>
          <button class="btn-primary" (click)="openCreate()">
            <span>＋</span> Create Quiz
          </button>
        </div>

        <!-- ── Loading ─────────────────────────────────────────────────── -->
        @if (loading()) {
          <div class="flex items-center justify-center py-20 gap-3">
            <div class="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
            <span class="text-gray-400">Loading quizzes…</span>
          </div>
        }

        <!-- ── Empty state ─────────────────────────────────────────────── -->
        @if (!loading() && quizzes().length === 0) {
          <div class="glass p-16 text-center space-y-4">
            <p class="text-6xl">🧩</p>
            <h2 class="text-xl font-display font-semibold text-gray-200">No quizzes yet</h2>
            <p class="text-gray-400">Create your first quiz to get started!</p>
            <button class="btn-primary mt-2" (click)="openCreate()">Create Quiz</button>
          </div>
        }

        <!-- ── Quiz grid ───────────────────────────────────────────────── -->
        @if (!loading() && quizzes().length > 0) {
          <div class="grid gap-4">
            @for (quiz of quizzes(); track quiz.quizId) {
              <div class="glass p-5 flex flex-col sm:flex-row sm:items-center gap-4">

                <!-- Info -->
                <div class="flex-1 min-w-0 space-y-1">
                  <h3 class="font-display font-semibold text-gray-100 truncate">{{ quiz.title }}</h3>
                  <div class="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                    <span>{{ quiz.questionCount }} questions</span>
                    <span>·</span>
                    <span>{{ quiz.duration }} min</span>
                    <span>·</span>
                    <span>{{ quiz.createdAt | date:'mediumDate' }}</span>
                  </div>
                </div>

                <!-- Visibility badge -->
                <div class="flex-shrink-0">
                  @if (quiz.visibility === 'Public') {
                    <span class="badge-green">🌐 Public</span>
                  } @else {
                    <span class="badge-violet">🔒 Private</span>
                  }
                </div>

                <!-- Actions -->
                <div class="flex flex-wrap items-center gap-2 flex-shrink-0">
                  <!-- Manage Questions -->
                  <a
                    [routerLink]="['/my-quizzes', quiz.quizId, 'edit']"
                    class="btn-primary btn-sm flex items-center gap-1.5"
                  >
                    ⚙️ Questions ({{ quiz.questionCount }})
                  </a>

                  <!-- Edit Info -->
                  <button class="btn-secondary btn-sm" (click)="openEdit(quiz)">✏️ Edit</button>

                  <!-- Publish / Unpublish -->
                  @if (quiz.visibility === 'Private') {
                    <button
                      class="btn btn-sm bg-neon-green/20 hover:bg-neon-green/30 text-neon-green border border-neon-green/30 disabled:opacity-50"
                      (click)="togglePublish(quiz)"
                      [disabled]="actionLoading() === quiz.quizId"
                      [title]="quiz.questionCount === 0 ? 'Cần thêm ít nhất 1 câu hỏi để Publish' : 'Công khai Quiz'"
                    >Publish</button>
                  } @else {
                    <button
                      class="btn btn-sm bg-neon-amber/20 hover:bg-neon-amber/30 text-neon-amber border border-neon-amber/30"
                      (click)="togglePublish(quiz)"
                      [disabled]="actionLoading() === quiz.quizId"
                    >Unpublish</button>
                  }

                  <!-- Delete with inline confirm -->
                  @if (deleteConfirm() === quiz.quizId) {
                    <span class="flex items-center gap-2">
                      <span class="text-xs text-red-400">Sure?</span>
                      <button class="btn-danger btn-sm" (click)="confirmDelete(quiz.quizId)">Yes</button>
                      <button class="btn-secondary btn-sm" (click)="deleteConfirm.set(null)">No</button>
                    </span>
                  } @else {
                    <button class="btn-danger btn-sm" (click)="deleteConfirm.set(quiz.quizId)">🗑 Delete</button>
                  }
                </div>

              </div>
            }
          </div>
        }

      </div>
    </div>

    <!-- ── Create / Edit Modal ──────────────────────────────────────────────── -->
    @if (modalOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);"
        (click)="closeModal()"
      >
        <div
          class="glass w-full max-w-md p-8 space-y-6 animate-in"
          (click)="$event.stopPropagation()"
        >
          <h2 class="text-xl font-display font-bold gradient-text">
            {{ editingQuiz() ? 'Edit Quiz' : 'Create Quiz' }}
          </h2>

          <form [formGroup]="form" (ngSubmit)="submitForm()" class="space-y-4">
            <!-- Title -->
            <div>
              <label class="input-label">Title <span class="text-red-400">*</span></label>
              <input class="input" formControlName="title" placeholder="My awesome quiz" />
              @if (form.get('title')?.invalid && form.get('title')?.touched) {
                <p class="text-xs text-red-400 mt-1">Title is required.</p>
              }
            </div>

            <!-- Description -->
            <div>
              <label class="input-label">Description</label>
              <textarea
                class="input resize-none"
                rows="3"
                formControlName="description"
                placeholder="What is this quiz about?"
              ></textarea>
            </div>

            <!-- Duration -->
            <div>
              <label class="input-label">Duration (minutes) <span class="text-red-400">*</span></label>
              <input
                class="input"
                type="number"
                min="1"
                formControlName="duration"
                placeholder="30"
              />
              @if (form.get('duration')?.invalid && form.get('duration')?.touched) {
                <p class="text-xs text-red-400 mt-1">Duration must be at least 1 minute.</p>
              }
            </div>

            <!-- Buttons -->
            <div class="flex gap-3 pt-2">
              <button
                type="submit"
                class="btn-primary flex-1"
                [disabled]="form.invalid || formLoading()"
              >
                @if (formLoading()) {
                  <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
                }
                {{ editingQuiz() ? 'Save Changes' : 'Create' }}
              </button>
              <button type="button" class="btn-secondary" (click)="closeModal()">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- ── Toast notifications ───────────────────────────────────────────────── -->
    <div class="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none">
      @for (t of toasts(); track t.id) {
        <div
          class="px-5 py-3 rounded-xl text-sm font-semibold shadow-lg animate-in pointer-events-auto"
          [ngClass]="{
            'bg-neon-green/20 text-neon-green border border-neon-green/30': t.type === 'success',
            'bg-red-500/20 text-red-400 border border-red-500/30':          t.type === 'error'
          }"
        >{{ t.message }}</div>
      }
    </div>
  `,
})
export class MyQuizzesComponent implements OnInit {
  private readonly quizSvc = inject(QuizService);
  private readonly router  = inject(Router);
  private readonly fb      = inject(FormBuilder);

  // ── Signals ──────────────────────────────────────────────────────────────
  quizzes      = signal<Quiz[]>([]);
  loading      = signal(true);
  modalOpen    = signal(false);
  editingQuiz  = signal<Quiz | null>(null);
  deleteConfirm = signal<number | null>(null);
  actionLoading = signal<number | null>(null);
  formLoading  = signal(false);
  toasts       = signal<Toast[]>([]);
  private toastCounter = 0;

  // ── Form ─────────────────────────────────────────────────────────────────
  form: FormGroup = this.fb.group({
    title:       ['', [Validators.required, Validators.minLength(1)]],
    description: [''],
    duration:    [30,  [Validators.required, Validators.min(1)]],
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.quizSvc.getMine().subscribe({
      next: res => {
        if (res.success) this.quizzes.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.showToast('Failed to load quizzes.', 'error');
        this.loading.set(false);
      },
    });
  }

  // ── Modal helpers ─────────────────────────────────────────────────────────
  openCreate(): void {
    this.editingQuiz.set(null);
    this.form.reset({ title: '', description: '', duration: 30 });
    this.modalOpen.set(true);
  }

  openEdit(quiz: Quiz): void {
    this.editingQuiz.set(quiz);
    this.form.setValue({
      title:       quiz.title,
      description: quiz.description ?? '',
      duration:    quiz.duration,
    });
    this.modalOpen.set(true);
  }

  closeModal(): void { this.modalOpen.set(false); }

  submitForm(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const req: CreateQuizRequest = this.form.value;
    this.formLoading.set(true);
    const editing = this.editingQuiz();

    const call = editing
      ? this.quizSvc.update(editing.quizId, req)
      : this.quizSvc.create(req);

    call.subscribe({
      next: res => {
        if (res.success) {
          this.showToast(editing ? 'Quiz updated!' : 'Quiz created!', 'success');
          this.closeModal();
          this.load();
        } else {
          this.showToast(res.message ?? 'Operation failed.', 'error');
        }
        this.formLoading.set(false);
      },
      error: () => {
        this.showToast('An error occurred.', 'error');
        this.formLoading.set(false);
      },
    });
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  confirmDelete(id: number): void {
    this.quizSvc.delete(id).subscribe({
      next: res => {
        if (res.success) {
          this.quizzes.update(list => list.filter(q => q.quizId !== id));
          this.showToast('Quiz deleted.', 'success');
        } else {
          this.showToast(res.message ?? 'Delete failed.', 'error');
        }
        this.deleteConfirm.set(null);
      },
      error: () => {
        this.showToast('Delete failed.', 'error');
        this.deleteConfirm.set(null);
      },
    });
  }

  togglePublish(quiz: Quiz): void {
    if (quiz.visibility === 'Private' && quiz.questionCount === 0) {
      this.showToast('Quiz cần có ít nhất 1 câu hỏi trước khi Publish! Hãy bấm "⚙️ Questions" để thêm câu hỏi.', 'error');
      return;
    }
    this.actionLoading.set(quiz.quizId);
    const call = quiz.visibility === 'Public'
      ? this.quizSvc.unpublish(quiz.quizId)
      : this.quizSvc.publish(quiz.quizId);

    call.subscribe({
      next: res => {
        if (res.success) {
          this.quizzes.update(list =>
            list.map(q => q.quizId === quiz.quizId ? res.data : q)
          );
          this.showToast(
            quiz.visibility === 'Public' ? 'Quiz unpublished.' : 'Quiz published!',
            'success'
          );
        } else {
          this.showToast(res.message ?? 'Action failed.', 'error');
        }
        this.actionLoading.set(null);
      },
      error: (err) => {
        this.showToast(err.error?.message ?? 'Action failed.', 'error');
        this.actionLoading.set(null);
      },
    });
  }

  // ── Toast ─────────────────────────────────────────────────────────────────
  showToast(message: string, type: 'success' | 'error'): void {
    const id = ++this.toastCounter;
    this.toasts.update(t => [...t, { id, message, type }]);
    setTimeout(() => this.toasts.update(t => t.filter(x => x.id !== id)), 3500);
  }
}
