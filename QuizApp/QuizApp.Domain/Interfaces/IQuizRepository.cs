using QuizApp.Domain.Entities;
using QuizApp.Domain.Enums;

namespace QuizApp.Domain.Interfaces;

public interface IQuizRepository : IRepository<Quiz>
{
    Task<IEnumerable<Quiz>> GetPublicQuizzesAsync(string? keyword = null);
    Task<IEnumerable<Quiz>> GetByCreatorAsync(int creatorId);
    Task<Quiz?> GetWithQuestionsAsync(int quizId);
    Task<bool> DeleteWithAllRelatedAsync(int quizId);
}
