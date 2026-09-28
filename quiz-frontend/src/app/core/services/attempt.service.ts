import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse, Attempt, AttemptResult, StartAttemptRequest, SubmitAttemptRequest } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AttemptService {
  private base = `${environment.apiUrl}/quizzes`;
  constructor(private http: HttpClient) {}

  start(quizId: number, req: StartAttemptRequest) {
    return this.http.post<ApiResponse<Attempt>>(`${this.base}/${quizId}/start`, req);
  }

  submit(attemptId: number, req: SubmitAttemptRequest, guestId?: string) {
    let url = `${this.base}/attempts/${attemptId}/submit`;
    if (guestId) url += `?guestIdentifier=${encodeURIComponent(guestId)}`;
    return this.http.post<ApiResponse<AttemptResult>>(url, req);
  }

  getResult(attemptId: number) {
    return this.http.get<ApiResponse<AttemptResult>>(`${this.base}/attempts/${attemptId}/result`);
  }

  getMyAttempts() {
    return this.http.get<ApiResponse<Attempt[]>>(`${this.base}/my-attempts`);
  }
}
