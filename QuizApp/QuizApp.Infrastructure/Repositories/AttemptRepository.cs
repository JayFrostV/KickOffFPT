using Microsoft.EntityFrameworkCore;
using QuizApp.Domain.Entities;
using QuizApp.Domain.Interfaces;
using QuizApp.Infrastructure.Data;

namespace QuizApp.Infrastructure.Repositories;

public class AttemptRepository : Repository<QuizAttempt>, IAttemptRepository
{
    public AttemptRepository(AppDbContext context) : base(context) { }

    public async Task<QuizAttempt?> GetWithAnswersAsync(int attemptId) =>
        await _context.QuizAttempts
            .Include(a => a.AttemptAnswers)
                .ThenInclude(aa => aa.Answer)
            .Include(a => a.AttemptAnswers)
                .ThenInclude(aa => aa.Question)
            .Include(a => a.Quiz)
            .FirstOrDefaultAsync(a => a.AttemptId == attemptId);

    public async Task<int> GetGuestTrialCountAsync(string guestIdentifier) =>
        await _context.QuizAttempts
            .CountAsync(a => a.GuestIdentifier == guestIdentifier && a.IsCompleted);

    public async Task<IEnumerable<QuizAttempt>> GetByUserAsync(int userId) =>
        await _context.QuizAttempts
            .Include(a => a.Quiz)
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.StartedAt)
            .ToListAsync();
}
