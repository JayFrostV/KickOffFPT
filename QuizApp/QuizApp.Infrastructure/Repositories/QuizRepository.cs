using Microsoft.EntityFrameworkCore;
using QuizApp.Domain.Entities;
using QuizApp.Domain.Enums;
using QuizApp.Domain.Interfaces;
using QuizApp.Infrastructure.Data;

namespace QuizApp.Infrastructure.Repositories;

public class QuizRepository : Repository<Quiz>, IQuizRepository
{
    public QuizRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Quiz>> GetPublicQuizzesAsync(string? keyword = null)
    {
        var query = _context.Quizzes
            .Include(q => q.Creator)
            .Include(q => q.QuizQuestions)
            .Where(q => q.Visibility == QuizVisibility.Public);

        if (!string.IsNullOrWhiteSpace(keyword))
            query = query.Where(q => q.Title.Contains(keyword) || (q.Description != null && q.Description.Contains(keyword)));

        return await query.OrderByDescending(q => q.CreatedAt).ToListAsync();
    }

    public async Task<IEnumerable<Quiz>> GetByCreatorAsync(int creatorId) =>
        await _context.Quizzes
            .Include(q => q.Creator)
            .Include(q => q.QuizQuestions)
            .Where(q => q.CreatorId == creatorId)
            .OrderByDescending(q => q.CreatedAt)
            .ToListAsync();

    public async Task<Quiz?> GetWithQuestionsAsync(int quizId) =>
        await _context.Quizzes
            .Include(q => q.Creator)
            .Include(q => q.QuizQuestions.OrderBy(qq => qq.OrderIndex))
                .ThenInclude(qq => qq.Question)
                    .ThenInclude(q => q.Answers)
            .FirstOrDefaultAsync(q => q.QuizId == quizId);

    public async Task<bool> DeleteWithAllRelatedAsync(int quizId)
    {
        var quiz = await _context.Quizzes.FindAsync(quizId);
        if (quiz is null) return false;

        var attemptIds = await _context.QuizAttempts
            .Where(a => a.QuizId == quizId)
            .Select(a => a.AttemptId)
            .ToListAsync();

        if (attemptIds.Count > 0)
        {
            var attemptAnswers = await _context.AttemptAnswers
                .Where(aa => attemptIds.Contains(aa.AttemptId))
                .ToListAsync();
            _context.AttemptAnswers.RemoveRange(attemptAnswers);

            var attempts = await _context.QuizAttempts
                .Where(a => a.QuizId == quizId)
                .ToListAsync();
            _context.QuizAttempts.RemoveRange(attempts);
        }

        var quizQuestions = await _context.QuizQuestions
            .Where(qq => qq.QuizId == quizId)
            .ToListAsync();
        _context.QuizQuestions.RemoveRange(quizQuestions);

        _context.Quizzes.Remove(quiz);
        await _context.SaveChangesAsync();
        return true;
    }
}
