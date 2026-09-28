using AutoMapper;
using QuizApp.Application.DTOs;
using QuizApp.Domain.Entities;
using QuizApp.Domain.Enums;
using QuizApp.Domain.Interfaces;

namespace QuizApp.Application.Services;

public interface IQuestionBankService
{
    Task<IEnumerable<QuestionBankDto>> GetMyBanksAsync(int ownerId);
    Task<IEnumerable<QuestionBankDto>> GetPublicBanksAsync();
    Task<QuestionBankDetailDto?> GetDetailAsync(int bankId, int? requesterId);
    Task<QuestionBankDto> CreateAsync(int ownerId, CreateQuestionBankRequest request);
    Task<(QuestionBankDto? dto, string? error)> UpdateAsync(int bankId, int requesterId, UpdateQuestionBankRequest request);
    Task<(bool success, string? error)> DeleteAsync(int bankId, int requesterId);
    // Questions within bank
    Task<(QuestionDto? dto, string? error)> AddQuestionAsync(int bankId, int requesterId, CreateQuestionRequest request);
    Task<(QuestionDto? dto, string? error)> UpdateQuestionAsync(int questionId, int requesterId, UpdateQuestionRequest request);
    Task<(bool success, string? error)> DeleteQuestionAsync(int questionId, int requesterId);
    Task<(AnswerDto? dto, string? error)> AddAnswerAsync(int questionId, int requesterId, CreateAnswerRequest request);
    Task<(AnswerDto? dto, string? error)> UpdateAnswerAsync(int answerId, int requesterId, UpdateAnswerRequest request);
    Task<(bool success, string? error)> DeleteAnswerAsync(int answerId, int requesterId);
    Task<IEnumerable<QuestionDto>> SearchPublicQuestionsAsync(string? keyword);
}

public class QuestionBankService : IQuestionBankService
{
    private readonly IQuestionBankRepository _bankRepo;
    private readonly IQuestionRepository _questionRepo;
    private readonly IAnswerRepository _answerRepo;
    private readonly IMapper _mapper;

    private const int GUEST_TRIAL_LIMIT = 3;

    public QuestionBankService(IQuestionBankRepository bankRepo, IQuestionRepository questionRepo, IAnswerRepository answerRepo, IMapper mapper)
    {
        _bankRepo = bankRepo;
        _questionRepo = questionRepo;
        _answerRepo = answerRepo;
        _mapper = mapper;
    }

    public async Task<IEnumerable<QuestionBankDto>> GetMyBanksAsync(int ownerId)
    {
        var banks = await _bankRepo.GetByOwnerAsync(ownerId);
        return _mapper.Map<IEnumerable<QuestionBankDto>>(banks);
    }

    public async Task<IEnumerable<QuestionBankDto>> GetPublicBanksAsync()
    {
        var banks = await _bankRepo.GetPublicBanksAsync();
        return _mapper.Map<IEnumerable<QuestionBankDto>>(banks);
    }

    public async Task<QuestionBankDetailDto?> GetDetailAsync(int bankId, int? requesterId)
    {
        var bank = await _bankRepo.GetWithQuestionsAsync(bankId);
        if (bank is null) return null;
        // Allow if public OR if owner
        if (bank.Visibility == BankVisibility.Private && bank.OwnerId != requesterId)
            return null;
        return _mapper.Map<QuestionBankDetailDto>(bank);
    }

    public async Task<QuestionBankDto> CreateAsync(int ownerId, CreateQuestionBankRequest request)
    {
        var visibility = Enum.TryParse<BankVisibility>(request.Visibility, true, out var v) ? v : BankVisibility.Private;
        var bank = new QuestionBank
        {
            OwnerId = ownerId,
            Name = request.Name,
            Description = request.Description,
            Visibility = visibility,
            CreatedAt = DateTime.UtcNow
        };
        await _bankRepo.AddAsync(bank);
        await _bankRepo.SaveChangesAsync();
        return _mapper.Map<QuestionBankDto>(bank);
    }

    public async Task<(QuestionBankDto? dto, string? error)> UpdateAsync(int bankId, int requesterId, UpdateQuestionBankRequest request)
    {
        var bank = await _bankRepo.GetByIdAsync(bankId);
        if (bank is null) return (null, "Question bank not found.");
        if (bank.OwnerId != requesterId) return (null, "You do not own this question bank.");

        bank.Name = request.Name;
        bank.Description = request.Description;
        bank.Visibility = Enum.TryParse<BankVisibility>(request.Visibility, true, out var v) ? v : bank.Visibility;
        _bankRepo.Update(bank);
        await _bankRepo.SaveChangesAsync();
        return (_mapper.Map<QuestionBankDto>(bank), null);
    }

    public async Task<(bool success, string? error)> DeleteAsync(int bankId, int requesterId)
    {
        var bank = await _bankRepo.GetByIdAsync(bankId);
        if (bank is null) return (false, "Question bank not found.");
        if (bank.OwnerId != requesterId) return (false, "You do not own this question bank.");
        _bankRepo.Delete(bank);
        await _bankRepo.SaveChangesAsync();
        return (true, null);
    }

    public async Task<(QuestionDto? dto, string? error)> AddQuestionAsync(int bankId, int requesterId, CreateQuestionRequest request)
    {
        var bank = await _bankRepo.GetByIdAsync(bankId);
        if (bank is null) return (null, "Question bank not found.");
        if (bank.OwnerId != requesterId) return (null, "You do not own this question bank.");

        if (!Enum.TryParse<QuestionType>(request.QuestionType.ToString(), out var qType))
            return (null, "Invalid question type. Use 1=SingleChoice, 2=MultipleChoice, 3=TrueFalse.");

        var question = new Question { BankId = bankId, Content = request.Content, QuestionType = qType };
        await _questionRepo.AddAsync(question);
        await _questionRepo.SaveChangesAsync();

        // Auto-create True/False answers with user choice
        if (qType == QuestionType.TrueFalse)
        {
            bool isTrueCorrect = request.TrueFalseAnswer ?? true;
            await _answerRepo.AddAsync(new Answer { QuestionId = question.QuestionId, Content = "True", IsCorrect = isTrueCorrect });
            await _answerRepo.AddAsync(new Answer { QuestionId = question.QuestionId, Content = "False", IsCorrect = !isTrueCorrect });
            await _answerRepo.SaveChangesAsync();
        }

        var full = await _questionRepo.GetWithAnswersAsync(question.QuestionId);
        return (_mapper.Map<QuestionDto>(full), null);
    }

    public async Task<(QuestionDto? dto, string? error)> UpdateQuestionAsync(int questionId, int requesterId, UpdateQuestionRequest request)
    {
        var question = await _questionRepo.GetWithAnswersAsync(questionId);
        if (question is null) return (null, "Question not found.");
        var bank = await _bankRepo.GetByIdAsync(question.BankId);
        if (bank?.OwnerId != requesterId) return (null, "You do not own this question.");

        question.Content = request.Content;
        if (Enum.TryParse<QuestionType>(request.QuestionType.ToString(), out var newType) && newType != question.QuestionType)
        {
            // Handle TrueFalse type change
            if (question.QuestionType == QuestionType.TrueFalse)
            {
                foreach (var ans in question.Answers.ToList())
                    _answerRepo.Delete(ans);
                await _answerRepo.SaveChangesAsync();
            }
            question.QuestionType = newType;
            if (newType == QuestionType.TrueFalse)
            {
                await _answerRepo.AddAsync(new Answer { QuestionId = questionId, Content = "True", IsCorrect = true });
                await _answerRepo.AddAsync(new Answer { QuestionId = questionId, Content = "False", IsCorrect = false });
            }
        }
        _questionRepo.Update(question);
        await _questionRepo.SaveChangesAsync();
        var full = await _questionRepo.GetWithAnswersAsync(questionId);
        return (_mapper.Map<QuestionDto>(full), null);
    }

    public async Task<(bool success, string? error)> DeleteQuestionAsync(int questionId, int requesterId)
    {
        var question = await _questionRepo.GetByIdAsync(questionId);
        if (question is null) return (false, "Question not found.");
        var bank = await _bankRepo.GetByIdAsync(question.BankId);
        if (bank?.OwnerId != requesterId) return (false, "You do not own this question.");
        _questionRepo.Delete(question);
        await _questionRepo.SaveChangesAsync();
        return (true, null);
    }

    public async Task<(AnswerDto? dto, string? error)> AddAnswerAsync(int questionId, int requesterId, CreateAnswerRequest request)
    {
        var question = await _questionRepo.GetWithAnswersAsync(questionId);
        if (question is null) return (null, "Question not found.");
        var bank = await _bankRepo.GetByIdAsync(question.BankId);
        if (bank?.OwnerId != requesterId) return (null, "You do not own this question.");
        if (question.QuestionType == QuestionType.TrueFalse) return (null, "True/False answers are managed automatically.");

        var answer = new Answer { QuestionId = questionId, Content = request.Content, IsCorrect = request.IsCorrect };
        await _answerRepo.AddAsync(answer);
        await _answerRepo.SaveChangesAsync();
        return (_mapper.Map<AnswerDto>(answer), null);
    }

    public async Task<(AnswerDto? dto, string? error)> UpdateAnswerAsync(int answerId, int requesterId, UpdateAnswerRequest request)
    {
        var answer = await _answerRepo.GetByIdAsync(answerId);
        if (answer is null) return (null, "Answer not found.");
        var question = await _questionRepo.GetWithAnswersAsync(answer.QuestionId);
        var bank = await _bankRepo.GetByIdAsync(question!.BankId);
        if (bank?.OwnerId != requesterId) return (null, "You do not own this answer.");
        if (question.QuestionType == QuestionType.TrueFalse)
        {
            // Toggle True/False answers
            answer.IsCorrect = request.IsCorrect;
            var otherAnswer = question.Answers.FirstOrDefault(a => a.AnswerId != answerId);
            if (otherAnswer is not null)
            {
                otherAnswer.IsCorrect = !request.IsCorrect;
                _answerRepo.Update(otherAnswer);
            }
            _answerRepo.Update(answer);
            await _answerRepo.SaveChangesAsync();
            return (_mapper.Map<AnswerDto>(answer), null);
        }

        if (question.QuestionType == QuestionType.SingleChoice && request.IsCorrect)
        {
            foreach (var a in question.Answers.Where(a => a.AnswerId != answerId && a.IsCorrect))
            {
                a.IsCorrect = false;
                _answerRepo.Update(a);
            }
        }

        answer.Content = request.Content;
        answer.IsCorrect = request.IsCorrect;
        _answerRepo.Update(answer);
        await _answerRepo.SaveChangesAsync();
        return (_mapper.Map<AnswerDto>(answer), null);
    }

    public async Task<(bool success, string? error)> DeleteAnswerAsync(int answerId, int requesterId)
    {
        var answer = await _answerRepo.GetByIdAsync(answerId);
        if (answer is null) return (false, "Answer not found.");
        var question = await _questionRepo.GetWithAnswersAsync(answer.QuestionId);
        var bank = await _bankRepo.GetByIdAsync(question!.BankId);
        if (bank?.OwnerId != requesterId) return (false, "You do not own this answer.");
        if (question.QuestionType == QuestionType.TrueFalse) return (false, "True/False answers cannot be deleted manually.");

        _answerRepo.Delete(answer);
        await _answerRepo.SaveChangesAsync();
        return (true, null);
    }

    public async Task<IEnumerable<QuestionDto>> SearchPublicQuestionsAsync(string? keyword)
    {
        var questions = await _questionRepo.SearchPublicQuestionsAsync(keyword);
        return _mapper.Map<IEnumerable<QuestionDto>>(questions);
    }
}
