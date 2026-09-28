namespace QuizApp.Domain.Entities;

public class AttemptAnswer
{
    public int AttemptAnswerId { get; set; }
    public int AttemptId { get; set; }
    public int QuestionId { get; set; }
    public int AnswerId { get; set; }
    public bool IsCorrect { get; set; }  // cached result for quick score display

    // Navigation
    public QuizAttempt Attempt { get; set; } = null!;
    public Question Question { get; set; } = null!;
    public Answer Answer { get; set; } = null!;
}
