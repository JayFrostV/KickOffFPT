import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { QuestionBankService } from '../../../core/services/question-bank.service';
import { QuestionBank } from '../../../core/models/models';

@Component({
  selector: 'app-bank-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-10">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="font-display text-3xl font-bold gradient-text">🏦 Question Banks</h1>
          <p class="text-gray-400 mt-1">Organize your questions into reusable banks</p>
        </div>
        <button (click)="openCreate()" class="btn-primary">+ New Bank</button>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 mb-6 p-1 rounded-xl bg-white/5 w-fit">
        <button (click)="loadMine()"
                class="px-5 py-2 rounded-lg text-sm font-medium transition-all"
                [class.bg-violet-600]="activeTab() === 'mine'"
                [class.text-white]="activeTab() === 'mine'"
                [class.text-gray-400]="activeTab() !== 'mine'">My Banks</button>
        <button (click)="loadPublic()"
                class="px-5 py-2 rounded-lg text-sm font-medium transition-all"
                [class.bg-violet-600]="activeTab() === 'public'"
                [class.text-white]="activeTab() === 'public'"
                [class.text-gray-400]="activeTab() !== 'public'">Public Banks</button>
      </div>

      <!-- Create Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div class="glass p-8 w-full max-w-md animate-in">
            <h2 class="font-display text-xl font-bold text-white mb-6">New Question Bank</h2>
            <form [formGroup]="form" (ngSubmit)="create()" class="space-y-4">
              <div>
                <label class="input-label">Name</label>
                <input formControlName="name" class="input" placeholder="e.g. JavaScript Basics">
              </div>
              <div>
                <label class="input-label">Description</label>
                <textarea formControlName="description" class="input resize-none" placeholder="Optional"></textarea>
              </div>
              <div>
                <label class="input-label">Visibility</label>
                <select formControlName="visibility" class="input">
                  <option value="Private">🔒 Private</option>
                  <option value="Public">🌐 Public</option>
                </select>
              </div>
              <div class="flex gap-3 pt-2">
                <button type="button" (click)="closeModal()" class="btn-secondary flex-1">Cancel</button>
                <button type="submit" class="btn-primary flex-1" [disabled]="creating()">
                  {{ creating() ? 'Creating...' : 'Create' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Loading -->
      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          @for (i of [1,2,3]; track i) {
            <div class="glass p-6 h-32"></div>
          }
        </div>
      }

      @if (!loading()) {
        @if (banks().length === 0) {
          <div class="glass p-16 text-center">
            <div class="text-5xl mb-4">📂</div>
            <h3 class="font-display text-xl font-bold text-white mb-2">No banks yet</h3>
            <p class="text-gray-500 mb-6">Create your first question bank to get started</p>
            <button (click)="openCreate()" class="btn-primary">Create Bank</button>
          </div>
        }
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          @for (bank of banks(); track bank.bankId) {
            <div class="glass p-5 flex flex-col gap-3 group hover:border-violet-500/30 transition-all cursor-pointer"
                 (click)="goToBank(bank.bankId)">
              <div class="flex items-start justify-between">
                <h3 class="font-display font-semibold text-white group-hover:text-violet-300 transition-colors">{{ bank.name }}</h3>
                <span [class]="bank.visibility === 'Public' ? 'badge-green' : 'badge-gray'">{{ bank.visibility }}</span>
              </div>
              @if (bank.description) {
                <p class="text-sm text-gray-400 line-clamp-2">{{ bank.description }}</p>
              }
              <div class="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                <span class="badge-violet">{{ bank.questionCount }} questions</span>
                @if (activeTab() === 'mine') {
                  <button (click)="deleteBank($event, bank.bankId)" class="text-red-400 hover:text-red-300 text-xs transition-colors">Delete</button>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class BankListComponent implements OnInit {
  private bankService = inject(QuestionBankService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  banks = signal<QuestionBank[]>([]);
  loading = signal(true);
  showModal = signal(false);
  creating = signal(false);
  activeTab = signal<'mine' | 'public'>('mine');

  form = this.fb.group({
    name:        ['', Validators.required],
    description: [''],
    visibility:  ['Private']
  });

  ngOnInit() { this.loadMine(); }

  loadMine() {
    this.activeTab.set('mine');
    this.loading.set(true);
    this.bankService.getMine().subscribe({
      next: (r: any) => { this.banks.set(r.data || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  loadPublic() {
    this.activeTab.set('public');
    this.loading.set(true);
    this.bankService.getPublic().subscribe({
      next: (r: any) => { this.banks.set(r.data || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  goToBank(id: number) { this.router.navigate(['/question-banks', id]); }

  openCreate() { this.form.reset({ visibility: 'Private' }); this.showModal.set(true); }
  closeModal() { this.showModal.set(false); }

  create() {
    if (this.form.invalid) return;
    this.creating.set(true);
    this.bankService.create(this.form.value as any).subscribe({
      next: () => { this.closeModal(); this.creating.set(false); this.loadMine(); },
      error: () => this.creating.set(false)
    });
  }

  deleteBank(e: Event, id: number) {
    e.stopPropagation();
    if (!confirm('Delete this bank and all its questions?')) return;
    this.bankService.delete(id).subscribe(() => this.loadMine());
  }
}
