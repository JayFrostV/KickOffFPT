// ═══════════════════════════════════════════════════════════════════════════
// DTOs — QuizApp.Application
// ═══════════════════════════════════════════════════════════════════════════

namespace QuizApp.Application.DTOs;

// ─── Auth ─────────────────────────────────────────────────────────────────────

public class RegisterRequest { public string Username { get; set; } = string.Empty; public string Email { get; set; } = string.Empty; public string Password { get; set; } = string.Empty; }
public class LoginRequest { public string Email { get; set; } = string.Empty; public string Password { get; set; } = string.Empty; }
public class AuthResultDto 
{ 
    public int UserId { get; set; } 
    public string Username { get; set; } = string.Empty; 
    public string Email { get; set; } = string.Empty; 
    public string Role { get; set; } = string.Empty; 
    public string Token { get; set; } = string.Empty; 

    public AuthResultDto() {}
    public AuthResultDto(int userId, string username, string email, string role, string token)
    {
        UserId = userId; Username = username; Email = email; Role = role; Token = token;
    }
}

// ─── User ─────────────────────────────────────────────────────────────────────

public class UserDto { public int UserId { get; set; } public string Username { get; set; } = string.Empty; public string Email { get; set; } = string.Empty; public string Role { get; set; } = string.Empty; public bool IsActive { get; set; } public DateTime CreatedAt { get; set; } }
public class UpdateUserStatusRequest { public bool IsActive { get; set; } }

// ─── QuestionBank ─────────────────────────────────────────────────────────────

public class QuestionBankDto { public int BankId { get; set; } public int OwnerId { get; set; } public string Name { get; set; } = string.Empty; public string? Description { get; set; } public string Visibility { get; set; } = string.Empty; public DateTime CreatedAt { get; set; } public int QuestionCount { get; set; } }
public class QuestionBankDetailDto { public int BankId { get; set; } public int OwnerId { get; set; } public string Name { get; set; } = string.Empty; public string? Description { get; set; } public string Visibility { get; set; } = string.Empty; public DateTime CreatedAt { get; set; } public IEnumerable<QuestionDto> Questions { get; set; } = new List<QuestionDto>(); }
public class CreateQuestionBankRequest { public string Name { get; set; } = string.Empty; public string? Description { get; set; } public string Visibility { get; set; } = string.Empty; }
public class UpdateQuestionBankRequest { public string Name { get; set; } = string.Empty; public string? Description { get; set; } public string Visibility { get; set; } = string.Empty; }

// ─── Question ─────────────────────────────────────────────────────────────────

public class QuestionDto { public int QuestionId { get; set; } public int BankId { get; set; } public string Content { get; set; } = string.Empty; public string QuestionType { get; set; } = string.Empty; public IEnumerable<AnswerDto> Answers { get; set; } = new List<AnswerDto>(); }
public class CreateQuestionRequest { public string Content { get; set; } = string.Empty; public int QuestionType { get; set; } public bool? TrueFalseAnswer { get; set; } }
public class UpdateQuestionRequest { public string Content { get; set; } = string.Empty; public int QuestionType { get; set; } }

// ─── Answer ───────────────────────────────────────────────────────────────────

public class AnswerDto { public int AnswerId { get; set; } public int QuestionId { get; set; } public string Content { get; set; } = string.Empty; public bool IsCorrect { get; set; } }
public class CreateAnswerRequest { public string Content { get; set; } = string.Empty; public bool IsCorrect { get; set; } }
public class UpdateAnswerRequest { public string Content { get; set; } = string.Empty; public bool IsCorrect { get; set; } }

// ─── Quiz ─────────────────────────────────────────────────────────────────────

public class QuizDto { public int QuizId { get; set; } public int CreatorId { get; set; } public string CreatorName { get; set; } = string.Empty; public string Title { get; set; } = string.Empty; public string? Description { get; set; } public int Duration { get; set; } public string Visibility { get; set; } = string.Empty; public DateTime CreatedAt { get; set; } public int QuestionCount { get; set; } }
public class QuizDetailDto { public int QuizId { get; set; } public int CreatorId { get; set; } public string CreatorName { get; set; } = string.Empty; public string Title { get; set; } = string.Empty; public string? Description { get; set; } public int Duration { get; set; } public string Visibility { get; set; } = string.Empty; public DateTime CreatedAt { get; set; } public IEnumerable<QuizQuestionDto> Questions { get; set; } = new List<QuizQuestionDto>(); }
public class CreateQuizRequest { public string Title { get; set; } = string.Empty; public string? Description { get; set; } public int Duration { get; set; } }
public class UpdateQuizRequest { public string Title { get; set; } = string.Empty; public string? Description { get; set; } public int Duration { get; set; } }

// ─── QuizQuestion ─────────────────────────────────────────────────────────────

public class QuizQuestionDto { public int QuizQuestionId { get; set; } public int OrderIndex { get; set; } public QuestionDto Question { get; set; } = null!; }
public class AddQuestionToQuizRequest { public int QuestionId { get; set; } public int OrderIndex { get; set; } }
public class ReuseQuestionRequest { public int QuestionId { get; set; } public int OrderIndex { get; set; } }

// ─── Public Quiz (for Guest/User taking quiz - no IsCorrect) ──────────────────

public class PublicQuizDetailDto { public int QuizId { get; set; } public string Title { get; set; } = string.Empty; public string? Description { get; set; } public int Duration { get; set; } public IEnumerable<PublicQuestionDto> Questions { get; set; } = new List<PublicQuestionDto>(); }
public class PublicQuestionDto { public int QuestionId { get; set; } public string Content { get; set; } = string.Empty; public string QuestionType { get; set; } = string.Empty; public IEnumerable<PublicAnswerDto> Answers { get; set; } = new List<PublicAnswerDto>(); }
public class PublicAnswerDto { public int AnswerId { get; set; } public string Content { get; set; } = string.Empty; }

// ─── Attempt ──────────────────────────────────────────────────────────────────

public class StartAttemptRequest { public string? GuestIdentifier { get; set; } }
public class SubmitAttemptRequest { public IEnumerable<SubmitAnswerItem> Answers { get; set; } = new List<SubmitAnswerItem>(); }
public class SubmitAnswerItem { public int QuestionId { get; set; } public int AnswerId { get; set; } }
public class AttemptDto { public int AttemptId { get; set; } public int QuizId { get; set; } public string QuizTitle { get; set; } = string.Empty; public int? UserId { get; set; } public DateTime StartedAt { get; set; } public DateTime? SubmittedAt { get; set; } public decimal? Score { get; set; } public bool IsCompleted { get; set; } }
public class AttemptResultDto 
{ 
    public int AttemptId { get; set; } 
    public int QuizId { get; set; } 
    public string QuizTitle { get; set; } = string.Empty; 
    public decimal Score { get; set; } 
    public int CorrectCount { get; set; } 
    public int TotalCount { get; set; } 
    public DateTime SubmittedAt { get; set; } 
    public IEnumerable<AttemptAnswerResultDto> Answers { get; set; } = new List<AttemptAnswerResultDto>(); 

    public AttemptResultDto() {}
    public AttemptResultDto(int attemptId, int quizId, string quizTitle, decimal score, int correctCount, int totalCount, DateTime submittedAt, IEnumerable<AttemptAnswerResultDto> answers)
    {
        AttemptId = attemptId; QuizId = quizId; QuizTitle = quizTitle; Score = score; CorrectCount = correctCount; TotalCount = totalCount; SubmittedAt = submittedAt; Answers = answers;
    }
}
public class AttemptAnswerResultDto { public int QuestionId { get; set; } public string QuestionContent { get; set; } = string.Empty; public int AnswerId { get; set; } public string AnswerContent { get; set; } = string.Empty; public bool IsCorrect { get; set; } }

// ─── Admin ────────────────────────────────────────────────────────────────────

public class ModerateRequest { public string Action { get; set; } = string.Empty; public string? Reason { get; set; } }
