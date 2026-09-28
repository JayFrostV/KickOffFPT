import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse, User, Quiz } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = `${environment.apiUrl}/admin`;
  constructor(private http: HttpClient) {}

  getUsers()   { return this.http.get<ApiResponse<User[]>>(`${this.base}/users`); }
  setStatus(userId: number, isActive: boolean) {
    return this.http.put<ApiResponse<User>>(`${this.base}/users/${userId}/status`, { isActive });
  }

  getAllQuizzes() { return this.http.get<ApiResponse<Quiz[]>>(`${this.base}/quizzes`); }
  removeQuiz(id: number) { return this.http.delete<ApiResponse<void>>(`${this.base}/quizzes/${id}`); }
}
