using QuizApp.Domain.Enums;

namespace QuizApp.Domain.Entities;

public class QuestionBank
{
    public int BankId { get; set; }
    public int OwnerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public BankVisibility Visibility { get; set; } = BankVisibility.Private;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User Owner { get; set; } = null!;
    public ICollection<Question> Questions { get; set; } = new List<Question>();
}
