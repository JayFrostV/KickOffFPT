using Microsoft.EntityFrameworkCore;
using QuizApp.Domain.Entities;
using QuizApp.Domain.Interfaces;
using QuizApp.Infrastructure.Data;

namespace QuizApp.Infrastructure.Repositories;

public class AnswerRepository : Repository<Answer>, IAnswerRepository
{
    public AnswerRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Answer>> GetByQuestionIdAsync(int questionId) =>
        await _context.Answers
            .Where(a => a.QuestionId == questionId)
            .ToListAsync();
}
