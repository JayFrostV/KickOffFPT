import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'login',    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },

  // Public quiz
  { path: 'quizzes/:id', loadComponent: () => import('./features/quiz/quiz-detail/quiz-detail.component').then(m => m.QuizDetailComponent) },
  { path: 'quizzes/:id/take', loadComponent: () => import('./features/quiz/take-quiz/take-quiz.component').then(m => m.TakeQuizComponent) },
  { path: 'quizzes/:quizId/result/:attemptId', loadComponent: () => import('./features/quiz/quiz-result/quiz-result.component').then(m => m.QuizResultComponent) },

  // Authenticated
  { path: 'my-quizzes', canActivate: [authGuard], loadComponent: () => import('./features/my-quizzes/my-quizzes.component').then(m => m.MyQuizzesComponent) },
  { path: 'my-quizzes/:id/edit', canActivate: [authGuard], loadComponent: () => import('./features/my-quizzes/edit-quiz/edit-quiz.component').then(m => m.EditQuizComponent) },
  { path: 'question-banks', canActivate: [authGuard], loadComponent: () => import('./features/question-bank/bank-list/bank-list.component').then(m => m.BankListComponent) },
  { path: 'question-banks/:id', canActivate: [authGuard], loadComponent: () => import('./features/question-bank/bank-detail/bank-detail.component').then(m => m.BankDetailComponent) },
  { path: 'attempts', canActivate: [authGuard], loadComponent: () => import('./features/attempts/attempt-history.component').then(m => m.AttemptHistoryComponent) },

  // Admin
  { path: 'admin', canActivate: [adminGuard], loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent) },

  { path: '**', redirectTo: '' }
];
