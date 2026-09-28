using QuizApp.Application.DTOs;
using QuizApp.Domain.Entities;
using QuizApp.Domain.Interfaces;

namespace QuizApp.Application.Services;

public interface IAuthService
{
    Task<(AuthResultDto? result, string? error)> RegisterAsync(RegisterRequest request);
    Task<(AuthResultDto? result, string? error)> LoginAsync(LoginRequest request);
}

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepo;
    private readonly IJwtService _jwtService;

    public AuthService(IUserRepository userRepo, IJwtService jwtService)
    {
        _userRepo = userRepo;
        _jwtService = jwtService;
    }

    public async Task<(AuthResultDto? result, string? error)> RegisterAsync(RegisterRequest request)
    {
        if (await _userRepo.ExistsAsync(request.Email, request.Username))
            return (null, "Email or username is already taken.");

        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            CreatedAt = DateTime.UtcNow
        };

        await _userRepo.AddAsync(user);
        await _userRepo.SaveChangesAsync();

        var token = _jwtService.GenerateToken(user);
        return (new AuthResultDto(user.UserId, user.Username, user.Email, user.Role.ToString(), token), null);
    }

    public async Task<(AuthResultDto? result, string? error)> LoginAsync(LoginRequest request)
    {
        var user = await _userRepo.GetByEmailAsync(request.Email);
        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return (null, "Invalid email or password.");

        if (!user.IsActive)
            return (null, "Your account has been deactivated. Please contact support.");

        var token = _jwtService.GenerateToken(user);
        return (new AuthResultDto(user.UserId, user.Username, user.Email, user.Role.ToString(), token), null);
    }
}
