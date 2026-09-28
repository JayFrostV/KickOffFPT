using Microsoft.EntityFrameworkCore;
using QuizApp.Domain.Entities;
using QuizApp.Domain.Enums;
using QuizApp.Domain.Interfaces;
using QuizApp.Infrastructure.Data;

namespace QuizApp.Infrastructure.Repositories;

public class QuestionRepository : Repository<Question>, IQuestionRepository
{
    public QuestionRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Question>> GetByBankIdAsync(int bankId) =>
        await _context.Questions
            .Include(q => q.Answers)
            .Where(q => q.BankId == bankId)
            .ToListAsync();

    public async Task<IEnumerable<Question>> SearchPublicQuestionsAsync(string? keyword = null)
    {
        var query = _context.Questions
            .Include(q => q.Answers)
            .Include(q => q.Bank)
            .Where(q => q.Bank.Visibility == BankVisibility.Public);

        if (!string.IsNullOrWhiteSpace(keyword))
            query = query.Where(q => q.Content.Contains(keyword));

        return await query.ToListAsync();
    }

    public async Task<Question?> GetWithAnswersAsync(int questionId) =>
        await _context.Questions
            .Include(q => q.Answers)
            .FirstOrDefaultAsync(q => q.QuestionId == questionId);
}
