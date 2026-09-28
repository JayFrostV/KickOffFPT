// ─── Auth ────────────────────────────────────────────────────────────────────
export interface RegisterRequest { username: string; email: string; password: string; }
export interface LoginRequest { email: string; password: string; }
export interface AuthResult {
  userId: number; username: string; email: string; role: string; token: string;
}

// ─── User ────────────────────────────────────────────────────────────────────
export interface User {
  userId: number; username: string; email: string; role: string;
  isActive: boolean; createdAt: string;
}

// ─── QuestionBank ─────────────────────────────────────────────────────────────
export interface QuestionBank {
  bankId: number; ownerId: number; name: string; description?: string;
  visibility: string; createdAt: string; questionCount: number;
}
export interface QuestionBankDetail extends QuestionBank { questions: Question[]; }
export interface CreateBankRequest { name: string; description?: string; visibility: string; }

// ─── Question / Answer ────────────────────────────────────────────────────────
export interface Answer { answerId: number; questionId: number; content: string; isCorrect: boolean; }
export interface PublicAnswer { answerId: number; content: string; }
export interface Question {
  questionId: number; bankId: number; content: string; questionType: string; answers: Answer[];
}
export interface PublicQuestion {
  questionId: number; content: string; questionType: string; answers: PublicAnswer[];
}
export interface CreateQuestionRequest { content: string; questionType: number; trueFalseAnswer?: boolean; }
export interface CreateAnswerRequest { content: string; isCorrect: boolean; }

// ─── Quiz ─────────────────────────────────────────────────────────────────────
export interface Quiz {
  quizId: number; creatorId: number; creatorName: string; title: string;
  description?: string; duration: number; visibility: string;
  createdAt: string; questionCount: number;
}
export interface QuizDetail {
  quizId: number; creatorId: number; creatorName: string; title: string;
  description?: string; duration: number; visibility: string;
  createdAt: string; questionCount: number;
  questions: QuizQuestion[];
}
export interface PublicQuizDetail {
  quizId: number; title: string; description?: string; duration: number;
  questions: PublicQuestion[];
}
export interface QuizQuestion {
  quizQuestionId: number; orderIndex: number; question: Question;
}
export interface CreateQuizRequest { title: string; description?: string; duration: number; }

// ─── Attempt ─────────────────────────────────────────────────────────────────
export interface StartAttemptRequest { guestIdentifier?: string; }
export interface Attempt {
  attemptId: number; quizId: number; quizTitle: string;
  userId?: number; startedAt: string; submittedAt?: string;
  score?: number; isCompleted: boolean;
}
export interface SubmitAttemptRequest { answers: { questionId: number; answerId: number }[]; }
export interface AttemptResult {
  attemptId: number; quizId: number; quizTitle: string;
  score: number; correctCount: number; totalCount: number;
  submittedAt: string;
  answers: AttemptAnswerResult[];
}
export interface AttemptAnswerResult {
  questionId: number; questionContent: string;
  answerId: number; answerContent: string; isCorrect: boolean;
}

// ─── Generic API response ─────────────────────────────────────────────────────
export interface ApiResponse<T> { success: boolean; message?: string; data: T; }
