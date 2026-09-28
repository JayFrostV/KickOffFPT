using Microsoft.AspNetCore.Mvc;
using QuizApp.API.Common;
using QuizApp.Application.DTOs;
using QuizApp.Application.Services;

namespace QuizApp.API.Controllers;

[ApiController]
[Route("api/auth")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService) => _authService = authService;

    /// <summary>UC01 – Register new account</summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(ApiResponse.Fail("Username, email, and password are required."));
        if (request.Password.Length < 6)
            return BadRequest(ApiResponse.Fail("Password must be at least 6 characters."));

        var (result, error) = await _authService.RegisterAsync(request);
        if (error is not null) return Conflict(ApiResponse.Fail(error));
        return StatusCode(201, ApiResponse<AuthResultDto>.Ok(result!, "Account created successfully."));
    }

    /// <summary>UC02 – Login</summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(ApiResponse.Fail("Email and password are required."));

        var (result, error) = await _authService.LoginAsync(request);
        if (error is not null) return Unauthorized(ApiResponse.Fail(error));
        return Ok(ApiResponse<AuthResultDto>.Ok(result!));
    }

    /// <summary>UC03 – Logout (client just discards JWT)</summary>
    [HttpPost("logout")]
    public IActionResult Logout() =>
        Ok(ApiResponse.Ok("Logged out successfully. Please discard your token."));
}
