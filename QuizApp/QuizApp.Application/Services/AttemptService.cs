using AutoMapper;
using QuizApp.Application.DTOs;
using QuizApp.Domain.Entities;
using QuizApp.Domain.Enums;
using QuizApp.Domain.Interfaces;

namespace QuizApp.Application.Services;

public interface IAttemptService
{
    Task<(AttemptDto? dto, string? error)> StartAsync(int quizId, int? userId, string? guestIdentifier);
    Task<(AttemptResultDto? result, string? error)> SubmitAsync(int attemptId, int? userId, string? guestIdentifier, SubmitAttemptRequest request);
    Task<AttemptResultDto?> GetResultAsync(int attemptId, int? userId);
    Task<IEnumerable<AttemptDto>> GetMyAttemptsAsync(int userId);
}

public class AttemptService : IAttemptService
{
    private readonly IAttemptRepository _attemptRepo;
    private readonly IQuizRepository _quizRepo;
    private readonly IAnswerRepository _answerRepo;
    private readonly IMapper _mapper;

    private const int GUEST_TRIAL_LIMIT = 3;

    public AttemptService(IAttemptRepository attemptRepo, IQuizRepository quizRepo, IAnswerRepository answerRepo, IMapper mapper)
    {
        _attemptRepo = attemptRepo;
        _quizRepo = quizRepo;
        _answerRepo = answerRepo;
        _mapper = mapper;
    }

    public async Task<(AttemptDto? dto, string? error)> StartAsync(int quizId, int? userId, string? guestIdentifier)
    {
        var quiz = await _quizRepo.GetByIdAsync(quizId);
        if (quiz is null || quiz.Visibility != QuizVisibility.Public)
            return (null, "Quiz not found or not available.");

        // Guest trial limit
        if (userId is null)
        {
            if (string.IsNullOrWhiteSpace(guestIdentifier))
                return (null, "Guest identifier required for trial.");
            var trialCount = await _attemptRepo.GetGuestTrialCountAsync(guestIdentifier);
            if (trialCount >= GUEST_TRIAL_LIMIT)
                return (null, $"Trial limit reached ({GUEST_TRIAL_LIMIT} quizzes). Please register to continue.");
        }

        var attempt = new QuizAttempt
        {
            QuizId = quizId,
            UserId = userId,
            GuestIdentifier = guestIdentifier,
            StartedAt = DateTime.UtcNow,
            IsCompleted = false
        };

        await _attemptRepo.AddAsync(attempt);
        await _attemptRepo.SaveChangesAsync();

        // Reload with quiz info
        attempt.Quiz = quiz;
        return (_mapper.Map<AttemptDto>(attempt), null);
    }

    public async Task<(AttemptResultDto? result, string? error)> SubmitAsync(int attemptId, int? userId, string? guestIdentifier, SubmitAttemptRequest request)
    {
        var attempt = await _attemptRepo.GetWithAnswersAsync(attemptId);
        if (attempt is null) return (null, "Attempt not found.");
        if (attempt.IsCompleted) return (null, "This attempt has already been submitted.");

        // Ownership check
        if (attempt.UserId != userId || attempt.GuestIdentifier != guestIdentifier)
            return (null, "Forbidden.");

        var quiz = await _quizRepo.GetWithQuestionsAsync(attempt.QuizId);
        if (quiz is null) return (null, "Quiz not found.");

        var quizQuestionMap = quiz.QuizQuestions.ToDictionary(qq => qq.QuestionId, qq => qq.Question);
        var attemptAnswers = new List<AttemptAnswer>();
        int correctCount = 0;

        foreach (var item in request.Answers)
        {
            if (!quizQuestionMap.TryGetValue(item.QuestionId, out var question))
                return (null, $"Question {item.QuestionId} does not belong to this quiz.");

            var answer = question.Answers.FirstOrDefault(a => a.AnswerId == item.AnswerId);
            if (answer is null)
                return (null, $"Answer {item.AnswerId} does not belong to question {item.QuestionId}.");

            var isCorrect = answer.IsCorrect;
            if (isCorrect) correctCount++;

            attemptAnswers.Add(new AttemptAnswer
            {
                AttemptId = attemptId,
                QuestionId = item.QuestionId,
                AnswerId = item.AnswerId,
                IsCorrect = isCorrect
            });
        }

        // Calculate score
        int total = quiz.QuizQuestions.Count;
        decimal score = total > 0 ? Math.Round((decimal)correctCount / total * 100, 2) : 0;

        attempt.AttemptAnswers = attemptAnswers;
        attempt.SubmittedAt = DateTime.UtcNow;
        attempt.Score = score;
        attempt.IsCompleted = true;

        _attemptRepo.Update(attempt);
        await _attemptRepo.SaveChangesAsync();

        return (new AttemptResultDto(
            attemptId,
            attempt.QuizId,
            quiz.Title,
            score,
            correctCount,
            total,
            attempt.SubmittedAt!.Value,
            _mapper.Map<IEnumerable<AttemptAnswerResultDto>>(attemptAnswers)
        ), null);
    }

    public async Task<AttemptResultDto?> GetResultAsync(int attemptId, int? userId)
    {
        var attempt = await _attemptRepo.GetWithAnswersAsync(attemptId);
        if (attempt is null || !attempt.IsCompleted) return null;
        if (userId is not null && attempt.UserId != userId) return null;

        return new AttemptResultDto(
            attempt.AttemptId,
            attempt.QuizId,
            attempt.Quiz.Title,
            attempt.Score ?? 0,
            attempt.AttemptAnswers.Count(a => a.IsCorrect),
            attempt.AttemptAnswers.Count,
            attempt.SubmittedAt!.Value,
            _mapper.Map<IEnumerable<AttemptAnswerResultDto>>(attempt.AttemptAnswers)
        );
    }

    public async Task<IEnumerable<AttemptDto>> GetMyAttemptsAsync(int userId)
    {
        var attempts = await _attemptRepo.GetByUserAsync(userId);
        return _mapper.Map<IEnumerable<AttemptDto>>(attempts);
    }
}
