using AutoMapper;
using QuizApp.Application.DTOs;
using QuizApp.Domain.Entities;
using QuizApp.Domain.Enums;
using QuizApp.Domain.Interfaces;

namespace QuizApp.Application.Services;

public interface IQuizService
{
    Task<IEnumerable<QuizDto>> GetPublicAsync(string? keyword);
    Task<IEnumerable<QuizDto>> GetMyQuizzesAsync(int creatorId);
    Task<QuizDetailDto?> GetDetailAsync(int quizId, int? requesterId);
    Task<PublicQuizDetailDto?> GetForTakingAsync(int quizId);
    Task<QuizDto> CreateAsync(int creatorId, CreateQuizRequest request);
    Task<(QuizDto? dto, string? error)> UpdateAsync(int quizId, int requesterId, UpdateQuizRequest request);
    Task<(bool success, string? error)> DeleteAsync(int quizId, int requesterId);
    Task<(QuizDto? dto, string? error)> PublishAsync(int quizId, int requesterId);
    Task<(QuizDto? dto, string? error)> UnpublishAsync(int quizId, int requesterId);
    Task<(QuizDetailDto? dto, string? error)> AddQuestionAsync(int quizId, int requesterId, AddQuestionToQuizRequest request);
    Task<(bool success, string? error)> RemoveQuestionAsync(int quizQuestionId, int requesterId);
}

public class QuizService : IQuizService
{
    private readonly IQuizRepository _quizRepo;
    private readonly IQuestionRepository _questionRepo;
    private readonly IMapper _mapper;

    public QuizService(IQuizRepository quizRepo, IQuestionRepository questionRepo, IMapper mapper)
    {
        _quizRepo = quizRepo;
        _questionRepo = questionRepo;
        _mapper = mapper;
    }

    public async Task<IEnumerable<QuizDto>> GetPublicAsync(string? keyword)
    {
        var quizzes = await _quizRepo.GetPublicQuizzesAsync(keyword);
        return _mapper.Map<IEnumerable<QuizDto>>(quizzes);
    }

    public async Task<IEnumerable<QuizDto>> GetMyQuizzesAsync(int creatorId)
    {
        var quizzes = await _quizRepo.GetByCreatorAsync(creatorId);
        return _mapper.Map<IEnumerable<QuizDto>>(quizzes);
    }

    public async Task<QuizDetailDto?> GetDetailAsync(int quizId, int? requesterId)
    {
        var quiz = await _quizRepo.GetWithQuestionsAsync(quizId);
        if (quiz is null) return null;
        if (quiz.Visibility == QuizVisibility.Private && quiz.CreatorId != requesterId)
            return null;
        return _mapper.Map<QuizDetailDto>(quiz);
    }

    public async Task<PublicQuizDetailDto?> GetForTakingAsync(int quizId)
    {
        var quiz = await _quizRepo.GetWithQuestionsAsync(quizId);
        if (quiz is null || quiz.Visibility != QuizVisibility.Public) return null;
        return _mapper.Map<PublicQuizDetailDto>(quiz);
    }

    public async Task<QuizDto> CreateAsync(int creatorId, CreateQuizRequest request)
    {
        var quiz = new Quiz
        {
            CreatorId = creatorId,
            Title = request.Title,
            Description = request.Description,
            Duration = request.Duration,
            Visibility = QuizVisibility.Private,
            CreatedAt = DateTime.UtcNow
        };
        await _quizRepo.AddAsync(quiz);
        await _quizRepo.SaveChangesAsync();
        var full = await _quizRepo.GetWithQuestionsAsync(quiz.QuizId);
        return _mapper.Map<QuizDto>(full!);
    }

    public async Task<(QuizDto? dto, string? error)> UpdateAsync(int quizId, int requesterId, UpdateQuizRequest request)
    {
        var quiz = await _quizRepo.GetByIdAsync(quizId);
        if (quiz is null) return (null, "Quiz not found.");
        if (quiz.CreatorId != requesterId) return (null, "You do not own this quiz.");

        quiz.Title = request.Title;
        quiz.Description = request.Description;
        quiz.Duration = request.Duration;
        _quizRepo.Update(quiz);
        await _quizRepo.SaveChangesAsync();
        var full = await _quizRepo.GetWithQuestionsAsync(quizId);
        return (_mapper.Map<QuizDto>(full!), null);
    }

    public async Task<(bool success, string? error)> DeleteAsync(int quizId, int requesterId)
    {
        var quiz = await _quizRepo.GetByIdAsync(quizId);
        if (quiz is null) return (false, "Quiz not found.");
        if (quiz.CreatorId != requesterId) return (false, "You do not own this quiz.");
        await _quizRepo.DeleteWithAllRelatedAsync(quizId);
        return (true, null);
    }

    public async Task<(QuizDto? dto, string? error)> PublishAsync(int quizId, int requesterId)
    {
        var quiz = await _quizRepo.GetWithQuestionsAsync(quizId);
        if (quiz is null) return (null, "Quiz not found.");
        if (quiz.CreatorId != requesterId) return (null, "You do not own this quiz.");
        if (quiz.QuizQuestions.Count == 0) return (null, "Quiz must have at least one question before publishing.");
        if (quiz.Visibility == QuizVisibility.Public) return (null, "Quiz is already public.");

        quiz.Visibility = QuizVisibility.Public;
        _quizRepo.Update(quiz);
        await _quizRepo.SaveChangesAsync();
        return (_mapper.Map<QuizDto>(quiz), null);
    }

    public async Task<(QuizDto? dto, string? error)> UnpublishAsync(int quizId, int requesterId)
    {
        var quiz = await _quizRepo.GetByIdAsync(quizId);
        if (quiz is null) return (null, "Quiz not found.");
        if (quiz.CreatorId != requesterId) return (null, "You do not own this quiz.");
        if (quiz.Visibility == QuizVisibility.Private) return (null, "Quiz is already private.");

        quiz.Visibility = QuizVisibility.Private;
        _quizRepo.Update(quiz);
        await _quizRepo.SaveChangesAsync();
        return (_mapper.Map<QuizDto>(quiz), null);
    }

    public async Task<(QuizDetailDto? dto, string? error)> AddQuestionAsync(int quizId, int requesterId, AddQuestionToQuizRequest request)
    {
        var quiz = await _quizRepo.GetWithQuestionsAsync(quizId);
        if (quiz is null) return (null, "Quiz not found.");
        if (quiz.CreatorId != requesterId) return (null, "You do not own this quiz.");
        if (quiz.QuizQuestions.Any(qq => qq.QuestionId == request.QuestionId))
            return (null, "This question is already in the quiz.");

        var question = await _questionRepo.GetByIdAsync(request.QuestionId);
        if (question is null) return (null, "Question not found.");

        var qq = new QuizQuestion { QuizId = quizId, QuestionId = request.QuestionId, OrderIndex = request.OrderIndex };
        quiz.QuizQuestions.Add(qq);
        _quizRepo.Update(quiz);
        await _quizRepo.SaveChangesAsync();
        var full = await _quizRepo.GetWithQuestionsAsync(quizId);
        return (_mapper.Map<QuizDetailDto>(full!), null);
    }

    public async Task<(bool success, string? error)> RemoveQuestionAsync(int quizQuestionId, int requesterId)
    {
        var quiz = (await _quizRepo.FindAsync(q => q.QuizQuestions.Any(qq => qq.QuizQuestionId == quizQuestionId))).FirstOrDefault();
        if (quiz is null) return (false, "Not found.");
        if (quiz.CreatorId != requesterId) return (false, "You do not own this quiz.");

        var full = await _quizRepo.GetWithQuestionsAsync(quiz.QuizId);
        var item = full!.QuizQuestions.FirstOrDefault(qq => qq.QuizQuestionId == quizQuestionId);
        if (item is null) return (false, "Question not found in quiz.");

        full.QuizQuestions.Remove(item);
        _quizRepo.Update(full);
        await _quizRepo.SaveChangesAsync();
        return (true, null);
    }
}
