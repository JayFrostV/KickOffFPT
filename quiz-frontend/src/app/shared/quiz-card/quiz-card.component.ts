import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Quiz } from '../../core/models/models';

@Component({
  selector: 'app-quiz-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div (click)="cardClick.emit(quiz)"
         class="glass p-5 cursor-pointer hover:bg-violet-500/10 hover:border-violet-500/30 transition-all duration-300 group animate-in">
      <!-- Header -->
      <div class="flex items-start justify-between mb-3">
        <div class="flex-1 min-w-0">
          <h3 class="font-display font-semibold text-white text-lg leading-tight truncate group-hover:text-violet-300 transition-colors">
            {{ quiz.title }}
          </h3>
          <p class="text-xs text-gray-500 mt-0.5">by {{ quiz.creatorName }}</p>
        </div>
        <span [class]="quiz.visibility === 'Public' ? 'badge-green' : 'badge-gray'" class="ml-3 flex-shrink-0">
          {{ quiz.visibility }}
        </span>
      </div>

      <!-- Description -->
      @if (quiz.description) {
        <p class="text-sm text-gray-400 line-clamp-2 mb-4">{{ quiz.description }}</p>
      }

      <!-- Stats row -->
      <div class="flex items-center gap-4 text-xs text-gray-500">
        <span class="flex items-center gap-1">
          <svg class="w-3.5 h-3.5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {{ quiz.questionCount }} questions
        </span>
        <span class="flex items-center gap-1">
          <svg class="w-3.5 h-3.5 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {{ quiz.duration }} min
        </span>
        <span class="ml-auto">{{ quiz.createdAt | date:'MMM d' }}</span>
      </div>

      <!-- Hover arrow -->
      <div class="mt-3 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
        <svg class="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </div>
    </div>
  `
})
export class QuizCardComponent {
  @Input({ required: true }) quiz!: Quiz;
  @Output() cardClick = new EventEmitter<Quiz>();
}
