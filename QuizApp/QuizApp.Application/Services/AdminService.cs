using AutoMapper;
using QuizApp.Application.DTOs;
using QuizApp.Domain.Interfaces;

namespace QuizApp.Application.Services;

public interface IAdminService
{
    Task<IEnumerable<UserDto>> GetAllUsersAsync();
    Task<(UserDto? dto, string? error)> SetUserStatusAsync(int userId, bool isActive);
    Task<IEnumerable<QuizDto>> GetAllQuizzesAsync();
    Task<(bool success, string? error)> RemoveQuizAsync(int quizId);
}

public class AdminService : IAdminService
{
    private readonly IUserRepository _userRepo;
    private readonly IQuizRepository _quizRepo;
    private readonly IMapper _mapper;

    public AdminService(IUserRepository userRepo, IQuizRepository quizRepo, IMapper mapper)
    {
        _userRepo = userRepo;
        _quizRepo = quizRepo;
        _mapper = mapper;
    }

    public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
    {
        var users = await _userRepo.GetAllAsync();
        return _mapper.Map<IEnumerable<UserDto>>(users);
    }

    public async Task<(UserDto? dto, string? error)> SetUserStatusAsync(int userId, bool isActive)
    {
        var user = await _userRepo.GetByIdAsync(userId);
        if (user is null) return (null, "User not found.");
        user.IsActive = isActive;
        _userRepo.Update(user);
        await _userRepo.SaveChangesAsync();
        return (_mapper.Map<UserDto>(user), null);
    }

    public async Task<IEnumerable<QuizDto>> GetAllQuizzesAsync()
    {
        var quizzes = await _quizRepo.GetPublicQuizzesAsync(null);
        // Admin sees all quizzes
        var all = await _quizRepo.GetAllAsync();
        return _mapper.Map<IEnumerable<QuizDto>>(all);
    }

    public async Task<(bool success, string? error)> RemoveQuizAsync(int quizId)
    {
        var quiz = await _quizRepo.GetByIdAsync(quizId);
        if (quiz is null) return (false, "Quiz not found.");
        await _quizRepo.DeleteWithAllRelatedAsync(quizId);
        return (true, null);
    }
}
