using Microsoft.EntityFrameworkCore;
using QuizApp.Domain.Entities;
using QuizApp.Domain.Enums;
using QuizApp.Domain.Interfaces;
using QuizApp.Infrastructure.Data;

namespace QuizApp.Infrastructure.Repositories;

public class QuestionBankRepository : Repository<QuestionBank>, IQuestionBankRepository
{
    public QuestionBankRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<QuestionBank>> GetByOwnerAsync(int ownerId) =>
        await _context.QuestionBanks
            .Include(b => b.Questions)
            .Where(b => b.OwnerId == ownerId)
            .ToListAsync();

    public async Task<IEnumerable<QuestionBank>> GetPublicBanksAsync() =>
        await _context.QuestionBanks
            .Include(b => b.Questions)
            .Where(b => b.Visibility == BankVisibility.Public)
            .ToListAsync();

    public async Task<QuestionBank?> GetWithQuestionsAsync(int bankId) =>
        await _context.QuestionBanks
            .Include(b => b.Questions)
                .ThenInclude(q => q.Answers)
            .FirstOrDefaultAsync(b => b.BankId == bankId);
}
