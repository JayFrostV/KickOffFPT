import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  ApiResponse, QuestionBank, QuestionBankDetail, CreateBankRequest,
  Question, CreateQuestionRequest, Answer, CreateAnswerRequest
} from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class QuestionBankService {
  private base = `${environment.apiUrl}/question-banks`;
  constructor(private http: HttpClient) {}

  getMine()   { return this.http.get<ApiResponse<QuestionBank[]>>(`${this.base}/mine`); }
  getPublic() { return this.http.get<ApiResponse<QuestionBank[]>>(`${this.base}/public`); }
  getDetail(id: number) { return this.http.get<ApiResponse<QuestionBankDetail>>(`${this.base}/${id}`); }

  create(req: CreateBankRequest) { return this.http.post<ApiResponse<QuestionBank>>(this.base, req); }
  update(id: number, req: CreateBankRequest) { return this.http.put<ApiResponse<QuestionBank>>(`${this.base}/${id}`, req); }
  delete(id: number) { return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`); }

  // Questions
  addQuestion(bankId: number, req: CreateQuestionRequest) {
    return this.http.post<ApiResponse<Question>>(`${this.base}/${bankId}/questions`, req);
  }
  updateQuestion(questionId: number, req: CreateQuestionRequest) {
    return this.http.put<ApiResponse<Question>>(`${this.base}/questions/${questionId}`, req);
  }
  deleteQuestion(questionId: number) {
    return this.http.delete<ApiResponse<void>>(`${this.base}/questions/${questionId}`);
  }

  // Answers
  addAnswer(questionId: number, req: CreateAnswerRequest) {
    return this.http.post<ApiResponse<Answer>>(`${this.base}/questions/${questionId}/answers`, req);
  }
  updateAnswer(answerId: number, req: CreateAnswerRequest) {
    return this.http.put<ApiResponse<Answer>>(`${this.base}/answers/${answerId}`, req);
  }
  deleteAnswer(answerId: number) {
    return this.http.delete<ApiResponse<void>>(`${this.base}/answers/${answerId}`);
  }

  searchPublicQuestions(keyword?: string) {
    const url = keyword
      ? `${this.base}/public/questions?keyword=${encodeURIComponent(keyword)}`
      : `${this.base}/public/questions`;
    return this.http.get<ApiResponse<Question[]>>(url);
  }
}
