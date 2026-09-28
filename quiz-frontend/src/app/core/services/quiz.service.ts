import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse, Quiz, QuizDetail, PublicQuizDetail, CreateQuizRequest } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class QuizService {
  private base = `${environment.apiUrl}/quizzes`;
  constructor(private http: HttpClient) {}

  getPublic(keyword?: string) {
    const url = keyword ? `${this.base}?keyword=${encodeURIComponent(keyword)}` : this.base;
    return this.http.get<ApiResponse<Quiz[]>>(url);
  }

  getMine() { return this.http.get<ApiResponse<Quiz[]>>(`${this.base}/mine`); }

  getDetail(id: number) { return this.http.get<ApiResponse<QuizDetail>>(`${this.base}/${id}`); }

  getTake(id: number) { return this.http.get<ApiResponse<PublicQuizDetail>>(`${this.base}/${id}/take`); }

  create(req: CreateQuizRequest) { return this.http.post<ApiResponse<Quiz>>(this.base, req); }

  update(id: number, req: CreateQuizRequest) { return this.http.put<ApiResponse<Quiz>>(`${this.base}/${id}`, req); }

  delete(id: number) { return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`); }

  publish(id: number)   { return this.http.post<ApiResponse<Quiz>>(`${this.base}/${id}/publish`, {}); }
  unpublish(id: number) { return this.http.post<ApiResponse<Quiz>>(`${this.base}/${id}/unpublish`, {}); }

  addQuestion(quizId: number, questionId: number, orderIndex: number) {
    return this.http.post<ApiResponse<QuizDetail>>(`${this.base}/${quizId}/questions`, { questionId, orderIndex });
  }

  removeQuestion(quizQuestionId: number) {
    return this.http.delete<ApiResponse<void>>(`${this.base}/quiz-questions/${quizQuestionId}`);
  }
}
