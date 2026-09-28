using QuizApp.Domain.Entities;

namespace QuizApp.Domain.Interfaces;

public interface IAttemptRepository : IRepository<QuizAttempt>
{
    Task<QuizAttempt?> GetWithAnswersAsync(int attemptId);
    Task<int> GetGuestTrialCountAsync(string guestIdentifier);
    Task<IEnumerable<QuizAttempt>> GetByUserAsync(int userId);
}
