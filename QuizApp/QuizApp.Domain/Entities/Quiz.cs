using QuizApp.Domain.Enums;

namespace QuizApp.Domain.Entities;

public class Quiz
{
    public int QuizId { get; set; }
    public int CreatorId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Duration { get; set; } // minutes
    public QuizVisibility Visibility { get; set; } = QuizVisibility.Private;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User Creator { get; set; } = null!;
    public ICollection<QuizQuestion> QuizQuestions { get; set; } = new List<QuizQuestion>();
    public ICollection<QuizAttempt> Attempts { get; set; } = new List<QuizAttempt>();
}
