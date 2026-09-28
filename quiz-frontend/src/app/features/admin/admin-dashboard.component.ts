import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { User, Quiz } from '../../core/models/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-10">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="font-display text-3xl font-bold gradient-text">🛡️ Admin Dashboard</h1>
        <p class="text-gray-400 mt-1">Manage users and moderate content</p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="glass p-5 text-center">
          <div class="text-3xl font-bold font-display text-violet-400">{{ users().length }}</div>
          <div class="text-xs text-gray-500 mt-1">Total Users</div>
        </div>
        <div class="glass p-5 text-center">
          <div class="text-3xl font-bold font-display text-neon-green">{{ activeUsers() }}</div>
          <div class="text-xs text-gray-500 mt-1">Active Users</div>
        </div>
        <div class="glass p-5 text-center">
          <div class="text-3xl font-bold font-display text-neon-cyan">{{ quizzes().length }}</div>
          <div class="text-xs text-gray-500 mt-1">Total Quizzes</div>
        </div>
        <div class="glass p-5 text-center">
          <div class="text-3xl font-bold font-display text-neon-amber">{{ publicQuizzes() }}</div>
          <div class="text-xs text-gray-500 mt-1">Public Quizzes</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 mb-6 p-1 rounded-xl bg-white/5 w-fit">
        <button (click)="tab.set('users')"
                class="px-5 py-2 rounded-lg text-sm font-medium transition-all"
                [class.bg-violet-600]="tab() === 'users'"
                [class.text-white]="tab() === 'users'"
                [class.text-gray-400]="tab() !== 'users'">Users</button>
        <button (click)="tab.set('quizzes')"
                class="px-5 py-2 rounded-lg text-sm font-medium transition-all"
                [class.bg-violet-600]="tab() === 'quizzes'"
                [class.text-white]="tab() === 'quizzes'"
                [class.text-gray-400]="tab() !== 'quizzes'">All Quizzes</button>
      </div>

      <!-- Users Tab -->
      @if (tab() === 'users') {
        <div class="glass overflow-hidden">
          @if (loadingUsers()) {
            <div class="p-8 text-center text-gray-500">Loading users...</div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-white/10">
                    <th class="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase">User</th>
                    <th class="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Role</th>
                    <th class="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Status</th>
                    <th class="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Joined</th>
                    <th class="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  @for (u of users(); track u.userId) {
                    <tr class="hover:bg-white/5 transition-colors">
                      <td class="px-6 py-4">
                        <div class="font-medium text-white text-sm">{{ u.username }}</div>
                        <div class="text-xs text-gray-500">{{ u.email }}</div>
                      </td>
                      <td class="px-6 py-4">
                        <span [class]="u.role === 'Administrator' ? 'badge-violet' : 'badge-gray'">{{ u.role }}</span>
                      </td>
                      <td class="px-6 py-4">
                        @if (u.isActive) {
                          <span class="badge-green">Active</span>
                        } @else {
                          <span class="badge bg-red-500/10 text-red-400 border border-red-500/30">Inactive</span>
                        }
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-400">{{ u.createdAt | date:'MMM d, y' }}</td>
                      <td class="px-6 py-4 text-right">
                        @if (u.role !== 'Administrator') {
                          <button (click)="toggleUser(u)"
                                  class="btn-sm transition-colors"
                                  [class.btn-success]="!u.isActive"
                                  [class.btn-danger]="u.isActive">
                            {{ u.isActive ? 'Deactivate' : 'Activate' }}
                          </button>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }

      <!-- Quizzes Tab -->
      @if (tab() === 'quizzes') {
        <div class="glass overflow-hidden">
          @if (loadingQuizzes()) {
            <div class="p-8 text-center text-gray-500">Loading quizzes...</div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-white/10">
                    <th class="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Title</th>
                    <th class="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Creator</th>
                    <th class="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Visibility</th>
                    <th class="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Created</th>
                    <th class="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  @for (q of quizzes(); track q.quizId) {
                    <tr class="hover:bg-white/5 transition-colors">
                      <td class="px-6 py-4">
                        <div class="font-medium text-white text-sm">{{ q.title }}</div>
                        <div class="text-xs text-gray-500">{{ q.questionCount }} questions · {{ q.duration }} min</div>
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-300">{{ q.creatorName }}</td>
                      <td class="px-6 py-4">
                        <span [class]="q.visibility === 'Public' ? 'badge-green' : 'badge-gray'">{{ q.visibility }}</span>
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-400">{{ q.createdAt | date:'MMM d, y' }}</td>
                      <td class="px-6 py-4 text-right">
                        <button (click)="removeQuiz(q.quizId)" class="btn-danger btn-sm">Remove</button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);

  tab = signal<'users' | 'quizzes'>('users');
  users = signal<User[]>([]);
  quizzes = signal<Quiz[]>([]);
  loadingUsers = signal(true);
  loadingQuizzes = signal(true);

  activeUsers = () => this.users().filter(u => u.isActive).length;
  publicQuizzes = () => this.quizzes().filter(q => q.visibility === 'Public').length;

  ngOnInit() {
    this.adminService.getUsers().subscribe({ next: r => { this.users.set(r.data || []); this.loadingUsers.set(false); }, error: () => this.loadingUsers.set(false) });
    this.adminService.getAllQuizzes().subscribe({ next: r => { this.quizzes.set(r.data || []); this.loadingQuizzes.set(false); }, error: () => this.loadingQuizzes.set(false) });
  }

  toggleUser(u: User) {
    this.adminService.setStatus(u.userId, !u.isActive).subscribe(r => {
      this.users.update(list => list.map(x => x.userId === u.userId ? r.data : x));
    });
  }

  removeQuiz(id: number) {
    if (!confirm('Remove this quiz permanently?')) return;
    this.adminService.removeQuiz(id).subscribe(() => {
      this.quizzes.update(list => list.filter(q => q.quizId !== id));
    });
  }
}
