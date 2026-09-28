using QuizApp.Domain.Enums;

namespace QuizApp.Domain.Entities;

public class Question
{
    public int QuestionId { get; set; }
    public int BankId { get; set; }           // belongs to QuestionBank (not Quiz directly)
    public string Content { get; set; } = string.Empty;
    public QuestionType QuestionType { get; set; }

    // Navigation
    public QuestionBank Bank { get; set; } = null!;
    public ICollection<Answer> Answers { get; set; } = new List<Answer>();
    public ICollection<QuizQuestion> QuizQuestions { get; set; } = new List<QuizQuestion>();
    public ICollection<AttemptAnswer> AttemptAnswers { get; set; } = new List<AttemptAnswer>();
}
