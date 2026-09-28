namespace QuizApp.Domain.Entities;

public class QuizAttempt
{
    public int AttemptId { get; set; }
    public int QuizId { get; set; }
    public int? UserId { get; set; }            // NULL = Guest
    public string? GuestIdentifier { get; set; } // For guest trial tracking
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? SubmittedAt { get; set; }
    public decimal? Score { get; set; }          // percentage 0-100
    public bool IsCompleted { get; set; } = false;

    // Navigation
    public Quiz Quiz { get; set; } = null!;
    public User? User { get; set; }
    public ICollection<AttemptAnswer> AttemptAnswers { get; set; } = new List<AttemptAnswer>();
}
