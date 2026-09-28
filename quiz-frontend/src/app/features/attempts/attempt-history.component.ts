import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AttemptService } from '../../core/services/attempt.service';
import { Attempt } from '../../core/models/models';

@Component({
  selector: 'app-attempt-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-10">
      <div class="mb-8">
        <h1 class="font-display text-3xl font-bold gradient-text">📊 My Quiz History</h1>
        <p class="text-gray-400 mt-2">Track your progress across all quizzes</p>
      </div>

      @if (loading()) {
        <div class="space-y-3 animate-pulse">
          @for (i of [1,2,3,4]; track i) {
            <div class="glass p-5 h-16 rounded-2xl"></div>
          }
        </div>
      }

      @if (!loading() && attempts().length === 0) {
        <div class="glass p-16 text-center">
          <div class="text-6xl mb-4">🎮</div>
          <h2 class="font-display text-xl font-bold text-white mb-2">No attempts yet</h2>
          <p class="text-gray-500 mb-6">Start taking quizzes to see your history here</p>
          <a routerLink="/" class="btn-primary">Browse Quizzes</a>
        </div>
      }

      @if (!loading() && attempts().length > 0) {
        <div class="glass overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-white/10">
                  <th class="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Quiz</th>
                  <th class="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Score</th>
                  <th class="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th class="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                  <th class="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                @for (a of attempts(); track a.attemptId) {
                  <tr class="hover:bg-white/5 transition-colors">
                    <td class="px-6 py-4">
                      <span class="font-medium text-white text-sm">{{ a.quizTitle }}</span>
                    </td>
                    <td class="px-6 py-4">
                      @if (a.score !== null && a.score !== undefined) {
                        <span class="badge font-bold px-3 py-1"
                              [class.badge-green]="a.score! >= 70"
                              [class.badge-amber]="a.score! >= 40 && a.score! < 70"
                              [class]="a.score! < 40 ? 'badge bg-red-500/10 text-red-400 border border-red-500/30' : ''">
                          {{ a.score | number:'1.0-0' }}%
                        </span>
                      } @else {
                        <span class="text-gray-500 text-sm">—</span>
                      }
                    </td>
                    <td class="px-6 py-4">
                      @if (a.isCompleted) {
                        <span class="badge-green">Completed</span>
                      } @else {
                        <span class="badge-amber">In Progress</span>
                      }
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-400">
                      {{ a.startedAt | date:'MMM d, y' }}
                    </td>
                    <td class="px-6 py-4 text-right">
                      @if (a.isCompleted) {
                        <a [routerLink]="['/quizzes', a.quizId, 'result', a.attemptId]"
                           class="btn-secondary btn-sm">View Result</a>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `
})
export class AttemptHistoryComponent implements OnInit {
  private attemptService = inject(AttemptService);
  attempts = signal<Attempt[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.attemptService.getMyAttempts().subscribe({
      next: res => { this.attempts.set(res.data || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
