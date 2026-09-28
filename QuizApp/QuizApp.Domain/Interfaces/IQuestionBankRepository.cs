using QuizApp.Domain.Entities;

namespace QuizApp.Domain.Interfaces;

public interface IQuestionBankRepository : IRepository<QuestionBank>
{
    Task<IEnumerable<QuestionBank>> GetByOwnerAsync(int ownerId);
    Task<IEnumerable<QuestionBank>> GetPublicBanksAsync();
    Task<QuestionBank?> GetWithQuestionsAsync(int bankId);
}
