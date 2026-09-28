using QuizApp.Domain.Entities;

namespace QuizApp.Domain.Interfaces;

public interface IQuestionRepository : IRepository<Question>
{
    Task<IEnumerable<Question>> GetByBankIdAsync(int bankId);
    Task<IEnumerable<Question>> SearchPublicQuestionsAsync(string? keyword = null);
    Task<Question?> GetWithAnswersAsync(int questionId);
}
