using QuizApp.Domain.Entities;

namespace QuizApp.Domain.Interfaces;

public interface IAnswerRepository : IRepository<Answer>
{
    Task<IEnumerable<Answer>> GetByQuestionIdAsync(int questionId);
}
