namespace QuizApp.Domain.Entities;

/// <summary>Junction table: Quiz ↔ Question with ordering</summary>
public class QuizQuestion
{
    public int QuizQuestionId { get; set; }
    public int QuizId { get; set; }
    public int QuestionId { get; set; }
    public int OrderIndex { get; set; }

    // Navigation
    public Quiz Quiz { get; set; } = null!;
    public Question Question { get; set; } = null!;
}
